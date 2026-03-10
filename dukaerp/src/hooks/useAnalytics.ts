import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { useAuthStore } from "@/store/authStore";

export const analyticsKeys = {
  kpis: (shopId: string) => ["analytics", "kpis", shopId] as const,
  trend: (shopId: string, days: number) => ["analytics", "trend", shopId, days] as const,
  topProducts: (shopId: string) => ["analytics", "top-products", shopId] as const,
};

export function useAnalytics() {
  const shopId = useAuthStore((s) => s.activeShop?.id || "demo-shop");

  const kpis = useQuery({ queryKey: analyticsKeys.kpis(shopId), queryFn: () => analyticsService.getTodayKPIs(shopId) });
  const trend = useQuery({ queryKey: analyticsKeys.trend(shopId, 30), queryFn: () => analyticsService.getRevenueTrend(shopId, 30) });
  const topProducts = useQuery({ queryKey: analyticsKeys.topProducts(shopId), queryFn: () => analyticsService.getTopProducts(shopId) });

  return { kpis, trend, topProducts };
}
