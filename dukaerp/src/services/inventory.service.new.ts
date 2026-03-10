import { supabase } from "@/lib/supabase";
import type { Product, ProductInsert, ProductUpdate, ProductWithCategory, Category, StockMovement, MovementType } from "@/types";

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

  async createCategory(shopId: string, name: string, color?: string): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert({ shop_id: shopId, name, color })
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
    type: MovementType;
    notes?: string;
    created_by?: string;
  }): Promise<StockMovement> {
    // Update product stock
    const { error: prodErr } = await supabase
      .from("products")
      .update({ quantity_in_stock: payload.new_quantity })
      .eq("id", payload.product_id);
    if (prodErr) throw prodErr;

    const delta = payload.new_quantity - payload.previous_quantity;

    // Record movement
    const { data, error } = await supabase
      .from("stock_movements")
      .insert({
        shop_id: payload.shop_id,
        product_id: payload.product_id,
        type: payload.type,
        quantity: delta,
        notes: payload.notes ?? null,
        created_by: payload.created_by ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
