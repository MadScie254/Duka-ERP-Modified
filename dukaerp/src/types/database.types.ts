export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// TypeScript union types matching DB CHECK constraints
export type PaymentMethod = 'cash' | 'mpesa' | 'credit' | 'bank' | 'card';
export type ExpensePaymentMethod = 'cash' | 'mpesa' | 'bank';
export type SaleStatus = 'completed' | 'refunded' | 'partial_refund';
export type PlanType = 'free' | 'pro' | 'biashara';
export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage' | 'transfer';
export type MpesaStatus = 'pending' | 'success' | 'failed';
export type POStatus = 'draft' | 'ordered' | 'received' | 'cancelled';
export type DebtEntryType = 'credit' | 'payment';
export type MemberRole = 'owner' | 'manager' | 'cashier' | 'viewer';
export type BusinessType = 'general' | 'agrovet' | 'pharmacy' | 'hardware' | 'boutique' | 'electronics' | 'food' | 'other';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          plan: PlanType;
          created_at: string;
          updated_at: string;
        };
        Insert: { id: string; full_name?: string; phone?: string | null; avatar_url?: string | null; plan?: PlanType };
        Update: Partial<Omit<Database['public']['Tables']['profiles']['Row'], 'id'>>;
        Relationships: [];
      };
      shops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          business_type: string | null;
          location: string | null;
          phone: string | null;
          email: string | null;
          kra_pin: string | null;
          logo_url: string | null;
          currency: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: { owner_id: string; name: string; business_type?: string; location?: string; phone?: string; email?: string; kra_pin?: string; logo_url?: string; currency?: string; timezone?: string };
        Update: Partial<Omit<Database['public']['Tables']['shops']['Row'], 'id'>>;
        Relationships: [];
      };
      shop_members: {
        Row: {
          id: string;
          shop_id: string;
          user_id: string;
          role: MemberRole;
          is_active: boolean;
          created_at: string;
        };
        Insert: { shop_id: string; user_id: string; role?: MemberRole; is_active?: boolean };
        Update: Partial<Omit<Database['public']['Tables']['shop_members']['Row'], 'id'>>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: { shop_id: string; name: string; color?: string };
        Update: { name?: string; color?: string };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          shop_id: string;
          category_id: string | null;
          name: string;
          sku: string | null;
          barcode: string | null;
          description: string | null;
          unit: string;
          cost_price: number;
          selling_price: number;
          quantity_in_stock: number;
          reorder_level: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: { shop_id: string; name: string; cost_price: number; selling_price: number; category_id?: string | null; sku?: string | null; barcode?: string | null; description?: string | null; unit?: string; quantity_in_stock?: number; reorder_level?: number; is_active?: boolean; image_url?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['products']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          shop_id: string;
          product_id: string;
          type: MovementType;
          quantity: number;
          unit_cost: number | null;
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: { shop_id: string; product_id: string; type: MovementType; quantity: number; unit_cost?: number | null; reference_id?: string | null; notes?: string | null; created_by?: string | null };
        Update: never;
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: { shop_id: string; name: string; contact_person?: string | null; phone?: string | null; email?: string | null; address?: string | null; notes?: string | null; is_active?: boolean };
        Update: Partial<Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          id: string;
          shop_id: string;
          supplier_id: string | null;
          status: POStatus;
          total_amount: number;
          notes: string | null;
          ordered_at: string | null;
          received_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: { shop_id: string; supplier_id?: string | null; status?: POStatus; total_amount?: number; notes?: string | null; ordered_at?: string | null; created_by?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['purchase_orders']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
      purchase_order_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number; // GENERATED
        };
        Insert: { purchase_order_id: string; product_id: string; quantity: number; unit_cost: number };
        Update: Partial<Omit<Database['public']['Tables']['purchase_order_items']['Row'], 'id' | 'total_cost'>>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          id_number: string | null;
          address: string | null;
          notes: string | null;
          credit_limit: number;
          total_debt: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: { shop_id: string; name: string; phone?: string | null; email?: string | null; id_number?: string | null; address?: string | null; notes?: string | null; credit_limit?: number };
        Update: Partial<Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'shop_id' | 'total_debt'>>;
        Relationships: [];
      };
      customer_debts: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string;
          sale_id: string | null;
          type: DebtEntryType;
          amount: number;
          balance_after: number | null;
          notes: string | null;
          due_date: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: { shop_id: string; customer_id: string; type: DebtEntryType; amount: number; sale_id?: string | null; balance_after?: number | null; notes?: string | null; due_date?: string | null; created_by?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['customer_debts']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string | null;
          receipt_number: string;
          status: SaleStatus;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          amount_paid: number;
          amount_owed: number; // GENERATED
          notes: string | null;
          sold_by: string | null;
          created_at: string;
        };
        Insert: { shop_id: string; receipt_number: string; subtotal: number; total_amount: number; customer_id?: string | null; discount_amount?: number; tax_amount?: number; amount_paid?: number; status?: SaleStatus; notes?: string | null; sold_by?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'shop_id' | 'amount_owed'>>;
        Relationships: [];
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          cost_price: number;
          discount_amount: number;
          total_price: number; // GENERATED
        };
        Insert: { sale_id: string; product_id: string; product_name: string; quantity: number; unit_price: number; cost_price: number; discount_amount?: number };
        Update: never;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          shop_id: string;
          sale_id: string | null;
          customer_id: string | null;
          method: PaymentMethod;
          amount: number;
          mpesa_code: string | null;
          mpesa_phone: string | null;
          reference: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: { shop_id: string; amount: number; method: PaymentMethod; sale_id?: string | null; customer_id?: string | null; mpesa_code?: string | null; mpesa_phone?: string | null; reference?: string | null; notes?: string | null; created_by?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['payments']['Row'], 'id'>>;
        Relationships: [];
      };
      mpesa_transactions: {
        Row: {
          id: string;
          shop_id: string;
          checkout_request_id: string | null;
          merchant_request_id: string | null;
          result_code: string | null;
          result_desc: string | null;
          amount: number | null;
          mpesa_receipt_number: string | null;
          transaction_date: string | null;
          phone_number: string | null;
          status: MpesaStatus;
          linked_payment_id: string | null;
          raw_response: Json | null;
          created_at: string;
        };
        Insert: { shop_id: string; checkout_request_id?: string | null; merchant_request_id?: string | null; amount?: number | null; phone_number?: string | null; status?: MpesaStatus; linked_payment_id?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['mpesa_transactions']['Row'], 'id'>>;
        Relationships: [];
      };
      expense_categories: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          color: string;
        };
        Insert: { shop_id: string; name: string; color?: string };
        Update: { name?: string; color?: string };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          shop_id: string;
          category_id: string | null;
          description: string;
          amount: number;
          payment_method: ExpensePaymentMethod;
          mpesa_code: string | null;
          receipt_url: string | null;
          incurred_at: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: { shop_id: string; description: string; amount: number; category_id?: string | null; payment_method?: ExpensePaymentMethod; mpesa_code?: string | null; receipt_url?: string | null; incurred_at?: string; created_by?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
    };
    Views: {
      daily_sales_summary: {
        Row: {
          shop_id: string;
          sale_date: string;
          transaction_count: number;
          gross_revenue: number;
          total_discounts: number;
          cash_collected: number;
          credit_outstanding: number;
        };
      };
      product_performance: {
        Row: {
          shop_id: string;
          product_id: string;
          product_name: string;
          category_id: string | null;
          units_sold: number;
          revenue: number;
          cogs: number;
          gross_profit: number;
          margin_pct: number;
          quantity_in_stock: number;
          reorder_level: number;
          needs_reorder: boolean;
        };
      };
      payment_method_summary: {
        Row: {
          shop_id: string;
          pay_date: string;
          method: PaymentMethod;
          transactions: number;
          total_amount: number;
        };
      };
    };
    Functions: {
      today_kpis: {
        Args: { p_shop_id: string };
        Returns: { revenue: number; profit: number; units_sold: number; transaction_count: number; active_debts: number; low_stock_count: number }[];
      };
      daily_sales_summary: {
        Args: { p_shop_id: string; p_days?: number };
        Returns: { sale_date: string; revenue: number; profit: number; transaction_count: number; units_sold: number }[];
      };
      top_products: {
        Args: { p_shop_id: string; p_limit?: number; p_days?: number };
        Returns: { product_id: string; product_name: string; total_revenue: number; total_units: number; margin_pct: number }[];
      };
      payment_method_summary: {
        Args: { p_shop_id: string; p_days?: number };
        Returns: { method: PaymentMethod; total_amount: number; tx_count: number }[];
      };
      stock_valuation: {
        Args: { p_shop_id: string };
        Returns: { product_id: string; product_name: string; quantity_in_stock: number; cost_value: number; retail_value: number; potential_profit: number }[];
      };
      debt_aging: {
        Args: { p_shop_id: string };
        Returns: { customer_id: string; customer_name: string; customer_phone: string; total_debt: number; oldest_days: number; bucket: string }[];
      };
      sales_heatmap: {
        Args: { p_shop_id: string; p_days?: number };
        Returns: { day_of_week: number; hour_of_day: number; sale_count: number; total_revenue: number }[];
      };
      generate_receipt_number: {
        Args: { p_shop_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Shop = Database['public']['Tables']['shops']['Row'];
export type ShopMember = Database['public']['Tables']['shop_members']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row'];
export type StockMovement = Database['public']['Tables']['stock_movements']['Row'];
export type CustomerDebt = Database['public']['Tables']['customer_debts']['Row'];
export type MpesaTransaction = Database['public']['Tables']['mpesa_transactions']['Row'];
export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row'];
export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row'];

// Insert/Update helpers
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];
export type SaleInsert = Database['public']['Tables']['sales']['Insert'];
export type SaleItemInsert = Database['public']['Tables']['sale_items']['Insert'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];
export type StockMovementInsert = Database['public']['Tables']['stock_movements']['Insert'];
export type CustomerDebtInsert = Database['public']['Tables']['customer_debts']['Insert'];

// RPC return types
export type TodayKpis = Database['public']['Functions']['today_kpis']['Returns'][0];
export type DailySalesSummary = Database['public']['Functions']['daily_sales_summary']['Returns'][0];
export type TopProduct = Database['public']['Functions']['top_products']['Returns'][0];
export type PaymentMethodBreakdown = Database['public']['Functions']['payment_method_summary']['Returns'][0];
export type StockValuationRow = Database['public']['Functions']['stock_valuation']['Returns'][0];
export type DebtAgingRow = Database['public']['Functions']['debt_aging']['Returns'][0];
export type SalesHeatmapRow = Database['public']['Functions']['sales_heatmap']['Returns'][0];

// Joined types
export type SaleWithItems = Sale & { sale_items: SaleItem[]; customer?: Customer | null };
export type ProductWithCategory = Product & { categories?: Category | null };
export type ExpenseWithCategory = Expense & { expense_categories?: ExpenseCategory | null };
