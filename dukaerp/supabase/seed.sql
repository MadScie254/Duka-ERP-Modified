-- Sample seed data for development
INSERT INTO shops (id, owner_id, name, business_type, location, phone)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'USER_ID_HERE',
  'Mama Wanjiku General Store',
  'general',
  'Tom Mboya Street, Nairobi',
  '0712345678'
);

INSERT INTO categories (shop_id, name, color) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Unga & Grains', '#F59E0B'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Sugar & Cooking', '#EF4444'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Beverages', '#3B82F6'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Household', '#8B5CF6'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Toiletries', '#EC4899');

INSERT INTO products (shop_id, category_id, name, sku, unit, cost_price, selling_price, quantity_in_stock, reorder_level)
VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM categories WHERE name='Unga & Grains' LIMIT 1), 'Unga wa Ngano 2kg', 'UNG-2KG', 'piece', 85, 100, 50, 10),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM categories WHERE name='Sugar & Cooking' LIMIT 1), 'Sukari 1kg', 'SUK-1KG', 'kg', 80, 100, 100, 20),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM categories WHERE name='Beverages' LIMIT 1), 'Chai Rangi 50 bags', 'CHA-50', 'piece', 45, 60, 30, 5),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM categories WHERE name='Household' LIMIT 1), 'Omo Detergent 500g', 'OMO-500', 'piece', 95, 120, 25, 5),
  ('a1b2c3d4-0000-0000-0000-000000000001', (SELECT id FROM categories WHERE name='Toiletries' LIMIT 1), 'Geisha Soap 175g', 'GEI-175', 'piece', 40, 55, 60, 10);
