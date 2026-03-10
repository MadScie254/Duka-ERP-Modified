import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import type { DailySalesSummary } from "@/types";

type Mode = "revenue" | "revenue-profit";

interface Props {
  data?: DailySalesSummary[];
  loading?: boolean;
}

const RevenueLineChart = ({ data = [], loading = false }: Props) => {
  const [mode, setMode] = useState<Mode>("revenue-profit");

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return <EmptyState title="No sales data yet" description="Make your first sale to unlock insights." />;

  const chartData = data.map((d) => ({
    date: new Date(d.sale_date).toLocaleDateString("en-KE", { day: "numeric", month: "short" }),
    revenue: d.revenue,
    profit: d.profit,
  }));

  const avgRevenue = chartData.reduce((acc, cur) => acc + cur.revenue, 0) / chartData.length;

  return (
    <div className="card p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Revenue Trend</p>
          <p className="text-xs text-slate-500">Overlay profit</p>
        </div>
        <div className="flex gap-2 text-xs">
          {([
            { key: "revenue" as const, label: "Revenue only" },
            { key: "revenue-profit" as const, label: "Revenue + Profit" },
          ]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMode(opt.key)}
              className={`rounded-full border px-3 py-1 ${
                mode === opt.key ? "border-brand-500 text-brand-700" : "border-slate-200 text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => `KES ${Number(v).toLocaleString("en-KE")}`} />
            <Legend />
            <ReferenceLine y={avgRevenue} stroke="#94a3b8" strokeDasharray="5 5" label="Avg" />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" fill="#22c55e33" strokeWidth={2} />
            {mode === "revenue-profit" && (
              <Area type="monotone" dataKey="profit" name="Profit" stroke="#0ea5e9" fill="#0ea5e933" strokeWidth={2} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueLineChart;
