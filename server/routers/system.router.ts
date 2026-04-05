import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAnalyticsSummary,
  updateSiteSetting,
  getSiteSettings,
  blacklistIp,
  getDb,
  verificationCodes,
} from "../db";
import { getClientIp, getUserAgent } from "../security";
import { logResourceAction } from "../audit";
import { aiChatCache, dbCache } from "../cache";
import { desc } from "drizzle-orm";
import { sendBrevoEmail } from "../_core/mail";

export const systemRouter = router({
  stats: adminProcedure.query(async () => {
    return getAnalyticsSummary();
  }),

  clearCache: adminProcedure.mutation(async ({ ctx }) => {
    aiChatCache.clear();
    dbCache.clear();
    await logResourceAction(
      ctx.user.id,
      "clear_cache",
      "system",
      undefined,
      null,
      getClientIp(ctx.req),
      getUserAgent(ctx.req)
    );
    return { success: true, message: "System cache cleared successfully." };
  }),

  emergencyLockdown: adminProcedure.mutation(async ({ ctx }) => {
    await updateSiteSetting("maintenance_mode", "true");
    await logResourceAction(
      ctx.user.id,
      "emergency_lockdown",
      "system",
      undefined,
      { maintenance_mode: "true" },
      getClientIp(ctx.req),
      getUserAgent(ctx.req)
    );
    return { success: true, message: "Emergency lockdown engaged." };
  }),

  syncRss: adminProcedure.mutation(async ({ ctx }) => {
    const { syncRSSFeeds } = await import("../rss");
    const result = await syncRSSFeeds();
    await logResourceAction(
      ctx.user.id,
      "sync_rss",
      "system",
      undefined,
      null,
      getClientIp(ctx.req),
      getUserAgent(ctx.req)
    );
    return result;
  }),

  getStatus: publicProcedure.query(async () => {
    const cacheKey = "system_status";
    const cached = dbCache.get(cacheKey);
    if (cached) return cached;

    try {
      const settings = await getSiteSettings();
      const status = {
        maintenance: settings.find(s => s.key === "maintenance_mode")?.value === "true",
        siteName: settings.find(s => s.key === "site_name")?.value || "BISHOUY",
        siteDescription: settings.find(s => s.key === "site_description")?.value || "Uncompromising Journalistic Excellence in the Digital Age.",
        allowComments: settings.find(s => s.key === "allow_comments")?.value !== "false",
        socialX: settings.find(s => s.key === "social_x")?.value || "https://x.com/bishouy_news",
      };
      dbCache.set(cacheKey, status, 30000);
      return status;
    } catch (e) {
      return { maintenance: false, siteName: "BISHOUY", allowComments: true };
    }
  }),

  testEmail: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const success = await sendBrevoEmail({
        to: input.email,
        subject: "Bishouy System: Email Connection Test",
        htmlContent: "<h1>Email Connection Successful</h1>",
      });

      await logResourceAction(ctx.user.id, "test_email", "system", undefined, { recipient: input.email }, getClientIp(ctx.req), getUserAgent(ctx.req), success ? "success" : "failure");

      if (!success) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Brevo API rejected the request." });
      return { success: true, message: "Test email sent successfully!" };
    }),

  getDebugLogs: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const results = await db
      .select()
      .from(verificationCodes)
      .orderBy(desc(verificationCodes.createdAt))
      .limit(20);
    
    return results.map((item: any) => ({
      ...item,
      code: item.code.length > 2 ? `${item.code.slice(0, 1)}****${item.code.slice(-1)}` : "****"
    }));
  }),
});
