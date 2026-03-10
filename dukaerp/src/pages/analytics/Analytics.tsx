import StatCard from "@/components/common/StatCard";
import RevenueLineChart from "@/components/charts/RevenueLineChart";
import SalesByProductChart from "@/components/charts/SalesByProductChart";
import PaymentMethodPieChart from "@/components/charts/PaymentMethodPieChart";
import StockValueChart from "@/components/charts/StockValueChart";
import SalesTrendHeatmap from "@/components/charts/SalesTrendHeatmap";
import ProfitMarginChart from "@/components/charts/ProfitMarginChart";
import DataTable from "@/components/common/DataTable";

const debtRows = [
  { customer: "Kamau", amount: "KES 3,400", days: 5 },
  { customer: "Amina", amount: "KES 1,200", days: 28 },
  { customer: "Wanjiku", amount: "KES 800", days: 65 },
];

const stockRows = [
  { product: "Unga 2kg", qty: 50, cost: "KES 4,250", retail: "KES 5,000" },
  { product: "Sugar 1kg", qty: 100, cost: "KES 8,000", retail: "KES 10,000" },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Today Revenue" value={45200} hint="↑ 12% vs yesterday" />
        <StatCard title="Gross Profit" value={12400} hint="27.4% margin" />
        <StatCard title="Units Sold" value="234 items" hint="8 txns today" />
        <StatCard title="Active Debts" value={8300} hint="3 customers" />
        <StatCard title="Low Stock" value="7 products" hint="Reorder needed" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueLineChart />
        <SalesByProductChart />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PaymentMethodPieChart />
        <StockValueChart />
        <ProfitMarginChart />
      </div>

      <SalesTrendHeatmap />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Debt Aging</p>
          <DataTable
            columns={[
              { header: "Customer", accessor: "customer" },
              { header: "Amount", accessor: "amount" },
              { header: "Days Due", accessor: "days" },
            ]}
            data={debtRows}
            emptyMessage="No debts"
          />
        </div>
        <div className="card p-4">
          <p className="text-sm font-semibold mb-3">Stock Value Analysis</p>
          <DataTable
            columns={[
              { header: "Product", accessor: "product" },
              { header: "Qty", accessor: "qty" },
              { header: "Cost Value", accessor: "cost" },
              { header: "Sell Value", accessor: "retail" },
            ]}
            data={stockRows}
            emptyMessage="No stock"
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
