
# 🏪 DukaERP — Master Copilot Prompt
### AI-Assisted Build Guide for a Kenyan Small Retailer ERP SaaS
**Version 1.0 | Built by Danco Analytics | Stack: React + Supabase**

---

> **HOW TO USE THIS PROMPT**
> Paste this entire document into Cursor AI, GitHub Copilot Chat, or Claude as your project system prompt. Reference individual sections when working on specific modules. Keep this file at the root of your repo as `COPILOT.md`.

---

## 🧠 PROJECT VISION

You are building **DukaERP** — a SaaS ERP (Enterprise Resource Planning) platform designed specifically for small Kenyan retailers: dukas, boutiques, agrovet shops, hardware stores, pharmacies, and general traders. The product must feel like a smart, powerful tool built FOR Kenya — M-Pesa native, mobile-first, Swahili-friendly, and priced for the local market.

**Core promise to the user:** "Run your whole shop from your phone. Know exactly what you have, what you sold, who owes you, and how much you made — all in one place."

**Target users:**
- Small shop owners (1–5 employees)
- Market traders with physical stock
- Agrovet and pharmacy owners
- Multi-branch retailers (growth segment)

---

## 🛠️ TECH STACK (NON-NEGOTIABLE)

```
Frontend:        React 18 + Vite + TypeScript
Styling:         TailwindCSS + shadcn/ui components
State (server):  TanStack Query v5 (React Query)
State (client):  Zustand
Routing:         React Router v6
Forms:           React Hook Form + Zod validation
Backend:         Supabase (Auth, PostgreSQL, Storage, Realtime, Edge Functions)
Charts:          Recharts (primary) + react-chartjs-2 (secondary)
Dates:           date-fns
Icons:           Lucide React
Animations:      Framer Motion
PDF/Receipts:    @react-pdf/renderer
Notifications:   react-hot-toast
HTTP extras:     axios (for Daraja M-Pesa API calls via Edge Functions)
Currency:        Always KES (Kenyan Shillings), format with toLocaleString('en-KE')
```

---

## 🗂️ PROJECT FILE STRUCTURE

```
dukaerp/
├── public/
│   └── logo.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── vite-env.d.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client init
│   │   ├── queryClient.ts        # TanStack Query client
│   │   ├── utils.ts              # formatCurrency, formatDate, cn()
│   │   └── constants.ts          # App-wide constants
│   │
│   ├── types/
│   │   ├── database.types.ts     # Auto-generated from Supabase (supabase gen types)
│   │   └── index.ts              # Re-exported + custom types
│   │
│   ├── store/
│   │   ├── authStore.ts          # Zustand: user, shop, session
│   │   └── uiStore.ts            # Zustand: sidebar, modals, theme
│   │
│   ├── hooks/
│   │   ├── useShop.ts
│   │   ├── useInventory.ts
│   │   ├── useSales.ts
│   │   ├── useCustomers.ts
│   │   ├── useExpenses.ts
│   │   ├── useAnalytics.ts
│   │   └── useMpesa.ts
│   │
│   ├── services/
│   │   ├── inventory.service.ts
│   │   ├── sales.service.ts
│   │   ├── customers.service.ts
│   │   ├── expenses.service.ts
│   │   ├── analytics.service.ts
│   │   └── mpesa.service.ts
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── AppShell.tsx      # Main layout with sidebar + topbar
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── common/
│   │   │   ├── StatCard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── CurrencyInput.tsx
│   │   │   └── SearchBar.tsx
│   │   └── charts/
│   │       ├── RevenueLineChart.tsx
│   │       ├── SalesByProductChart.tsx
│   │       ├── PaymentMethodPieChart.tsx
│   │       ├── StockValueChart.tsx
│   │       ├── ProfitMarginChart.tsx
│   │       └── SalesTrendHeatmap.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── OnboardingWizard.tsx   # Shop setup after signup
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── inventory/
│   │   │   ├── Inventory.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── StockAdjustment.tsx
│   │   ├── pos/
│   │   │   └── POS.tsx                # Point of Sale page
│   │   ├── sales/
│   │   │   ├── Sales.tsx
│   │   │   └── SaleDetail.tsx
│   │   ├── customers/
│   │   │   ├── Customers.tsx
│   │   │   ├── CustomerDetail.tsx
│   │   │   └── DebtTracker.tsx        # Mkopo management
│   │   ├── suppliers/
│   │   │   ├── Suppliers.tsx
│   │   │   └── SupplierDetail.tsx
│   │   ├── expenses/
│   │   │   └── Expenses.tsx
│   │   ├── analytics/
│   │   │   └── Analytics.tsx          # Deep analytics dashboard
│   │   ├── reports/
│   │   │   └── Reports.tsx            # Printable/exportable reports
│   │   └── settings/
│   │       └── Settings.tsx
│   │
│   └── router/
│       └── index.tsx                  # All routes defined here
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── functions/
│   │   ├── mpesa-stk-push/
│   │   │   └── index.ts
│   │   └── mpesa-callback/
│   │       └── index.ts
│   └── seed.sql                       # Sample data for dev
│
├── .env.local
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 🗄️ SUPABASE DATABASE SCHEMA

Run this SQL in the Supabase SQL editor. This is the complete schema.
```sql
-- ============================================================
-- DukaERP Database Schema
-- Supabase PostgreSQL | Version 1.0
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- MULTI-TENANCY FOUNDATION
-- ============================================================

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'biashara')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shops (one user can own many shops in Biashara plan)
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

-- Shop members (staff with roles)
CREATE TABLE shop_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'manager', 'cashier', 'viewer')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shop_id, user_id)
);

-- ============================================================
-- INVENTORY MODULE
-- ============================================================

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
  sku TEXT,                          -- Stock Keeping Unit / barcode
  description TEXT,
  unit TEXT DEFAULT 'piece' CHECK (unit IN (
    'piece', 'kg', 'g', 'litre', 'ml', 'dozen', 'pack', 'box', 'bag', 'roll', 'metre', 'pair'
  )),
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,    -- Buying price
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0, -- Selling price
  quantity_in_stock NUMERIC(12,2) NOT NULL DEFAULT 0,
  reorder_level NUMERIC(12,2) DEFAULT 5,          -- Alert threshold
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shop_id, sku)
);

-- Full audit trail of all stock movements
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'purchase',      -- Stock bought from supplier
    'sale',          -- Stock sold to customer
    'adjustment',    -- Manual stock count correction
    'return',        -- Customer returned goods
    'damage',        -- Damaged/expired goods written off
    'transfer'       -- Between branches (future)
  )),
  quantity NUMERIC(12,2) NOT NULL,  -- Positive = in, Negative = out
  unit_cost NUMERIC(12,2),
  reference_id UUID,                -- Links to sale_id or purchase_order_id
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
