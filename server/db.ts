import { eq, ne, desc, and, sql, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
export {
  users,
  articles,
  comments,
  advertisements,
  articleLikes,
  subscribers,
  verificationCodes,
  passwordResetTokens,
  sentNewsletters,
  savedArticles,
  pageViews,
  siteSettings,
  visitorSessions,
  ipBlacklist,
} from "../drizzle/schema";
import {
  InsertUser,
  User,
  users,
  articles,
  InsertArticle,
  Article,
  comments,
  InsertComment,
  Comment,
  advertisements,
  InsertAdvertisement,
  Advertisement,
  articleLikes,
  ArticleLike,
  InsertArticleLike,
  subscribers,
  InsertSubscriber,
  verificationCodes,
  VerificationCode,
  InsertVerificationCode,
  passwordResetTokens,
  PasswordResetToken,
  InsertPasswordResetToken,
  sentNewsletters,
  SentNewsletter,
  InsertSentNewsletter,
  savedArticles,
  SavedArticle,
  InsertSavedArticle,
  pageViews,
  PageView,
  InsertPageView,
  siteSettings,
  SiteSetting,
  InsertSiteSetting,
  socialPosts,
  SocialPost,
  InsertSocialPost,
  socialLikes,
  SocialLike,
  InsertSocialLike,
  visitorSessions,
  VisitorSession,
  InsertVisitorSession,
  ipBlacklist,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _initializing = false;
let _initPromise: Promise<any> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (_db) return _db;

  if (_initPromise) {
    return _initPromise;
  }

  _initPromise = (async () => {
    try {
      const dbUrl = ENV.databaseUrl || "file:sqlite.db";
      const authToken = ENV.databaseAuthToken;
      const client = createClient({
        url: dbUrl,
        authToken: authToken || undefined,
      });

      // Eseguiamo una migrazione manuale "leggera" (non bloccante) per le nuove colonne di commenti,
      // utile per scavalcare i warning di Drizzle e Turso durante il deploy
      try {
        await client.execute(
          "ALTER TABLE comments ADD COLUMN originalContent TEXT;"
        );
        console.log("[Migration] Added originalContent column to comments");
      } catch (err) {
        // Se la colonna esiste già, ignora l'errore
      }

      try {
        await client.execute(`
          CREATE TABLE IF NOT EXISTS visitor_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sessionId TEXT NOT NULL UNIQUE,
            userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
            ipAddress TEXT,
            userAgent TEXT,
            location TEXT,
            currentPath TEXT,
            lastActiveAt INTEGER NOT NULL
          );
        `);
        console.log("[Migration] Created visitor_sessions table if not exists");
      } catch (err) {
        console.error("[Migration] Error creating visitor_sessions:", err);
      }

      try {
        await client.execute(
          "ALTER TABLE comments ADD COLUMN isEdited INTEGER DEFAULT 0;"
        );
        console.log("[Migration] Added isEdited column to comments");
      } catch (err) {
        // Ignora
      }

      // Safer migration for articles table (ensure new columns exist)
      const articleColumns = [
        { name: "status", type: "TEXT" },
        { name: "publishedAt", type: "INTEGER" },
        { name: "seoTitle", type: "TEXT" },
        { name: "seoDescription", type: "TEXT" },
        { name: "viewCount", type: "INTEGER" },
        { name: "authorId", type: "INTEGER" },
        { name: "sourceUrl", type: "TEXT" },
        { name: "sourceTitle", type: "TEXT" }
      ];

      for (const col of articleColumns) {
        try {
          // Individual execution for maximum reliability
          await client.execute(`ALTER TABLE articles ADD COLUMN ${col.name} ${col.type};`);
          console.log(`[Migration] Success: Added ${col.name} to articles`);
        } catch (err: any) {
          // If the column already exists, this is fine
          if (err.message && (err.message.includes("duplicate") || err.message.includes("already exist"))) {
            continue;
          }
          console.warn(`[Migration] Skip column ${col.name}: ${err.message}`);
        }
      }

      // AdSense / Advertisement Migrations
      try {
        await client.execute("ALTER TABLE advertisements ADD COLUMN adCode TEXT;");
        console.log("[Migration] Added adCode to advertisements");
      } catch (err) { }

      // Make linkUrl and imageUrl nullable if they ARE NOT NULL (Legacy DB fixes)
      try {
        // Enforce nullability for advertisements (SQLite requires re-creation for this usually, 
        // but we'll try a simpler way first or just ignore if it works)
        await client.execute("UPDATE advertisements SET imageUrl = NULL WHERE imageUrl = '';");
        await client.execute("UPDATE advertisements SET linkUrl = NULL WHERE linkUrl = '';");
      } catch (err) { }

      // Ensure status is 'published' for legacy rows
      try {
        await client.execute("UPDATE articles SET status = 'published' WHERE status IS NULL OR status = '';");
      } catch (e) { /* ignore */ }

      // Migration for user status
      try {
        await client.execute(
          "ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' NOT NULL;"
        );
      } catch (err) {}

      try {
        await client.execute(
          "ALTER TABLE users ADD COLUMN statusMessage TEXT;"
        );
      } catch (err) {}

      try {
        await client.execute(
          "ALTER TABLE users ADD COLUMN statusNotificationRead INTEGER DEFAULT 0 NOT NULL;"
        );
      } catch (err) {}

      // 2FA Migrations
      try {
        await client.execute("ALTER TABLE users ADD COLUMN twoFactorEnabled INTEGER DEFAULT 0 NOT NULL;");
      } catch (err) {}
      try {
        await client.execute("ALTER TABLE users ADD COLUMN twoFactorSecret TEXT;");
      } catch (err) {}
      try {
        await client.execute("ALTER TABLE users ADD COLUMN twoFactorBackupCodes TEXT;");
      } catch (err) {}

      try {
        await client.execute(
          "ALTER TABLE users ADD COLUMN subscribeToNewsletter INTEGER DEFAULT 0 NOT NULL;"
        );
      } catch (err) {}

      // Migration for ip_blacklist table
      try {
        await client.execute(`
          CREATE TABLE IF NOT EXISTS ip_blacklist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ipAddress TEXT NOT NULL UNIQUE,
            reason TEXT,
            createdAt INTEGER NOT NULL
          );
        `);
        console.log("[Migration] Created ip_blacklist table");
      } catch (err) {}

      // Finalize database initialization after migrations
      _db = drizzle(client);
      return _db;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      throw error;
    }
  })();

  return _initPromise;
}

export async function generateUniqueUsername(
  baseName: string
): Promise<string> {
  const db = await getDb();
  if (!db) return baseName;

  let base = baseName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .substring(0, 20);

  if (!base) base = "user";

  let username = base;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing.length === 0) {
      return username;
    }

    username = `${base}${counter}`;
    counter++;
  }
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

    const textFields = ["name", "email", "loginMethod", "password", "status"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized as any;
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
    if (user.subscribeToNewsletter !== undefined) {
      values.subscribeToNewsletter = user.subscribeToNewsletter;
      updateSet.subscribeToNewsletter = user.subscribeToNewsletter;
    }

    if (ENV.oAuthServerUrl && ( // Only auto-assign admin if we have a real OAuth setup
        user.openId === ENV.ownerOpenId ||
        (ENV.ownerEmail && user.email === ENV.ownerEmail)
      )
    ) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (user.username !== undefined) {
      values.username = user.username;
      updateSet.username = user.username;
    } else {
      // Determine a base name for auto-generation
      let baseName = "user";
      if (user.name) {
        baseName = user.name;
      } else if (user.email) {
        baseName = user.email.split("@")[0];
      }
      values.username = await generateUniqueUsername(baseName);
      // We don't add username to updateSet here because we only want to generate it on insert.
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
export async function getAllArticles(
  includeDrafts = false,
  category?: string,
  limit?: number,
  offset?: number,
  currentUserId?: number
): Promise<(Article & { likeCount: number; hasLiked?: boolean })[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (!includeDrafts) {
    conditions.push(eq(articles.status, "published"));
  }
  if (category) {
    conditions.push(eq(articles.category, category));
  }

  const query = db
    .select({
      article: articles,
      likeCount: sql<number>`count(${articleLikes.id})`.mapWith(Number),
      hasLiked: currentUserId
        ? sql<number>`max(case when ${articleLikes.userId} = ${currentUserId} then 1 else 0 end)`.mapWith(v => v === 1)
        : sql<boolean>`0`.mapWith(() => false),
    })
    .from(articles)
    .leftJoin(articleLikes, eq(articles.id, articleLikes.articleId))
    .groupBy(articles.id);

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  let finalQuery = query.orderBy(desc(articles.createdAt));

  if (limit) {
    finalQuery = finalQuery.limit(limit);
  }
  if (offset) {
    finalQuery = finalQuery.offset(offset);
  }

  const results = await finalQuery;

  return results.map((r: { article: Article; likeCount: number; hasLiked?: boolean }) => {
    const { content, ...articleWithoutContent } = r.article;
    return {
      ...articleWithoutContent,
      likeCount: r.likeCount,
      hasLiked: r.hasLiked
    } as any;
  });
}

export async function getArticleBySlug(
  slug: string,
  currentUserId?: number
): Promise<(Article & { likeCount: number; hasLiked?: boolean }) | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({
      article: articles,
      likeCount: sql<number>`count(${articleLikes.id})`.mapWith(Number),
      hasLiked: currentUserId
        ? sql<number>`max(case when ${articleLikes.userId} = ${currentUserId} then 1 else 0 end)`.mapWith(v => v === 1)
        : sql<boolean>`0`.mapWith(() => false),
    })
    .from(articles)
    .leftJoin(articleLikes, eq(articles.id, articleLikes.articleId))
    .where(eq(articles.slug, slug))
    .groupBy(articles.id)
    .limit(1);

  if (result.length === 0) return undefined;

  return {
    ...result[0].article,
    likeCount: result[0].likeCount,
    hasLiked: result[0].hasLiked
  };
}

export async function getArticleById(id: number): Promise<Article | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createArticle(data: InsertArticle): Promise<Article> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const created = await db.insert(articles).values(data).returning();
  if (!created[0]) throw new Error("Failed to create article");
  return created[0];
}

