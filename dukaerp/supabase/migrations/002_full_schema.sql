-- ============================================================
-- DukaERP Full Schema Migration
-- Kenyan Retail ERP - Supabase PostgreSQL
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash','mpesa','card','credit','bank_transfer');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sale_status AS ENUM ('completed','pending','refunded','voided');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('completed','pending','failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_type AS ENUM ('free','pro','biashara');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE adjustment_reason AS ENUM ('damage','count_correction','theft','expiry','restock','other');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE mpesa_status AS ENUM ('pending','completed','failed','cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  plan plan_type NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SHOPS
-- ============================================================
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT DEFAULT 'General Retail',
  location TEXT,
  phone TEXT,
  email TEXT,
  kra_pin TEXT,
  logo_url TEXT,
  currency TEXT NOT NULL DEFAULT 'KES',
  timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(shop_id, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_shop ON categories(shop_id);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'piece',
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  total_purchases NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_debt NUMERIC(12,2) NOT NULL DEFAULT 0,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_shop ON customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  contact_person TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_shop ON suppliers(shop_id);

-- ============================================================
-- SALES
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  receipt_number TEXT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status sale_status NOT NULL DEFAULT 'completed',
  payment_method payment_method NOT NULL DEFAULT 'cash',
  notes TEXT,
  cashier_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_shop ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_receipt ON sales(receipt_number);

-- ============================================================
-- SALE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'cash',
  status payment_status NOT NULL DEFAULT 'completed',
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_shop ON payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_payments_sale ON payments(sale_id);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'Miscellaneous',
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash',
  receipt_url TEXT,
  notes TEXT,
  incurred_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_shop ON expenses(shop_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(incurred_at DESC);

-- ============================================================
-- STOCK ADJUSTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason adjustment_reason NOT NULL DEFAULT 'count_correction',
  notes TEXT,
  adjusted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_adj_shop ON stock_adjustments(shop_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_product ON stock_adjustments(product_id);

-- ============================================================
-- MPESA TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  mpesa_receipt TEXT,
  merchant_request_id TEXT,
  checkout_request_id TEXT,
  result_code INTEGER,
  result_desc TEXT,
  status mpesa_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mpesa_shop ON mpesa_transactions(shop_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_checkout ON mpesa_transactions(checkout_request_id);

-- ============================================================
-- DEBT RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS debt_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  original_amount NUMERIC(12,2) NOT NULL,
  remaining_amount NUMERIC(12,2) NOT NULL,
  due_date DATE,
  is_settled BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debts_shop ON debt_records(shop_id);
CREATE INDEX IF NOT EXISTS idx_debts_customer ON debt_records(customer_id);

-- ============================================================
-- DEBT PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS debt_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debt_id UUID NOT NULL REFERENCES debt_records(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','shops','products','customers','suppliers','sales','expenses','mpesa_transactions','debt_records'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;

-- ============================================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RECEIPT NUMBER GENERATOR
-- ============================================================
CREATE OR REPLACE FUNCTION generate_receipt_number(p_shop_id UUID)
RETURNS TEXT AS $$
DECLARE
  cnt INTEGER;
  prefix TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO cnt FROM sales WHERE shop_id = p_shop_id;
  prefix := 'RCT-' || to_char(now(), 'YYMMDD') || '-';
  RETURN prefix || lpad(cnt::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STOCK DEDUCTION ON SALE
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deduct_stock ON sale_items;
CREATE TRIGGER trg_deduct_stock
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION deduct_stock_on_sale();

-- ============================================================
-- RESTORE STOCK ON REFUND/VOID
-- ============================================================
CREATE OR REPLACE FUNCTION restore_stock_on_void()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('refunded', 'voided') AND OLD.status = 'completed' THEN
    UPDATE products p
    SET stock_quantity = p.stock_quantity + si.quantity
    FROM sale_items si
    WHERE si.sale_id = NEW.id AND si.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restore_stock ON sales;
CREATE TRIGGER trg_restore_stock
  AFTER UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION restore_stock_on_void();

-- ============================================================
-- UPDATE CUSTOMER TOTALS
-- ============================================================
CREATE OR REPLACE FUNCTION update_customer_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET total_purchases = total_purchases + NEW.total_amount,
        loyalty_points = loyalty_points + FLOOR(NEW.total_amount / 100)
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_customer ON sales;
CREATE TRIGGER trg_update_customer
  AFTER INSERT ON sales
  FOR EACH ROW EXECUTE FUNCTION update_customer_totals();

-- ============================================================
-- RPC: Daily Sales Summary
-- ============================================================
CREATE OR REPLACE FUNCTION daily_sales_summary(p_shop_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  sale_date DATE,
  revenue NUMERIC,
  profit NUMERIC,
  transaction_count BIGINT,
  units_sold BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.created_at::date AS sale_date,
    COALESCE(SUM(s.total_amount), 0) AS revenue,
    COALESCE(SUM(s.profit_amount), 0) AS profit,
    COUNT(s.id) AS transaction_count,
    COALESCE(SUM(si.quantity), 0) AS units_sold
  FROM sales s
  LEFT JOIN sale_items si ON si.sale_id = s.id
  WHERE s.shop_id = p_shop_id
    AND s.status = 'completed'
    AND s.created_at >= (now() - (p_days || ' days')::interval)
  GROUP BY s.created_at::date
  ORDER BY sale_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Today KPIs
-- ============================================================
CREATE OR REPLACE FUNCTION today_kpis(p_shop_id UUID)
RETURNS TABLE(
  revenue NUMERIC,
  profit NUMERIC,
  units_sold BIGINT,
  transaction_count BIGINT,
  active_debts NUMERIC,
  low_stock_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(s.total_amount), 0) AS revenue,
    COALESCE(SUM(s.profit_amount), 0) AS profit,
    COALESCE((SELECT SUM(si.quantity) FROM sale_items si JOIN sales s2 ON si.sale_id = s2.id WHERE s2.shop_id = p_shop_id AND s2.status = 'completed' AND s2.created_at::date = CURRENT_DATE), 0) AS units_sold,
    COUNT(s.id) AS transaction_count,
    COALESCE((SELECT SUM(remaining_amount) FROM debt_records WHERE shop_id = p_shop_id AND NOT is_settled), 0) AS active_debts,
    COALESCE((SELECT COUNT(*) FROM products WHERE shop_id = p_shop_id AND stock_quantity <= reorder_level AND is_active), 0) AS low_stock_count
  FROM sales s
  WHERE s.shop_id = p_shop_id
    AND s.status = 'completed'
    AND s.created_at::date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Top Products
-- ============================================================
CREATE OR REPLACE FUNCTION top_products(p_shop_id UUID, p_limit INTEGER DEFAULT 10, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  total_revenue NUMERIC,
  total_units BIGINT,
  margin_pct NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.product_id,
    si.product_name,
    SUM(si.line_total) AS total_revenue,
    SUM(si.quantity)::BIGINT AS total_units,
    CASE WHEN SUM(si.line_total) > 0 
      THEN ROUND((SUM(si.line_total) - SUM(si.cost_price * si.quantity)) / SUM(si.line_total) * 100, 1)
      ELSE 0
    END AS margin_pct
  FROM sale_items si
  JOIN sales s ON s.id = si.sale_id
  WHERE s.shop_id = p_shop_id
    AND s.status = 'completed'
    AND s.created_at >= (now() - (p_days || ' days')::interval)
  GROUP BY si.product_id, si.product_name
  ORDER BY total_revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Payment Method Breakdown
-- ============================================================
CREATE OR REPLACE FUNCTION payment_method_summary(p_shop_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  method payment_method,
  total_amount NUMERIC,
  tx_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.payment_method AS method,
    SUM(s.total_amount) AS total_amount,
    COUNT(s.id) AS tx_count
  FROM sales s
  WHERE s.shop_id = p_shop_id
    AND s.status = 'completed'
    AND s.created_at >= (now() - (p_days || ' days')::interval)
  GROUP BY s.payment_method
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Stock Valuation
-- ============================================================
CREATE OR REPLACE FUNCTION stock_valuation(p_shop_id UUID)
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  stock_quantity INTEGER,
  cost_value NUMERIC,
  retail_value NUMERIC,
  potential_profit NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.stock_quantity,
    (p.cost_price * p.stock_quantity) AS cost_value,
    (p.selling_price * p.stock_quantity) AS retail_value,
    ((p.selling_price - p.cost_price) * p.stock_quantity) AS potential_profit
  FROM products p
  WHERE p.shop_id = p_shop_id AND p.is_active
  ORDER BY retail_value DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Debt Aging
-- ============================================================
CREATE OR REPLACE FUNCTION debt_aging(p_shop_id UUID)
RETURNS TABLE(
  customer_id UUID,
  customer_name TEXT,
  customer_phone TEXT,
  total_debt NUMERIC,
  oldest_days INTEGER,
  bucket TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    SUM(d.remaining_amount) AS total_debt,
    EXTRACT(DAY FROM now() - MIN(d.created_at))::INTEGER AS oldest_days,
    CASE 
      WHEN EXTRACT(DAY FROM now() - MIN(d.created_at)) <= 7 THEN '0-7 days'
      WHEN EXTRACT(DAY FROM now() - MIN(d.created_at)) <= 30 THEN '7-30 days'
      WHEN EXTRACT(DAY FROM now() - MIN(d.created_at)) <= 90 THEN '30-90 days'
      ELSE '90+ days'
    END AS bucket
  FROM debt_records d
  JOIN customers c ON c.id = d.customer_id
  WHERE d.shop_id = p_shop_id AND NOT d.is_settled
  GROUP BY c.id, c.name, c.phone
  ORDER BY total_debt DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RPC: Sales Heatmap
-- ============================================================
CREATE OR REPLACE FUNCTION sales_heatmap(p_shop_id UUID, p_days INTEGER DEFAULT 90)
RETURNS TABLE(
  day_of_week INTEGER,
  hour_of_day INTEGER,
  sale_count BIGINT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXTRACT(DOW FROM s.created_at)::INTEGER AS day_of_week,
    EXTRACT(HOUR FROM s.created_at)::INTEGER AS hour_of_day,
    COUNT(s.id) AS sale_count,
    SUM(s.total_amount) AS total_revenue
  FROM sales s
  WHERE s.shop_id = p_shop_id
    AND s.status = 'completed'
    AND s.created_at >= (now() - (p_days || ' days')::interval)
  GROUP BY day_of_week, hour_of_day
  ORDER BY day_of_week, hour_of_day;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Shops: owner can CRUD
CREATE POLICY "Owner manages shops" ON shops FOR ALL USING (auth.uid() = owner_id);

-- Helper function to check shop ownership
CREATE OR REPLACE FUNCTION user_owns_shop(p_shop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM shops WHERE id = p_shop_id AND owner_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- All shop-scoped tables: user can access if they own the shop
CREATE POLICY "Shop owner access" ON categories FOR ALL USING (user_owns_shop(shop_id));
CREATE POLICY "Shop owner access" ON products FOR ALL USING (user_owns_shop(shop_id));
CREATE POLICY "Shop owner access" ON customers FOR ALL USING (user_owns_shop(shop_id));
CREATE POLICY "Shop owner access" ON suppliers FOR ALL USING (user_owns_shop(shop_id));
CREATE POLICY "Shop owner access" ON sales FOR ALL USING (user_owns_shop(shop_id));
CREATE POLICY "Shop owner access" ON payments FOR ALL USING (user_owns_shop(shop_id));
CREATE POLICY "Shop owner access" ON expenses FOR ALL USING (user_owns_shop(shop_id));
CREATE POLICY "Shop owner access" ON stock_adjustments FOR ALL USING (user_owns_shop(shop_id));
CREATE POLICY "Shop owner access" ON mpesa_transactions FOR ALL USING (user_owns_shop(shop_id));
CREATE POLICY "Shop owner access" ON debt_records FOR ALL USING (user_owns_shop(shop_id));

-- Sale items: accessible through sale's shop
CREATE POLICY "Sale items access" ON sale_items FOR ALL 
USING (EXISTS (SELECT 1 FROM sales s WHERE s.id = sale_id AND user_owns_shop(s.shop_id)));

-- Debt payments: accessible through debt's shop
CREATE POLICY "Debt payments access" ON debt_payments FOR ALL 
USING (EXISTS (SELECT 1 FROM debt_records d WHERE d.id = debt_id AND user_owns_shop(d.shop_id)));
