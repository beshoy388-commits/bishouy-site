CREATE TABLE `ip_blacklist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ipAddress` text NOT NULL,
	`reason` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ip_blacklist_ipAddress_unique` ON `ip_blacklist` (`ipAddress`);--> statement-breakpoint
ALTER TABLE `users` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `statusMessage` text;--> statement-breakpoint
ALTER TABLE `users` ADD `statusNotificationRead` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorEnabled` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorSecret` text;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorBackupCodes` text;--> statement-breakpoint
ALTER TABLE `users` ADD `subscribeToNewsletter` integer DEFAULT 0 NOT NULL;