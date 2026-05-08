CREATE UNIQUE INDEX `articles_slug_idx` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `articles_category_idx` ON `articles` (`category`);--> statement-breakpoint
CREATE INDEX `articles_published_at_idx` ON `articles` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `articles_premium_idx` ON `articles` (`premiumOnly`);--> statement-breakpoint
CREATE INDEX `audit_logs_user_idx` ON `audit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_logs_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_logs_created_at_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `page_views_article_idx` ON `page_views` (`articleId`);--> statement-breakpoint
CREATE INDEX `page_views_created_at_idx` ON `page_views` (`createdAt`);--> statement-breakpoint
CREATE INDEX `visitor_user_idx` ON `visitor_sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `visitor_last_active_idx` ON `visitor_sessions` (`lastActiveAt`);