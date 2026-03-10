import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";

const data = Array.from({ length: 8 }).map((_, i) => ({
  name: `P${i + 1}`,
  margin: Math.round(10 + Math.random() * 35),
}));

const ProfitMarginChart = ({ loading = false }: { loading?: boolean }) => {
  if (loading) return <Skeleton className="h-56 w-full" />;
  if (!data.length) return <EmptyState title="No margin data" description="Record sales to calculate profit margins." />;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Profit Margin %</p>
        <p className="text-xs text-slate-500">Snapshot</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis unit="%" />
            <Tooltip formatter={((v: unknown) => `${v}%`) as any} />
            <Line type="monotone" dataKey="margin" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitMarginChart;
