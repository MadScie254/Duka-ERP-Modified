import { useQuery, useMutation } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";
import type { ProductInsert, ProductUpdate, AdjustmentReason } from "@/types";

export const inventoryKeys = {
  products: (shopId: string) => ["products", shopId] as const,
  product: (id: string) => ["products", "detail", id] as const,
  categories: (shopId: string) => ["categories", shopId] as const,
};

export function useInventory() {
  const shopId = useAuthStore((s) => s.activeShop?.id ?? "");

  const products = useQuery({
    queryKey: inventoryKeys.products(shopId),
    queryFn: () => inventoryService.listProducts(shopId),
    enabled: !!shopId,
  });

  const categories = useQuery({
    queryKey: inventoryKeys.categories(shopId),
    queryFn: () => inventoryService.listCategories(shopId),
    enabled: !!shopId,
  });

  const createProduct = useMutation({
    mutationFn: (product: Omit<ProductInsert, "shop_id">) =>
      inventoryService.createProduct({ ...product, shop_id: shopId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.products(shopId) }),
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProductUpdate }) =>
      inventoryService.updateProduct(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.products(shopId) }),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => inventoryService.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.products(shopId) }),
  });

  const adjustStock = useMutation({
    mutationFn: (payload: { product_id: string; previous_quantity: number; new_quantity: number; reason: AdjustmentReason; notes?: string; adjusted_by?: string }) =>
      inventoryService.adjustStock({ ...payload, shop_id: shopId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.products(shopId) }),
  });

  const createCategory = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      inventoryService.createCategory(shopId, name, description),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.categories(shopId) }),
  });

  const searchProducts = (query: string) => inventoryService.searchProducts(shopId, query);

  return { products, categories, createProduct, updateProduct, deleteProduct, adjustStock, createCategory, searchProducts };
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: inventoryKeys.product(id),
    queryFn: () => inventoryService.getProduct(id),
    enabled: !!id,
  });
}
