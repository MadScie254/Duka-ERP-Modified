import { supabase } from "@/lib/supabase";
import type { Database } from "@/types";

export const expensesService = {
  async listExpenses(shopId: string) {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("shop_id", shopId)
        .order("incurred_at", { ascending: false });
      if (error) throw error;
      return data as Database["public"]["Tables"]["expenses"]["Row"][];
    } catch (error) {
      console.error("listExpenses", error);
      throw error;
    }
  },
};
