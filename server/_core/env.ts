import "dotenv/config";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  databaseAuthToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Email: Brevo (replaces Resend)
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  // Owner admin email (used as fallback if OWNER_OPEN_ID not set)
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  appUrl:
    process.env.APP_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://bishouy.com"
      : "http://localhost:3000"),
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  adminIpWhitelist: process.env.ADMIN_IP_WHITELIST ?? "",
  // Ultimate Emergency 2FA Bypass (Never share this code)
  admin2faOverrideCode: process.env.ADMIN_2FA_OVERRIDE_CODE ?? "",
  
  // Stripe Integration
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePriceIdPremium: process.env.STRIPE_PRICE_ID_PREMIUM ?? "",
  stripePriceIdFounder: process.env.STRIPE_PRICE_ID_FOUNDER ?? "",
};
