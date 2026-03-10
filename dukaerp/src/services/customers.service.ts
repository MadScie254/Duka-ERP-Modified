import { supabase } from "@/lib/supabase";
import type { Customer, CustomerInsert, CustomerUpdate, CustomerDebt } from "@/types";

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

  /** Get credit/payment history for a customer */
  async getCustomerDebtEntries(customerId: string): Promise<CustomerDebt[]> {
    const { data, error } = await supabase
      .from("customer_debts")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  /** Record a debt payment (inserts type='payment' into customer_debts; trigger updates total_debt) */
  async recordDebtPayment(payload: {
    shop_id: string;
    customer_id: string;
    amount: number;
    notes?: string;
    created_by?: string;
  }): Promise<CustomerDebt> {
    const { data, error } = await supabase
      .from("customer_debts")
      .insert({
        shop_id: payload.shop_id,
        customer_id: payload.customer_id,
        type: 'payment' as const,
        amount: payload.amount,
        notes: payload.notes || null,
        created_by: payload.created_by || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** List customers who owe money */
  async listCustomersWithDebt(shopId: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("shop_id", shopId)
      .gt("total_debt", 0)
      .order("total_debt", { ascending: false });
    if (error) throw error;
    return data;
  },
};
