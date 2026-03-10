import { supabase } from "@/lib/supabase";
import type { MpesaTransaction } from "@/types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

export const mpesaService = {
  async triggerStkPush({ phone, amount, shop_id, sale_id }: { phone: string; amount: number; shop_id: string; sale_id?: string }) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${supabaseUrl}/functions/v1/mpesa-stk-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ phone, amount, shop_id, sale_id }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async listTransactions(shopId: string): Promise<MpesaTransaction[]> {
    const { data, error } = await supabase
      .from("mpesa_transactions")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
