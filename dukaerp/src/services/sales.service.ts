import { supabase } from "@/lib/supabase";
import type { Database } from "@/types";

export const salesService = {
  async listSales(shopId: string) {
    try {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Database["public"]["Tables"]["sales"]["Row"][];
    } catch (error) {
      console.error("listSales", error);
      throw error;
    }
  },

  async createSale(payload: any) {
    try {
      const { data, error } = await supabase.from("sales").insert(payload).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("createSale", error);
      throw error;
    }
  },
};
