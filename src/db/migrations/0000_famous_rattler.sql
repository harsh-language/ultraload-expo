CREATE TABLE `logged_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_id` integer NOT NULL,
	`exercise_id` text NOT NULL,
	`order` integer NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`bodyweight` real,
	`name` text,
	`height` real,
	`age` integer,
	`units` text DEFAULT 'kg' NOT NULL,
	`warm_up_percent` integer DEFAULT 50 NOT NULL,
	`warm_up_auto_tag_enabled` integer DEFAULT true NOT NULL,
	`rest_timer_seconds` integer DEFAULT 180 NOT NULL,
	`onboarding_complete` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`logged_exercise_id` integer NOT NULL,
	`weight` real NOT NULL,
	`reps` integer NOT NULL,
	`warm_up` integer DEFAULT false NOT NULL,
	`order` integer NOT NULL,
	`timestamp` text NOT NULL,
	FOREIGN KEY (`logged_exercise_id`) REFERENCES `logged_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`per_exercise_overrides` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workout_plan` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`exercise_ids` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workouts_date_unique` ON `workouts` (`date`);