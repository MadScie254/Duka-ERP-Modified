import { useParams, Link } from "react-router-dom";
import { useSaleDetail, useSales } from "@/hooks/useSales";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

const SaleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: sale, isLoading } = useSaleDetail(id ?? "");
  const { voidSale } = useSales();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!sale) {
    return <p className="text-sm text-slate-500">Sale not found.</p>;
  }

  const handleVoid = () => {
    if (sale.status !== "completed") return;
    voidSale.mutate(sale.id, {
      onSuccess: () => toast.success("Sale voided"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Receipt</p>
          <h1 className="text-2xl font-bold text-slate-900">{sale.receipt_number}</h1>
        </div>
        <div className="flex gap-2">
          {sale.status === "completed" && (
            <Button variant="outline" onClick={handleVoid} disabled={voidSale.isPending}>
              {voidSale.isPending ? "Voiding…" : "Void sale"}
            </Button>
          )}
          <Button onClick={() => window.print()}>Print receipt</Button>
        </div>
      </div>

      <div className="card p-4 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs text-slate-500">Customer</p>
          <p className="font-medium text-slate-900">{(sale as any).customers?.name ?? "Walk-in"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Payment Method</p>
          <p className="font-medium text-slate-900 capitalize">{sale.payment_method}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Status</p>
          <p className="font-medium text-slate-900 capitalize">{sale.status}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Date</p>
          <p className="font-medium text-slate-900">{formatDateTime(sale.created_at)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Subtotal</p>
          <p className="font-medium text-slate-900">{formatCurrency(sale.subtotal)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Total</p>
          <p className="font-bold text-lg text-slate-900">{formatCurrency(sale.total_amount)}</p>
        </div>
      </div>

      {sale.sale_items && sale.sale_items.length > 0 && (
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Items</p>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Product</th>
                  <th className="text-right px-4 py-3 font-semibold">Qty</th>
                  <th className="text-right px-4 py-3 font-semibold">Unit Price</th>
                  <th className="text-right px-4 py-3 font-semibold">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sale.sale_items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-slate-700">{item.product_name}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Link className="text-brand-700 text-sm font-semibold" to="/sales">
        &larr; Back to sales
      </Link>
    </div>
  );
};

export default SaleDetail;
