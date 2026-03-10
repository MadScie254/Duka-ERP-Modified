import { useQuery, useMutation } from "@tanstack/react-query";
import { expensesService } from "@/services/expenses.service";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";
import type { ExpenseInsert, ExpenseUpdate } from "@/types";

export const expenseKeys = {
  list: (shopId: string) => ["expenses", shopId] as const,
};

export function useExpenses() {
  const shopId = useAuthStore((s) => s.activeShop?.id ?? "");

  const expenses = useQuery({
    queryKey: expenseKeys.list(shopId),
    queryFn: () => expensesService.listExpenses(shopId),
    enabled: !!shopId,
  });

  const createExpense = useMutation({
    mutationFn: (expense: Omit<ExpenseInsert, "shop_id">) =>
      expensesService.createExpense({ ...expense, shop_id: shopId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.list(shopId) }),
  });

  const updateExpense = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ExpenseUpdate }) =>
      expensesService.updateExpense(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.list(shopId) }),
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => expensesService.deleteExpense(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.list(shopId) }),
  });

  return { expenses, createExpense, updateExpense, deleteExpense };
}
