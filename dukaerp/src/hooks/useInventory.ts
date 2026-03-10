import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { useAuthStore } from "@/store/authStore";

export const queryKeys = {
  products: (shopId: string) => ["products", shopId] as const,
};

export function useInventory() {
  const shopId = useAuthStore((s) => s.activeShop?.id || "demo-shop");
  const products = useQuery({
    queryKey: queryKeys.products(shopId),
    queryFn: () => inventoryService.listProducts(shopId),
  });
  return { products };
}
