ALTER TABLE `articles` ADD `summary` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `factCheck` text;--> statement-breakpoint
ALTER TABLE `articles` ADD `premiumOnly` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `breakingNewsAlerts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `pushSubscription` text;--> statement-breakpoint
ALTER TABLE `users` ADD `passkeyCredentials` text;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionTier` text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` text;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` text;--> statement-breakpoint
ALTER TABLE `users` ADD `stripePriceId` text;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` text;