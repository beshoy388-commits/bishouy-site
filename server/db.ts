import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
export { users, articles, comments, advertisements, articleLikes, subscribers, verificationCodes, passwordResetTokens } from "../drizzle/schema";
import { InsertUser, User, users, articles, InsertArticle, Article, comments, InsertComment, Comment, advertisements, InsertAdvertisement, Advertisement, articleLikes, ArticleLike, InsertArticleLike, subscribers, InsertSubscriber, verificationCodes, VerificationCode, InsertVerificationCode, passwordResetTokens, PasswordResetToken, InsertPasswordResetToken } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    try {
      const dbUrl = ENV.databaseUrl || "file:sqlite.db";
      const authToken = ENV.databaseAuthToken;
      const client = createClient({
        url: dbUrl,
        authToken: authToken || undefined
      });
      _db = drizzle(client);

      // Eseguiamo una migrazione manuale "leggera" (non bloccante) per le nuove colonne di commenti,
      // utile per scavalcare i warning di Drizzle e Turso durante il deploy
      try {
        await client.execute('ALTER TABLE comments ADD COLUMN originalContent TEXT;');
        console.log('[Migration] Added originalContent column to comments');
      } catch (err) {
        // Se la colonna esiste già, ignora l'errore
      }

      try {
        await client.execute('ALTER TABLE comments ADD COLUMN isEdited INTEGER DEFAULT 0;');
        console.log('[Migration] Added isEdited column to comments');
      } catch (err) {
        // Ignora
      }

      // Migration for unsubscribe token in newsletter subscribers
      try {
        await client.execute('ALTER TABLE subscribers ADD COLUMN unsubscribeToken TEXT;');
        console.log('[Migration] Added unsubscribeToken column to subscribers');
      } catch (err) {
        // Column already exists — ignore
      }

    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "password"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.isVerified !== undefined) {
      values.isVerified = user.isVerified;
      updateSet.isVerified = user.isVerified;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId || (ENV.ownerEmail && user.email === ENV.ownerEmail)) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}



// Article queries
export async function getAllArticles(includeDrafts = false): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];

  if (includeDrafts) {
    return db.select().from(articles).orderBy(desc(articles.createdAt));
  }

  return db.select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.createdAt));
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createArticle(data: InsertArticle): Promise<Article> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const created = await db.insert(articles).values(data).returning();
  if (!created[0]) throw new Error("Failed to create article");
  return created[0];
}

export async function updateArticle(id: number, data: Partial<InsertArticle>): Promise<Article> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updated = await db.update(articles).set(data).where(eq(articles.id, id)).returning();
  if (!updated[0]) throw new Error("Failed to update article");
  return updated[0];
}

export async function deleteArticle(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(articles).where(eq(articles.id, id));
}

export async function getArticlesByCategory(category: string, includeDrafts = false): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];

  if (includeDrafts) {
    return db.select().from(articles).where(eq(articles.category, category)).orderBy(desc(articles.createdAt));
  }

  return db.select()
    .from(articles)
    .where(
      and(
        eq(articles.category, category),
        eq(articles.status, "published")
      )
    )
    .orderBy(desc(articles.createdAt));
}

// Type for comment with user info
export type CommentWithUser = Comment & {
  userName: string | null;
  userUsername: string | null;
  userAvatarUrl: string | null;
};

// Comment queries
export async function getCommentsByArticle(articleId: number, onlyApproved: boolean = true): Promise<CommentWithUser[]> {
  const db = await getDb();
  if (!db) return [];

  const whereCondition = onlyApproved
    ? and(eq(comments.articleId, articleId), eq(comments.approved, 1))
    : eq(comments.articleId, articleId);

  const rows = await db
    .select({
      id: comments.id,
      articleId: comments.articleId,
      userId: comments.userId,
      content: comments.content,
      originalContent: comments.originalContent,
      isEdited: comments.isEdited,
      approved: comments.approved,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userName: users.name,
      userUsername: users.username,
      userAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(whereCondition)
    .orderBy(desc(comments.createdAt));

  return rows as CommentWithUser[];
}

export async function getAllComments(): Promise<CommentWithUser[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: comments.id,
      articleId: comments.articleId,
      userId: comments.userId,
      content: comments.content,
      originalContent: comments.originalContent,
      isEdited: comments.isEdited,
      approved: comments.approved,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userName: users.name,
      userUsername: users.username,
      userAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .orderBy(desc(comments.createdAt));

  return rows as CommentWithUser[];
}

export async function createComment(data: InsertComment): Promise<Comment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const created = await db.insert(comments).values(data).returning();
  if (!created[0]) throw new Error("Failed to create comment");
  return created[0];
}

export async function approveComment(id: number): Promise<Comment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updated = await db.update(comments).set({ approved: 1 }).where(eq(comments.id, id)).returning();
  if (!updated[0]) throw new Error("Failed to approve comment");
  return updated[0];
}

