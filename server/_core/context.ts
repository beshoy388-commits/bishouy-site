import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { isIpBlacklisted } from "../db";
import { getClientIp } from "../security";
import { TRPCError } from "@trpc/server";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // 1. Global IP Blacklist Check
  const clientIp = getClientIp(opts.req);
  if (await isIpBlacklisted(clientIp)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Access denied: Your IP address has been restricted due to security policy violations."
    });
  }

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error: any) {
    // If it's a specific security error (like BANNED or DELETED), we should NOT allow anonymous fallback
    if (error?.message?.includes("Account Terminated") || error?.message?.includes("Account Deactivated")) {
       throw new TRPCError({
         code: "FORBIDDEN",
         message: error.message
       });
    }
    // Otherwise, generic auth failure means they are just not logged in (anonymous)
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
