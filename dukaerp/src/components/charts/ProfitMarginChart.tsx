import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import type { TopProduct } from "@/types";

interface Props {
  data?: TopProduct[];
  loading?: boolean;
}

const ProfitMarginChart = ({ data = [], loading = false }: Props) => {
  if (loading) return <Skeleton className="h-56 w-full" />;
  if (!data.length) return <EmptyState title="No margin data" description="Record sales to calculate profit margins." />;

  const chartData = data.map((p) => ({
    name: p.product_name.length > 12 ? p.product_name.slice(0, 10) + "…" : p.product_name,
    margin: Math.round(p.margin_pct),
  }));

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Profit Margin %</p>
        <p className="text-xs text-slate-500">Top products</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="margin" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitMarginChart;
