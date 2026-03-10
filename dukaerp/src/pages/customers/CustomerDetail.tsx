import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCustomerDetail, useDebts } from "@/hooks/useCustomers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading } = useCustomerDetail(id ?? "");
  const { debts, recordPayment } = useDebts();
  const [payDebtId, setPayDebtId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");

  const customerDebts = (debts.data ?? []).filter((d: any) => d.customer_id === id);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!customer) return <p className="text-sm text-slate-500">Customer not found.</p>;

  const handlePay = () => {
    if (!payDebtId || !payAmount) return;
    recordPayment.mutate(
      { debtId: payDebtId, amount: Number(payAmount) },
      {
        onSuccess: () => { toast.success("Payment recorded"); setPayDebtId(null); setPayAmount(""); },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
          <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
        </div>
        <Link to="/customers"><Button variant="outline">&larr; Back</Button></Link>
      </div>

      <div className="card p-4 grid gap-4 md:grid-cols-3">
        <div><p className="text-xs text-slate-500">Phone</p><p className="font-medium">{customer.phone ?? "—"}</p></div>
        <div><p className="text-xs text-slate-500">Email</p><p className="font-medium">{customer.email ?? "—"}</p></div>
        <div><p className="text-xs text-slate-500">Loyalty Points</p><p className="font-medium">{customer.loyalty_points ?? 0}</p></div>
        <div><p className="text-xs text-slate-500">Total Purchases</p><p className="font-medium">{formatCurrency(customer.total_purchases ?? 0)}</p></div>
        <div><p className="text-xs text-slate-500">Total Debt</p><p className="font-bold text-red-600">{formatCurrency(customer.total_debt ?? 0)}</p></div>
        <div><p className="text-xs text-slate-500">Member Since</p><p className="font-medium">{formatDate(customer.created_at)}</p></div>
      </div>

      {customerDebts.length > 0 && (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold">Outstanding Debts</p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Original</th>
                  <th className="text-left px-4 py-3 font-semibold">Remaining</th>
                  <th className="text-left px-4 py-3 font-semibold">Due</th>
                  <th className="text-left px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerDebts.map((d: any) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3">{formatCurrency(d.original_amount)}</td>
                    <td className="px-4 py-3 font-medium text-red-600">{formatCurrency(d.remaining_amount)}</td>
                    <td className="px-4 py-3 text-slate-500">{d.due_date ? formatDate(d.due_date) : "—"}</td>
                    <td className="px-4 py-3">
                      {payDebtId === d.id ? (
                        <div className="flex gap-1 items-center">
                          <Input type="number" min={1} max={d.remaining_amount} className="w-28" placeholder="Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                          <Button size="sm" onClick={handlePay} disabled={recordPayment.isPending}>Pay</Button>
                          <Button size="sm" variant="outline" onClick={() => setPayDebtId(null)}>×</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => setPayDebtId(d.id)}>Record payment</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
