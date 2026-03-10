import { supabase } from "@/lib/supabase";
import type { Customer, CustomerInsert, CustomerUpdate, DebtRecord, DebtPayment, PaymentMethod } from "@/types";

export const customersService = {
  async listCustomers(shopId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("shop_id", shopId)
      .order("name");
    if (error) throw error;
    return data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async createCustomer(customer: CustomerInsert): Promise<Customer> {
    const { data, error } = await supabase.from("customers").insert(customer).select().single();
    if (error) throw error;
    return data;
  },

  async updateCustomer(id: string, updates: CustomerUpdate): Promise<Customer> {
    const { data, error } = await supabase.from("customers").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
  },

  async getCustomerDebts(customerId: string): Promise<DebtRecord[]> {
    const { data, error } = await supabase
      .from("debt_records")
      .select("*")
      .eq("customer_id", customerId)
      .eq("is_settled", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async recordDebtPayment(debtId: string, amount: number, method: PaymentMethod = 'cash'): Promise<DebtPayment> {
    // Insert debt payment
    const { data, error } = await supabase
      .from("debt_payments")
      .insert({ debt_id: debtId, amount, method })
      .select()
      .single();
    if (error) throw error;

    // Update remaining amount on debt record
    const { data: debt, error: debtErr } = await supabase
      .from("debt_records")
      .select("remaining_amount")
      .eq("id", debtId)
      .single();
    if (debtErr) throw debtErr;

    const newRemaining = debt.remaining_amount - amount;
    const { error: updateErr } = await supabase
      .from("debt_records")
      .update({
        remaining_amount: Math.max(0, newRemaining),
        is_settled: newRemaining <= 0,
      })
      .eq("id", debtId);
    if (updateErr) throw updateErr;

    return data;
  },

  async listAllDebts(shopId: string): Promise<DebtRecord[]> {
    const { data, error } = await supabase
      .from("debt_records")
      .select("*, customers(name, phone)")
      .eq("shop_id", shopId)
      .eq("is_settled", false)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as DebtRecord[];
  },
};
