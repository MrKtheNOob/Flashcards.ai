CREATE TABLE `Users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(100),
  `password` varchar(100),
  `created_at` timestamp
);

CREATE TABLE `Decks` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100),
  `created_at` timestamp,
  `user_id` int
);

CREATE TABLE `Flashcards` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `front` text,
  `back` text,
  `created_at` timestamp,
  `deck_id` int
);

ALTER TABLE `Decks` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

ALTER TABLE `Decks` ADD FOREIGN KEY (`id`) REFERENCES `Flashcards` (`id`);
