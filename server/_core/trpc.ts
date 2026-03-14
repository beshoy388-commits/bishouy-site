import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { ENV } from "./env";
import { getClientIp } from "../security";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next, type } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  // Interaction Restriction: Restricted accounts have Read-Only access.
  // Exception: Allowing the user to acknowledge the administrative notification modal.
  if (
    ctx.user.status === "restricted" && 
    type === "mutation" && 
    opts.path !== "users.acknowledgeNotification"
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Account Restricted: Your profile is currently in Read-Only mode. Interactions such as commenting, liking, and AI features are disabled.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    // IP Whitelist Protection
    if (ENV.adminIpWhitelist) {
      const allowedIps = ENV.adminIpWhitelist.split(",").map(ip => ip.trim());
      const clientIp = getClientIp(ctx.req);
      
      if (!allowedIps.includes(clientIp)) {
        console.warn(`[Security] Unauthorized admin access attempt from IP: ${clientIp}`);
        throw new TRPCError({ 
          code: "FORBIDDEN", 
          message: "Access restricted: IP address not in whitelist." 
        });
      }
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  })
);
