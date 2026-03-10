import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { useAuthStore } from "@/store/authStore";

export const analyticsKeys = {
  kpis: (shopId: string) => ["analytics", "kpis", shopId] as const,
  trend: (shopId: string, days: number) => ["analytics", "trend", shopId, days] as const,
  topProducts: (shopId: string, days: number) => ["analytics", "top-products", shopId, days] as const,
  paymentBreakdown: (shopId: string, days: number) => ["analytics", "payments", shopId, days] as const,
  heatmap: (shopId: string) => ["analytics", "heatmap", shopId] as const,
  debtAging: (shopId: string) => ["analytics", "debt-aging", shopId] as const,
  stockValuation: (shopId: string) => ["analytics", "stock-valuation", shopId] as const,
};

export function useAnalytics(days = 30) {
  const shopId = useAuthStore((s) => s.activeShop?.id ?? "");

  const kpis = useQuery({
    queryKey: analyticsKeys.kpis(shopId),
    queryFn: () => analyticsService.getTodayKPIs(shopId),
    enabled: !!shopId,
    refetchInterval: 60_000,
  });

  const trend = useQuery({
    queryKey: analyticsKeys.trend(shopId, days),
    queryFn: () => analyticsService.getRevenueTrend(shopId, days),
    enabled: !!shopId,
  });

  const topProducts = useQuery({
    queryKey: analyticsKeys.topProducts(shopId, days),
    queryFn: () => analyticsService.getTopProducts(shopId, 10, days),
    enabled: !!shopId,
  });

  const paymentBreakdown = useQuery({
    queryKey: analyticsKeys.paymentBreakdown(shopId, days),
    queryFn: () => analyticsService.getPaymentMethodBreakdown(shopId, days),
    enabled: !!shopId,
  });

  const heatmap = useQuery({
    queryKey: analyticsKeys.heatmap(shopId),
    queryFn: () => analyticsService.getSalesHeatmap(shopId),
    enabled: !!shopId,
  });

  const debtAging = useQuery({
    queryKey: analyticsKeys.debtAging(shopId),
    queryFn: () => analyticsService.getDebtAging(shopId),
    enabled: !!shopId,
  });

  const stockValuation = useQuery({
    queryKey: analyticsKeys.stockValuation(shopId),
    queryFn: () => analyticsService.getStockValuation(shopId),
    enabled: !!shopId,
  });

  return { kpis, trend, topProducts, paymentBreakdown, heatmap, debtAging, stockValuation };
}
