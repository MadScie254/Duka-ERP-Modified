-- DukaERP Database Schema
-- Supabase PostgreSQL | Version 1.0

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'biashara')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT DEFAULT 'general' CHECK (business_type IN (
    'general', 'agrovet', 'pharmacy', 'hardware', 'boutique', 'electronics', 'food', 'other'
  )),
  location TEXT,
  phone TEXT,
  email TEXT,
  kra_pin TEXT,
  logo_url TEXT,
  currency TEXT DEFAULT 'KES',
  timezone TEXT DEFAULT 'Africa/Nairobi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'manager', 'cashier', 'viewer')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shop_id, user_id)
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366F1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  unit TEXT DEFAULT 'piece' CHECK (unit IN (
    'piece', 'kg', 'g', 'litre', 'ml', 'dozen', 'pack', 'box', 'bag', 'roll', 'metre', 'pair'
  )),
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity_in_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(12,2) DEFAULT 5,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shop_id, sku)
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'purchase',
    'sale',
    'adjustment',
    'return',
    'damage',
    'transfer'
  )),
  quantity NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2),
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
  total_amount NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  ordered_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(12,2) NOT NULL,
  unit_cost NUMERIC(12,2) NOT NULL,
  total_cost NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED
);

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  id_number TEXT,
  address TEXT,
  notes TEXT,
  credit_limit NUMERIC(12,2) DEFAULT 0,
  total_debt NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  sale_id UUID,
  type TEXT NOT NULL CHECK (type IN ('credit', 'payment')),
  amount NUMERIC(12,2) NOT NULL,
  balance_after NUMERIC(12,2),
  notes TEXT,
  due_date DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  receipt_number TEXT NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'partial_refund')),
  subtotal NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  amount_owed NUMERIC(12,2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  notes TEXT,
  sold_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity NUMERIC(12,2) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  cost_price NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total_price NUMERIC(12,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount_amount) STORED
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'mpesa', 'credit', 'bank', 'card')),
  amount NUMERIC(12,2) NOT NULL,
  mpesa_code TEXT,
  mpesa_phone TEXT,
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  checkout_request_id TEXT,
  merchant_request_id TEXT,
  result_code TEXT,
  result_desc TEXT,
  amount NUMERIC(12,2),
  mpesa_receipt_number TEXT,
  transaction_date TIMESTAMPTZ,
  phone_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  linked_payment_id UUID REFERENCES payments(id),
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#F59E0B'
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'mpesa', 'bank')),
  mpesa_code TEXT,
  receipt_url TEXT,
  incurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_shop_ids()
RETURNS SETOF UUID AS $$
  SELECT shop_id FROM shop_members
  WHERE user_id = auth.uid() AND is_active = TRUE;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE POLICY "Users access own profile" ON profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "Shop members access shop" ON shops
  FOR ALL USING (id IN (SELECT get_user_shop_ids()));

CREATE POLICY "Shop members access products" ON products
  FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));

CREATE POLICY "shop_data_access" ON categories FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON stock_movements FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON suppliers FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON purchase_orders FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON customers FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON customer_debts FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON sales FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON sale_items FOR ALL USING (sale_id IN (SELECT id FROM sales WHERE shop_id IN (SELECT get_user_shop_ids())));
CREATE POLICY "shop_data_access" ON payments FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON mpesa_transactions FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON expenses FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));
CREATE POLICY "shop_data_access" ON expense_categories FOR ALL USING (shop_id IN (SELECT get_user_shop_ids()));

CREATE OR REPLACE FUNCTION generate_receipt_number(p_shop_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := TO_CHAR(NOW(), 'YYYY');
  v_count INT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count FROM sales
  WHERE shop_id = p_shop_id AND DATE_PART('year', created_at) = DATE_PART('year', NOW());
  RETURN 'INV-' || v_year || '-' || LPAD(v_count::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET quantity_in_stock = quantity_in_stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock_on_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_sale();

CREATE OR REPLACE FUNCTION update_customer_debt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET total_debt = (
    SELECT COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0)
    FROM customer_debts WHERE customer_id = NEW.customer_id
  )
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_customer_debt
  AFTER INSERT OR UPDATE ON customer_debts
  FOR EACH ROW EXECUTE FUNCTION update_customer_debt();

CREATE VIEW daily_sales_summary AS
SELECT
  shop_id,
  DATE(created_at) AS sale_date,
  COUNT(*) AS transaction_count,
  SUM(total_amount) AS gross_revenue,
  SUM(discount_amount) AS total_discounts,
  SUM(amount_paid) AS cash_collected,
  SUM(amount_owed) AS credit_outstanding
FROM sales
WHERE status = 'completed'
GROUP BY shop_id, DATE(created_at);

CREATE VIEW product_performance AS
SELECT
  p.shop_id,
  p.id AS product_id,
  p.name AS product_name,
  p.category_id,
  SUM(si.quantity) AS units_sold,
  SUM(si.total_price) AS revenue,
  SUM(si.quantity * si.cost_price) AS cogs,
  SUM(si.total_price) - SUM(si.quantity * si.cost_price) AS gross_profit,
  CASE WHEN SUM(si.total_price) > 0 THEN
    ROUND(((SUM(si.total_price) - SUM(si.quantity * si.cost_price)) / SUM(si.total_price) * 100)::NUMERIC, 2)
  ELSE 0 END AS margin_pct,
  p.quantity_in_stock,
  p.reorder_level,
  CASE WHEN p.quantity_in_stock <= p.reorder_level THEN TRUE ELSE FALSE END AS needs_reorder
FROM sale_items si
JOIN products p ON p.id = si.product_id
JOIN sales s ON s.id = si.sale_id AND s.status = 'completed'
GROUP BY p.shop_id, p.id, p.name, p.category_id, p.quantity_in_stock, p.reorder_level;

CREATE VIEW payment_method_summary AS
SELECT
  shop_id,
  DATE(created_at) AS pay_date,
  method,
  COUNT(*) AS transactions,
  SUM(amount) AS total_amount
FROM payments
GROUP BY shop_id, DATE(created_at), method;