export async function updateArticle(
  id: number,
  data: Partial<InsertArticle>
): Promise<Article> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updated = await db
    .update(articles)
    .set(data)
    .where(eq(articles.id, id))
    .returning();
  if (!updated[0]) throw new Error("Failed to update article");
  return updated[0];
}

export async function deleteArticle(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(articles).where(eq(articles.id, id));
}

export async function getArticlesByCategory(
  category: string,
  includeDrafts = false
): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];

  if (includeDrafts) {
    return db
      .select()
      .from(articles)
      .where(eq(articles.category, category))
      .orderBy(desc(articles.createdAt));
  }

  return db
    .select()
    .from(articles)
    .where(
      and(eq(articles.category, category), eq(articles.status, "published"))
    )
    .orderBy(desc(articles.createdAt));
}

export async function getRelatedArticles(
  articleId: number,
  limitCount: number = 3
): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];

  // Fetch recent published articles excluding the current one
  return db
    .select()
    .from(articles)
    .where(
      and(eq(articles.status, "published"), sql`${articles.id} != ${articleId}`)
    )
    .orderBy(desc(articles.createdAt))
    .limit(limitCount);
}

export async function getBreakingArticles(limit = 5): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), eq(articles.breaking, 1)))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

// Type for comment with user info
export type CommentWithUser = Comment & {
  userName: string | null;
  userUsername: string | null;
  userAvatarUrl: string | null;
};

