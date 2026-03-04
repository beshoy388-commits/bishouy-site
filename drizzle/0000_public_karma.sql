CREATE TABLE `advertisements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`imageUrl` text NOT NULL,
	`linkUrl` text NOT NULL,
	`position` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`startDate` integer,
	`endDate` integer,
	`clickCount` integer DEFAULT 0,
	`impressionCount` integer DEFAULT 0,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `article_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` integer NOT NULL,
	`userId` integer NOT NULL,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`categoryColor` text DEFAULT '#E8A020',
	`author` text NOT NULL,
	`authorRole` text DEFAULT 'Staff Writer',
	`image` text NOT NULL,
	`featured` integer DEFAULT 0 NOT NULL,
	`breaking` integer DEFAULT 0 NOT NULL,
	`readTime` integer DEFAULT 5 NOT NULL,
	`tags` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`publishedAt` integer,
	`authorId` integer,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`action` text NOT NULL,
	`resource` text NOT NULL,
	`resourceId` integer,
	`changes` text,
	`ipAddress` text,
	`userAgent` text,
	`status` text DEFAULT 'success',
	`errorMessage` text,
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`articleId` integer NOT NULL,
	`userId` integer NOT NULL,
	`content` text NOT NULL,
	`approved` integer DEFAULT 0 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`username` text,
	`bio` text,
	`avatarUrl` text,
	`website` text,
	`location` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);