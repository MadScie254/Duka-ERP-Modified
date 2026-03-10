import { useQuery } from "@tanstack/react-query";
import { expensesService } from "@/services/expenses.service";
import { useAuthStore } from "@/store/authStore";

export const expenseKeys = {
  list: (shopId: string) => ["expenses", shopId] as const,
};

export function useExpenses() {
  const shopId = useAuthStore((s) => s.activeShop?.id || "demo-shop");
  const expenses = useQuery({
    queryKey: expenseKeys.list(shopId),
    queryFn: () => expensesService.listExpenses(shopId),
  });
  return { expenses };
}
