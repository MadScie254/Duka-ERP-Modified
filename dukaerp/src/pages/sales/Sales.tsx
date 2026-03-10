import { useSales } from "@/hooks/useSales";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, Link } from "react-router-dom";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  refunded: "bg-red-100 text-red-700",
  partial_refund: "bg-yellow-100 text-yellow-700",
};

const Sales = () => {
  const navigate = useNavigate();
  const { sales } = useSales();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sales</h1>
          <p className="text-sm text-slate-500">All receipts with payment breakdown.</p>
        </div>
        <Button onClick={() => navigate("/pos")}>New Sale</Button>
      </div>
      <div className="card p-4">
        {sales.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !sales.data?.length ? (
          <p className="text-sm text-slate-500">No sales yet</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Receipt</th>
                  <th className="text-left px-4 py-3 font-semibold">Customer</th>
                  <th className="text-right px-4 py-3 font-semibold">Paid</th>
                  <th className="text-right px-4 py-3 font-semibold">Total</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.data.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/sales/${sale.id}`} className="text-brand-700 font-medium hover:underline">
                        {sale.receipt_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {sale.customers?.name ?? "Walk-in"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(sale.amount_paid)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {formatCurrency(sale.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[sale.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDateTime(sale.created_at)}
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

export default Sales;
