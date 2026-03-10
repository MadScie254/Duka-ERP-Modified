import { useMemo, useState } from "react";
import {
  Line,
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

const mockData = Array.from({ length: 14 }).map((_, i) => ({
  date: `Day ${i + 1}`,
  revenue: Math.round(50000 + Math.random() * 30000),
  profit: Math.round(15000 + Math.random() * 8000),
  expenses: Math.round(10000 + Math.random() * 7000),
}));

const options = ["Today", "7 Days", "30 Days", "90 Days"];

type Mode = "revenue" | "revenue-profit" | "revenue-expenses";

const RevenueLineChart = ({ loading = false }: { loading?: boolean }) => {
  const [period, setPeriod] = useState("7 Days");
  const [mode, setMode] = useState<Mode>("revenue-profit");

  const data = useMemo(() => mockData, [period]);

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length) return <EmptyState title="No sales data yet" description="Make your first sale to unlock insights." />;

  const avgRevenue = data.reduce((acc, cur) => acc + cur.revenue, 0) / data.length;

  return (
    <div className="card p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Revenue Trend</p>
          <p className="text-xs text-slate-500">Overlay profit & expenses</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => setPeriod(opt)}
              className={`rounded-full border px-3 py-1 ${
                period === opt ? "border-brand-500 text-brand-700" : "border-slate-200 text-slate-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="flex gap-2 text-xs">
          {(
            [
              { key: "revenue", label: "Revenue only" },
              { key: "revenue-profit", label: "Revenue + Profit" },
              { key: "revenue-expenses", label: "Revenue + Expenses" },
            ] as const
          ).map((opt) => (
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
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `KES ${Number(v) / 1000}k`} tick={{ fontSize: 12 }} />
            <Tooltip formatter={((value: unknown) => `KES ${Number(value || 0).toLocaleString("en-KE")}`) as any} />
            <Legend />
            <ReferenceLine y={avgRevenue} stroke="#22c55e" strokeDasharray="5 5" label="Avg" />
            <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#dcfce7" />
            {mode === "revenue-profit" && <Line type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={2} />}
            {mode === "revenue-expenses" && <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueLineChart;
