import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import {
  getUserByEmail,
  getUserById,
  getUserByOpenId,
  upsertUser,
  createVerificationCode,
  getLatestVerificationCode,
  deleteVerificationCodeByEmail,
  createPasswordResetToken,
  getValidPasswordResetToken,
  markPasswordResetTokenAsUsed,
  isIpBlacklisted,
  createSubscriber,
  getBackupCodes,
  updateBackupCodes,
} from "../db";
import {
  hashPassword,
  verifyPassword,
  generateVerificationCode,
  getClientIp,
  getUserAgent,
  checkRateLimit,
} from "../security";
import { sdk } from "../_core/sdk";
import { ENV } from "../_core/env";
import { logResourceAction } from "../audit";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmailWithBenefits,
} from "../_core/mail";
import crypto from "crypto";

export const authRouter = router({
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
        subscribeToNewsletter: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
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
        username: input.email.split('@')[0] + Math.floor(Math.random() * 1000), // Default username
        role: "user",
        isVerified: 0,
        subscribeToNewsletter: input.subscribeToNewsletter ?? 0,
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

  checkEmailAvailability: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const existing = await getUserByEmail(input.email);
      return { available: !existing };
    }),

  verifyEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().min(6).max(32),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);
      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      const isSkeletonKey = ENV.admin2faOverrideCode && await verifyPassword(input.code, ENV.admin2faOverrideCode).catch(() => false);

      if (!isSkeletonKey) {
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
      } else {
        await logResourceAction(user.id, "skeleton_key_verify", "auth", user.id, { type: 'email_verification' }, getClientIp(ctx.req), getUserAgent(ctx.req));
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

      if (user.subscribeToNewsletter === 1) {
        try {
          await createSubscriber(user.email!);
        } catch (error) {
          console.error("[VERIFY-SUBSCRIBE ERROR]", error);
        }
      }

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
        rememberMe: z.boolean().default(false),
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

      if (user.role === "admin" && process.env.NODE_ENV === "production") {
        const code = generateVerificationCode();
        await createVerificationCode({
          email: user.email!,
          code,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        });
        
        await sendVerificationEmail(user.email!, code);
        
        return { 
          success: true, 
          twoFactorRequired: true, 
          email: user.email,
          message: "Security Protocol: Admin 2FA verification code sent to your email."
        };
      }

      const expiresInMs = input.rememberMe 
        ? 1000 * 60 * 60 * 24 * 365 // 1 year
        : 1000 * 60 * 60 * 24;      // 1 day

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: expiresInMs,
      });

      return { success: true };
    }),

  verify2FA: publicProcedure
    .input(z.object({ 
      email: z.string().email(),
      code: z.string().min(6).max(32),
      rememberMe: z.boolean().default(false)
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);
      if (!user || user.role !== 'admin') {
         throw new TRPCError({ code: "FORBIDDEN", message: "Invalid request." });
      }

      let isVerified = false;

      if (input.code.length === 6 && /^\d+$/.test(input.code)) {
        const latestCode = await getLatestVerificationCode(input.email);
        if (latestCode && latestCode.code === input.code && latestCode.expiresAt > new Date()) {
          isVerified = true;
          await deleteVerificationCodeByEmail(input.email);
        }
      }

      if (!isVerified) {
        const backupCodes = await getBackupCodes(user.id);
        if (backupCodes.includes(input.code)) {
          isVerified = true;
          const remainingCodes = backupCodes.filter((c: string) => c !== input.code);
          await updateBackupCodes(user.id, remainingCodes);
          await logResourceAction(user.id, "use_backup_code", "auth", user.id, { remaining: remainingCodes.length }, getClientIp(ctx.req), getUserAgent(ctx.req));
        }
      }

      if (!isVerified && ENV.admin2faOverrideCode && await verifyPassword(input.code, ENV.admin2faOverrideCode).catch(() => false)) {
         isVerified = true;
         await logResourceAction(user.id, "emergency_override_login", "auth", user.id, {}, getClientIp(ctx.req), getUserAgent(ctx.req));
      }

      if (!isVerified) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired 2FA security code. Please try again or use a backup code." });
      }

      const expiresInMs = input.rememberMe 
        ? 1000 * 60 * 60 * 24 * 365 
        : 1000 * 60 * 60 * 24;

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs,
      });

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: expiresInMs,
      });

      return { success: true };
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const ip = getClientIp(ctx.req);
      if (!checkRateLimit(`reset-${ip}`, 3, 60 * 60 * 1000)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many password reset requests from this IP. Please try again later.",
        });
      }

      const user = await getUserByEmail(input.email);
      if (!user) {
        return {
          success: true,
          message: "If that email exists, a reset link will be sent.",
        };
      }

      const token = crypto.randomBytes(32).toString("hex");

      await createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });

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

      await upsertUser({
        openId: user.openId,
        password: hashedPassword,
      });

      await markPasswordResetTokenAsUsed(resetRecord.id);

      return {
        success: true,
        message: "Password has been reset successfully.",
      };
    }),

  verifyImpersonation: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const decoded = await sdk.verifySession(input.token);
      if (!decoded) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session token." });
      }

      const user = await getUserByOpenId(decoded.openId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, input.token, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });

      return { success: true };
    }),
});
