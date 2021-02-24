CREATE TABLE IF NOT EXISTS `cms` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `key` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `value` longtext CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `message` longtext CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `document_type` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `downloadable` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `file_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `file_id` (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `file` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `path` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `size` bigint unsigned NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `loggable_type` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `loggable_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `loggable_id` (`loggable_id`,`user_id`) USING BTREE,
  FULLTEXT KEY `loggable_type` (`loggable_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `queue` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `payload` longtext COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `request` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `request_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `document_type_id` bigint unsigned NOT NULL,
  `approved` tinyint NOT NULL DEFAULT '0',
  `expired` tinyint NOT NULL DEFAULT '0',
  `acknowledged` tinyint NOT NULL DEFAULT '0',
  `file_id` bigint unsigned DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT 'Received',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `storage` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `path` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `content` longtext CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `token` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `hash` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hash` (`hash`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `phone` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `role` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `profile_picture_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `profile_picture_id` (`profile_picture_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
