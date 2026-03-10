import { supabase } from "@/lib/supabase";
import type { Expense, ExpenseInsert, ExpenseUpdate } from "@/types";

export const expensesService = {
  async listExpenses(shopId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("shop_id", shopId)
      .order("incurred_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getExpense(id: string): Promise<Expense> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async createExpense(expense: ExpenseInsert): Promise<Expense> {
    const { data, error } = await supabase.from("expenses").insert(expense).select().single();
    if (error) throw error;
    return data;
  },

  async updateExpense(id: string, updates: ExpenseUpdate): Promise<Expense> {
    const { data, error } = await supabase.from("expenses").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
  },
};
