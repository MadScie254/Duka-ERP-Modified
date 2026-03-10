import { useDebtors } from "@/hooks/useCustomers";
import { useAnalytics } from "@/hooks/useAnalytics";
import StatCard from "@/components/common/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

const DebtTracker = () => {
  const { debtors } = useDebtors();
  const { debtAging } = useAnalytics();

  const totalOutstanding = (debtors.data ?? []).reduce((sum, c) => sum + (c.total_debt ?? 0), 0);
  const customerCount = (debtors.data ?? []).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Debt Tracker</h1>
        <StatCard title="Outstanding" value={totalOutstanding} hint={`${customerCount} customer${customerCount !== 1 ? "s" : ""}`} />
      </div>

      {debtAging.data && debtAging.data.length > 0 && (
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Aging Summary</p>
          <div className="grid gap-3 md:grid-cols-4">
            {debtAging.data.map((row) => (
              <div key={row.customer_id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500">{row.customer_name}</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(row.total_debt)}</p>
                <p className="text-xs text-slate-500">{row.bucket} &bull; {row.oldest_days}d overdue</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4">
        {debtors.isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !(debtors.data ?? []).length ? (
          <p className="text-sm text-slate-500">No outstanding debts</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold">Phone</th>
                  <th className="text-right px-4 py-3 font-semibold">Credit Limit</th>
                  <th className="text-right px-4 py-3 font-semibold">Total Debt</th>
                  <th className="text-left px-4 py-3 font-semibold">Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(debtors.data ?? []).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/customers/${c.id}`} className="text-brand-700 font-medium hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(c.credit_limit ?? 0)}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(c.total_debt)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(c.created_at)}</td>
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

export default DebtTracker;
