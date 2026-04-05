import Stripe from "stripe";
import { ENV } from "./env";

if (!ENV.stripeSecretKey) {
  console.warn("[Stripe] Missing STRIPE_SECRET_KEY in environment");
}

export const stripe = new Stripe(ENV.stripeSecretKey, {
  appInfo: {
    name: "Bishouy Platform",
    version: "1.0.0",
  },
});