// Comment queries
export async function getCommentsByArticle(
  articleId: number,
  onlyApproved: boolean = true
): Promise<CommentWithUser[]> {
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

  const updated = await db
    .update(comments)
    .set({ approved: 1 })
    .where(eq(comments.id, id))
    .returning();
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

export async function editComment(
  id: number,
  newContent: string,
  currentContent: string
): Promise<Comment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const comment = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);
  if (!comment[0]) throw new Error("Comment not found");

  const originalContent = comment[0].originalContent || currentContent;

  const updated = await db
    .update(comments)
    .set({
      content: newContent,
      originalContent: originalContent,
      isEdited: 1,
      updatedAt: new Date(),
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
export async function getActiveAdvertisements(
  position?: string
): Promise<Advertisement[]> {
  const db = await getDb();
  if (!db) return [];

  if (position) {
    return db
      .select()
      .from(advertisements)
      .where(
        and(
          eq(advertisements.active, 1),
          eq(advertisements.position as any, position)
        )
      );
  }

  return db.select().from(advertisements).where(eq(advertisements.active, 1));
}

export async function getAllAdvertisements(): Promise<Advertisement[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(advertisements)
    .orderBy(desc(advertisements.createdAt));
}

export async function createAdvertisement(
  data: InsertAdvertisement
): Promise<Advertisement> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const created = await db.insert(advertisements).values(data).returning();
  if (!created[0]) throw new Error("Failed to create advertisement");
  return created[0];
}

export async function updateAdvertisement(
  id: number,
  data: Partial<InsertAdvertisement>
): Promise<Advertisement> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updated = await db
    .update(advertisements)
    .set(data)
    .where(eq(advertisements.id, id))
    .returning();
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

  const ad = await db
    .select()
    .from(advertisements)
    .where(eq(advertisements.id, id))
    .limit(1);
  if (ad[0]) {
    await db
      .update(advertisements)
      .set({ clickCount: (ad[0].clickCount || 0) + 1 })
      .where(eq(advertisements.id, id));
  }
}

