export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum types matching the DB
export type PaymentMethod = 'cash' | 'mpesa' | 'card' | 'credit' | 'bank_transfer';
export type SaleStatus = 'completed' | 'pending' | 'refunded' | 'voided';
export type PaymentStatus = 'completed' | 'pending' | 'failed';
export type PlanType = 'free' | 'pro' | 'biashara';
export type AdjustmentReason = 'damage' | 'count_correction' | 'theft' | 'expiry' | 'restock' | 'other';
export type MpesaStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type POStatus = 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';

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
      categories: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: { shop_id: string; name: string; description?: string | null };
        Update: { name?: string; description?: string | null };
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
          stock_quantity: number;
          reorder_level: number;
          is_active: boolean;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { shop_id: string; name: string; cost_price: number; selling_price: number; category_id?: string | null; sku?: string | null; barcode?: string | null; description?: string | null; unit?: string; stock_quantity?: number; reorder_level?: number; is_active?: boolean; image_url?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['products']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          total_purchases: number;
          total_debt: number;
          loyalty_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: { shop_id: string; name: string; phone?: string | null; email?: string | null; address?: string | null; notes?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          shop_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          contact_person: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { shop_id: string; name: string; phone?: string | null; email?: string | null; address?: string | null; notes?: string | null; contact_person?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string | null;
          receipt_number: string;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          profit_amount: number;
          status: SaleStatus;
          payment_method: PaymentMethod;
          notes: string | null;
          cashier_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { shop_id: string; receipt_number: string; subtotal: number; total_amount: number; profit_amount: number; customer_id?: string | null; discount_amount?: number; tax_amount?: number; status?: SaleStatus; payment_method?: PaymentMethod; notes?: string | null; cashier_id?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'shop_id'>>;
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
          discount: number;
          line_total: number;
          created_at: string;
        };
        Insert: { sale_id: string; product_id: string; product_name: string; quantity: number; unit_price: number; line_total: number; cost_price?: number; discount?: number };
        Update: Partial<Omit<Database['public']['Tables']['sale_items']['Row'], 'id'>>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          shop_id: string;
          sale_id: string | null;
          customer_id: string | null;
          amount: number;
          method: PaymentMethod;
          status: PaymentStatus;
          reference: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: { shop_id: string; amount: number; method: PaymentMethod; sale_id?: string | null; customer_id?: string | null; status?: PaymentStatus; reference?: string | null; notes?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['payments']['Row'], 'id'>>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          shop_id: string;
          category: string;
          description: string;
          amount: number;
          payment_method: PaymentMethod;
          receipt_url: string | null;
          notes: string | null;
          incurred_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: { shop_id: string; description: string; amount: number; category?: string; payment_method?: PaymentMethod; receipt_url?: string | null; notes?: string | null; incurred_at?: string };
        Update: Partial<Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
      stock_adjustments: {
        Row: {
          id: string;
          shop_id: string;
          product_id: string;
          previous_quantity: number;
          new_quantity: number;
          reason: AdjustmentReason;
          notes: string | null;
          adjusted_by: string | null;
          created_at: string;
        };
        Insert: { shop_id: string; product_id: string; previous_quantity: number; new_quantity: number; reason: AdjustmentReason; notes?: string | null; adjusted_by?: string | null };
        Update: never;
        Relationships: [];
      };
      mpesa_transactions: {
        Row: {
          id: string;
          shop_id: string;
          payment_id: string | null;
          phone: string;
          amount: number;
          mpesa_receipt: string | null;
          merchant_request_id: string | null;
          checkout_request_id: string | null;
          result_code: number | null;
          result_desc: string | null;
          status: MpesaStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: { shop_id: string; phone: string; amount: number; payment_id?: string | null; status?: MpesaStatus };
        Update: Partial<Omit<Database['public']['Tables']['mpesa_transactions']['Row'], 'id'>>;
        Relationships: [];
      };
      debt_records: {
        Row: {
          id: string;
          shop_id: string;
          customer_id: string;
          sale_id: string | null;
          original_amount: number;
          remaining_amount: number;
          due_date: string | null;
          is_settled: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { shop_id: string; customer_id: string; original_amount: number; remaining_amount: number; sale_id?: string | null; due_date?: string | null; notes?: string | null };
        Update: Partial<Omit<Database['public']['Tables']['debt_records']['Row'], 'id' | 'shop_id'>>;
        Relationships: [];
      };
      debt_payments: {
        Row: {
          id: string;
          debt_id: string;
          amount: number;
          method: PaymentMethod;
          notes: string | null;
          created_at: string;
        };
        Insert: { debt_id: string; amount: number; method?: PaymentMethod; notes?: string | null };
        Update: never;
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          id: string;
          shop_id: string;
          supplier_id: string;
          po_number: string;
          status: POStatus;
          total: number;
          notes: string | null;
          expected_date: string | null;
          received_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: { shop_id: string; supplier_id: string; po_number: string; status?: POStatus; total?: number; notes?: string | null; expected_date?: string | null };
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
          received_qty: number;
          total: number;
        };
        Insert: { purchase_order_id: string; product_id: string; quantity: number; unit_cost: number; total: number; received_qty?: number };
        Update: Partial<Omit<Database['public']['Tables']['purchase_order_items']['Row'], 'id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
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
        Returns: { product_id: string; product_name: string; stock_quantity: number; cost_value: number; retail_value: number; potential_profit: number }[];
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
    Enums: {
      payment_method: PaymentMethod;
      sale_status: SaleStatus;
      payment_status: PaymentStatus;
      plan_type: PlanType;
      adjustment_reason: AdjustmentReason;
      mpesa_status: MpesaStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Shop = Database['public']['Tables']['shops']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type StockAdjustment = Database['public']['Tables']['stock_adjustments']['Row'];
export type MpesaTransaction = Database['public']['Tables']['mpesa_transactions']['Row'];
export type DebtRecord = Database['public']['Tables']['debt_records']['Row'];
export type DebtPayment = Database['public']['Tables']['debt_payments']['Row'];
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
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

// RPC return types
export type TodayKpis = Database['public']['Functions']['today_kpis']['Returns'][0];
export type DailySalesSummary = Database['public']['Functions']['daily_sales_summary']['Returns'][0];
export type TopProduct = Database['public']['Functions']['top_products']['Returns'][0];
export type PaymentMethodBreakdown = Database['public']['Functions']['payment_method_summary']['Returns'][0];
export type StockValuationRow = Database['public']['Functions']['stock_valuation']['Returns'][0];
export type DebtAgingRow = Database['public']['Functions']['debt_aging']['Returns'][0];
export type SalesHeatmapRow = Database['public']['Functions']['sales_heatmap']['Returns'][0];

// Sale with items (joined)
export type SaleWithItems = Sale & { sale_items: SaleItem[]; customer?: Customer | null };
// Product with category
export type ProductWithCategory = Product & { categories?: Category | null };
