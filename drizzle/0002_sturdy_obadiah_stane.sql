CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_settings_key_unique` ON `site_settings` (`key`);--> statement-breakpoint
DROP INDEX "articles_slug_unique";--> statement-breakpoint
DROP INDEX "password_reset_tokens_token_unique";--> statement-breakpoint
DROP INDEX "site_settings_key_unique";--> statement-breakpoint
DROP INDEX "subscribers_email_unique";--> statement-breakpoint
DROP INDEX "subscribers_unsubscribeToken_unique";--> statement-breakpoint
DROP INDEX "users_openId_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_username_unique";--> statement-breakpoint
ALTER TABLE `articles` ALTER COLUMN "status" TO "status" text NOT NULL DEFAULT 'draft';--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_tokens_token_unique` ON `password_reset_tokens` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_unsubscribeToken_unique` ON `subscribers` (`unsubscribeToken`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
ALTER TABLE `articles` ADD `sourceUrl` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `sourceTitle` text;