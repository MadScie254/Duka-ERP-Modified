import { supabase } from "@/lib/supabase";
import type { Product, ProductInsert, ProductUpdate, ProductWithCategory, Category, StockAdjustment, AdjustmentReason } from "@/types";

export const inventoryService = {
  async listProducts(shopId: string): Promise<ProductWithCategory[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("shop_id", shopId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data as unknown as ProductWithCategory[];
  },

  async getProduct(id: string): Promise<ProductWithCategory> {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as unknown as ProductWithCategory;
  },

  async createProduct(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabase.from("products").insert(product).select().single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  async searchProducts(shopId: string, query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId)
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,barcode.eq.${query},sku.ilike.%${query}%`)
      .limit(50);
    if (error) throw error;
    return data;
  },

  async listCategories(shopId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("shop_id", shopId)
      .order("name");
    if (error) throw error;
    return data;
  },

  async createCategory(shopId: string, name: string, description?: string): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert({ shop_id: shopId, name, description })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async adjustStock(payload: {
    shop_id: string;
    product_id: string;
    previous_quantity: number;
    new_quantity: number;
    reason: AdjustmentReason;
    notes?: string;
    adjusted_by?: string;
  }): Promise<StockAdjustment> {
    // Update product stock
    const { error: prodErr } = await supabase
      .from("products")
      .update({ stock_quantity: payload.new_quantity })
      .eq("id", payload.product_id);
    if (prodErr) throw prodErr;

    // Record adjustment
    const { data, error } = await supabase
      .from("stock_adjustments")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getLowStockProducts(shopId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .rpc("stock_valuation", { p_shop_id: shopId });
    if (error) throw error;
    // Filter to low stock (where stock_quantity <= reorder_level equivalent)
    return data as unknown as Product[];
  },
};
