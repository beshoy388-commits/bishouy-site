import "dotenv/config";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByCategory,
  searchArticles,
  getCommentsByArticle,
  createComment,
  approveComment,
  rejectComment,
  deleteComment,
  getPendingComments,
  getActiveAdvertisements,
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  banUser,
  purgeUser,
  restrictUser,
  isIpBlacklisted,
  blacklistIp,
  getAllBlacklistedIps,
  removeIpFromBlacklist,
  clearAllBlacklistedIps,
  toggleArticleLike,
  getArticleLikeCount,
  hasUserLikedArticle,
  getArticleWithLikeInfo,
  getDb,
  createSubscriber,
  getAllSubscribers,
  deleteSubscriber,
  getUserByEmail,
  createVerificationCode,
  getLatestVerificationCode,
  deleteVerificationCodeByEmail,
  upsertUser,
  editComment,
  createPasswordResetToken,
  getValidPasswordResetToken,
  markPasswordResetTokenAsUsed,
  getAllComments,
  createSentNewsletterRecord,
  getAllSentNewsletters,
  toggleSavedArticle,
  hasUserSavedArticle,
  getSavedArticlesByUserId,
  getRelatedArticles,
  getPublicUserByUsername,
  getPublicUserComments,
  getArticleBySlugWithTracking,
  getTrendingArticles,
  getAnalyticsSummary,
  getBreakingArticles,
  getSiteSettings,
  updateSiteSetting,
  getSocialPosts,
  getSocialLikeCount,
  createSocialPost,
  toggleSocialLike,
  hasUserLikedSocialPost,
  deleteSocialPost,
  updateSocialPostStatus,
  activateUser,
  markStatusNotificationRead,
  markForDeletion,
  updateVisitorSession,
  getActiveVisitors,
} from "./db";
import { comments, InsertArticle, articles, users, verificationCodes } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { ENV } from "./_core/env";
import { aiChatCache, dbCache } from "./cache";
import { getAuditLogs, logArticleAction, logResourceAction } from "./audit";
import {
  checkRateLimit,
  validateAndCleanArticleData,
  getClientIp,
  getUserAgent,
  hashPassword,
  verifyPassword,
  generateVerificationCode,
} from "./security";
import { sdk } from "./_core/sdk";
import { sendDailyNewsletter } from "./newsletter_job";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewsletterBroadcast,
  sendWelcomeNewsletterEmail,
  sendWelcomeEmailWithBenefits,
  sendBrevoEmail,
} from "./_core/mail";
import { stripHtml, calculateReadTime } from "./utils";
import crypto from "crypto";
import { syncRSSFeeds } from "./rss";
import { generateArticleFromTopic, moderateContent } from "./ai_service";

// Local cache for maintenance mode to avoid DB spam
let maintenanceCache: { value: boolean; expires: number } | null = null;

// Middleware to check for maintenance mode
const maintenanceMiddleware = async ({ ctx, next }: any) => {
  // Allow admins to bypass maintenance
  if (ctx.user?.role === "admin") {
    return next({ ctx });
  }

  const now = Date.now();
  let isMaintenance = false;

  if (maintenanceCache && now < maintenanceCache.expires) {
    isMaintenance = maintenanceCache.value;
  } else {
    try {
      const settings = await getSiteSettings();
      isMaintenance = settings.find(s => s.key === "maintenance_mode")?.value === "true";
      maintenanceCache = { value: isMaintenance, expires: now + 5000 }; // Cache for 5 seconds
    } catch (e) {
      // If settings table not found, proceed anyway
    }
  }

  if (isMaintenance) {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message: "SYSTEM_MAINTENANCE",
    });
  }

  return next({ ctx });
};

// Use maintenance check for public procedures too, unless it's a settings check
const publicMaintenanceProcedure = publicProcedure.use(maintenanceMiddleware);

// Admin-only procedure with security checks
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can perform this action",
    });
  }

  // Rate limiting for admin operations
  const userId = ctx.user.id.toString();
  if (!checkRateLimit(`admin-${userId}`, 100, 60000)) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many admin requests. Please try again later.",
    });
  }

  return next({ ctx });
});

