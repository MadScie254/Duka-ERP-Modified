import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCustomerDetail, useDebtEntries, useDebtors } from "@/hooks/useCustomers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading } = useCustomerDetail(id ?? "");
  const { data: debtEntries } = useDebtEntries(id ?? "");
  const { recordPayment } = useDebtors();
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!customer) return <p className="text-sm text-slate-500">Customer not found.</p>;

  const handlePay = () => {
    if (!payAmount || !id) return;
    recordPayment.mutate(
      { customer_id: id, amount: Number(payAmount) },
      {
        onSuccess: () => { toast.success("Payment recorded"); setShowPayForm(false); setPayAmount(""); },
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
        <div><p className="text-xs text-slate-500">ID Number</p><p className="font-medium">{customer.id_number ?? "—"}</p></div>
        <div><p className="text-xs text-slate-500">Credit Limit</p><p className="font-medium">{formatCurrency(customer.credit_limit ?? 0)}</p></div>
        <div><p className="text-xs text-slate-500">Total Debt</p><p className="font-bold text-red-600">{formatCurrency(customer.total_debt ?? 0)}</p></div>
        <div><p className="text-xs text-slate-500">Member Since</p><p className="font-medium">{formatDate(customer.created_at)}</p></div>
      </div>

      {(customer.total_debt ?? 0) > 0 && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Outstanding: {formatCurrency(customer.total_debt)}</p>
            {showPayForm ? (
              <div className="flex gap-1 items-center">
                <Input type="number" min={1} className="w-32" placeholder="Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                <Button size="sm" onClick={handlePay} disabled={recordPayment.isPending}>Pay</Button>
                <Button size="sm" variant="outline" onClick={() => setShowPayForm(false)}>Cancel</Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setShowPayForm(true)}>Record payment</Button>
            )}
          </div>
        </div>
      )}

      {debtEntries && debtEntries.length > 0 && (
        <div className="card p-4 space-y-3">
          <p className="text-sm font-semibold">Credit / Payment History</p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Type</th>
                  <th className="text-right px-4 py-3 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold">Notes</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {debtEntries.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3">
                      <span className={d.type === 'credit' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {d.type === 'credit' ? 'Credit' : 'Payment'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(d.amount)}</td>
                    <td className="px-4 py-3 text-slate-500">{d.notes ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(d.created_at)}</td>
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
