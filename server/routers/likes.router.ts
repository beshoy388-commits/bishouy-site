import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  toggleArticleLike,
  getArticleLikeCount,
  hasUserLikedArticle,
  getArticleWithLikeInfo,
} from "../db";

export const likesRouter = router({
  toggle: protectedProcedure
    .input(z.object({ articleId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const liked = await toggleArticleLike(input.articleId, ctx.user.id);
      const count = await getArticleLikeCount(input.articleId);
      return { liked, count };
    }),

  getCount: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .query(async ({ input }) => {
      return getArticleLikeCount(input.articleId);
    }),

  hasUserLiked: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) return false;
      return hasUserLikedArticle(input.articleId, ctx.user.id);
    }),

  getWithInfo: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .query(async ({ input, ctx }) => {
      return getArticleWithLikeInfo(input.articleId, ctx.user?.id);
    }),
});
