import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";

const data = Array.from({ length: 6 }).map((_, i) => ({
  name: `Category ${i + 1}`,
  cost_value: Math.round(30000 + Math.random() * 40000),
  retail_value: Math.round(50000 + Math.random() * 60000),
}));

const StockValueChart = ({ loading = false }: { loading?: boolean }) => {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return <EmptyState title="No stock yet" description="Add products to see stock valuation." />;

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Stock Value</p>
        <p className="text-xs text-slate-500">Cost vs Retail</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `KES ${Number(v) / 1000}k`} />
            <Tooltip formatter={((v: unknown) => `KES ${Number(v || 0).toLocaleString("en-KE")}`) as any} />
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
