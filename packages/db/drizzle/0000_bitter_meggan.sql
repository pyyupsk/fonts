CREATE TABLE `families` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`designer` text NOT NULL,
	`category` text NOT NULL,
	`license` text NOT NULL,
	`is_noto` integer DEFAULT false NOT NULL,
	`date_added` text NOT NULL,
	`source_repository_url` text NOT NULL,
	FOREIGN KEY (`license`) REFERENCES `licenses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `families_category_idx` ON `families` (`category`);--> statement-breakpoint
CREATE INDEX `families_license_idx` ON `families` (`license`);--> statement-breakpoint
CREATE TABLE `family_subsets` (
	`family_id` text NOT NULL,
	`subset_id` text NOT NULL,
	PRIMARY KEY(`family_id`, `subset_id`),
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subset_id`) REFERENCES `subsets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `family_subsets_subset_idx` ON `family_subsets` (`subset_id`);--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`format` text NOT NULL,
	`r2_key` text NOT NULL,
	`file_size` integer NOT NULL,
	`checksum_sha256` text NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `files_variant_idx` ON `files` (`variant_id`);--> statement-breakpoint
CREATE TABLE `licenses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subsets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subsets_name_unique` ON `subsets` (`name`);--> statement-breakpoint
CREATE TABLE `variants` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`style` text NOT NULL,
	`weight` integer NOT NULL,
	`post_script_name` text NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `families`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `variants_family_idx` ON `variants` (`family_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `variants_family_style_weight_unique` ON `variants` (`family_id`,`style`,`weight`);