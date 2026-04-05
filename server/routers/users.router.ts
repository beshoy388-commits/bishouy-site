import { z } from "zod";
import { router, adminProcedure, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllUsers,
  getUserById,
  updateUser,
  markForDeletion,
  restrictUser,
  activateUser,
  purgeUser,
  banUser,
  getBackupCodes,
  updateBackupCodes,
  getUserByEmail,
  getPublicUserByUsername,
  getPublicUserComments,
  createVerificationCode,
  getLatestVerificationCode,
  deleteVerificationCodeByEmail,
  markStatusNotificationRead,
} from "../db";
import {
  getClientIp,
  getUserAgent,
  hashPassword,
  verifyPassword,
  generateVerificationCode,
} from "../security";
import { logResourceAction } from "../audit";
import { sdk } from "../_core/sdk";
import {
  sendEmailChangeCode,
} from "../_core/mail";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

export const usersRouter = router({
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
        subscriptionTier: z.enum(["free", "premium", "founder"]).optional(),
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
        if (error?.message?.includes("UNIQUE constraint failed: users.username")) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This username is already taken. Please choose another.",
          });
        }
        throw error;
      }
    }),

  // Protected: Request Email Change (Safety Protocol)
  requestEmailChange: protectedProcedure
    .input(z.object({ newEmail: z.string().email() }))
    .mutation(async ({ input }) => {
      const existing = await getUserByEmail(input.newEmail);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "This email is already associated with an editorial account." });
      }
      
      const code = generateVerificationCode();
      await createVerificationCode({
        email: input.newEmail,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      });
      
      await sendEmailChangeCode(input.newEmail, code);
      return { success: true, message: "Verification protocol initiated. Check your new inbox." };
    }),

  // Protected: Verify and Commit Email Change
  verifyEmailChange: protectedProcedure
    .input(z.object({ newEmail: z.string().email(), code: z.string().min(6) }))
    .mutation(async ({ input, ctx }) => {
      const latestCode = await getLatestVerificationCode(input.newEmail);
      if (!latestCode || latestCode.code !== input.code || latestCode.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Verification failed. Code is invalid or has expired." });
      }
      
      await updateUser(ctx.user.id, { email: input.newEmail });
      await deleteVerificationCodeByEmail(input.newEmail);
      
      return { success: true, message: "Identity successfully updated." };
    }),

  // Protected: System Safety Toggle (2FA)
  toggle2FA: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await updateUser(ctx.user.id, { twoFactorEnabled: input.enabled ? 1 : 0 });
      return { success: true, message: input.enabled ? "Enhanced security protocol engaged (Email 2FA)." : "Security protocol downgraded." };
    }),

  // Protected: Communication Intelligence Preferences
  updatePreferences: protectedProcedure
    .input(z.object({ subscribeToNewsletter: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      await updateUser(ctx.user.id, { subscribeToNewsletter: input.subscribeToNewsletter ? 1 : 0 });
      return { success: true, message: "Communication channels updated." };
    }),

  // Protected: Change Password (Old Password Verification)
  changePassword: protectedProcedure
    .input(z.object({ 
      oldPassword: z.string(), 
      newPassword: z.string().min(8) 
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user || !user.password) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Account has no local password." });
      }

      const isMatch = await verifyPassword(input.oldPassword, user.password);
      if (!isMatch) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password verification failed." });
      }

      const hashedPassword = await hashPassword(input.newPassword);
      await updateUser(ctx.user.id, { password: hashedPassword });
      
      return { success: true, message: "Password updated successfully." };
    }),

  // Protected: Request Password Reset Code (Forgotten Password while logged in)
  requestPasswordResetCode: protectedProcedure
    .mutation(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user || !user.email) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User identity unresolved." });
      }

      const code = generateVerificationCode();
      await createVerificationCode({
        email: user.email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      });

      // Import sendPasswordResetCode locally to avoid circular dependencies if any
      const { sendPasswordResetCode } = await import("../_core/mail");
      await sendPasswordResetCode(user.email, code);
      return { success: true, message: "A recovery code has been dispatched to your registered email." };
    }),

  // Protected: Verify Password Reset Code and Update
  verifyPasswordResetCode: protectedProcedure
    .input(z.object({ 
      code: z.string().min(6), 
      newPassword: z.string().min(8) 
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user || !user.email) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User identity unresolved." });
      }

      const latestCode = await getLatestVerificationCode(user.email);
      if (!latestCode || latestCode.code !== input.code || latestCode.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired recovery code." });
      }

      const hashedPassword = await hashPassword(input.newPassword);
      await updateUser(ctx.user.id, { password: hashedPassword });
      await deleteVerificationCodeByEmail(user.email);

      return { success: true, message: "Security credentials reassigned successfully." };
    }),

  // Protected: Mock Upgrade to Premium (In place of real payment gateway)
  mockUpgrade: protectedProcedure
    .input(z.object({ tier: z.enum(["premium", "founder"]) }))
    .mutation(async ({ input, ctx }) => {
      await updateUser(ctx.user.id, { subscriptionTier: input.tier });
      return { success: true, message: `Subscription confirmed. Welcome to the ${input.tier.toUpperCase()} tier.` };
    }),

  // Protected: Cancel Subscription
  cancelSubscription: protectedProcedure
    .mutation(async ({ ctx }) => {
      await updateUser(ctx.user.id, { subscriptionTier: "free" });
      return { success: true, message: "Subscription canceled. Your account has been reverted to the Free tier." };
    }),

  // Admin: Wipe account (Request Hard Delete)
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

  // Admin: Deactivate account
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
          // Logic for IP blacklisting
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

  // Admin: Impersonate user
  impersonate: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const user = await getUserById(input.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      if (user.role === "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Security Protocol: Admin-to-Admin impersonation is prohibited." });
      }

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: 1000 * 60 * 60, // 1 hour for impersonation
      });

      await logResourceAction(
        ctx.user.id,
        "impersonate",
        "user",
        input.id,
        { targetUser: user.username, targetEmail: user.email },
        getClientIp(ctx.req),
        getUserAgent(ctx.req)
      );

      return { 
        success: true, 
        token: sessionToken,
        redirect: `/auth/callback?token=${sessionToken}`
      };
    }),

  // Protected: User wipes their own account
  purgeMe: protectedProcedure.mutation(async ({ ctx }) => {
      const userId = ctx.user.id;
      const user = await getUserById(userId);
      
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

  // Admin/Security: Generate 2FA Backup Codes
  generate2FABackupCodes: adminProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.user.id;
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 14).toUpperCase()
      );
      await updateBackupCodes(userId, codes);
      
      await logResourceAction(userId, "generate_backup_codes", "user", userId, {}, getClientIp(ctx.req), getUserAgent(ctx.req));
      
      return { success: true, codes };
    }),
    
  // Admin/Security: Get current 2FA status
  get2FASecurityInfo: adminProcedure
    .query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      const backupCodes = await getBackupCodes(ctx.user.id);
      return {
        twoFactorEnabled: user?.twoFactorEnabled === 1,
        backupCodesCount: backupCodes.length,
        hasBackupCodes: backupCodes.length > 0
      };
  }),
});
