import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { stripe } from "../_core/stripe";
import type Stripe from "stripe";
import { ENV } from "../_core/env";
import { getUserById, updateUser } from "../db";

export const stripeRouter = router({
  // Protected: Create a Checkout Session (supports both Redirect/Hosted and Embedded modes)
  createCheckoutSession: protectedProcedure
    .input(z.object({ 
      tier: z.enum(["premium", "founder"]),
      uiMode: z.enum(["hosted", "embedded"]).optional().default("hosted"),
      couponCode: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const priceId = input.tier === "premium" ? ENV.stripePriceIdPremium : ENV.stripePriceIdFounder;
      if (!priceId) {
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: `Price ID for plan '${input.tier}' is not configured.` 
        });
      }

      // 1. Find or Create Stripe Customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || "",
          name: user.name || user.username || "",
          metadata: { userId: user.id.toString() },
        });
        customerId = customer.id;
        await updateUser(user.id, { stripeCustomerId: customerId });
      }

      // 2. Build session config base
      const sessionConfig: Stripe.Checkout.SessionCreateParams = { 
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        subscription_data: {
          metadata: { userId: user.id.toString(), tier: input.tier },
        },
        metadata: { userId: user.id.toString(), tier: input.tier },
      };

      // Only set ui_mode for embedded to avoid errors in hosted/default mode
      if (input.uiMode === "embedded") {
        sessionConfig.ui_mode = "embedded" as Stripe.Checkout.SessionCreateParams.UiMode;
      }

      // 3. Add 7-day free trial ONLY IF no coupon is pre-applied (to avoid Stripe conflict)
      if (input.tier === "premium" && !input.couponCode) {
        const hasHadSubscription = !!user.stripeSubscriptionId;
        if (!hasHadSubscription) {
          sessionConfig.subscription_data!.trial_period_days = 7;
        }
      }

      // 3.5 Apply coupon if provided
      if (input.couponCode) {
        sessionConfig.allow_promotion_codes = undefined; // Cannot use both discounts and allow_promotion_codes
        // In embedded mode or if we specifically pass the exact coupon code
        sessionConfig.discounts = [{ coupon: input.couponCode }];
      }

      // 4. Configure mode-specific parameters
      if (input.uiMode === "embedded") {
        sessionConfig.return_url = `${ENV.appUrl}/profile?session_id={CHECKOUT_SESSION_ID}&tier=${input.tier}`;
      } else {
        sessionConfig.success_url = `${ENV.appUrl}/profile?session_id={CHECKOUT_SESSION_ID}&tier=${input.tier}`;
        sessionConfig.cancel_url = `${ENV.appUrl}/pricing`;
      }

      // 5. Create Checkout Session
      const session = await stripe.checkout.sessions.create(sessionConfig);

      return { 
        url: session.url,
        clientSecret: session.client_secret 
      };
    }),

  // Protected: Create a Customer Portal Session for management
  createPortalSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      let customerId = user.stripeCustomerId;

      // Failsafe: if missing customer ID but has email, try to find in Stripe
      if (!customerId && user.email) {
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          await updateUser(user.id, { stripeCustomerId: customerId });
        }
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId || "",
        return_url: `${ENV.appUrl}/profile`,
      });

      return { url: session.url };
    }),

  // Protected: Get subscription status
  getSubscriptionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return {
        tier: user.subscriptionTier || "free",
        status: user.subscriptionStatus || null,
        hasStripeCustomer: !!user.stripeCustomerId,
      };
    }),
  // Protected: Verify a session manually (failsafe for local development or delayed webhooks)
  verifySession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
        expand: ["subscription"],
      });
      
      const userId = parseInt(session.metadata?.userId || "0");
      if (userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized session verification." });
      }

      const isPaid = session.payment_status === "paid" || session.status === "complete";
      
      if (isPaid) {
        const tier = session.metadata?.tier as "premium" | "founder";
        const subscription = session.subscription as any;

        await updateUser(userId, {
          subscriptionTier: tier,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription?.id || null,
          subscriptionStatus: subscription?.status || "active",
        });

        return { success: true, tier };
      }

      return { success: false };
    }),
});

