import { supabase } from "@/lib/supabase";
import type { Database } from "@/types";

export const customersService = {
  async listCustomers(shopId: string) {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Database["public"]["Tables"]["customers"]["Row"][];
    } catch (error) {
      console.error("listCustomers", error);
      throw error;
    }
  },
};
