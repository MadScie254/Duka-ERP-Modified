import { supabase } from "@/lib/supabase";
import type { Database } from "@/types";

export const inventoryService = {
  /** Fetch products for active shop. */
  async listProducts(shopId: string) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shopId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Database["public"]["Tables"]["products"]["Row"][];
    } catch (error) {
      console.error("listProducts", error);
      throw error;
    }
  },
};
