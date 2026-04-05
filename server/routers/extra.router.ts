import { z } from "zod";
import { router, publicProcedure, adminProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getSavedArticlesByUserId,
  toggleSavedArticle,
  hasUserSavedArticle,
  getCommentsByArticle,
  createComment,
  deleteComment,
  approveComment,
  rejectComment,
  editComment,
  getAllComments,
  getPendingComments,
  getAllAdvertisements,
  createAdvertisement,
  deleteAdvertisement,
  createSubscriber,
  getAllSubscribers,
  getAllSentNewsletters,
  createSentNewsletterRecord,
  deleteSubscriber,
  getSiteSettings,
  updateSiteSetting,
  blacklistIp,
  getDb,
  comments,
} from "../db";
import { getClientIp, getUserAgent, checkRateLimit, sanitizeInput } from "../security";
import { logResourceAction } from "../audit";
import {
  sendWelcomeNewsletterEmail,
  sendNewsletterBroadcast,
} from "../_core/mail";
import { sendDailyNewsletter } from "../newsletter_job";
import { OpenAI } from "openai";
import { ENV } from "../_core/env";
import { aiChatCache, dbCache } from "../cache";
import { articles } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const extraRouter = router({
  // Bookmarks
  bookmarks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getSavedArticlesByUserId(ctx.user.id);
    }),
    hasSaved: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input, ctx }) => {
        return hasUserSavedArticle(input.articleId, ctx.user.id);
      }),
    toggle: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return toggleSavedArticle(input.articleId, ctx.user.id);
      }),
  }),

  // Comments
  comments: router({
    getAll: adminProcedure.query(async () => {
      return getAllComments();
    }),
    getPending: adminProcedure.query(async () => {
      return getPendingComments();
    }),
    getByArticle: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input, ctx }) => {
        const isAdmin = ctx.user?.role === "admin";
        return getCommentsByArticle(input.articleId, !isAdmin);
      }),
    create: protectedProcedure
      .input(z.object({ articleId: z.number(), content: z.string().min(1).max(1000) }))
      .mutation(async ({ input, ctx }) => {
        const rateLimitKey = `comment-${ctx.user.id}`;
        if (!checkRateLimit(rateLimitKey, 5, 60000)) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Calma! Too many comments." });
        }
        await logResourceAction(ctx.user.id, "create_comment", "article", input.articleId, { length: input.content.length }, getClientIp(ctx.req), getUserAgent(ctx.req));
        return createComment({
          articleId: input.articleId,
          userId: ctx.user.id,
          content: sanitizeInput(input.content),
          approved: 1,
        });
      }),
    editOwn: protectedProcedure
      .input(z.object({ id: z.number(), content: z.string().min(1).max(1000) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        const existing = await db!.select().from(comments).where(eq(comments.id, input.id)).limit(1);
        if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND" });
        if (existing[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return editComment(input.id, input.content, existing[0].content);
      }),
    deleteOwn: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        const existing = await db!.select().from(comments).where(eq(comments.id, input.id)).limit(1);
        if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND" });
        if (existing[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return deleteComment(input.id);
      }),
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return approveComment(input.id);
      }),
    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return rejectComment(input.id);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteComment(input.id);
      }),
  }),

  // Ads
  ads: router({
    list: publicProcedure.query(async () => {
      return getAllAdvertisements();
    }),
    getByPosition: publicProcedure
      .input(z.object({ position: z.enum(["sidebar", "banner_top", "banner_bottom", "inline"]) }))
      .query(async ({ input }) => {
        const all = await getAllAdvertisements();
        return all.filter((ad: any) => ad.position === input.position);
      }),
    create: adminProcedure
      .input(z.object({ 
          title: z.string(),
          imageUrl: z.string().optional(), 
          linkUrl: z.string().optional(), 
          adCode: z.string().optional(),
          position: z.enum(["sidebar", "banner_top", "banner_bottom", "inline"]),
          priority: z.number().default(0) 
      }))
      .mutation(async ({ input }) => {
        return createAdvertisement(input as any);
      }),
    delete: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return deleteAdvertisement(input);
      }),
  }),

  // Newsletter
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const cleanEmail = input.email.toLowerCase();
        const { token, alreadyActive } = await createSubscriber(cleanEmail);
        if (token && !alreadyActive) {
          sendWelcomeNewsletterEmail(cleanEmail, token).catch(console.error);
        }
        return { success: true };
      }),
    list: adminProcedure.query(async () => {
      return getAllSubscribers();
    }),
    getHistory: adminProcedure.query(async () => {
      return getAllSentNewsletters();
    }),
    broadcast: adminProcedure
      .input(z.object({ subject: z.string().min(1), htmlContent: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const subscribers = await getAllSubscribers();
        const activeRecipients = subscribers
          .filter((s: any) => s.active === 1 && s.unsubscribeToken)
          .map((s: any) => ({ email: s.email, token: s.unsubscribeToken! }));
        if (activeRecipients.length > 0) {
          sendNewsletterBroadcast(input.subject, input.htmlContent, activeRecipients).catch(console.error);
          await createSentNewsletterRecord({
            subject: input.subject,
            content: input.htmlContent,
            recipientCount: activeRecipients.length,
          });
        }
        return { success: true, count: activeRecipients.length };
      }),
    triggerDailyAITest: adminProcedure
      .input(z.object({ email: z.string().email().optional() }))
      .mutation(async ({ input, ctx }) => {
        const testTarget = input.email || ctx.user.email;
        if (!testTarget) throw new TRPCError({ code: "BAD_REQUEST", message: "No recipient email found." });
        sendDailyNewsletter(testTarget).catch(console.error);
        return { success: true, message: `Daily AI newsletter test sent to ${testTarget}.` };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteSubscriber } = await import("../db");
        return deleteSubscriber(input.id);
      }),
  }),

  // AI
  ai: router({
    chat: protectedProcedure
      .input(z.object({ messages: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() })) }))
      .mutation(async ({ input, ctx }) => {
        const isSubscriber = ctx.user?.subscriptionTier === "premium" || ctx.user?.subscriptionTier === "founder";
        const isAdmin = ctx.user?.role === "admin";
        
        if (!isSubscriber && !isAdmin) {
           throw new TRPCError({ code: "FORBIDDEN", message: "AI Assistant is a Premium feature." });
        }

        const rateLimitKey = `ai-chat-${ctx.user.id}`;
        if (!checkRateLimit(rateLimitKey, 30, 60000)) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many AI requests. Relax." });
        }
        if (!ENV.openRouterApiKey) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI key missing" });
        const openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: ENV.openRouterApiKey,
          defaultHeaders: { "HTTP-Referer": "https://bishouy.com", "X-Title": "Bishouy AI" },
        });
        const conversationKey = JSON.stringify(input.messages);
        const cachedResponse = aiChatCache.get(conversationKey);
        if (cachedResponse) return cachedResponse;
        let systemContext = "";
        const db = await getDb();
        if (db) {
          const latestArticles = await db
            .select({ title: articles.title, category: articles.category, excerpt: articles.excerpt })
            .from(articles)
            .where(eq(articles.status, "published"))
            .orderBy(desc(articles.createdAt))
            .limit(10);
          systemContext = `CONTEXT: ${latestArticles.map((a: any) => `- ${a.title}: ${a.excerpt}`).join("\n")}`;
        }
        const systemMessage = input.messages.find(m => m.role === "system")?.content || "You are BISHOUY AI.";
        const chatContents = input.messages.filter(m => m.role !== "system").map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
        const response = await openai.chat.completions.create({
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: [{ role: "system", content: systemMessage + "\n" + systemContext }, ...chatContents],
          temperature: 0.7,
        });
        const responseText = response.choices[0]?.message?.content || "No response";
        aiChatCache.set(conversationKey, responseText, 3600000);
        return responseText;
      }),
    triggerNewsGeneration: adminProcedure.mutation(async ({ ctx }) => {
      const { generateArticleFromTopic } = await import("../ai_service");
      const { createArticle } = await import("../db");
      
      const aiData = await generateArticleFromTopic(
        "Generate a top quality world news article for today."
      );
      
      const article = await createArticle({
        ...aiData,
        author: "Redazione AI",
        status: "draft",
        authorId: ctx.user.id,
      });

      if (article) {
        await logResourceAction(
          ctx.user.id,
          "trigger_ai_generation",
          "article",
          article.id,
          null,
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );
        return { success: true, message: "AI has synthesized a new broadcast segment.", article };
      }
      return { success: false, message: "Synthesis failed. Neural engine did not respond." };
    }),
  }),

  // Settings
  settings: router({
    getAll: adminProcedure.query(async () => {
      return getSiteSettings();
    }),
    update: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        if (input.key === "maintenance_mode") dbCache.delete("system_status");
        return updateSiteSetting(input.key, input.value);
      }),
  }),

  // Security
  security: router({
    getAuditLogs: adminProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        const { getAuditLogs } = await import("../audit");
        return getAuditLogs(input.limit);
      }),
    getBlacklistedIps: adminProcedure.query(async () => {
      const { getBlacklistedIps } = await import("../db");
      return getBlacklistedIps();
    }),
    blacklistIp: adminProcedure
      .input(z.object({ ip: z.string(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        await blacklistIp(input.ip, input.reason);
        return { success: true };
      }),
    unblacklistIp: adminProcedure
      .input(z.object({ ip: z.string() }))
      .mutation(async ({ input }) => {
        const { unblacklistIp } = await import("../db");
        await unblacklistIp(input.ip);
        return { success: true };
      }),
    clearBlacklist: adminProcedure.mutation(async () => {
      const { clearBlacklist } = await import("../db");
      await clearBlacklist();
      return { success: true };
    }),
    getIp: adminProcedure.query(async ({ ctx }) => {
      return { ip: getClientIp(ctx.req) };
    }),
  }),

  // Notifications
  notifications: router({
    getLatest: publicProcedure.query(async () => {
      const { getTrendingArticles } = await import("../db");
      return getTrendingArticles(10);
    }),
  }),
});
