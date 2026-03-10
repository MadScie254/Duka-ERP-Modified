import { supabase } from "@/lib/supabase";
import type { Sale, SaleInsert, SaleWithItems, SaleItem, PaymentMethod } from "@/types";

export interface CreateSalePayload {
  shop_id: string;
  customer_id?: string | null;
  payment_method: PaymentMethod;
  discount_amount?: number;
  tax_amount?: number;
  notes?: string;
  cashier_id?: string;
  items: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    cost_price: number;
    discount?: number;
  }[];
}

export const salesService = {
  async listSales(shopId: string): Promise<Sale[]> {
    const { data, error } = await supabase
      .from("sales")
      .select("*, customers(name, phone)")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as Sale[];
  },

  async getSale(id: string): Promise<SaleWithItems> {
    const { data, error } = await supabase
      .from("sales")
      .select("*, sale_items(*), customers(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as unknown as SaleWithItems;
  },

  async createSale(payload: CreateSalePayload): Promise<Sale> {
    const { items, ...saleData } = payload;
    const discount = saleData.discount_amount ?? 0;
    const tax = saleData.tax_amount ?? 0;

    const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity - (i.discount ?? 0), 0);
    const profit = items.reduce((sum, i) => sum + (i.unit_price - i.cost_price) * i.quantity - (i.discount ?? 0), 0);
    const total = subtotal - discount + tax;

    // Generate receipt number
    const { data: receiptNum, error: rpcErr } = await supabase.rpc("generate_receipt_number", { p_shop_id: payload.shop_id });
    if (rpcErr) throw rpcErr;

    const saleInsert: SaleInsert = {
      ...saleData,
      receipt_number: receiptNum as string,
      subtotal,
      total_amount: total,
      profit_amount: profit,
    };

    const { data: sale, error: saleErr } = await supabase.from("sales").insert(saleInsert).select().single();
    if (saleErr) throw saleErr;

    // Insert sale items
    const saleItems = items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      cost_price: item.cost_price,
      discount: item.discount ?? 0,
      line_total: item.unit_price * item.quantity - (item.discount ?? 0),
    }));

    const { error: itemsErr } = await supabase.from("sale_items").insert(saleItems);
    if (itemsErr) throw itemsErr;

    // Record payment
    const { error: payErr } = await supabase.from("payments").insert({
      shop_id: payload.shop_id,
      sale_id: sale.id,
      customer_id: payload.customer_id,
      amount: total,
      method: payload.payment_method,
      status: payload.payment_method === 'credit' ? 'pending' : 'completed',
    });
    if (payErr) throw payErr;

    // If credit sale, create debt record
    if (payload.payment_method === 'credit' && payload.customer_id) {
      const { error: debtErr } = await supabase.from("debt_records").insert({
        shop_id: payload.shop_id,
        customer_id: payload.customer_id,
        sale_id: sale.id,
        original_amount: total,
        remaining_amount: total,
      });
      if (debtErr) throw debtErr;
    }

    return sale;
  },

  async voidSale(id: string): Promise<Sale> {
    const { data, error } = await supabase
      .from("sales")
      .update({ status: 'voided' as const })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async refundSale(id: string): Promise<Sale> {
    const { data, error } = await supabase
      .from("sales")
      .update({ status: 'refunded' as const })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
