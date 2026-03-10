import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import type { StockValuationRow } from "@/types";

interface Props {
  data?: StockValuationRow[];
  loading?: boolean;
}

const StockValueChart = ({ data = [], loading = false }: Props) => {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return <EmptyState title="No stock yet" description="Add products to see stock valuation." />;

  const chartData = data.slice(0, 10).map((p) => ({
    name: p.product_name.length > 15 ? p.product_name.slice(0, 13) + "…" : p.product_name,
    cost_value: p.cost_value,
    retail_value: p.retail_value,
  }));

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Stock Value</p>
        <p className="text-xs text-slate-500">Cost vs Retail</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `KES ${Number(v) / 1000}k`} />
            <Tooltip formatter={(v) => `KES ${Number(v).toLocaleString("en-KE")}`} />
            <Legend />
            <Bar dataKey="cost_value" name="Cost" fill="#94a3b8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="retail_value" name="Retail" fill="#22c55e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockValueChart;
