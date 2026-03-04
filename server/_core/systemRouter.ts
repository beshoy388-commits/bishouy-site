import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getDb, verificationCodes, getDashboardStats } from "../db";
import { desc } from "drizzle-orm";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  getDebugLogs: adminProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(verificationCodes).orderBy(desc(verificationCodes.createdAt)).limit(20);
    }),

  stats: adminProcedure
    .query(async () => {
      return getDashboardStats();
    }),
});
