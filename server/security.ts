import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual, randomInt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

/**
 * Rate limiting store - in production, use Redis
 * Format: { key: { count: number, resetTime: number } }
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * @param key Unique identifier (e.g., userId, IP address)
 * @param maxAttempts Maximum attempts allowed
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 60000,
  isWhitelistedBot: boolean = false
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // Elevate limits for search bots (50x the standard limit)
  const actualLimit = isWhitelistedBot ? maxAttempts * 50 : maxAttempts;

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= actualLimit) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Validate and sanitize input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string, maxLength: number = 50000): string {
  if (typeof input !== "string") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input type" });
  }

  if (input.length > maxLength) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Input exceeds maximum length of ${maxLength}`,
    });
  }

  // Basic sanitization: Remove script tags and event handlers to prevent common XSS
  // For complex HTML, we rely on the library logic, but this is a safety net
  return input
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/on\w+\s*=/gim, "x-on=")
    .trim();
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 255;
}

/**
 * Validate image URL (basic validation)
 */
export function validateImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validProtocols = ["http:", "https:", "data:"];

    // We only check for a valid protocol.
    // Many CDNs and image hosting services (like Unsplash) don't use explicit file extensions in their URLs.
    // data: protocol is allowed to support internal base64 uploads.
    if (!validProtocols.includes(urlObj.protocol)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320;
}

/**
 * Extract IP address from request
 */
export function getClientIp(req: any): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return (forwarded as string).split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

/**
 * Express middleware to block blacklisted IPs
 */
export async function ipBlacklistMiddleware(req: any, res: any, next: any) {
  try {
    const { isIpBlacklisted } = await import("./db");
    const ip = getClientIp(req);
    const ua = getUserAgent(req);

    // BISHOUY.COM — FULL CRAWLER ACCESSIBILITY
    // Always allow official search bots, even if the IP is from a shared range previously flagged
    if (isBot(ua)) {
        return next();
    }

    if (await isIpBlacklisted(ip)) {
      console.warn(`[Security] Blocked request from blacklisted IP: ${ip}`);
      return res.status(403).send("Access restricted due to security violations.");
    }
    next();
  } catch (err) {
    console.error("[Security] IP Blacklist check failed:", err);
    next();
  }
}

/**
 * Detects if the request comes from a known search engine crawler
 */
export function isBot(userAgent: string): boolean {
  const bots = [
    "Googlebot",
    "Bingbot",
    "Slurp",
    "DuckDuckBot",
    "Baiduspider",
    "YandexBot",
    "Sogou",
    "Exabot",
    "facebot",
    "facebookexternalhit",
    "ia_archiver",
    "Lighthouse",
    "PageSpeed",
  ];
  return bots.some(bot => userAgent.includes(bot));
}

/**
 * Get user agent from request
 */
export function getUserAgent(req: any): string {
  return (req.headers["user-agent"] as string) || "unknown";
}

/**
 * Validate article data
 */
export const articleSchema = z.object({
  title: z.string().min(1).max(255),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1).max(50000),
  category: z.string().min(1).max(100),
  categoryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  author: z.string().min(1).max(255),
  authorRole: z.string().max(255).optional(),
  image: z.string(), // URL validation is handled separately via validateImageUrl
  featured: z.boolean().optional(),
  breaking: z.boolean().optional(),
  readTime: z.number().min(1).max(120).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  slug: z.string().min(1).max(255),
  status: z.enum(["draft", "published"]).optional(),
});

/**
 * Prevent common attack patterns
 */
export function detectSuspiciousInput(input: string): boolean {
  const suspiciousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /eval\(/gi,
    /expression\(/gi,
    /vbscript:/gi,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Validate and clean article data
 */
export function validateAndCleanArticleData(data: any) {
  // Validate against schema
  const validated = articleSchema.parse(data);

  // Additional security checks
  if (detectSuspiciousInput(validated.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Title contains suspicious content",
    });
  }

  if (detectSuspiciousInput(validated.excerpt)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Excerpt contains suspicious content",
    });
  }

  if (detectSuspiciousInput(validated.content)) {
    // We don't block content because it might contain valid code snippets, 
    // but we ensure it goes through sanitization
    validated.content = sanitizeInput(validated.content, 50000);
  } else {
    validated.content = validated.content.trim();
  }

  if (!validateImageUrl(validated.image)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image URL" });
  }

  if (!validateSlug(validated.slug)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid slug format",
    });
  }

  return validated;
}

/**
 * Password Security
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(keyBuffer, derivedKey);
}

export function generateVerificationCode(): string {
  // Use crypto.randomInt for cryptographically secure random number
  return randomInt(100000, 999999).toString();
}