export async function trackAdImpression(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const ad = await db
    .select()
    .from(advertisements)
    .where(eq(advertisements.id, id))
    .limit(1);
  if (ad[0]) {
    await db
      .update(advertisements)
      .set({ impressionCount: (ad[0].impressionCount || 0) + 1 })
      .where(eq(advertisements.id, id));
  }
}

// User management queries
export async function getPublicUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      website: users.website,
      location: users.location,
      createdAt: users.createdAt,
      role: users.role,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!result[0]) return undefined;

  const commentsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments)
    .where(and(eq(comments.userId, result[0].id), eq(comments.approved, 1)));

  return {
    ...result[0],
    totalComments: commentsCount[0]?.count || 0,
  };
}

export async function getPublicUserComments(username: string) {
  const db = await getDb();
  if (!db) return [];

  const userResult = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!userResult[0]) return [];

  return db
    .select({
      id: comments.id,
      content: comments.content,
      isEdited: comments.isEdited,
      createdAt: comments.createdAt,
      articleId: articles.id,
      articleTitle: articles.title,
      articleSlug: articles.slug,
    })
    .from(comments)
    .innerJoin(articles, eq(comments.articleId, articles.id))
    .where(and(eq(comments.userId, userResult[0].id), eq(comments.approved, 1)))
    .orderBy(desc(comments.createdAt))
    .limit(20);
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(ne(users.status, 'deleted')).orderBy(desc(users.createdAt));
}

export async function getUserByOpenId(
  openId: string
): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(
  id: number,
  data: Partial<InsertUser>
): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updated = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  if (!updated[0]) throw new Error("Failed to update user");
  return updated[0];
}

export async function deleteUser(id: number): Promise<void> {
  // Now mapped to 'Purge' logic as requested: hard delete to allow re-registration
  return purgeUser(id);
}

export async function restrictUser(id: number, message?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ 
      status: 'restricted',
      statusMessage: message || 'Your account has been restricted. You can still browse but interactions are disabled for safety and legal compliance.',
      statusNotificationRead: 0
    })
    .where(eq(users.id, id));
}

export async function banUser(id: number, message?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ 
      status: 'banned',
      statusMessage: message || 'Your account has been permanently banned due to a violation of our terms of service.',
      statusNotificationRead: 0
    })
    .where(eq(users.id, id));
}

export async function activateUser(id: number, message?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ 
      status: 'active',
      statusMessage: message || 'Good news! Your account status has been restored to Active.',
      statusNotificationRead: 0
    })
    .where(eq(users.id, id));
}

export async function markStatusNotificationRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ statusNotificationRead: 1 })
    .where(eq(users.id, userId));
}

export async function markForDeletion(id: number, message?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users)
    .set({ 
      status: 'deleted',
      statusMessage: message || 'Your account has been scheduled for permanent deletion. All associated data will be physically removed from our systems.',
      statusNotificationRead: 0
    })
    .where(eq(users.id, id));
}

export async function purgeUser(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const userToPurge = await getUserById(id);
  if (userToPurge && (
    userToPurge.openId === ENV.ownerOpenId || 
    (ENV.ownerEmail && userToPurge.email === ENV.ownerEmail)
  )) {
    throw new Error("System owner cannot be purged");
  }

  // 1. Delete verification codes associated with the email
  if (userToPurge?.email) {
    await db.delete(verificationCodes).where(eq(verificationCodes.email, userToPurge.email));
  }

  // 2. Physical deletion from users table
  await db.delete(users).where(eq(users.id, id));
}

export async function getBackupCodes(userId: number): Promise<string[]> {
  const user = await getUserById(userId);
  if (!user || !user.twoFactorBackupCodes) return [];
  try {
    return JSON.parse(user.twoFactorBackupCodes);
  } catch (e) {
    return [];
  }
}

export async function updateBackupCodes(userId: number, codes: string[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users)
    .set({ twoFactorBackupCodes: JSON.stringify(codes) })
    .where(eq(users.id, userId));
}