export async function rejectComment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(comments).set({ approved: -1 }).where(eq(comments.id, id));
}

export async function deleteComment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(comments).where(eq(comments.id, id));
}

export async function editComment(id: number, newContent: string, currentContent: string): Promise<Comment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const comment = await db.select().from(comments).where(eq(comments.id, id)).limit(1);
  if (!comment[0]) throw new Error("Comment not found");

  const originalContent = comment[0].originalContent || currentContent;

  const updated = await db.update(comments)
    .set({
      content: newContent,
      originalContent: originalContent,
      isEdited: 1,
      updatedAt: new Date()
    })
    .where(eq(comments.id, id))
    .returning();

  return updated[0];
}

export async function getPendingComments(): Promise<CommentWithUser[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      id: comments.id,
      articleId: comments.articleId,
      userId: comments.userId,
      content: comments.content,
      originalContent: comments.originalContent,
      isEdited: comments.isEdited,
      approved: comments.approved,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userName: users.name,
      userUsername: users.username,
      userAvatarUrl: users.avatarUrl,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.approved, 0))
    .orderBy(desc(comments.createdAt));

  return rows as CommentWithUser[];
}

// Advertisement queries
export async function getActiveAdvertisements(position?: string): Promise<Advertisement[]> {
  const db = await getDb();
  if (!db) return [];

  if (position) {
    return db.select().from(advertisements)
      .where(and(
        eq(advertisements.active, 1),
        eq(advertisements.position as any, position)
      ));
  }

  return db.select().from(advertisements).where(eq(advertisements.active, 1));
}

export async function getAllAdvertisements(): Promise<Advertisement[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(advertisements).orderBy(desc(advertisements.createdAt));
}

export async function createAdvertisement(data: InsertAdvertisement): Promise<Advertisement> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const created = await db.insert(advertisements).values(data).returning();
  if (!created[0]) throw new Error("Failed to create advertisement");
  return created[0];
}

export async function updateAdvertisement(id: number, data: Partial<InsertAdvertisement>): Promise<Advertisement> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updated = await db.update(advertisements).set(data).where(eq(advertisements.id, id)).returning();
  if (!updated[0]) throw new Error("Failed to update advertisement");
  return updated[0];
}

export async function deleteAdvertisement(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(advertisements).where(eq(advertisements.id, id));
}

export async function trackAdClick(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const ad = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
  if (ad[0]) {
    await db.update(advertisements)
      .set({ clickCount: (ad[0].clickCount || 0) + 1 })
      .where(eq(advertisements.id, id));
  }
}

export async function trackAdImpression(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const ad = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
  if (ad[0]) {
    await db.update(advertisements)
      .set({ impressionCount: (ad[0].impressionCount || 0) + 1 })
      .where(eq(advertisements.id, id));
  }
}

// User management queries
export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updated = await db.update(users).set(data).where(eq(users.id, id)).returning();
  if (!updated[0]) throw new Error("Failed to update user");
  return updated[0];
}

export async function deleteUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(users).where(eq(users.id, id));
}

// Article likes queries
export async function toggleArticleLike(articleId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if like already exists
  const existing = await db
    .select()
    .from(articleLikes)
    .where(and(eq(articleLikes.articleId, articleId), eq(articleLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    // Remove like
    await db
      .delete(articleLikes)
      .where(and(eq(articleLikes.articleId, articleId), eq(articleLikes.userId, userId)));
    return false; // Like was removed
  } else {
    // Add like
    await db.insert(articleLikes).values({ articleId, userId });
    return true; // Like was added
  }
}

export async function getArticleLikeCount(articleId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(articleLikes)
    .where(eq(articleLikes.articleId, articleId));

  return result.length;
}

export async function hasUserLikedArticle(articleId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(articleLikes)
    .where(and(eq(articleLikes.articleId, articleId), eq(articleLikes.userId, userId)))
    .limit(1);

  return result.length > 0;
}

export async function getArticleWithLikeInfo(articleId: number, userId?: number): Promise<{
  article: Article | undefined;
  likeCount: number;
  userLiked: boolean;
}> {
  const article = await getArticleById(articleId);
  const likeCount = await getArticleLikeCount(articleId);
  const userLiked = userId ? await hasUserLikedArticle(articleId, userId) : false;

  return { article, likeCount, userLiked };
}

export async function searchArticles(query: string, limit: number = 20): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];

  // Normalize the search query
  const searchTerm = `%${query.toLowerCase()}%`;

  // Search in title, excerpt, content, and tags
  const results = await db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.status, "published"),
        sql`LOWER(${articles.title}) LIKE ${searchTerm} 
            OR LOWER(${articles.excerpt}) LIKE ${searchTerm} 
            OR LOWER(${articles.content}) LIKE ${searchTerm}
            OR LOWER(${articles.tags}) LIKE ${searchTerm}`
      )
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit);

  return results;
}

