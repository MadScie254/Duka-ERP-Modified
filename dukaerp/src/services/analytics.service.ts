import { supabase } from "@/lib/supabase";

export const analyticsService = {
  async getTodayKPIs(shopId: string) {
    try {
      // TODO: replace with RPC
      return {
        revenue: 45200,
        profit: 12400,
        units_sold: 234,
        transaction_count: 18,
      };
    } catch (error) {
      console.error("getTodayKPIs", error);
      throw error;
    }
  },
  async getRevenueTrend(shopId: string, days: number) {
    try {
      // TODO: query daily_sales_summary view
      return Array.from({ length: days }).map((_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString(),
        revenue: Math.round(50000 + Math.random() * 20000),
        profit: Math.round(15000 + Math.random() * 7000),
        expenses: Math.round(10000 + Math.random() * 5000),
      }));
    } catch (error) {
      console.error("getRevenueTrend", error);
      throw error;
    }
  },
  async getTopProducts(shopId: string, limit = 10, metric: "revenue" | "units" | "margin" = "revenue") {
    try {
      // TODO: pull from product_performance view
      return Array.from({ length: limit }).map((_, i) => ({
        name: `Product ${i + 1}`,
        revenue: Math.round(20000 + Math.random() * 15000),
        units: Math.round(30 + Math.random() * 80),
        margin: Math.round(10 + Math.random() * 40),
        metric,
      }));
    } catch (error) {
      console.error("getTopProducts", error);
      throw error;
    }
  },
  async getPaymentMethodBreakdown(shopId: string, days: number) {
    try {
      // TODO: use payment_method_summary view
      return [
        { method: "cash", total_amount: 45 },
        { method: "mpesa", total_amount: 40 },
        { method: "credit", total_amount: 10 },
        { method: "card", total_amount: 5 },
      ];
    } catch (error) {
      console.error("getPaymentMethodBreakdown", error);
      throw error;
    }
  },
  async getSalesHeatmap(shopId: string, days = 90) {
    try {
      // TODO: aggregate by hour/day
      return [];
    } catch (error) {
      console.error("getSalesHeatmap", error);
      throw error;
    }
  },
  async getDebtAging(shopId: string) {
    try {
      return [];
    } catch (error) {
      console.error("getDebtAging", error);
      throw error;
    }
  },
  async getStockValuation(shopId: string) {
    try {
      return [];
    } catch (error) {
      console.error("getStockValuation", error);
      throw error;
    }
  },
};
