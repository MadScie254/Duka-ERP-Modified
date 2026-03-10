import { useState, useEffect } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { KE_CONSTANTS } from "@/lib/constants";
import { expensesService } from "@/services/expenses.service";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";
import { expenseKeys } from "@/hooks/useExpenses";
import toast from "react-hot-toast";
import type { ExpensePaymentMethod } from "@/types";

const Expenses = () => {
  const shopId = useAuthStore((s) => s.activeShop?.id ?? "");
  const { expenses, expenseCategories, createExpense, deleteExpense } = useExpenses();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [method, setMethod] = useState<ExpensePaymentMethod>("cash");

  // Auto-seed default expense categories if none exist
  useEffect(() => {
    if (expenseCategories.data && expenseCategories.data.length === 0 && shopId) {
      expensesService
        .ensureDefaultCategories(shopId, KE_CONSTANTS.defaultExpenseCategories)
        .then(() => queryClient.invalidateQueries({ queryKey: expenseKeys.categories(shopId) }));
    }
  }, [expenseCategories.data, shopId]);

  // Set default category when categories load
  useEffect(() => {
    if (expenseCategories.data?.length && !categoryId) {
      setCategoryId(expenseCategories.data[0].id);
    }
  }, [expenseCategories.data, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    createExpense.mutate(
      { description: desc, amount: Number(amount), category_id: categoryId || undefined, payment_method: method, incurred_at: new Date().toISOString().slice(0, 10) },
      {
        onSuccess: () => { toast.success("Expense added"); setDesc(""); setAmount(""); },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteExpense.mutate(id, {
      onSuccess: () => toast.success("Expense deleted"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">Keep costs in check.</p>
        </div>
        <Button form="expense-form" type="submit" disabled={createExpense.isPending}>
          {createExpense.isPending ? "Adding…" : "Quick add"}
        </Button>
      </div>
      <div className="card p-4 space-y-3">
        <form id="expense-form" onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1 md:col-span-1">
            <Label>Description</Label>
            <Input placeholder="e.g. Rent" required value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Amount (KES)</Label>
            <Input type="number" min={0} required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">-- Select --</option>
              {(expenseCategories.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Payment Method</Label>
            <Select value={method} onChange={(e) => setMethod(e.target.value as ExpensePaymentMethod)}>
              <option value="cash">Cash</option>
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Bank Transfer</option>
            </Select>
          </div>
        </form>

        {expenses.isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !(expenses.data ?? []).length ? (
          <p className="text-sm text-slate-500">No expenses</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Description</th>
                  <th className="text-left px-4 py-3 font-semibold">Category</th>
                  <th className="text-right px-4 py-3 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold">Method</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.data!.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{exp.description}</td>
                    <td className="px-4 py-3 text-slate-500">{exp.expense_categories?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(exp.amount)}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{exp.payment_method}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(exp.incurred_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
