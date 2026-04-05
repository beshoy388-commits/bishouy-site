import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getSocialPosts,
  getSocialLikeCount,
  createSocialPost,
  toggleSocialLike,
  hasUserLikedSocialPost,
  deleteSocialPost,
  updateSocialPostStatus,
} from "../db";
import { moderateContent } from "../ai_service";
import { checkRateLimit } from "../security";

export const socialRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const posts = await getSocialPosts("approved", input.limit);
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
      const posts = await getSocialPosts("approved", 100); 
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
});
