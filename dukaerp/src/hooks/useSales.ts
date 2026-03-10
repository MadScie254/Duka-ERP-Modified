import { useQuery, useMutation } from "@tanstack/react-query";
import { salesService } from "@/services/sales.service";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";

export const salesKeys = {
  list: (shopId: string) => ["sales", shopId] as const,
};

export function useSales() {
  const shopId = useAuthStore((s) => s.activeShop?.id || "demo-shop");

  const sales = useQuery({
    queryKey: salesKeys.list(shopId),
    queryFn: () => salesService.listSales(shopId),
  });

  const createSale = useMutation({
    mutationFn: salesService.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.list(shopId) });
    },
  });

  return { sales, createSale };
}
