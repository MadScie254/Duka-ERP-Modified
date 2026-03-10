import { useQuery, useMutation } from "@tanstack/react-query";
import { customersService } from "@/services/customers.service";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";
import type { CustomerInsert, CustomerUpdate, PaymentMethod } from "@/types";

export const customerKeys = {
  list: (shopId: string) => ["customers", shopId] as const,
  detail: (id: string) => ["customers", "detail", id] as const,
  debts: (shopId: string) => ["debts", shopId] as const,
  customerDebts: (customerId: string) => ["debts", "customer", customerId] as const,
};

export function useCustomers() {
  const shopId = useAuthStore((s) => s.activeShop?.id ?? "");

  const customers = useQuery({
    queryKey: customerKeys.list(shopId),
    queryFn: () => customersService.listCustomers(shopId),
    enabled: !!shopId,
  });

  const createCustomer = useMutation({
    mutationFn: (customer: Omit<CustomerInsert, "shop_id">) =>
      customersService.createCustomer({ ...customer, shop_id: shopId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.list(shopId) }),
  });

  const updateCustomer = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CustomerUpdate }) =>
      customersService.updateCustomer(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.list(shopId) }),
  });

  const deleteCustomer = useMutation({
    mutationFn: (id: string) => customersService.deleteCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.list(shopId) }),
  });

  return { customers, createCustomer, updateCustomer, deleteCustomer };
}

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersService.getCustomer(id),
    enabled: !!id,
  });
}

export function useDebts() {
  const shopId = useAuthStore((s) => s.activeShop?.id ?? "");

  const debts = useQuery({
    queryKey: customerKeys.debts(shopId),
    queryFn: () => customersService.listAllDebts(shopId),
    enabled: !!shopId,
  });

  const recordPayment = useMutation({
    mutationFn: ({ debtId, amount, method }: { debtId: string; amount: number; method?: PaymentMethod }) =>
      customersService.recordDebtPayment(debtId, amount, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.debts(shopId) });
      queryClient.invalidateQueries({ queryKey: customerKeys.list(shopId) });
    },
  });

  return { debts, recordPayment };
}
