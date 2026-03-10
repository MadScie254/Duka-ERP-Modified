import { useQuery } from "@tanstack/react-query";
import { customersService } from "@/services/customers.service";
import { useAuthStore } from "@/store/authStore";

export const customerKeys = {
  list: (shopId: string) => ["customers", shopId] as const,
};

export function useCustomers() {
  const shopId = useAuthStore((s) => s.activeShop?.id || "demo-shop");
  const customers = useQuery({
    queryKey: customerKeys.list(shopId),
    queryFn: () => customersService.listCustomers(shopId),
  });
  return { customers };
}
