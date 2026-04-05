import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import {
  getAnalyticsSummary,
  updateVisitorSession,
  getActiveVisitors,
} from "../db";
import { getClientIp, getUserAgent } from "../security";

export const analyticsRouter = router({
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
});
