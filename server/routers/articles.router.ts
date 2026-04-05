import { z } from "zod";
import { router, publicProcedure, adminProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllArticles,
  getArticleById,
  getArticleBySlugWithTracking,
  getTrendingArticles,
  getArticlesByCategory,
  searchArticles,
  getRelatedArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleArticleLike,
  getArticleLikeCount,
  hasUserLikedArticle,
  getArticleWithLikeInfo,
} from "../db";
import { InsertArticle } from "../../drizzle/schema";
import {
  validateAndCleanArticleData,
  getClientIp,
  getUserAgent,
} from "../security";
import { logArticleAction } from "../audit";
import { calculateReadTime } from "../utils";
import { generateArticleFromTopic } from "../ai_service";
import { dbCache } from "../cache";

export const articlesRouter = router({
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
        const category = input?.category || undefined;
        const limit = Math.min(input?.limit || 20, 100);
        const offset = input?.offset || 0;

        const cacheKey = `articles_list_${category || "all"}_${limit}_${offset}_${ctx.user?.id || "anon"}`;
        const cached = dbCache.get(cacheKey);
        if (cached) return cached;

        const result = await getAllArticles(
          false,
          category,
          limit,
          offset,
          ctx.user?.id
        );

        dbCache.set(cacheKey, result, 60000);
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
          limit + 1,
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
    .query(async ({ input, ctx }) => {
      const article = await getArticleById(input.id);
      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
      }

      const isAdmin = ctx.user?.role === "admin";
      
      // DRAFTS LOCKDOWN: Only admins can view drafts
      if (article.status !== "published" && !isAdmin) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Intelligence segment is restricted." });
      }

      const isUserPremium = ctx.user?.subscriptionTier === "premium" || ctx.user?.subscriptionTier === "founder";

      if (article.premiumOnly === 1 && !isUserPremium && !isAdmin) {
           const teaserLength = 450;
           if (article.content && article.content.length > teaserLength) {
              article.content = article.content.substring(0, teaserLength) + "... [PREMIUM CONTENT REDACTED]";
           }
           article.summary = null; 
           article.factCheck = null;
      }
      return article;
    }),

  // Public: Get article by slug (with tracking)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const ip = getClientIp(ctx.req);
        const ua = getUserAgent(ctx.req);
        
        const result = await getArticleBySlugWithTracking(input.slug, ctx.user?.id, ip, ua);
        if (!result) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
        }

        const isAdmin = ctx.user?.role === "admin";
        
        if (result.status !== "published" && !isAdmin) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Specified intelligence segment is currently restricted or in synthesis.",
          });
        }

        const isUserPremium = ctx.user?.subscriptionTier === "premium" || ctx.user?.subscriptionTier === "founder";
        
        if (result.premiumOnly === 1 && !isUserPremium && !isAdmin) {
          const teaserLength = 450;
          if (result.content && result.content.length > teaserLength) {
              result.content = result.content.substring(0, teaserLength) + "... [PREMIUM CONTENT REDACTED]";
          }
          result.summary = null;
          result.factCheck = null;
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[tRPC] Error in getBySlug:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to retrieve article details.",
        });
      }
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
      const results = await searchArticles(input.query);
      // SECURITY: Sanitize search results to prevent content leakage in JSON
      return results.map(r => ({
        ...r,
        content: "", // Content is never needed for search lists
      }));
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
        summary: z.string().optional(),
        factCheck: z.string().optional(),
        premiumOnly: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const validatedData = validateAndCleanArticleData(input);
      const dbData: any = {
        ...validatedData,
        featured: validatedData.featured ? 1 : 0,
        breaking: validatedData.breaking ? 1 : 0,
        tags: Array.isArray(validatedData.tags)
          ? JSON.stringify(validatedData.tags)
          : validatedData.tags,
        publishedAt: validatedData.status === "published" ? new Date() : null,
        readTime: input.readTime || calculateReadTime(input.content),
        premiumOnly: input.premiumOnly ? 1 : 0,
      };
      const article = await createArticle(dbData);

      await logArticleAction(
        ctx.user.id,
        "create",
        article.id,
        { title: input.title },
        getClientIp(ctx.req),
        getUserAgent(ctx.req)
      );

      // FORCE CACHE REFRESH: Ensures the new article appears immediately
      dbCache.clear();

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
        summary: z.string().optional(),
        factCheck: z.string().optional(),
        premiumOnly: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const dbData: Partial<InsertArticle> = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value === undefined) return;
        if (key === "featured" || key === "breaking" || key === "premiumOnly") {
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

      await logArticleAction(
        ctx.user.id,
        "update",
        id,
        { title: input.title || currentArticle.title },
        getClientIp(ctx.req),
        getUserAgent(ctx.req)
      );

      // FORCE CACHE REFRESH: Ensures status changes (Publish/Draft) reflect immediately
      dbCache.clear();

      return article;
    }),

  // Public: Get Article Count
  getCount: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const { getArticleCount } = await import("../db");
      return getArticleCount(false, input?.category);
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

      await logArticleAction(
        ctx.user.id,
        "delete",
        input.id,
        { title: article.title },
        getClientIp(ctx.req),
        getUserAgent(ctx.req)
      );

      // FORCE CACHE REFRESH: Ensures the article is removed from all list feeds immediately
      dbCache.clear();

      return { success: true };
    }),

  toggleLike: protectedProcedure
    .input(z.object({ articleId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return toggleArticleLike(input.articleId, ctx.user.id);
    }),
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

      const NEWS_PHOTOS = [
        "photo-1504711434969-e33886168f5c", "photo-1503676260728-1c00da094a0b",
        "photo-1512428559087-560fa5ceab42", "photo-1526304640581-d334cdbbf45e",
        "photo-1460925895917-afdab827c52f", "photo-1518770660439-4636190af475",
        "photo-1550751827-4bd374c3f58b", "photo-1508921340878-ba53e1f016ec",
        "photo-1532094349884-543bc11b234d", "photo-1486406146926-c627a92ad1ab",
      ];
      let hash = 0;
      for (let i = 0; i < slug.length; i++) {
        hash = ((hash << 5) - hash) + slug.charCodeAt(i);
        hash |= 0;
      }
      const photoId = NEWS_PHOTOS[Math.abs(hash % NEWS_PHOTOS.length)];

      const articleData = {
        title: generated.title,
        slug,
        excerpt: generated.excerpt,
        content: generated.content,
        category: (generated.category as any) || "World",
        categoryColor: (categoryColors as any)[generated.category] || "#E8A020",
        author: authorName,
        authorRole: authorRole,
        image: `https://loremflickr.com/1200/800/${(generated.imagePrompt || generated.category || "news").toLowerCase().replace(/[^a-z]/g, "")}?lock=${Math.abs(hash % 1000)}`,
        seoTitle: generated.seoTitle || generated.title,
        seoDescription: generated.seoDescription || generated.excerpt,
        status: "draft",
        featured: 0,
        breaking: 0,
        tags: JSON.stringify(generated.tags || []),
        publishedAt: null as any,
        sourceUrl: null,
        sourceTitle: `Bishouy Editorial Research | Assigned to ${authorName}`,
        summary: JSON.stringify(generated.summary || []),
        factCheck: generated.factCheck || "98% Neural Integrity",
      };

      return {
        ...articleData,
        tags: JSON.stringify(generated.tags || []),
        readTime: calculateReadTime(generated.content)
      };
    }),
});
