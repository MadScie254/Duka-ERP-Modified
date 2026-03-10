import { supabase } from "@/lib/supabase";
import type { TodayKpis, DailySalesSummary, TopProduct, PaymentMethodBreakdown, StockValuationRow, DebtAgingRow, SalesHeatmapRow } from "@/types";

export const analyticsService = {
  async getTodayKPIs(shopId: string): Promise<TodayKpis> {
    const { data, error } = await supabase.rpc("today_kpis", { p_shop_id: shopId });
    if (error) throw error;
    return (data as unknown as TodayKpis[])[0] ?? { revenue: 0, profit: 0, units_sold: 0, transaction_count: 0, active_debts: 0, low_stock_count: 0 };
  },

  async getRevenueTrend(shopId: string, days = 30): Promise<DailySalesSummary[]> {
    const { data, error } = await supabase.rpc("daily_sales_summary", { p_shop_id: shopId, p_days: days });
    if (error) throw error;
    return (data as unknown as DailySalesSummary[]) ?? [];
  },

  async getTopProducts(shopId: string, limit = 10, days = 30): Promise<TopProduct[]> {
    const { data, error } = await supabase.rpc("top_products", { p_shop_id: shopId, p_limit: limit, p_days: days });
    if (error) throw error;
    return (data as unknown as TopProduct[]) ?? [];
  },

  async getPaymentMethodBreakdown(shopId: string, days = 30): Promise<PaymentMethodBreakdown[]> {
    const { data, error } = await supabase.rpc("payment_method_summary", { p_shop_id: shopId, p_days: days });
    if (error) throw error;
    return (data as unknown as PaymentMethodBreakdown[]) ?? [];
  },

  async getSalesHeatmap(shopId: string, days = 90): Promise<SalesHeatmapRow[]> {
    const { data, error } = await supabase.rpc("sales_heatmap", { p_shop_id: shopId, p_days: days });
    if (error) throw error;
    return (data as unknown as SalesHeatmapRow[]) ?? [];
  },

  async getDebtAging(shopId: string): Promise<DebtAgingRow[]> {
    const { data, error } = await supabase.rpc("debt_aging", { p_shop_id: shopId });
    if (error) throw error;
    return (data as unknown as DebtAgingRow[]) ?? [];
  },

  async getStockValuation(shopId: string): Promise<StockValuationRow[]> {
    const { data, error } = await supabase.rpc("stock_valuation", { p_shop_id: shopId });
    if (error) throw error;
    return (data as unknown as StockValuationRow[]) ?? [];
  },
};
