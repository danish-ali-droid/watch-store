-- Seed data for normalized Watch Store schema
-- Run schema.sql first before executing this file.

CREATE DATABASE IF NOT EXISTS watch_store;
USE watch_store;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE watch_images;
TRUNCATE TABLE watches;
TRUNCATE TABLE case_materials;
TRUNCATE TABLE movements;
TRUNCATE TABLE categories;
TRUNCATE TABLE brands;
TRUNCATE TABLE user_addresses;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ── Lookup tables ────────────────────────────────────────────

INSERT INTO brands (name) VALUES
  ('Rolex'),
  ('Apple'),
  ('Casio'),
  ('Breitling'),
  ('Garmin'),
  ('Tissot'),
  ('Panerai'),
  ('TAG Heuer');

INSERT INTO categories (name) VALUES
  ('Luxury'),
  ('Sports'),
  ('Smart');

INSERT INTO movements (name) VALUES
  ('Automatic'),
  ('Digital'),
  ('Quartz Solar'),
  ('In-house Chronograph'),
  ('Quartz + GPS'),
  ('Manual');

INSERT INTO case_materials (name) VALUES
  ('Oystersteel'),
  ('Titanium'),
  ('Carbon Fiber'),
  ('Stainless Steel');

-- ── Users ────────────────────────────────────────────────────

INSERT INTO users (name, email, password, role) VALUES
  ('Ahmad', 'ahmad@gmail.com',
   '801a8d076da222a82f5b8ebb062e29839a04ec9ee1f7cabccbada9c17e2390b43fa257c2a578e7972e2e61a17889542243c1f3e3cf67f3437956f8febbbf86ae',
   'user'),
  ('Admin', 'admin@gmail.com',
   '0e2eb5500c848e7bc6cb9f1b707c8f332ef1eb74a00d38059420998d08dd49d2e82d9db94714c6dde68962d9679d9f579dca8b4ba6e41080c7b50b0fcc710598',
   'admin');

INSERT INTO user_addresses (user_id, phone, address, city, is_default) VALUES
  (1, '03000037670', '56 Street, Block A', 'Karachi', TRUE),
  (2, '03007654321', 'Admin Lane, Sector 5', 'Lahore',  TRUE);

-- ── Watches ──────────────────────────────────────────────────
-- brand_id:         1=Rolex  2=Apple  3=Casio  4=Breitling  5=Garmin  6=Tissot  7=Panerai  8=TAG Heuer
-- category_id:      1=Luxury 2=Sports 3=Smart
-- movement_id:      1=Automatic 2=Digital 3=Quartz Solar 4=In-house Chronograph 5=Quartz+GPS 6=Manual
-- case_material_id: 1=Oystersteel 2=Titanium 3=Carbon Fiber 4=Stainless Steel

INSERT INTO watches
  (name, brand_id, category_id, movement_id, case_material_id,
   price, original_price, primary_image,
   water_resistance, warranty, case_size, description,
   stock, rating, reviews, featured, is_new)
VALUES
  ('Rolex Submariner Date',         1, 1, 1, 1,  2850000.00, 3200000.00, '/assets/pexels-6230456.jpeg',  '300m', '5 Years', '41mm', 'The Rolex Submariner is the reference among divers'' watches.',                             5, 4.90, 128, TRUE,  FALSE),
  ('Apple Watch Ultra 2',           2, 3, 2, 2,   290000.00,       NULL, '/assets/pexels-8968349.jpeg',  '100m', '1 Year',  '49mm', 'The most capable and rugged Apple Watch ever.',                                           30, 4.90, 892, TRUE,  FALSE),
  ('Casio G-Shock GWF-A1000',       3, 2, 3, 3,   850000.00,  95000.00, '/assets/pexels-207489.jpeg',   '200m', '2 Years', '48mm', 'The ultimate sports watch with solar charging and GPS.',                                   25, 4.70, 342, TRUE,  FALSE),
  ('Breitling Navitimer B01',       4, 1, 4, 4,  4200000.00,       NULL, '/assets/pexels-15261585.jpeg', '30m',  '2 Years', '43mm', 'Classic pilot watch with a slide rule bezel for navigation.',                              3, 4.90,  78, TRUE,  FALSE),
  ('Garmin Fenix 7 Sapphire',       5, 2, 5, 2,   195000.00,       NULL, '/assets/pexels-218675.jpeg',  '100m', '1 Year',  '47mm', 'Advanced GPS multisport smartwatch with sapphire lens.',                                   20, 4.80, 421, TRUE,  TRUE),
  ('Tissot PRX Powermatic 80',      6, 1, 1, 4,   185000.00,       NULL, '/assets/pexels-277955.jpeg',  '100m', '2 Years', '40mm', 'Sporty elegance with an 80-hour automatic movement.',                                     15, 4.70, 167, TRUE,  TRUE),
  ('Panerai Luminor Base Logo',     7, 2, 6, 2,  1900000.00,       NULL, '/assets/pexels-190819.jpeg',  '100m', '2 Years', '44mm', 'Iconic Italian dive watch with luminous numerals and crown guard.',                        5, 4.70, 106, FALSE, TRUE),
  ('TAG Heuer Connected Calibre E4',8, 3, 2, 2,   255000.00,       NULL, '/assets/pexels-87701.jpeg',   '50m',  '2 Years', '45mm', 'Luxury connected smartwatch with high-end sensors and display.',                         18, 4.60, 201, FALSE, TRUE);

-- Additional images (watch_images table — one entry per watch matching primary_image)
INSERT INTO watch_images (watch_id, image_url, sort_order) VALUES
  (1, '/assets/pexels-6230456.jpeg',  0),
  (2, '/assets/pexels-8968349.jpeg',  0),
  (3, '/assets/pexels-207489.jpeg',   0),
  (4, '/assets/pexels-15261585.jpeg', 0),
  (5, '/assets/pexels-218675.jpeg',   0),
  (6, '/assets/pexels-277955.jpeg',   0),
  (7, '/assets/pexels-190819.jpeg',   0),
  (8, '/assets/pexels-87701.jpeg',    0);

-- ── Sample order ─────────────────────────────────────────────

INSERT INTO orders (id, user_id, address_id, total, status, payment_method, tracking_number, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 1, 2935000.00, 'Processing', 'Card', 'TRK123456789', NOW());

INSERT INTO order_items (order_id, watch_id, quantity, unit_price) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 1, 2850000.00),
  ('11111111-1111-1111-1111-111111111111', 2, 1,  290000.00);
