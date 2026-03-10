import { useQuery, useMutation } from "@tanstack/react-query";
import { salesService, type CreateSalePayload } from "@/services/sales.service";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";
import { inventoryKeys } from "./useInventory";

export const salesKeys = {
  list: (shopId: string) => ["sales", shopId] as const,
  detail: (id: string) => ["sales", "detail", id] as const,
};

export function useSales() {
  const shopId = useAuthStore((s) => s.activeShop?.id ?? "");

  const sales = useQuery({
    queryKey: salesKeys.list(shopId),
    queryFn: () => salesService.listSales(shopId),
    enabled: !!shopId,
  });

  const createSale = useMutation({
    mutationFn: (payload: Omit<CreateSalePayload, "shop_id">) =>
      salesService.createSale({ ...payload, shop_id: shopId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.list(shopId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products(shopId) });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const refundSale = useMutation({
    mutationFn: (id: string) => salesService.refundSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.list(shopId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.products(shopId) });
    },
  });

  return { sales, createSale, refundSale };
}

export function useSaleDetail(id: string) {
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => salesService.getSale(id),
    enabled: !!id,
  });
}
