ALTER TABLE `users` ADD `password_reset_token_hash` text;--> statement-breakpoint
ALTER TABLE `users` ADD `password_reset_expires_at` text;