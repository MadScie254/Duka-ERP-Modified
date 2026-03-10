import StatCard from "@/components/common/StatCard";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import SalesByProductChart from "@/components/charts/SalesByProductChart";
import PaymentMethodPieChart from "@/components/charts/PaymentMethodPieChart";
import StockValueChart from "@/components/charts/StockValueChart";
import SalesTrendHeatmap from "@/components/charts/SalesTrendHeatmap";
import ProfitMarginChart from "@/components/charts/ProfitMarginChart";
import { useAnalytics } from "@/hooks/useAnalytics";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const Analytics = () => {
  const { kpis, trend, topProducts, paymentBreakdown, heatmap, debtAging, stockValuation } = useAnalytics();
  const k = kpis.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Today Revenue" value={k?.revenue ?? 0} hint={k ? `${k.transaction_count} txns today` : "—"} />
        <StatCard title="Gross Profit" value={k?.profit ?? 0} hint={k?.revenue ? `${((k.profit / k.revenue) * 100).toFixed(1)}% margin` : "—"} />
        <StatCard title="Units Sold" value={k ? `${k.units_sold} items` : "—"} hint={k ? `${k.transaction_count} txns today` : "—"} />
        <StatCard title="Active Debts" value={k?.active_debts ?? 0} hint="Outstanding" />
        <StatCard title="Low Stock" value={k ? `${k.low_stock_count} products` : "—"} hint="Reorder needed" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueLineChart dataquantity_in_stockloading={trend.isLoading} />
        <SalesByProductChart data={topProducts.data} loading={topProducts.isLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PaymentMethodPieChart data={paymentBreakdown.data} loading={paymentBreakdown.isLoading} />
        <StockValueChart data={stockValuation.data} loading={stockValuation.isLoading} />
        <ProfitMarginChart data={topProducts.data} loading={topProducts.isLoading} />
      </div>

      <SalesTrendHeatmap data={heatmap.data} loading={heatmap.isLoading} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Debt Aging</p>
          {debtAging.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !(debtAging.data ?? []).length ? (
            <p className="text-sm text-slate-500">No debts</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Bucket</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-right px-4 py-3 font-semibold">Oldest (days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debtAging.data!.map((row) => (
                    <tr key={row.bucket}>
                      <td className="px-4 py-3 text-slate-700">{row.bucket}</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">{formatCurrency(row.total_debt)}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{row.oldest_days}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Stock Value (Top Items)</p>
          {stockValuation.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !(stockValuation.data ?? []).length ? (
            <p className="text-sm text-slate-500">No stock</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Product</th>
                    <th className="text-right px-4 py-3 font-semibold">Qty</th>
                    <th className="text-right px-4 py-3 font-semibold">Cost Value</th>
                    <th className="text-right px-4 py-3 font-semibold">Retail Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockValuation.data!.slice(0, 10).map((row) => (
                    <tr key={row.product_name}>
                      <td className="px-4 py-3 text-slate-700">{row.product_name}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{row.quantity_in_stock}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.cost_value)}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(row.retail_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
