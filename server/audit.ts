import { auditLogs, InsertAuditLog, users } from "../drizzle/schema";
import { getDb } from "./db";
import { desc, eq } from "drizzle-orm";

export async function getAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    id: auditLogs.id,
    userId: auditLogs.userId,
    userName: users.name,
    action: auditLogs.action,
    resource: auditLogs.resource,
    resourceId: auditLogs.resourceId,
    changes: auditLogs.changes,
    ipAddress: auditLogs.ipAddress,
    userAgent: auditLogs.userAgent,
    status: auditLogs.status,
    errorMessage: auditLogs.errorMessage,
    createdAt: auditLogs.createdAt,
  })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function logAuditAction(data: InsertAuditLog): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database not available, skipping audit log");
    return;
  }

  try {
    await db.insert(auditLogs).values(data);
  } catch (error) {
    console.error("[Audit] Failed to log action:", error);
    // Don't throw - audit logging should never break the main operation
  }
}

export async function logArticleAction(
  userId: number,
  action: "create" | "update" | "delete" | "ai_generate",
  articleId: number | null,
  changes: Record<string, any> | null,
  ipAddress?: string,
  userAgent?: string,
  status: "success" | "failure" = "success",
  errorMessage?: string
): Promise<void> {
  await logAuditAction({
    userId,
    action,
    resource: "article",
    resourceId: articleId || undefined,
    changes: changes ? JSON.stringify(changes) : null,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    status,
    errorMessage: errorMessage || null,
  });
}

export async function logAuthAction(
  userId: number,
  action: "login" | "logout" | "failed_login",
  ipAddress?: string,
  userAgent?: string,
  status: "success" | "failure" = "success",
  errorMessage?: string
): Promise<void> {
  await logAuditAction({
    userId,
    action,
    resource: "auth",
    resourceId: undefined,
    changes: null,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    status,
    errorMessage: errorMessage || null,
  });
}

export async function logResourceAction(
  userId: number,
  action: string,
  resource: string,
  resourceId?: number,
  changes: Record<string, any> | null = null,
  ipAddress?: string,
  userAgent?: string,
  status: "success" | "failure" = "success",
  errorMessage?: string
): Promise<void> {
  await logAuditAction({
    userId,
    action,
    resource,
    resourceId: resourceId || undefined,
    changes: changes ? JSON.stringify(changes) : null,
    ipAddress: ipAddress || null,
    userAgent: userAgent || null,
    status,
    errorMessage: errorMessage || null,
  });
}
