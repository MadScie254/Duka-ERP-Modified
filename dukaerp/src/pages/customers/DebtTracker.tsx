import { useDebts } from "@/hooks/useCustomers";
import { useAnalytics } from "@/hooks/useAnalytics";
import StatCard from "@/components/common/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Link } from "react-router-dom";

const DebtTracker = () => {
  const { debts } = useDebts();
  const { debtAging } = useAnalytics();

  const totalOutstanding = (debts.data ?? []).reduce((sum: number, d: any) => sum + d.remaining_amount, 0);
  const customerCount = new Set((debts.data ?? []).map((d: any) => d.customer_id)).size;

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
            {debtAging.data.map((row: any) => (
              <div key={row.bucket} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500">{row.bucket}</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(row.total_amount)}</p>
                <p className="text-xs text-slate-500">{row.customer_count} customer{row.customer_count !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-4">
        {debts.isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !(debts.data ?? []).length ? (
          <p className="text-sm text-slate-500">No outstanding debts</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Customer</th>
                  <th className="text-right px-4 py-3 font-semibold">Original</th>
                  <th className="text-right px-4 py-3 font-semibold">Remaining</th>
                  <th className="text-left px-4 py-3 font-semibold">Due Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(debts.data ?? []).map((d: any) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/customers/${d.customer_id}`} className="text-brand-700 font-medium hover:underline">
                        {d.customers?.name ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(d.original_amount)}</td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(d.remaining_amount)}</td>
                    <td className="px-4 py-3 text-slate-500">{d.due_date ? formatDate(d.due_date) : "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(d.created_at)}</td>
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