export async function isIpBlacklisted(ip: string): Promise<boolean> {
  // Security Guard: IPs in the Whitelist are immune to blacklisting
  if (ENV.adminIpWhitelist) {
    const allowedIps = ENV.adminIpWhitelist.split(",").map(i => i.trim());
    if (allowedIps.includes(ip)) return false;
  }

  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select()
    .from(ipBlacklist)
    .where(eq(ipBlacklist.ipAddress, ip))
    .limit(1);
    
  return result.length > 0;
}

export async function blacklistIp(ip: string, reason?: string): Promise<void> {
  // Security Guard: Cannot blacklist an IP that is in the Master Whitelist
  if (ENV.adminIpWhitelist) {
    const allowedIps = ENV.adminIpWhitelist.split(",").map(i => i.trim());
    if (allowedIps.includes(ip)) {
      console.warn(`[Security] Block attempt rejected: IP ${ip} is in the Master Whitelist.`);
      return; 
    }
  }

  const db = await getDb();
  if (!db) return;
  
  try {
    await db.insert(ipBlacklist).values({
      ipAddress: ip,
      reason: reason || null,
      createdAt: new Date(),
    });
  } catch (err) {
    // Likely already exists
  }
}

export async function getAllBlacklistedIps() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(ipBlacklist)
    .orderBy(desc(ipBlacklist.createdAt));
}

export async function removeIpFromBlacklist(ip: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(ipBlacklist).where(eq(ipBlacklist.ipAddress, ip));
}

export async function clearAllBlacklistedIps(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(ipBlacklist);
}

// Article likes queries
export async function toggleArticleLike(
  articleId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if like already exists
  const existing = await db
    .select()
    .from(articleLikes)
    .where(
      and(
        eq(articleLikes.articleId, articleId),
        eq(articleLikes.userId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove like
    await db
      .delete(articleLikes)
      .where(
        and(
          eq(articleLikes.articleId, articleId),
          eq(articleLikes.userId, userId)
        )
      );
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
    .select({ count: sql<number>`count(*)` })
    .from(articleLikes)
    .where(eq(articleLikes.articleId, articleId));

  return result[0]?.count || 0;
}

export async function hasUserLikedArticle(
  articleId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(articleLikes)
    .where(
      and(
        eq(articleLikes.articleId, articleId),
        eq(articleLikes.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0;
}

export async function getArticleWithLikeInfo(
  articleId: number,
  userId?: number
): Promise<{
  article: Article | undefined;
  likeCount: number;
  userLiked: boolean;
}> {
  const article = await getArticleById(articleId);
  const likeCount = await getArticleLikeCount(articleId);
  const userLiked = userId
    ? await hasUserLikedArticle(articleId, userId)
    : false;

  return { article, likeCount, userLiked };
}

// Saved Articles (Bookmarks) queries
export async function toggleSavedArticle(
  articleId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(savedArticles)
    .where(
      and(
        eq(savedArticles.articleId, articleId),
        eq(savedArticles.userId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove bookmark
    await db
      .delete(savedArticles)
      .where(
        and(
          eq(savedArticles.articleId, articleId),
          eq(savedArticles.userId, userId)
        )
      );
    return false; // Bookmark removed
  } else {
    // Add bookmark
    await db.insert(savedArticles).values({ articleId, userId });
    return true; // Bookmark added
  }
}

export async function hasUserSavedArticle(
  articleId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(savedArticles)
    .where(
      and(
        eq(savedArticles.articleId, articleId),
        eq(savedArticles.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0;
}

export async function getSavedArticlesByUserId(
  userId: number
): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      article: articles,
    })
    .from(savedArticles)
    .innerJoin(articles, eq(savedArticles.articleId, articles.id))
    .where(eq(savedArticles.userId, userId))
    .orderBy(desc(savedArticles.createdAt));

  return results.map((r: any) => r.article);
}

export async function searchArticles(
  query: string,
  limit: number = 20
): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];

  // Normalize the search query
  const term = query.toLowerCase();
  const searchTerm = `%${term}%`;

  const score = sql<number>`
    (CASE WHEN LOWER(${articles.title}) LIKE ${searchTerm} THEN 10 ELSE 0 END) +
    (CASE WHEN LOWER(${articles.excerpt}) LIKE ${searchTerm} THEN 5 ELSE 0 END) +
    (CASE WHEN LOWER(${articles.content}) LIKE ${searchTerm} THEN 1 ELSE 0 END)
  `;

  const results = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      content: articles.content,
      category: articles.category,
      categoryColor: articles.categoryColor,
      image: articles.image,
      author: articles.author,
      publishedAt: articles.publishedAt,
      readTime: articles.readTime,
      tags: articles.tags,
      score: score
    })
    .from(articles)
    .where(
      and(
        eq(articles.status, "published"),
        sql`LOWER(${articles.title}) LIKE ${searchTerm} 
            OR LOWER(${articles.excerpt}) LIKE ${searchTerm} 
            OR LOWER(${articles.content}) LIKE ${searchTerm}`
      )
    )
    .orderBy(desc(score), desc(articles.publishedAt))
    .limit(limit);

  return results as unknown as Article[];
}


// Newsletter queries
export async function createSubscriber(
  email: string
): Promise<{ token: string; alreadyActive: boolean }> {
  const db = await getDb();
  if (!db) return { token: "", alreadyActive: false };

  // Check if they already exist
  const existing = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.email, email))
    .limit(1);

  const subscriber = existing[0];

  if (subscriber) {
    if (subscriber.active === 1) {
      // Already active, don't do anything, don't send email
      return { token: subscriber.unsubscribeToken || "", alreadyActive: true };
    } else {
      // Exist but inactive (unsubscribed), reactivate
      await db
        .update(subscribers)
        .set({ active: 1 })
        .where(eq(subscribers.id, subscriber.id));
      return { token: subscriber.unsubscribeToken || "", alreadyActive: false };
    }
  }

  // Brand new
  const { randomBytes } = await import("node:crypto");
  const token = randomBytes(32).toString("hex");

  await db.insert(subscribers).values({ email, unsubscribeToken: token });

  return { token, alreadyActive: false };
}

export async function getSubscriberByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
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
  // Use soft-delete (setting active to 0) instead of hard deletion
  await db
    .update(subscribers)
    .set({ active: 0 })
    .where(eq(subscribers.id, subscriber.id));
  return true;
}

export async function deleteSubscriber(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  await db.delete(subscribers).where(eq(subscribers.id, id));
  return true;
}

export async function getAllSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
}