export const appRouter = router({
  system: router({
    stats: adminProcedure.query(async () => {
      const stats = await getAnalyticsSummary();
      return stats;
    }),
    clearCache: adminProcedure.mutation(async ({ ctx }) => {
      aiChatCache.clear();
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
      return { success: true, message: "Emergency lockdown engaged. Platform is now offline." };
    }),
    getDebugLogs: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(verificationCodes)
        .orderBy(desc(verificationCodes.createdAt))
        .limit(20);
    }),
    syncRss: adminProcedure.mutation(async ({ ctx }) => {
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
          allowComments: settings.find(s => s.key === "allow_comments")?.value !== "false",
          adsenseId: settings.find(s => s.key === "google_adsense_id")?.value || null,
          adsenseAutoAds: settings.find(s => s.key === "adsense_auto_ads")?.value === "true",
        };
        dbCache.set(cacheKey, status, 30000); // Cache for 30s
        return status;
      } catch (e) {
        return { maintenance: false, siteName: "BISHOUY", allowComments: true, adsenseId: null, adsenseAutoAds: false };
      }
    }),
    testEmail: adminProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const success = await sendBrevoEmail({
          to: input.email,
          subject: "Bishouy System: Email Connection Test",
          htmlContent: `
            <h1 style="color: #E8A020;">Email Connection Successful</h1>
            <p>This is a test email sent from the <b>BISHOUY.COM</b> system console to verify your Brevo SMTP configuration.</p>
            <hr/>
            <p>Timestamp: ${new Date().toISOString()}</p>
          `,
        });

        await logResourceAction(
          ctx.user.id,
          "test_email",
          "system",
          undefined,
          { recipient: input.email },
          getClientIp(ctx.req),
          getUserAgent(ctx.req),
          success ? "success" : "failure"
        );

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Brevo API rejected the request. Please check server logs for specific API error (usually invalid API key or unverified sender).",
          });
        }
        return { success: true, message: "Test email sent successfully! Please check your inbox/spam folder." };
      }),
    blacklistIp: adminProcedure
      .input(z.object({ ip: z.string(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        await blacklistIp(input.ip, input.reason);
        await logResourceAction(
          ctx.user.id,
          "blacklist_ip",
          "system",
          undefined,
          { ip: input.ip, reason: input.reason },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );
        return { success: true };
      }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    register: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(8),
          name: z.string().min(2),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // 1. IP Blacklist Check
        const clientIp = getClientIp(ctx.req);
        if (await isIpBlacklisted(clientIp)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Your access has been restricted due to security policy violations.",
          });
        }

        const existing = await getUserByEmail(input.email);
        if (existing) {
          if (existing.status === "banned") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "This email address is permanently banned from our services.",
            });
          }
          if (existing.status === "deleted") {
             throw new TRPCError({
              code: "FORBIDDEN",
              message: "This account has been deactivated and cannot be re-registered.",
            });
          }
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already registered",
          });
        }

        const hashedPassword = await hashPassword(input.password);
        const openId = `local-${Buffer.from(input.email).toString("hex")}`;

        await upsertUser({
          openId,
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: "user",
          isVerified: 0,
        });

        const code = generateVerificationCode();
        await createVerificationCode({
          email: input.email,
          code,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
        });

        await sendVerificationEmail(input.email, code);
        return { success: true, message: "Verification code sent to email." };
      }),

    verifyEmail: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          code: z.string().length(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const latestCode = await getLatestVerificationCode(input.email);
        if (
          !latestCode ||
          latestCode.code !== input.code ||
          latestCode.expiresAt < new Date()
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired code",
          });
        }

        await upsertUser({
          openId: user.openId,
          isVerified: 1,
        });

        await deleteVerificationCodeByEmail(input.email);

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: 1000 * 60 * 60 * 24 * 365,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });

        // Send professional welcome email after successful verification
        try {
          await sendWelcomeEmailWithBenefits(user.email!, user.name || "Nuovo Utente");
        } catch (error) {
          console.error("[WELCOME EMAIL ERROR]", error);
        }

        return { success: true };
      }),

    resendVerification: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
        })
      )
      .mutation(async ({ input }) => {
        const user = await getUserByEmail(input.email);
        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        if (user.isVerified)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User already verified",
          });

        // Generate new code
        const code = generateVerificationCode();
        await createVerificationCode({
          email: input.email,
          code,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
        });

        await sendVerificationEmail(input.email, code);
        return { success: true, message: "Verification code resent." };
      }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByEmail(input.email);
        if (!user || !user.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        const isMatch = await verifyPassword(input.password, user.password);
        if (!isMatch) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        if (!user.isVerified) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Please verify your email first",
          });
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: 1000 * 60 * 60 * 24 * 365,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });

        return { success: true };
      }),

    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        // Anti-abuse: rate limiting by IP (max 3 reqs per hour)
        const ip = getClientIp(ctx.req);
        if (!checkRateLimit(`reset-${ip}`, 3, 60 * 60 * 1000)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "Too many password reset requests from this IP. Please try again later.",
          });
        }

        const user = await getUserByEmail(input.email);
        // Security best practice: Even if user is not found, we act like it succeeded to prevent email enumeration.
        if (!user) {
          return {
            success: true,
            message: "If that email exists, a reset link will be sent.",
          };
        }

        // Create a long unique token
        const token = crypto.randomBytes(32).toString("hex");

        await createPasswordResetToken({
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        });

        // Generate full URL
        const resetUrl = `${ctx.req.protocol}://${ctx.req.get("host")}/reset-password?token=${token}`;

        await sendPasswordResetEmail(input.email, resetUrl);
        return {
          success: true,
          message: "If that email exists, a reset link will be sent.",
        };
      }),

    resetPassword: publicProcedure
      .input(
        z.object({
          token: z.string(),
          newPassword: z.string().min(8),
        })
      )
      .mutation(async ({ input }) => {
        const resetRecord = await getValidPasswordResetToken(input.token);

        if (!resetRecord || resetRecord.expiresAt < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired password reset token.",
          });
        }

        const user = await getUserById(resetRecord.userId);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
        }

        const hashedPassword = await hashPassword(input.newPassword);

        // Update user
        await upsertUser({
          openId: user.openId,
          password: hashedPassword,
        });

        // Mark token as used to prevent replay attacks
        await markPasswordResetTokenAsUsed(resetRecord.id);

        return {
          success: true,
          message: "Password has been reset successfully.",
        };
      }),
  }),

  articles: router({
    // Public: Get all articles (now with filters)
    getAll: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        return getAllArticles(false, input?.category, undefined, undefined, ctx.user?.id);
      }),

    // Public: List articles (now with filters)
    list: publicProcedure
      .input(
        z
          .object({
            category: z.string().optional(),
            limit: z.number().optional().default(20),
            offset: z.number().optional().default(0),
          })
          .optional()
      )
      .query(async ({ input, ctx }) => {
        try {
          // Robustness: handle null/undefined input and sanitize parameters
          const category = input?.category || undefined;
          const limit = Math.min(input?.limit || 20, 100);
          const offset = input?.offset || 0;

          // Caching for public list to improve "opening" speed
          // Cache key includes category/limit/offset and user ID (if logic depends on it)
          const cacheKey = `articles_list_${category || "all"}_${limit}_${offset}_${ctx.user?.id || "anon"}`;
          const cached = dbCache.get(cacheKey);
          if (cached) return cached;

          // Public list should focus strictly on published content
          const result = await getAllArticles(
            false,
            category,
            limit,
            offset,
            ctx.user?.id
          );

          dbCache.set(cacheKey, result, 60000); // Cache for 60s
          return result;
        } catch (error) {
          console.error("[tRPC] Error in articles.list:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable to retrieve articles at this time.",
            cause: error
          });
        }
      }),
      
    // Public: List articles with infinite loading cursor support
    listInfinite: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          limit: z.number().min(1).max(50).default(10),
          cursor: z.number().nullish(), // offset
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const limit = input.limit ?? 10;
          const offset = input.cursor ?? 0;
          
          const cacheKey = `articles_list_inf_${input.category || "all"}_${limit}_${offset}_${ctx.user?.id || "anon"}`;
          const cached = dbCache.get(cacheKey);
          if (cached) return cached;

          const items = await getAllArticles(
            false,
            input.category,
            limit + 1, // Fetch one extra to know if there's a next page
            offset,
            ctx.user?.id
          );

          let nextCursor: typeof offset | undefined = undefined;
          if (items.length > limit) {
            items.pop();
            nextCursor = offset + limit;
          }

          const result = {
            items,
            nextCursor,
          };

          dbCache.set(cacheKey, result, 60000);
          return result;
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable to retrieve articles.",
            cause: error
          });
        }
      }),

    // Admin: List ALL articles (including drafts)
    listAdmin: adminProcedure
      .input(
        z
          .object({
            category: z.string().optional(),
            limit: z.number().optional().default(50),
            offset: z.number().optional().default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return getAllArticles(
          true,
          input?.category,
          input?.limit,
          input?.offset
        );
      }),

    // Public: Get article by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getArticleById(input.id);
      }),

    // Public: Get article by slug (with tracking)
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input, ctx }) => {
        const ip = getClientIp(ctx.req);
        const ua = getUserAgent(ctx.req);
        const isAdmin = ctx.user?.role === "admin";

        // Admin views don't count toward analytics
        if (isAdmin) {
          const db = await getDb();
          const result = await db!
            .select()
            .from(articles)
            .where(eq(articles.slug, input.slug))
            .limit(1);
          return result[0] || null;
        }

        return getArticleBySlugWithTracking(input.slug, ctx.user?.id, ip, ua);
      }),

    // Public: Get trending articles
    trending: publicProcedure
      .input(z.object({ limit: z.number().default(5) }).optional())
      .query(async ({ input }) => {
        return getTrendingArticles(input?.limit);
      }),

    // Public: Get articles by category
    getByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input, ctx }) => {
        const isAdmin = ctx.user?.role === "admin";
        return getArticlesByCategory(input.category, isAdmin);
      }),

    // Public: Search articles
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return searchArticles(input.query);
      }),

    // Public: Get related articles
    getRelated: publicProcedure
      .input(z.object({ articleId: z.number(), limit: z.number().default(3) }))
      .query(async ({ input }) => {
        return getRelatedArticles(input.articleId, input.limit);
      }),

    // Protected: Create article (admin only)
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          slug: z.string().min(1).max(255),
          excerpt: z.string().min(1).max(500),
          content: z.string().min(1).max(50000),
          category: z.string(),
          categoryColor: z.string(),
          author: z.string(),
          authorRole: z.string(),
          image: z.string(),
          featured: z.boolean().default(false),
          breaking: z.boolean().default(false),
          status: z.enum(["draft", "published"]).default("published"),
          readTime: z.number().optional(),
          tags: z.array(z.string()).default([]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const validatedData = validateAndCleanArticleData(input);
        // Convert boolean to int and array to string for database
        const dbData: any = {
          ...validatedData,
          featured: validatedData.featured ? 1 : 0,
          breaking: validatedData.breaking ? 1 : 0,
          tags: Array.isArray(validatedData.tags)
            ? JSON.stringify(validatedData.tags)
            : validatedData.tags,
          publishedAt: validatedData.status === "published" ? new Date() : null,
          readTime: input.readTime || calculateReadTime(input.content),
        };
        const article = await createArticle(dbData);

        // Log the action
        await logArticleAction(
          ctx.user.id,
          "create",
          null,
          { title: input.title },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        return article;
      }),

    // Protected: Update article (admin only)
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(255).optional(),
          slug: z.string().min(1).max(255).optional(),
          excerpt: z.string().min(1).max(500).optional(),
          content: z.string().min(1).max(50000).optional(),
          category: z.string().optional(),
          categoryColor: z.string().optional(),
          author: z.string().optional(),
          authorRole: z.string().optional(),
          image: z.string().optional(),
          featured: z.boolean().optional(),
          breaking: z.boolean().optional(),
          status: z.enum(["draft", "published"]).optional(),
          readTime: z.number().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        // Convert boolean to int and array to string for database
        const dbData: Partial<InsertArticle> = {};
        Object.entries(updateData).forEach(([key, value]) => {
          if (value === undefined) return;
          if (key === "featured" || key === "breaking") {
            (dbData as any)[key] = value ? 1 : 0;
          } else if (key === "tags") {
            (dbData as any)[key] = Array.isArray(value)
              ? JSON.stringify(value)
              : value;
          } else {
            (dbData as any)[key] = value;
          }
        });

        const currentArticle = await getArticleById(id);
        if (!currentArticle) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
        }

        if (updateData.status === "published" && !currentArticle.publishedAt) {
          dbData.publishedAt = new Date();
        }

        const article = await updateArticle(id, dbData);

        // Log the action with accurate title
        await logArticleAction(
          ctx.user.id,
          "update",
          id,
          { title: input.title || currentArticle.title },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        return article;
      }),

    // Protected: Delete article (admin only)
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const article = await getArticleById(input.id);
        if (!article) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found",
          });
        }

        await deleteArticle(input.id);

        // Log the action
        await logArticleAction(
          ctx.user.id,
          "delete",
          input.id,
          { title: article.title },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        return { success: true };
      }),

    // Protected: Toggle like on article
    toggleLike: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return toggleArticleLike(ctx.user.id, input.articleId);
      }),

    // Public: Get like count for article
    getLikeCount: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        return getArticleLikeCount(input.articleId);
      }),

    // Public: Check if user has liked article
    hasLiked: publicProcedure
      .input(z.object({ articleId: z.number(), userId: z.number().optional() }))
      .query(async ({ input }) => {
        if (!input.userId) return false;
        return hasUserLikedArticle(input.articleId, input.userId);
      }),

    // Public: Get article with like info
    getWithLikeInfo: publicProcedure
      .input(z.object({ articleId: z.number(), userId: z.number().optional() }))
      .query(async ({ input }) => {
        return getArticleWithLikeInfo(input.articleId, input.userId);
      }),

    // Protected: Generate article from topic (admin only)
    generate: adminProcedure
      .input(z.object({ topic: z.string().min(3) }))
      .mutation(async ({ input, ctx }) => {
        const generated = await generateArticleFromTopic(input.topic);

        const slug = input.topic
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") +
          "-" +
          Math.floor(Math.random() * 10000);

        const categoryColors: Record<string, string> = {
          World: "#E8A020",
          Politics: "#C0392B",
          Economy: "#27AE60",
          Technology: "#2980B9",
          Culture: "#8E44AD",
          Sports: "#E67E22",
        };

        const authorName = "Bishouy Editorial";
        const authorRole = "Editorial Desk";

        const articleData = {
          title: generated.title,
          slug,
          excerpt: generated.excerpt,
          content: generated.content,
          category: (generated.category as any) || "World",
          categoryColor: (categoryColors as any)[generated.category] || "#E8A020",
          author: authorName,
          authorRole: authorRole,
          image: `https://image.pollinations.ai/prompt/${encodeURIComponent(generated.imagePrompt || generated.title)}?width=1200&height=800&nologo=true&enhance=true`,
          seoTitle: generated.seoTitle || generated.title,
          seoDescription: generated.seoDescription || generated.excerpt,
          status: "draft",
          featured: 0,
          breaking: 0,
          tags: JSON.stringify(generated.tags || []),
          publishedAt: null as any,
          sourceUrl: null,
          sourceTitle: `Bishouy Editorial Research | Assigned to ${authorName}`,
        };

        return {
          ...articleData,
          tags: JSON.stringify(generated.tags || []),
          readTime: calculateReadTime(generated.content)
        };
      }),
  }),

  comments: router({
    // Admin: Get ALL comments across the site
    getAll: adminProcedure.query(async () => {
      return getAllComments();
    }),

    // Public: Get approved comments for an article
    getByArticle: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        return getCommentsByArticle(input.articleId, true);
      }),

    // Protected: Create a comment
    create: protectedProcedure
      .input(
        z.object({
          articleId: z.number(),
          content: z.string().min(1).max(5000),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Rate limiting for comments
        const userId = ctx.user.id.toString();
        if (!checkRateLimit(`comment-${userId}`, 10, 60000)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many comments. Please try again later.",
          });
        }

        const article = await getArticleById(input.articleId);
        if (!article) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found",
          });
        }

        const settings = await getSiteSettings();
        const allowComments = settings.find(s => s.key === "allow_comments")?.value !== "false";

        if (!allowComments && ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Comments are currently disabled for this site.",
          });
        }

        const moderationSetting = settings.find(s => s.key === "comment_moderation")?.value === "true";
        const isUserAdmin = ctx.user.role === "admin";

        return createComment({
          articleId: input.articleId,
          userId: ctx.user.id,
          content: stripHtml(input.content),
          approved: (moderationSetting && !isUserAdmin) ? 0 : 1,
        });
      }),

    // Admin: Get pending comments
    getPending: adminProcedure.query(async () => {
      return getPendingComments();
    }),

    // Admin: Get all comments for an article (including unapproved)
    getAllByArticle: adminProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        return getCommentsByArticle(input.articleId, false);
      }),

    // Admin: Approve comment
    approve: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return approveComment(input.id);
      }),

    // Admin: Reject comment
    reject: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await rejectComment(input.id);
        return { success: true };
      }),

    // Admin: Delete comment
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteComment(input.id);
        return { success: true };
      }),

    // Protected: Delete own comment
    deleteOwn: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database unavailable",
          });
        const comment = await db
          .select()
          .from(comments)
          .where(eq(comments.id, input.id))
          .limit(1);
        if (comment.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Comment not found",
          });
        }
        if (comment[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only delete your own comments",
          });
        }
        await deleteComment(input.id);
        return { success: true };
      }),

    // Protected: Edit own comment
    editOwn: protectedProcedure
      .input(z.object({ id: z.number(), content: z.string().min(1).max(1000) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database unavailable",
          });

        const comment = await db
          .select()
          .from(comments)
          .where(eq(comments.id, input.id))
          .limit(1);
        if (comment.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Comment not found",
          });
        }
        if (comment[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only edit your own comments",
          });
        }

        return editComment(input.id, input.content, comment[0].content);
      }),
  }),

  advertisements: router({
    // Public: Get active ads for a specific position
    getByPosition: publicProcedure
      .input(
        z.object({
          position: z.enum([
            "sidebar",
            "banner_top",
            "banner_bottom",
            "inline",
          ]),
        })
      )
      .query(async ({ input }) => {
        return getActiveAdvertisements(input.position);
      }),

    // Admin: Get all ads
    getAll: adminProcedure.query(async () => {
      return getAllAdvertisements();
    }),

    // Admin: Create ad
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          imageUrl: z.string().url().optional(),
          adCode: z.string().optional(),
          linkUrl: z.string().url().optional(),
          position: z.enum([
            "sidebar",
            "banner_top",
            "banner_bottom",
            "inline",
          ]),
          active: z.number().default(1),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return createAdvertisement(input);
      }),

    // Admin: Update ad
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(255).optional(),
          imageUrl: z.string().url().optional(),
          adCode: z.string().optional(),
          linkUrl: z.string().url().optional(),
          position: z
            .enum(["sidebar", "banner_top", "banner_bottom", "inline"])
            .optional(),
          active: z.number().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        return updateAdvertisement(id, updateData);
      }),

    // Admin: Delete ad
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAdvertisement(input.id);
        return { success: true };
      }),
  }),

  likes: router({
    // Public: Get like count for an article
    getCount: publicProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input }) => {
        return getArticleLikeCount(input.articleId);
      }),

    // Protected: Check if user liked an article
    hasUserLiked: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input, ctx }) => {
        return hasUserLikedArticle(input.articleId, ctx.user.id);
      }),

    // Protected: Toggle like on an article
    toggle: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const liked = await toggleArticleLike(input.articleId, ctx.user.id);
        const likeCount = await getArticleLikeCount(input.articleId);
        return { liked, likeCount };
      }),
  }),

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

  analytics: router({
    getSummary: adminProcedure.query(async () => {
      return getAnalyticsSummary();
    }),
    heartbeat: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        currentPath: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const ip = getClientIp(ctx.req);
        const ua = getUserAgent(ctx.req);

        console.log(`[Heartbeat] Session: ${input.sessionId}, Path: ${input.currentPath}, User: ${ctx.user?.id || 'Guest'}`);

        // Basic location placeholder (or we could fetch from API)
        // For now we'll just store information we already have
        await updateVisitorSession({
          sessionId: input.sessionId,
          userId: ctx.user?.id || null,
          ipAddress: ip,
          userAgent: ua,
          currentPath: input.currentPath,
          lastActiveAt: new Date(),
        });

        return { success: true };
      }),
    getLiveVisitors: adminProcedure.query(async () => {
      return getActiveVisitors(5); // Last 5 minutes
    }),
  }),

  notifications: router({
    getLatest: publicProcedure.query(async () => {
      return getBreakingArticles(5);
    }),
  }),

  users: router({
    // Admin: Get all users
    getAll: adminProcedure.query(async () => {
      return getAllUsers();
    }),

    // Protected: Get current user info (for status monitoring)
    getMe: protectedProcedure.query(async ({ ctx }) => {
      return getUserById(ctx.user.id);
    }),

    // Protected: Acknowledge status notification
    acknowledgeNotification: protectedProcedure.mutation(async ({ ctx }) => {
      await markStatusNotificationRead(ctx.user.id);
      return { success: true };
    }),

    // Admin: Get user by ID
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getUserById(input.id);
      }),

    // Admin: Update user
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().max(255).optional(),
          email: z.string().email().optional(),
          role: z.enum(["user", "admin"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        return updateUser(id, updateData);
      }),

    // Protected: Update own profile
    updateMe: protectedProcedure
      .input(
        z.object({
          name: z.string().max(255).optional(),
          username: z.string().max(50).optional(),
          bio: z.string().max(500).optional(),
          avatarUrl: z.string().url().optional().or(z.literal("")),
          website: z.string().url().optional().or(z.literal("")),
          location: z.string().max(100).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          return await updateUser(ctx.user.id, input);
        } catch (error: any) {
          if (
            error?.message?.includes("UNIQUE constraint failed: users.username")
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "This username is already taken. Please choose another.",
            });
          }
          throw error;
        }
      }),

    // Admin: Wipe account (Request Hard Delete) - Sets status to 'deleted', user must confirm to wipe
    delete: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        await markForDeletion(input.id, input.reason);
        
        await logResourceAction(
          ctx.user.id,
          "scheduled_purge",
          "user",
          input.id,
          { username: user.username, email: user.email, reason: input.reason },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        return { success: true, message: "Account marked for deletion. User will be notified to confirm data wipe." };
      }),

    // Admin: Deactivate account (Soft Restriction) - Allows login, blocks interaction (read-only)
    deactivate: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(input.id);
        if (!user) {
           throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        
        await restrictUser(input.id, input.reason);

        await logResourceAction(
          ctx.user.id,
          "deactivate",
          "user",
          input.id,
          { username: user.username, email: user.email, type: "read_only_restriction", reason: input.reason },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        return { success: true, message: "Account deactivated. User now has Read-Only access." };
      }),

    // Admin: Restore account (Back to active)
    activate: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        
        await activateUser(input.id, input.reason);

        await logResourceAction(
          ctx.user.id,
          "activate",
          "user",
          input.id,
          { username: user.username, email: user.email, reason: input.reason },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        return { success: true, message: "Account status restored to Active." };
      }),

    // Admin: Wipe user (Request Hard Delete)
    // Marks user as deleted. They see a terminal notification and can trigger the final purge.
    purge: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        
        await markForDeletion(input.id, input.reason);

        await logResourceAction(
          ctx.user.id,
          "scheduled_purge",
          "user",
          input.id,
          { username: user.username, email: user.email, reason: input.reason },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        return { success: true, message: "Account scheduled for physical removal." };
      }),

    // Admin: Immediate Physical Wipe (Bypasses notification)
    finalPurge: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        
        await purgeUser(input.id);

        await logResourceAction(
          ctx.user.id,
          "final_wipe",
          "user",
          input.id,
          { username: user.username, email: user.email, type: "manual_hard_purge" },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        return { success: true, message: "Account physically removed from database." };
      }),

    // Admin: Ban user
    ban: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string().optional(), blacklistIp: z.boolean().default(false) }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserById(input.id);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        await banUser(input.id, input.reason);

        if (input.blacklistIp) {
            // Logic for IP blacklisting could be added here if we had the last observed IP
        }
        
        await logResourceAction(
          ctx.user.id,
          "ban",
          "user",
          input.id,
          { username: user.username, email: user.email, reason: input.reason },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        return { success: true, message: "User has been banned and access restricted." };
      }),

    // Protected: User wipes their own account (Hard Delete)
    purgeMe: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.user.id;
        const user = await getUserById(userId);
        
        // Log before deletion
        await logResourceAction(
          userId,
          "self_purge",
          "user",
          userId,
          { email: user?.email, type: "user_triggered_hard_delete" },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );

        await purgeUser(userId);

        // Clear session cookie automatically
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

        return { success: true };
    }),

    // Public: Get user by username for public profile
    getByUsername: publicProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ input }) => {
        const user = await getPublicUserByUsername(input.username);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        return user;
      }),

    // Public: Get recent approved comments by a user
    getPublicComments: publicProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ input }) => {
        return getPublicUserComments(input.username);
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const cleanEmail = stripHtml(input.email).toLowerCase();
        const { token, alreadyActive } = await createSubscriber(cleanEmail);

        // Only send welcome email if they weren't already active
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
      .input(
        z.object({
          subject: z.string().min(1),
          htmlContent: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const subscribers = await getAllSubscribers();
        const activeRecipients = subscribers
          .filter((s: any) => s.active === 1 && s.unsubscribeToken)
          .map((s: any) => ({ email: s.email, token: s.unsubscribeToken! }));

        if (activeRecipients.length > 0) {
          // Fire and forget (will run async in background)
          sendNewsletterBroadcast(
            input.subject,
            input.htmlContent,
            activeRecipients
          ).catch(console.error);

          // Record the broadcast in history
          await createSentNewsletterRecord({
            subject: input.subject,
            content: input.htmlContent,
            recipientCount: activeRecipients.length,
          });
        }

        return { success: true, count: activeRecipients.length };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteSubscriber(input.id);
      }),

    // Admin-only: Send a manual test of the AI DAILY Newsletter (7 AM template)
    // This allows the editor to verify the automatic morning brief layout & content.
    triggerDailyAITest: adminProcedure
      .input(z.object({ email: z.string().email().optional() }))
      .mutation(async ({ input, ctx }) => {
        const testTarget = input.email || ctx.user.email;
        if (!testTarget) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No recipient email found.",
          });
        }
        // Send asynchronously
        sendDailyNewsletter(testTarget).catch(err => {
          console.error("[Manual Newsletter Test Error]", err);
        });
        return {
          success: true,
          message: `Daily AI newsletter test sent to ${testTarget}. Check inbox.`,
        };
      }),
  }),

  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["system", "user", "assistant"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Rate limiting for AI chat (30 requests per minute per user/IP)
        const rateLimitKey = ctx.user?.id
          ? `ai-chat-${ctx.user.id}`
          : `ai-chat-ip-${getClientIp(ctx.req)}`;
        if (!checkRateLimit(rateLimitKey, 30, 60000)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message:
              "Too many AI requests. Please wait a moment before trying again.",
          });
        }

        if (!ENV.openRouterApiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI API key not configured",
          });
        }

        const openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: ENV.openRouterApiKey,
          defaultHeaders: {
            "HTTP-Referer": "https://bishouy.com",
            "X-Title": "Bishouy AI Assistant",
          },
        });
        const db = await getDb();

        // Create cache key from messages
        const conversationKey = JSON.stringify(input.messages);
        const cachedResponse = aiChatCache.get(conversationKey);
        if (cachedResponse) {
          return cachedResponse;
        }

        let systemContext = "";
        if (db) {
          const latestArticles = await db
            .select({
              title: articles.title,
              category: articles.category,
              excerpt: articles.excerpt,
              publishedAt: articles.publishedAt,
            })
            .from(articles)
            .where(eq(articles.status, "published"))
            .orderBy(desc(articles.createdAt))
            .limit(10);

          systemContext = `
            LATEST NEWS CONTEXT (Use this to answer questions about recent events):
            ${latestArticles.map((a: any) => `- ${a.title} (${a.category}): ${a.excerpt}`).join("\n")}
          `;
        }

        const systemMessage =
          input.messages.find(m => m.role === "system")?.content ||
          "You are the BISHOUY AI Assistant.";

        // Filter out system messages for the contents array, convert assistant/user
        const chatContents = input.messages
          .filter(m => m.role !== "system")
          .map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        try {
          const response = await openai.chat.completions.create({
            model: "meta-llama/llama-3.3-70b-instruct",
            // @ts-ignore - OpenRouter specific fallback extension
            extra_body: {
              models: [
                "nousresearch/hermes-3-llama-3.1-405b",
                "meta-llama/llama-3.3-70b-instruct",
                "google/gemma-3-27b-it:free",
                "openrouter/free",
              ],
            },
            messages: [
              {
                role: "system",
                content: systemMessage + "\n" + systemContext,
              },
              ...chatContents,
            ],
            temperature: 0.7,
          });

          const responseText =
            response.choices[0]?.message?.content ||
            "I'm sorry, I couldn't process that request at this moment.";

          // Cache the response for 1 hour
          aiChatCache.set(conversationKey, responseText, 3600000);

          return responseText;
        } catch (error: any) {
          console.error("[AI Chat Error]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Failed to generate AI response: " +
              (error.message || "Unknown error"),
          });
        }
      }),

    triggerNewsGeneration: adminProcedure.mutation(async () => {
      try {
        const result = await syncRSSFeeds(true); // true = manual sync bypasses setting check
        return {
          success: result.success,
          message: result.message || "Generazione completata.",
        };
      } catch (err: any) {
        console.error("[Manual AI Sync Error]", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Errore durante la generazione dell'articolo: " + err.message
        });
      }
    }),
  }),
  settings: router({
    getAll: adminProcedure.query(async () => {
      try {
        return await getSiteSettings();
      } catch (e) {
        console.warn("[Settings] Table not found or DB error:", e);
        return [];
      }
    }),
    update: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        try {
          return await updateSiteSetting(input.key, input.value);
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update settings in database. Ensure migrations are applied.",
          });
        }
      }),
  }),
  social: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        const posts = await getSocialPosts("approved", input.limit);
        // Enrich with like counts and user like status in parallel
        return Promise.all(posts.map(async (post) => {
          const likeCount = await getSocialLikeCount(post.id);
          return { ...post, likeCount };
        }));
      }),

    create: protectedProcedure
      .input(z.object({ content: z.string().min(1).max(500) }))
      .mutation(async ({ input, ctx }) => {
        const rateLimitKey = `social-post-${ctx.user.id}`;
        if (!checkRateLimit(rateLimitKey, 10, 3600000)) { // 10 posts per hour
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Community limit reached. Take a break and come back later.",
          });
        }

        // AI Moderation
        const moderation = await moderateContent(input.content);

        const post = await createSocialPost({
          content: input.content,
          authorId: ctx.user.id,
          status: moderation.action === "approved" ? "approved" : moderation.action,
          aiScore: moderation.score,
          aiReason: moderation.reason,
        });

        if (moderation.action === "rejected") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Content flagged by AI: ${moderation.reason}`,
          });
        }

        return {
          post,
          message: moderation.action === "approved"
            ? "Post shared successfully."
            : "Post submitted and pending review.",
        };
      }),

    toggleLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return toggleSocialLike(input.postId, ctx.user.id);
      }),

    getUserLikeStatus: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input, ctx }) => {
        const liked = await hasUserLikedSocialPost(input.postId, ctx.user.id);
        const count = await getSocialLikeCount(input.postId);
        return { liked, count };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const posts = await getSocialPosts("approved", 100); // Check if they own it
        const post = posts.find(p => p.id === input.id);

        if (!post && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (post?.authorId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await deleteSocialPost(input.id);
        return { success: true };
      }),

    // Admin routes
    adminList: adminProcedure
      .input(z.object({ status: z.enum(["approved", "pending", "rejected", "flagged"]) }))
      .query(async ({ input }) => {
        return getSocialPosts(input.status, 100);
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected", "flagged"])
      }))
      .mutation(async ({ input }) => {
        return updateSocialPostStatus(input.id, input.status);
      }),
  }),

  // Global Security Management
  security: router({
    getAuditLogs: adminProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return getAuditLogs(input.limit);
      }),
    
    getBlacklistedIps: adminProcedure.query(async () => {
      return getAllBlacklistedIps();
    }),

    blacklistIp: adminProcedure
      .input(z.object({ ip: z.string(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        await blacklistIp(input.ip, input.reason);
        await logResourceAction(
          ctx.user.id,
          "blacklist_ip",
          "system",
          undefined,
          { ip: input.ip, reason: input.reason },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );
        return { success: true };
      }),

    unblacklistIp: adminProcedure
      .input(z.object({ ip: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await removeIpFromBlacklist(input.ip);
        await logResourceAction(
          ctx.user.id,
          "unblacklist_ip",
          "system",
          undefined,
          { ip: input.ip },
          getClientIp(ctx.req),
          getUserAgent(ctx.req)
        );
        return { success: true };
      }),
    clearBlacklist: adminProcedure.mutation(async ({ ctx }) => {
      await clearAllBlacklistedIps();
      await logResourceAction(
        ctx.user.id,
        "clear_ip_blacklist",
        "system",
        undefined,
        { action: "purge_all" },
        getClientIp(ctx.req),
        getUserAgent(ctx.req)
      );
      return { success: true };
    }),

    getIp: adminProcedure.query(async ({ ctx }) => {
      return { ip: getClientIp(ctx.req) };
    }),
  }),
});

export type AppRouter = typeof appRouter;
