import StatCard from "@/components/common/StatCard";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import SalesByProductChart from "@/components/charts/SalesByProductChart";
import PaymentMethodPieChart from "@/components/charts/PaymentMethodPieChart";
import ProfitMarginChart from "@/components/charts/ProfitMarginChart";
import StockValueChart from "@/components/charts/StockValueChart";
import SalesTrendHeatmap from "@/components/charts/SalesTrendHeatmap";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ShoppingBag, TrendingUp, Package, Wallet, BellRing } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const Dashboard = () => {
  const { kpis, trend, topProducts, paymentBreakdown, heatmap, debtAging, stockValuation } = useAnalytics();
  const k = kpis.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Today Revenue" value={k?.revenue ?? 0} icon={<TrendingUp />} />
        <StatCard title="Gross Profit" value={k?.profit ?? 0} icon={<Wallet />} />
        <StatCard title="Units Sold" value={`${k?.units_sold ?? 0} items`} hint={`${k?.transaction_count ?? 0} txns today`} icon={<ShoppingBag />} />
        <StatCard title="Active Debts" value={k?.active_debts ?? 0} icon={<BellRing />} />
        <StatCard title="Low Stock" value={`${k?.low_stock_count ?? 0} products`} hint="Reorder soon" icon={<Package />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueLineChart data={trend.data} loading={trend.isLoading} />
        <SalesByProductChart data={topProducts.data} loading={topProducts.isLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PaymentMethodPieChart data={paymentBreakdown.data} loading={paymentBreakdown.isLoading} />
        <ProfitMarginChart data={topProducts.data} loading={topProducts.isLoading} />
        <SalesTrendHeatmap data={heatmap.data} loading={heatmap.isLoading} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StockValueChart data={stockValuation.data} loading={stockValuation.isLoading} />
        <div className="card p-4">
          <p className="text-sm font-semibold">Debt Aging</p>
          {debtAging.data && debtAging.data.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {debtAging.data.map((d) => (
                <li key={d.customer_id} className="flex justify-between">
                  <span>{d.customer_name} <span className="text-slate-400 text-xs">{d.bucket}</span></span>
                  <span className="font-semibold">{formatCurrency(d.total_debt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 mt-2">No outstanding debts.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
