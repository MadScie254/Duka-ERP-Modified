import { useQuery, useMutation } from "@tanstack/react-query";
import { suppliersService, type SupplierInsert, type SupplierUpdate } from "@/services/suppliers.service";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";

export const supplierKeys = {
  list: (shopId: string) => ["suppliers", shopId] as const,
  detail: (id: string) => ["suppliers", "detail", id] as const,
};

export function useSuppliers() {
  const shopId = useAuthStore((s) => s.activeShop?.id ?? "");

  const suppliers = useQuery({
    queryKey: supplierKeys.list(shopId),
    queryFn: () => suppliersService.listSuppliers(shopId),
    enabled: !!shopId,
  });

  const createSupplier = useMutation({
    mutationFn: (supplier: Omit<SupplierInsert, "shop_id">) =>
      suppliersService.createSupplier({ ...supplier, shop_id: shopId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.list(shopId) }),
  });

  const updateSupplier = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: SupplierUpdate }) =>
      suppliersService.updateSupplier(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.list(shopId) }),
  });

  const deleteSupplier = useMutation({
    mutationFn: (id: string) => suppliersService.deleteSupplier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.list(shopId) }),
  });

  return { suppliers, createSupplier, updateSupplier, deleteSupplier };
}

export function useSupplierDetail(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => suppliersService.getSupplier(id),
    enabled: !!id,
  });
}
