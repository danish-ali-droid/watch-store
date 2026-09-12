-- MariaDB Normalized Schema for Watch Store (3NF)
-- ============================================================
-- Normalization changes:
--   1NF : Eliminated the JSON `images` column → separate `watch_images` table
--         Eliminated the duplicate `image` / `image_url` columns → single `primary_image` column
--   2NF : Extracted repeating `brand` strings        → `brands` table
--         Extracted repeating `category` strings      → `categories` table
--         Extracted repeating `movement` strings      → `movements` table
--         Extracted repeating `case_material` strings → `case_materials` table
--   3NF : User contact/shipping info moved to        → `user_addresses` table
--         `shippingAddress` text blob in orders       → FK to `user_addresses`
--         Removed `phone` from orders (use address FK)
-- ============================================================

CREATE DATABASE IF NOT EXISTS watch_store;
USE watch_store;

-- ── Lookup / reference tables ─────────────────────────────────

CREATE TABLE IF NOT EXISTS brands (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS movements (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS case_materials (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- ── Users ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  password          VARCHAR(255) NOT NULL,
  email_verified    BOOLEAN      NOT NULL DEFAULT FALSE,
  email_verified_at TIMESTAMP    NULL,
  role              ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- A user may have multiple saved addresses / phone numbers
CREATE TABLE IF NOT EXISTS user_addresses (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  phone      VARCHAR(50)  NOT NULL,
  address    TEXT         NOT NULL,
  city       VARCHAR(100) NOT NULL,
  is_default BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Products (watches) ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS watches (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255)   NOT NULL,
  brand_id         INT            NOT NULL,
  category_id      INT            NOT NULL,
  movement_id      INT            NOT NULL,
  case_material_id INT            NOT NULL,
  price            DECIMAL(12,2)  NOT NULL,
  original_price   DECIMAL(12,2)  DEFAULT NULL,
  primary_image    TEXT           NOT NULL,
  water_resistance VARCHAR(100)   NOT NULL,
  warranty         VARCHAR(255)   NOT NULL,
  case_size        VARCHAR(100)   NOT NULL,
  description      TEXT           NOT NULL,
  stock            INT            NOT NULL DEFAULT 0,
  rating           DECIMAL(3,2)   NOT NULL DEFAULT 0.00,
  reviews          INT            NOT NULL DEFAULT 0,
  featured         BOOLEAN        NOT NULL DEFAULT FALSE,
  is_new           BOOLEAN        NOT NULL DEFAULT FALSE,
  FOREIGN KEY (brand_id)         REFERENCES brands(id),
  FOREIGN KEY (category_id)      REFERENCES categories(id),
  FOREIGN KEY (movement_id)      REFERENCES movements(id),
  FOREIGN KEY (case_material_id) REFERENCES case_materials(id)
);

-- Additional images per watch (replaces JSON `images` column — 1NF)
CREATE TABLE IF NOT EXISTS watch_images (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  watch_id  INT  NOT NULL,
  image_url TEXT NOT NULL,
  sort_order TINYINT NOT NULL DEFAULT 0,  -- controls display order
  FOREIGN KEY (watch_id) REFERENCES watches(id) ON DELETE CASCADE
);

-- ── Orders ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id              VARCHAR(36)   PRIMARY KEY,
  user_id         INT           NOT NULL,
  address_id      INT           NOT NULL,            -- FK to snapshot of shipping address
  total           DECIMAL(12,2) NOT NULL,
  status          ENUM('Pending','Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
  payment_method  ENUM('COD','Card') NOT NULL,
  tracking_number VARCHAR(255)  DEFAULT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)          ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES user_addresses(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   VARCHAR(36)   NOT NULL,
  watch_id   INT           NOT NULL,
  quantity   INT           NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,   -- price snapshot at time of purchase
  FOREIGN KEY (order_id) REFERENCES orders(id)  ON DELETE CASCADE,
  FOREIGN KEY (watch_id) REFERENCES watches(id) ON DELETE CASCADE
);
