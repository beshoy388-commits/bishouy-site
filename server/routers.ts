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
} from "./db";
import { comments, InsertArticle, articles, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { aiChatCache } from "./cache";
import { logArticleAction } from "./audit";
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
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewsletterBroadcast,
  sendWelcomeNewsletterEmail,
} from "./_core/mail";
import { stripHtml } from "./utils";
import crypto from "crypto";
import { syncRSSFeeds } from "./rss";

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
  system: systemRouter,
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
      .mutation(async ({ input }) => {
        const existing = await getUserByEmail(input.email);
        if (existing)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already registered",
          });

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
      .query(async ({ input }) => {
        return getAllArticles(false, input?.category);
      }),

    // Public: List articles (now with filters)
    list: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        // If admin, show everything (drafts included)
        const isAdmin = ctx.user?.role === "admin";
        return getAllArticles(isAdmin, input?.category);
      }),

    // Public: Get article by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getArticleById(input.id);
      }),

    // Public: Get article by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return null;

        const isAdmin = ctx.user?.role === "admin";

        if (!isAdmin) {
          const result = await db
            .select()
            .from(articles)
            .where(
              and(
                eq(articles.slug, input.slug),
                eq(articles.status, "published")
              )
            )
            .limit(1);
          return result[0] || null;
        }

        const result = await db
          .select()
          .from(articles)
          .where(eq(articles.slug, input.slug))
          .limit(1);
        return result[0] || null;
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
          readTime: z.number().default(5),
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
        const article = await updateArticle(id, dbData);

        // Log the action
        await logArticleAction(
          ctx.user.id,
          "update",
          null,
          { title: input.title },
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
        return hasUserLikedArticle(input.userId, input.articleId);
      }),

    // Public: Get article with like info
    getWithLikeInfo: publicProcedure
      .input(z.object({ articleId: z.number(), userId: z.number().optional() }))
      .query(async ({ input }) => {
        return getArticleWithLikeInfo(input.articleId, input.userId);
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

        return createComment({
          articleId: input.articleId,
          userId: ctx.user.id,
          content: stripHtml(input.content),
          approved: 0, // Comments need admin approval
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
          imageUrl: z.string().url(),
          linkUrl: z.string().url(),
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
        return toggleArticleLike(input.articleId, ctx.user.id);
      }),
  }),

  bookmarks: router({
    // Protected: Get saved articles for logged-in user
    list: protectedProcedure.query(async ({ ctx }) => {
      return getSavedArticlesByUserId(ctx.user.id);
    }),

    // Protected: Check if a specific article is saved
    hasSaved: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .query(async ({ input, ctx }) => {
        return hasUserSavedArticle(input.articleId, ctx.user.id);
      }),

    // Protected: Toggle saved status of an article
    toggle: protectedProcedure
      .input(z.object({ articleId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return toggleSavedArticle(input.articleId, ctx.user.id);
      }),
  }),

  users: router({
    // Admin: Get all users
    getAll: adminProcedure.query(async () => {
      return getAllUsers();
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

    // Admin: Delete user
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteUser(input.id);
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
          .filter(s => s.active === 1 && s.unsubscribeToken)
          .map(s => ({ email: s.email, token: s.unsubscribeToken! }));

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

        if (!process.env.OPENROUTER_API_KEY) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI API key not configured",
          });
        }

        const openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: process.env.OPENROUTER_API_KEY,
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
            .orderBy(desc(articles.publishedAt))
            .limit(10);

          systemContext = `
            LATEST NEWS CONTEXT (Use this to answer questions about recent events):
            ${latestArticles.map(a => `- ${a.title} (${a.category}): ${a.excerpt}`).join("\n")}
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
            model: "meta-llama/llama-3-8b-instruct:free",
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
        } catch (error) {
          console.error("[AI Chat Error]", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate AI response",
          });
        }
      }),

    triggerNewsGeneration: adminProcedure.mutation(async () => {
      // Run asynchronously without awaiting so we don't block the request for long
      syncRSSFeeds().catch(err => console.error("[Manual AI Sync Error]", err));
      return {
        success: true,
        message: "AI news generation started in the background.",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
