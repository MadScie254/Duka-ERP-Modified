import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import type { TopProduct } from "@/types";

type Metric = "revenue" | "units" | "margin";

interface Props {
  data?: TopProduct[];
  loading?: boolean;
}

const SalesByProductChart = ({ data = [], loading = false }: Props) => {
  const [metric, setMetric] = React.useState<Metric>("revenue");

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length)
    return <EmptyState title="No product performance yet" description="Add products and record sales to see trends." />;

  const chartData = data.map((p) => ({
    name: p.product_name.length > 20 ? p.product_name.slice(0, 18) + "…" : p.product_name,
    revenue: p.total_revenue,
    units: p.total_units,
    margin: Math.round(p.margin_pct),
  }));

  const dataKeyMap = { revenue: "Revenue", units: "Units", margin: "Margin %" };

  return (
    <div className="card p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Top Products</p>
          <p className="text-xs text-slate-500">By revenue, units or margin</p>
        </div>
        <div className="flex gap-2 text-xs">
          {([
            { key: "revenue" as const, label: "Revenue" },
            { key: "units" as const, label: "Units" },
            { key: "margin" as const, label: "Margin" },
          ]).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setMetric(opt.key)}
              className={`rounded-full border px-3 py-1 ${
                metric === opt.key ? "border-brand-500 text-brand-700" : "border-slate-200 text-slate-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" hide={metric === "margin"} />
            <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) =>
                metric === "margin" ? `${value}%` : `KES ${value.toLocaleString("en-KE")}`}
            />
            <Legend />
            <Bar
              dataKey={metric}
              name={dataKeyMap[metric]}
              fill={metric === "margin" ? "#f59e0b" : metric === "units" ? "#0ea5e9" : "#22c55e"}
              radius={[6, 6, 6, 6]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesByProductChart;