// Newsletter queries
export async function createSubscriber(email: string): Promise<{ token: string }> {
  const db = await getDb();
  if (!db) return { token: "" };

  const { randomBytes } = await import("node:crypto");
  const token = randomBytes(32).toString("hex");

  await db.insert(subscribers).values({ email, unsubscribeToken: token }).onConflictDoUpdate({
    target: subscribers.email,
    set: { active: 1 }
  });

  // If subscriber already existed, retrieve existing token
  const existing = await db.select()
    .from(subscribers)
    .where(eq(subscribers.email, email))
    .limit(1);
  const finalToken = existing[0]?.unsubscribeToken || token;

  return { token: finalToken };
}

export async function getSubscriberByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select()
    .from(subscribers)
    .where(eq(subscribers.unsubscribeToken, token))
    .limit(1);
  return result[0];
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const subscriber = await getSubscriberByToken(token);
  if (!subscriber) return false;
  await db.delete(subscribers).where(eq(subscribers.id, subscriber.id));
  return true;
}

export async function getAllSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
}

// Verification codes
export async function createVerificationCode(data: InsertVerificationCode) {
  const db = await getDb();
  if (!db) return;
  await db.insert(verificationCodes).values(data);
}

export async function getLatestVerificationCode(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select()
    .from(verificationCodes)
    .where(eq(verificationCodes.email, email))
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);
  return result[0];
}

export async function deleteVerificationCodeByEmail(email: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(verificationCodes).where(eq(verificationCodes.email, email));
}

// Password Reset operations
export async function createPasswordResetToken(data: InsertPasswordResetToken): Promise<PasswordResetToken> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const created = await db.insert(passwordResetTokens).values(data).returning();
  if (!created[0]) throw new Error("Failed to create password reset token");
  return created[0];
}

export async function getValidPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, 0)
      )
    )
    .orderBy(desc(passwordResetTokens.createdAt))
    .limit(1);

  if (!results[0]) return null;
  return results[0];
}

export async function markPasswordResetTokenAsUsed(tokenId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(passwordResetTokens).set({ used: 1 }).where(eq(passwordResetTokens.id, tokenId));
}

// System Stats
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const usersCount = await db.select({ count: sql<number>`count(*)` }).from(users);
  const articlesCount = await db.select({ count: sql<number>`count(*)` }).from(articles);
  const commentsCount = await db.select({ count: sql<number>`count(*)` }).from(comments);
  const adsCount = await db.select({ count: sql<number>`count(*)` }).from(advertisements);

  return {
    totalUsers: usersCount[0]?.count || 0,
    totalArticles: articlesCount[0]?.count || 0,
    totalComments: commentsCount[0]?.count || 0,
    totalAds: adsCount[0]?.count || 0,
  };
}

// ─── Cleanup Jobs ────────────────────────────────────────────────────────────

/**
 * Delete expired verification codes from the DB.
 * Called at server startup and every hour.
 */
export async function cleanupExpiredVerificationCodes(): Promise<void> {
  try {
    const db = await getDb();
    const now = Math.floor(Date.now() / 1000);
    await db!.delete(verificationCodes).where(sql`${verificationCodes.expiresAt} < ${now}`);
  } catch (error) {
    console.error("[Cleanup] Failed to delete expired verification codes:", error);
  }
}

/**
 * Delete expired and used password reset tokens from the DB.
 * Called at server startup and every hour.
 */
export async function cleanupExpiredResetTokens(): Promise<void> {
  try {
    const db = await getDb();
    const now = Math.floor(Date.now() / 1000);
    await db!.delete(passwordResetTokens).where(sql`${passwordResetTokens.expiresAt} < ${now}`);
  } catch (error) {
    console.error("[Cleanup] Failed to delete expired reset tokens:", error);
  }
}
