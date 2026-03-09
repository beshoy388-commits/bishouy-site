CREATE TABLE `visitor_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sessionId` text NOT NULL,
	`userId` integer,
	`ipAddress` text,
	`userAgent` text,
	`location` text,
	`currentPath` text,
	`lastActiveAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `visitor_sessions_sessionId_unique` ON `visitor_sessions` (`sessionId`);