// Sent newsletter history
export async function createSentNewsletterRecord(
  data: InsertSentNewsletter
): Promise<SentNewsletter> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const created = await db.insert(sentNewsletters).values(data).returning();
  if (!created[0]) throw new Error("Failed to record sent newsletter");
  return created[0];
}

export async function getAllSentNewsletters(): Promise<SentNewsletter[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(sentNewsletters)
    .orderBy(desc(sentNewsletters.createdAt));
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
  const result = await db
    .select()
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
export async function createPasswordResetToken(
  data: InsertPasswordResetToken
): Promise<PasswordResetToken> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const created = await db.insert(passwordResetTokens).values(data).returning();
  if (!created[0]) throw new Error("Failed to create password reset token");
  return created[0];
}

export async function getValidPasswordResetToken(
  token: string
): Promise<PasswordResetToken | null> {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(eq(passwordResetTokens.token, token), eq(passwordResetTokens.used, 0))
    )
    .orderBy(desc(passwordResetTokens.createdAt))
    .limit(1);

  if (!results[0]) return null;
  return results[0];
}

export async function markPasswordResetTokenAsUsed(
  tokenId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(passwordResetTokens)
    .set({ used: 1 })
    .where(eq(passwordResetTokens.id, tokenId));
}

// System Stats
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const usersCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  const articlesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles);
  const commentsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(comments);
  const adsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(advertisements);

  const subCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscribers);

  const viewsResult = await db
    .select({ total: sql<number>`sum(${articles.viewCount})` })
    .from(articles);

  return {
    totalUsers: usersCount[0]?.count || 0,
    totalArticles: articlesCount[0]?.count || 0,
    totalComments: commentsCount[0]?.count || 0,
    totalAds: adsCount[0]?.count || 0,
    totalSubscribers: subCount[0]?.count || 0,
    totalViews: viewsResult[0]?.total || 0,
  };
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return null;

  // Use parallel queries for totals to speed up response
  const [
    totalViewsResult,
    totalUsersResult,
    totalArticlesResult,
    totalCommentsResult,
  ] = await Promise.all([
    db.select({ total: sql<number>`sum(${articles.viewCount})` }).from(articles),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(articles),
    db.select({ count: sql<number>`count(*)` }).from(comments),
  ]);

  // Views in the last 24h
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const views24hResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(pageViews)
    .where(sql`${pageViews.createdAt} >= ${yesterday}`);

  // Get daily views for the last 7 days in a single grouped query
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyViewsRaw = await db
    .select({
      day: sql<string>`date(${pageViews.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(pageViews)
    .where(sql`${pageViews.createdAt} >= ${sevenDaysAgo}`)
    .groupBy(sql`date(${pageViews.createdAt})`)
    .orderBy(sql`date(${pageViews.createdAt})`);

  // Map to the expected format, ensuring all days are present even with 0 views
  const dailyViews = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dateStr = d.toISOString().split('T')[0];

    const dbMatch = dailyViewsRaw.find((row: { day: string | null; count: number }) => row.day === dateStr);

    dailyViews.push({
      date: d.toISOString(),
      views: dbMatch?.count || 0,
    });
  }

  return {
    totalViews: totalViewsResult[0]?.total || 0,
    totalUsers: totalUsersResult[0]?.count || 0,
    totalArticles: totalArticlesResult[0]?.count || 0,
    totalComments: totalCommentsResult[0]?.count || 0,
    views24h: views24hResult[0]?.count || 0,
    dailyViews,
  };
}


// ─── Cleanup Jobs ────────────────────────────────────────────────────────────

export async function cleanupExpiredVerificationCodes(): Promise<void> {
  try {
    const db = await getDb();
    const now = Math.floor(Date.now() / 1000);
    await db!
      .delete(verificationCodes)
      .where(sql`${verificationCodes.expiresAt} < ${now}`);
  } catch (error) {
    console.error("[Cleanup] Failed to delete expired verification codes:", error);
  }
}

export async function cleanupExpiredResetTokens(): Promise<void> {
  try {
    const db = await getDb();
    const now = Math.floor(Date.now() / 1000);
    await db!
      .delete(passwordResetTokens)
      .where(sql`${passwordResetTokens.expiresAt} < ${now}`);
  } catch (error) {
    console.error("[Cleanup] Failed to delete expired reset tokens:", error);
  }
}

export async function getArticleBySlugWithTracking(
  slug: string,
  userId?: number,
  ip?: string,
  ua?: string
): Promise<(Article & { likeCount: number; hasLiked?: boolean }) | undefined> {
  const article = await getArticleBySlug(slug, userId);
  if (article) {
    await trackView(article.id, userId, ip, ua).catch(err =>
      console.error("[Analytics] trackView failed:", err)
    );
  }
  return article;
}

// Analytics queries
export async function trackView(
  articleId: number,
  userId?: number,
  ip?: string,
  ua?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.transaction(async (tx: any) => {
      // Single atomic update for viewCount
      await tx
        .update(articles)
        .set({ viewCount: sql`${articles.viewCount} + 1` })
        .where(eq(articles.id, articleId));

      await tx.insert(pageViews).values({
        articleId,
        userId: userId || null,
        ipAddress: ip || null,
        userAgent: ua || null,
      });
    });
  } catch (error) {
    console.error("[Analytics] trackView error:", error);
  }
}

export async function getTrendingArticles(limit = 5): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.viewCount))
    .limit(limit);
}


// Site Settings queries
export async function getSiteSettings(): Promise<SiteSetting[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteSettings);
}

export async function getSiteSettingByKey(key: string): Promise<SiteSetting | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result[0];
}

export async function updateSiteSetting(key: string, value: string): Promise<SiteSetting> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    })
    .returning();

  return results[0];
}

// ─── Social Pulse Queries ─────────────────────────────────────────────────────

export async function getSocialPosts(status: "approved" | "pending" | "rejected" | "flagged" = "approved", limit = 50): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: socialPosts.id,
      content: socialPosts.content,
      status: socialPosts.status,
      aiScore: socialPosts.aiScore,
      aiReason: socialPosts.aiReason,
      createdAt: socialPosts.createdAt,
      authorId: socialPosts.authorId,
      authorName: users.name,
      authorAvatar: users.avatarUrl,
      authorRole: users.role,
    })
    .from(socialPosts)
    .innerJoin(users, eq(socialPosts.authorId, users.id))
    .where(eq(socialPosts.status, status))
    .orderBy(desc(socialPosts.createdAt))
    .limit(limit);
}

export async function createSocialPost(data: InsertSocialPost): Promise<SocialPost> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db.insert(socialPosts).values(data).returning();
  return results[0];
}

export async function updateSocialPostStatus(
  id: number,
  status: "approved" | "rejected" | "flagged",
  aiScore?: number,
  aiReason?: string
): Promise<SocialPost | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const results = await db
    .update(socialPosts)
    .set({
      status,
      aiScore: aiScore ?? undefined,
      aiReason: aiReason ?? undefined,
      updatedAt: new Date()
    })
    .where(eq(socialPosts.id, id))
    .returning();

  return results[0];
}

export async function toggleSocialLike(postId: number, userId: number): Promise<{ liked: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(socialLikes)
    .where(and(eq(socialLikes.postId, postId), eq(socialLikes.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(socialLikes)
      .where(and(eq(socialLikes.postId, postId), eq(socialLikes.userId, userId)));
    return { liked: false };
  } else {
    await db.insert(socialLikes).values({ postId, userId });
    return { liked: true };
  }
}

export async function getSocialLikeCount(postId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(socialLikes)
    .where(eq(socialLikes.postId, postId));
  return result[0]?.count || 0;
}

export async function hasUserLikedSocialPost(postId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(socialLikes)
    .where(and(eq(socialLikes.postId, postId), eq(socialLikes.userId, userId)))
    .limit(1);
  return result.length > 0;
}

export async function deleteSocialPost(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(socialPosts).where(eq(socialPosts.id, id));
}

export async function updateVisitorSession(data: InsertVisitorSession) {
  const db = await getDb();
  if (!db) return;

  // Failsafe table check
  try {
    const tableExists = await (db as any).run(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='visitor_sessions'`);
    if (!(tableExists.rows?.length > 0)) {
      console.log("[Analytics] Failsafe: Creating visitor_sessions table");
      await (db as any).run(sql`
          CREATE TABLE IF NOT EXISTS visitor_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sessionId TEXT NOT NULL UNIQUE,
            userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
            ipAddress TEXT,
            userAgent TEXT,
            location TEXT,
            currentPath TEXT,
            lastActiveAt INTEGER NOT NULL
          );
        `);
    }
  } catch (e) {
    // Already exists or wrong driver, ignore
  }

  const existing = await db
    .select()
    .from(visitorSessions)
    .where(eq(visitorSessions.sessionId, data.sessionId))
    .limit(1);

  let location = existing[0]?.location;

  // Attempt simple GeoIP lookup if location is missing and IP is present
  if (!location && data.ipAddress && data.ipAddress !== '127.0.0.1' && data.ipAddress !== '::1') {
    try {
      const response = await fetch(`https://ipapi.co/${data.ipAddress}/json/`);
      const geo = await response.json();
      if (geo.city && geo.country_name) {
        location = `${geo.city}, ${geo.country_name}`;
      }
    } catch (err) {
      console.warn("[Analytics] GeoIP lookup failed:", err);
    }
  }

  if (existing.length > 0) {
    return db
      .update(visitorSessions)
      .set({
        ...data,
        location: location || data.location,
        lastActiveAt: new Date(),
      })
      .where(eq(visitorSessions.sessionId, data.sessionId));
  } else {
    return db.insert(visitorSessions).values({
      ...data,
      location: location || data.location,
    });
  }
}

export async function getActiveVisitors(minutes: number = 5) {
  const db = await getDb();
  if (!db) return [];

  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  return db
    .select({
      id: visitorSessions.id,
      sessionId: visitorSessions.sessionId,
      userId: visitorSessions.userId,
      ipAddress: visitorSessions.ipAddress,
      userAgent: visitorSessions.userAgent,
      location: visitorSessions.location,
      currentPath: visitorSessions.currentPath,
      lastActiveAt: visitorSessions.lastActiveAt,
      userName: users.name,
      userRole: users.role,
    })
    .from(visitorSessions)
    .leftJoin(users, eq(visitorSessions.userId, users.id))
    .where(gt(visitorSessions.lastActiveAt, cutoff))
    .orderBy(desc(visitorSessions.lastActiveAt));
}

export async function getArticleBySourceUrlorTitle(url: string | null = null, title: string | null = null): Promise<Article | null> {
  const db = await getDb();
  if (!db || (!url && !title)) return null;

  const result = await db
    .select()
    .from(articles)
    .where(url ? eq(articles.sourceUrl, url) : eq(articles.sourceTitle, title as string))
    .limit(1);

  return result[0] || null;
}
