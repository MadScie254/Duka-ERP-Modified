import { supabase } from "@/lib/supabase";
import type { Expense, ExpenseInsert, ExpenseUpdate, ExpenseCategory, ExpenseWithCategory } from "@/types";

export const expensesService = {
  async listExpenses(shopId: string): Promise<ExpenseWithCategory[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*, expense_categories(name, color)")
      .eq("shop_id", shopId)
      .order("incurred_at", { ascending: false });
    if (error) throw error;
    return data as unknown as ExpenseWithCategory[];
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

  async listCategories(shopId: string): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from("expense_categories")
      .select("*")
      .eq("shop_id", shopId)
      .order("name");
    if (error) throw error;
    return data;
  },

  async ensureDefaultCategories(shopId: string, names: string[]): Promise<ExpenseCategory[]> {
    const existing = await this.listCategories(shopId);
    if (existing.length > 0) return existing;
    const rows = names.map((name) => ({ shop_id: shopId, name }));
    const { data, error } = await supabase
      .from("expense_categories")
      .insert(rows)
      .select();
    if (error) throw error;
    return data;
  },
};
