import { supabase } from "@/lib/supabase";
import type { Supplier } from "@/types";

export type SupplierInsert = Omit<Supplier, "id" | "created_at" | "updated_at">;
export type SupplierUpdate = Partial<Omit<SupplierInsert, "shop_id">>;

export const suppliersService = {
  async listSuppliers(shopId: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("shop_id", shopId)
      .order("name");
    if (error) throw error;
    return data;
  },

  async getSupplier(id: string): Promise<Supplier> {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async createSupplier(supplier: SupplierInsert): Promise<Supplier> {
    const { data, error } = await supabase.from("suppliers").insert(supplier).select().single();
    if (error) throw error;
    return data;
  },

  async updateSupplier(id: string, updates: SupplierUpdate): Promise<Supplier> {
    const { data, error } = await supabase.from("suppliers").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw error;
  },
};
