-- ============================================================
--  VIP Earner GH — Production SQL Schema
--  MySQL 5.7+ / MariaDB 10.3+ compatible
--  ENGINE=InnoDB | CHARSET=utf8mb4_unicode_ci
--  Generated: 2026-05-07
--  Safe for phpMyAdmin import on cPanel shared hosting
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- ============================================================
--  SECTION 1: LARAVEL SYSTEM TABLES
-- ============================================================

-- ── Cache ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `cache` (
    `key`        VARCHAR(255)     NOT NULL,
    `value`      MEDIUMTEXT       NOT NULL,
    `expiration` INT              NOT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cache_locks` (
    `key`        VARCHAR(255)     NOT NULL,
    `owner`      VARCHAR(255)     NOT NULL,
    `expiration` INT              NOT NULL,
    PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Sessions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `sessions` (
    `id`            VARCHAR(255)     NOT NULL,
    `user_id`       BIGINT UNSIGNED  NULL,
    `ip_address`    VARCHAR(45)      NULL,
    `user_agent`    TEXT             NULL,
    `payload`       LONGTEXT         NOT NULL,
    `last_activity` INT              NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `sessions_user_id_index` (`user_id`),
    INDEX `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Jobs / Queue ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `jobs` (
    `id`           BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    `queue`        VARCHAR(255)     NOT NULL,
    `payload`      LONGTEXT         NOT NULL,
    `attempts`     TINYINT UNSIGNED NOT NULL,
    `reserved_at`  INT UNSIGNED     NULL,
    `available_at` INT UNSIGNED     NOT NULL,
    `created_at`   INT UNSIGNED     NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `job_batches` (
    `id`             VARCHAR(255) NOT NULL,
    `name`           VARCHAR(255) NOT NULL,
    `total_jobs`     INT          NOT NULL,
    `pending_jobs`   INT          NOT NULL,
    `failed_jobs`    INT          NOT NULL,
    `failed_job_ids` LONGTEXT     NOT NULL,
    `options`        MEDIUMTEXT   NULL,
    `cancelled_at`   INT          NULL,
    `created_at`     INT          NOT NULL,
    `finished_at`    INT          NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `failed_jobs` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid`       VARCHAR(255)    NOT NULL,
    `connection` TEXT            NOT NULL,
    `queue`      TEXT            NOT NULL,
    `payload`    LONGTEXT        NOT NULL,
    `exception`  LONGTEXT        NOT NULL,
    `failed_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Personal Access Tokens (Sanctum) ─────────────────────────
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tokenable_type` VARCHAR(255)    NOT NULL,
    `tokenable_id`   VARCHAR(255)    NOT NULL,   -- VARCHAR because User PK is UUID string
    `name`           VARCHAR(255)    NOT NULL,
    `token`          VARCHAR(64)     NOT NULL,
    `abilities`      TEXT            NULL,
    `last_used_at`   TIMESTAMP       NULL,
    `expires_at`     TIMESTAMP       NULL,
    `created_at`     TIMESTAMP       NULL,
    `updated_at`     TIMESTAMP       NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
    INDEX `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Password Reset Tokens ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `email`      VARCHAR(255) NOT NULL,
    `token`      VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP    NULL,
    PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Migrations tracking ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `migrations` (
    `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(255) NOT NULL,
    `batch`     INT          NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  SECTION 2: APPLICATION TABLES (dependency order)
-- ============================================================

-- ── VIP Levels (must exist before users) ─────────────────────
CREATE TABLE IF NOT EXISTS `vip_levels` (
    `name`            VARCHAR(20)    NOT NULL,
    `sort_order`      INT            NOT NULL,
    `daily_tasks`     INT            NOT NULL,
    `reward_per_task` DECIMAL(8,2)   NOT NULL,
    `upgrade_cost`    DECIMAL(10,2)  NULL,
    `color_hex`       VARCHAR(7)     NOT NULL DEFAULT '#2563EB',
    `created_at`      TIMESTAMP      NULL,
    `updated_at`      TIMESTAMP      NULL,
    PRIMARY KEY (`name`),
    UNIQUE KEY `vip_levels_sort_order_unique` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
    `id`                CHAR(36)       NOT NULL,
    `phone`             VARCHAR(20)    NOT NULL,
    `password`          VARCHAR(255)   NULL,
    `display_name`      VARCHAR(80)    NULL,
    `avatar_url`        TEXT           NULL,
    `balance`           DECIMAL(12,2)  UNSIGNED NOT NULL DEFAULT 0.00,
    `total_income`      DECIMAL(12,2)  UNSIGNED NOT NULL DEFAULT 0.00,
    `daily_revenue`     DECIMAL(12,2)  UNSIGNED NOT NULL DEFAULT 0.00,
    `monthly_revenue`   DECIMAL(12,2)  UNSIGNED NOT NULL DEFAULT 0.00,
    `total_profit`      DECIMAL(12,2)  UNSIGNED NOT NULL DEFAULT 0.00,
    `total_withdrawals` DECIMAL(12,2)  UNSIGNED NOT NULL DEFAULT 0.00,
    `work_deposit`      DECIMAL(12,2)  UNSIGNED NOT NULL DEFAULT 0.00,
    `vip_level`         VARCHAR(20)    NOT NULL DEFAULT 'Intern',
    `vip_upgraded_at`   TIMESTAMP      NULL,
    `referral_code`     VARCHAR(12)    NOT NULL,
    `referred_by`       CHAR(36)       NULL,
    `last_checkin`      DATE           NULL,
    `checkin_streak`    TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `last_lucky_bag`    TIMESTAMP      NULL,
    `is_admin`          TINYINT(1)     NOT NULL DEFAULT 0,
    `is_banned`         TINYINT(1)     NOT NULL DEFAULT 0,
    `ban_reason`        TEXT           NULL,
    `created_at`        TIMESTAMP      NULL,
    `updated_at`        TIMESTAMP      NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_phone_unique` (`phone`),
    UNIQUE KEY `users_referral_code_unique` (`referral_code`),
    INDEX `users_vip_level_index` (`vip_level`),
    INDEX `users_is_admin_index` (`is_admin`),
    INDEX `users_is_banned_index` (`is_banned`),
    CONSTRAINT `users_vip_level_foreign` FOREIGN KEY (`vip_level`) REFERENCES `vip_levels` (`name`),
    CONSTRAINT `users_referred_by_foreign` FOREIGN KEY (`referred_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tasks ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `tasks` (
    `id`            CHAR(36)      NOT NULL,
    `title`         VARCHAR(255)  NOT NULL DEFAULT 'Engagement Task',
    `description`   TEXT          NULL,
    `facebook_url`  TEXT          NOT NULL,
    `reward`        DECIMAL(8,2)  NOT NULL,
    `wait_seconds`  INT           NOT NULL DEFAULT 15,
    `is_active`     TINYINT(1)    NOT NULL DEFAULT 1,
    `min_vip_sort`  INT           NOT NULL DEFAULT 0,
    `display_order` INT           NOT NULL DEFAULT 0,
    `created_by`    CHAR(36)      NULL,
    `created_at`    TIMESTAMP     NULL,
    `updated_at`    TIMESTAMP     NULL,
    PRIMARY KEY (`id`),
    INDEX `tasks_is_active_index` (`is_active`),
    INDEX `tasks_min_vip_sort_index` (`min_vip_sort`),
    CONSTRAINT `tasks_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Task Sessions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `task_sessions` (
    `id`          CHAR(36)    NOT NULL,
    `user_id`     CHAR(36)    NOT NULL,
    `task_id`     CHAR(36)    NOT NULL,
    `started_at`  TIMESTAMP   NULL,
    `expires_at`  TIMESTAMP   NULL,
    `completed`   TINYINT(1)  NOT NULL DEFAULT 0,
    `created_at`  TIMESTAMP   NULL,
    `updated_at`  TIMESTAMP   NULL,
    PRIMARY KEY (`id`),
    INDEX `task_sessions_user_id_index` (`user_id`),
    INDEX `task_sessions_task_id_index` (`task_id`),
    INDEX `task_sessions_expires_at_index` (`expires_at`),
    CONSTRAINT `task_sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `task_sessions_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Task Logs ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `task_logs` (
    `id`               CHAR(36)     NOT NULL,
    `user_id`          CHAR(36)     NOT NULL,
    `task_id`          CHAR(36)     NOT NULL,
    `task_session_id`  CHAR(36)     NULL,
    `reward_earned`    DECIMAL(8,2) NOT NULL,
    `completed_at`     TIMESTAMP    NULL,
    `created_at`       TIMESTAMP    NULL,
    `updated_at`       TIMESTAMP    NULL,
    PRIMARY KEY (`id`),
    INDEX `task_logs_user_id_index` (`user_id`),
    INDEX `task_logs_completed_at_index` (`completed_at`),
    CONSTRAINT `task_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `task_logs_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Transactions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `transactions` (
    `id`                  CHAR(36)      NOT NULL,
    `user_id`             CHAR(36)      NOT NULL,
    `amount`              DECIMAL(12,2) NOT NULL,
    `direction`           ENUM('+','-') NOT NULL,
    `type`                ENUM('deposit','withdrawal','task_reward','vip_upgrade','lucky_bag','daily_checkin','referral_bonus','admin_adjustment') NOT NULL,
    `status`              ENUM('pending','success','failed','reversed') NOT NULL DEFAULT 'pending',
    `paystack_reference`  VARCHAR(100)  NULL,
    `metadata`            JSON          NULL,
    `admin_id`            CHAR(36)      NULL,
    `created_at`          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `transactions_paystack_reference_unique` (`paystack_reference`),
    INDEX `transactions_user_id_status` (`user_id`, `status`),
    INDEX `transactions_status_created_at` (`status`, `created_at`),
    INDEX `transactions_type_index` (`type`),
    CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `transactions_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Withdrawals ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `withdrawals` (
    `id`             CHAR(36)                                          NOT NULL,
    `user_id`        CHAR(36)                                          NOT NULL,
    `amount`         DECIMAL(12,2)                                     NOT NULL,
    `channel`        ENUM('mobile_money','bank')                       NOT NULL,
    `details`        JSON                                              NOT NULL,
    `status`         ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
    `admin_note`     TEXT                                              NULL,
    `reviewed_by`    CHAR(36)                                          NULL,
    `reviewed_at`    TIMESTAMP                                         NULL,
    `transaction_id` CHAR(36)                                          NULL,
    `created_at`     TIMESTAMP                                         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `withdrawals_user_id_index` (`user_id`),
    INDEX `withdrawals_status_created_at` (`status`, `created_at`),
    CONSTRAINT `withdrawals_user_id_foreign`      FOREIGN KEY (`user_id`)        REFERENCES `users` (`id`)        ON DELETE CASCADE,
    CONSTRAINT `withdrawals_reviewed_by_foreign`  FOREIGN KEY (`reviewed_by`)    REFERENCES `users` (`id`)        ON DELETE SET NULL,
    CONSTRAINT `withdrawals_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Referrals ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `referrals` (
    `id`            CHAR(36)      NOT NULL,
    `referrer_id`   CHAR(36)      NOT NULL,
    `referred_id`   CHAR(36)      NOT NULL,
    `reward_amount` DECIMAL(8,2)  NOT NULL DEFAULT 2.00,
    `reward_paid`   TINYINT(1)    NOT NULL DEFAULT 0,
    `paid_at`       TIMESTAMP     NULL,
    `created_at`    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `referrals_referred_id_unique` (`referred_id`),
    INDEX `referrals_referrer_id_index` (`referrer_id`),
    CONSTRAINT `referrals_referrer_id_foreign` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `referrals_referred_id_foreign` FOREIGN KEY (`referred_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Announcements ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `announcements` (
    `id`         CHAR(36)    NOT NULL,
    `title`      VARCHAR(255) NOT NULL,
    `body`       TEXT        NOT NULL,
    `is_active`  TINYINT(1)  NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP   NULL,
    `updated_at` TIMESTAMP   NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notifications` (
    `id`         CHAR(36)    NOT NULL,
    `user_id`    CHAR(36)    NOT NULL,
    `type`       VARCHAR(100) NOT NULL,
    `title`      VARCHAR(255) NOT NULL,
    `body`       TEXT        NOT NULL,
    `is_read`    TINYINT(1)  NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP   NULL,
    PRIMARY KEY (`id`),
    INDEX `notifications_user_id_is_read` (`user_id`, `is_read`),
    CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Audit Log ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `audit_log` (
    `id`         CHAR(36)     NOT NULL,
    `admin_id`   CHAR(36)     NOT NULL,
    `target_id`  CHAR(36)     NOT NULL,
    `action`     VARCHAR(100) NOT NULL,
    `old_value`  JSON         NULL,
    `new_value`  JSON         NULL,
    `reason`     TEXT         NULL,
    `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `audit_log_admin_id_index` (`admin_id`),
    INDEX `audit_log_target_id_index` (`target_id`),
    INDEX `audit_log_action_index` (`action`),
    CONSTRAINT `audit_log_admin_id_foreign`  FOREIGN KEY (`admin_id`)  REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `audit_log_target_id_foreign` FOREIGN KEY (`target_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  SECTION 3: SEED DATA
-- ============================================================

-- ── VIP Levels ────────────────────────────────────────────────
INSERT IGNORE INTO `vip_levels` (`name`, `sort_order`, `daily_tasks`, `reward_per_task`, `upgrade_cost`, `color_hex`, `created_at`, `updated_at`) VALUES
('Intern', 0, 5,  0.20, NULL,   '#64748B', NOW(), NOW()),
('VIP 1',  1, 10, 0.50, 10.00,  '#3B82F6', NOW(), NOW()),
('VIP 2',  2, 20, 1.00, 25.00,  '#8B5CF6', NOW(), NOW()),
('VIP 3',  3, 35, 1.80, 50.00,  '#F59E0B', NOW(), NOW()),
('VIP 4',  4, 55, 2.80, 100.00, '#EF4444', NOW(), NOW()),
('VIP 5',  5, 80, 4.00, 200.00, '#10B981', NOW(), NOW());

-- ── Default Super Admin ───────────────────────────────────────
-- Password: ChangeMe@2025! (bcrypt hash below)
-- IMPORTANT: Change the password IMMEDIATELY after first login via /admin
-- To generate a new hash: php -r "echo password_hash('YourNewPassword', PASSWORD_BCRYPT);"
INSERT IGNORE INTO `users` (
    `id`, `phone`, `password`, `display_name`,
    `balance`, `total_income`, `daily_revenue`, `monthly_revenue`,
    `total_profit`, `total_withdrawals`, `work_deposit`,
    `vip_level`, `referral_code`, `is_admin`, `is_banned`,
    `created_at`, `updated_at`
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '+233000000001',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- "ChangeMe@2025!" hashed
    'Super Admin',
    0, 0, 0, 0, 0, 0, 0,
    'Intern',
    'ADMN0001',
    1, 0,
    NOW(), NOW()
);

-- ── Laravel migrations table seed ────────────────────────────
INSERT IGNORE INTO `migrations` (`migration`, `batch`) VALUES
('0001_01_01_000001_create_cache_table', 1),
('0001_01_01_000002_create_jobs_table', 1),
('2024_01_01_000001_create_vip_levels_table', 1),
('2024_01_01_000002_create_users_table', 1),
('2024_01_01_000003_create_tasks_table', 1),
('2024_01_01_000004_create_task_sessions_table', 1),
('2024_01_01_000005_create_task_logs_table', 1),
('2024_01_01_000006_create_transactions_table', 1),
('2024_01_01_000007_create_withdrawals_table', 1),
('2024_01_01_000008_create_referrals_table', 1),
('2024_01_01_000009_create_announcements_table', 1),
('2024_01_01_000010_create_notifications_table', 1),
('2024_01_01_000011_create_audit_log_table', 1),
('2026_05_07_214414_create_personal_access_tokens_table', 1),
('2026_05_07_add_password_to_users_table', 1);

-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
--  END OF FILE — VIP Earner GH Production Schema v1.0
-- ============================================================
