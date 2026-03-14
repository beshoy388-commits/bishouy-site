import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"), // Hashed password for local auth
  isVerified: integer("isVerified", { mode: "number" }).default(0).notNull(),
  username: text("username").unique(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  website: text("website"),
  location: text("location"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] })
    .default("user")
    .notNull(),
  status: text("status", { enum: ["active", "banned", "deleted", "restricted"] })
    .default("active")
    .notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const articles = sqliteTable("articles", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  categoryColor: text("categoryColor").default("#E8A020"),
  author: text("author").notNull(),
  authorRole: text("authorRole").default("Staff Writer"),
  image: text("image").notNull(),
  featured: integer("featured", { mode: "number" }).default(0).notNull(),
  breaking: integer("breaking", { mode: "number" }).default(0).notNull(),
  readTime: integer("readTime", { mode: "number" }).default(5).notNull(),
  tags: text("tags"),
  status: text("status", { enum: ["draft", "published"] })
    .default("draft")
    .notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  publishedAt: integer("publishedAt", { mode: "timestamp" }),
  authorId: integer("authorId").references(() => users.id),
  // SEO Fields
  seoTitle: text("seoTitle"),
  seoDescription: text("seoDescription"),
  // Analytics
  viewCount: integer("viewCount", { mode: "number" }).default(0).notNull(),
  // Tracking
  sourceUrl: text("sourceUrl"),
  sourceTitle: text("sourceTitle"),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

export const comments = sqliteTable("comments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  articleId: integer("articleId")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  originalContent: text("originalContent"),
  isEdited: integer("isEdited", { mode: "number" }).default(0),
  approved: integer("approved", { mode: "number" }).default(0).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const advertisements = sqliteTable("advertisements", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  adCode: text("adCode"), // For AdSense or other script-based ads
  linkUrl: text("linkUrl"),
  position: text("position", {
    enum: ["sidebar", "banner_top", "banner_bottom", "inline"],
  }).notNull(),
  active: integer("active", { mode: "number" }).default(1).notNull(),
  startDate: integer("startDate", { mode: "timestamp" }),
  endDate: integer("endDate", { mode: "timestamp" }),
  clickCount: integer("clickCount", { mode: "number" }).default(0),
  impressionCount: integer("impressionCount", { mode: "number" }).default(0),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = typeof advertisements.$inferInsert;

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: integer("resourceId", { mode: "number" }),
  changes: text("changes"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  status: text("status", { enum: ["success", "failure"] }).default("success"),
  errorMessage: text("errorMessage"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const ipBlacklist = sqliteTable("ip_blacklist", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  ipAddress: text("ipAddress").notNull().unique(),
  reason: text("reason"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type IpBlacklistEntry = typeof ipBlacklist.$inferSelect;
export type InsertIpBlacklistEntry = typeof ipBlacklist.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export const articleLikes = sqliteTable("article_likes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  articleId: integer("articleId")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type ArticleLike = typeof articleLikes.$inferSelect;
export type InsertArticleLike = typeof articleLikes.$inferInsert;

export const subscribers = sqliteTable("subscribers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  active: integer("active", { mode: "number" }).default(1).notNull(),
  // Unique token used for one-click unsubscribe links in emails
  unsubscribeToken: text("unsubscribeToken").unique(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

export const verificationCodes = sqliteTable("verification_codes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = typeof verificationCodes.$inferInsert;

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  used: integer("used", { mode: "number" }).default(0).notNull(), // 0 = false, 1 = true
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export const sentNewsletters = sqliteTable("sent_newsletters", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  recipientCount: integer("recipientCount", { mode: "number" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type SentNewsletter = typeof sentNewsletters.$inferSelect;
export type InsertSentNewsletter = typeof sentNewsletters.$inferInsert;

export const savedArticles = sqliteTable("saved_articles", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  articleId: integer("articleId")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type SavedArticle = typeof savedArticles.$inferSelect;
export type InsertSavedArticle = typeof savedArticles.$inferInsert;

export const pageViews = sqliteTable("page_views", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  articleId: integer("articleId").references(() => articles.id, {
    onDelete: "cascade",
  }),
  userId: integer("userId").references(() => users.id, { onDelete: "set null" }),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

export const socialPosts = sqliteTable("social_posts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  authorId: integer("authorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["approved", "pending", "rejected", "flagged"] })
    .default("pending")
    .notNull(),
  aiScore: integer("aiScore", { mode: "number" }).default(0),
  aiReason: text("aiReason"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;

export const socialLikes = sqliteTable("social_likes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  postId: integer("postId")
    .notNull()
    .references(() => socialPosts.id, { onDelete: "cascade" }),
  userId: integer("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type SocialLike = typeof socialLikes.$inferSelect;
export type InsertSocialLike = typeof socialLikes.$inferInsert;
export const visitorSessions = sqliteTable("visitor_sessions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  sessionId: text("sessionId").notNull().unique(), // Unique identifier for the browser session
  userId: integer("userId").references(() => users.id, { onDelete: "set null" }),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  location: text("location"), // JSON or string containing city, country, etc.
  currentPath: text("currentPath"),
  lastActiveAt: integer("lastActiveAt", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export type VisitorSession = typeof visitorSessions.$inferSelect;
export type InsertVisitorSession = typeof visitorSessions.$inferInsert;
