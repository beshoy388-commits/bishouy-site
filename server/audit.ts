import { auditLogs, InsertAuditLog } from "../drizzle/schema";
import { getDb } from "./db";

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
  action: "create" | "update" | "delete",
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
