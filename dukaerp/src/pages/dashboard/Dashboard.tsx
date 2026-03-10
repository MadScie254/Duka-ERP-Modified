import StatCard from "@/components/common/StatCard";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import SalesByProductChart from "@/components/charts/SalesByProductChart";
import PaymentMethodPieChart from "@/components/charts/PaymentMethodPieChart";
import ProfitMarginChart from "@/components/charts/ProfitMarginChart";
import StockValueChart from "@/components/charts/StockValueChart";
import SalesTrendHeatmap from "@/components/charts/SalesTrendHeatmap";
import { ShoppingBag, TrendingUp, Package, Wallet, BellRing } from "lucide-react";
import React from "react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Today Revenue" value={45200} hint="↑ 12% vs yesterday" icon={<TrendingUp />} />
        <StatCard title="Gross Profit" value={12400} hint="27.4% margin" icon={<Wallet />} />
        <StatCard title="Units Sold" value="234 items" hint="↑ 8 txns today" icon={<ShoppingBag />} />
        <StatCard title="Active Debts" value={8300} hint="3 customers overdue" icon={<BellRing />} />
        <StatCard title="Low Stock" value="7 products" hint="Reorder soon" icon={<Package />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueLineChart />
        <SalesByProductChart />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PaymentMethodPieChart />
        <ProfitMarginChart />
        <SalesTrendHeatmap />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StockValueChart />
        <div className="card p-4">
          <p className="text-sm font-semibold">Debt Aging</p>
          <p className="text-sm text-slate-500 mt-2">Connect real data to power this table.</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between">0-7 days <span className="font-semibold">KES 12,000</span></li>
            <li className="flex justify-between">7-30 days <span className="font-semibold">KES 8,300</span></li>
            <li className="flex justify-between">30-90 days <span className="font-semibold">KES 3,200</span></li>
            <li className="flex justify-between">90d+ <span className="font-semibold text-red-600">KES 1,000</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
