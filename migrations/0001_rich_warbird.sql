CREATE TABLE `species` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`period` text NOT NULL,
	CONSTRAINT "species_period_check" CHECK("species"."period" IN ('cretaceous', 'jurassic', 'triassic'))
);
