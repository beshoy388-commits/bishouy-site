import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getUserById, updateUser } from "../db";
import { ENV } from "../_core/env";

export const pushRouter = router({
  // Return the VAPID public key so client can subscribe
  getVapidPublicKey: publicProcedure.query(() => {
    return { publicKey: ENV.vapidPublicKey || null };
  }),

  // Register a push subscription for the authenticated user
  subscribe: protectedProcedure
    .input(
      z.object({
        subscription: z.object({
          endpoint: z.string(),
          keys: z.object({
            p256dh: z.string(),
            auth: z.string(),
          }),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      await updateUser(user.id, {
        pushSubscription: JSON.stringify(input.subscription),
        breakingNewsAlerts: 1,
      });

      return { success: true };
    }),

  // Remove push subscription (user opts out)
  unsubscribe: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    await updateUser(user.id, {
      pushSubscription: null,
      breakingNewsAlerts: 0,
    });

    return { success: true };
  }),

  // Toggle breaking news alerts (also manages push subscription side)
  toggleBreakingAlerts: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const updates: Record<string, any> = {
        breakingNewsAlerts: input.enabled ? 1 : 0,
      };

      // If disabling, clear push subscription
      if (!input.enabled) {
        updates.pushSubscription = null;
      }

      await updateUser(user.id, updates);
      return { success: true, enabled: input.enabled };
    }),
});
