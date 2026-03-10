import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";

const mockProducts = Array.from({ length: 10 }).map((_, i) => ({
  name: `Product ${i + 1}`,
  revenue: Math.round(20000 + Math.random() * 15000),
  units: Math.round(30 + Math.random() * 70),
  margin: Math.round(10 + Math.random() * 40),
}));

type Metric = "revenue" | "units" | "margin";

const SalesByProductChart = ({ loading = false }: { loading?: boolean }) => {
  const [metric, setMetric] = React.useState<Metric>("revenue");

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!mockProducts.length)
    return <EmptyState title="No product performance yet" description="Add products and record sales to see trends." />;

  const dataKeyMap = {
    revenue: "Revenue",
    units: "Units",
    margin: "Margin %",
  };

  return (
    <div className="card p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Top Products</p>
          <p className="text-xs text-slate-500">By revenue, units or margin</p>
        </div>
        <div className="flex gap-2 text-xs">
          {(
            [
              { key: "revenue", label: "Revenue" },
              { key: "units", label: "Units" },
              { key: "margin", label: "Margin" },
            ] as const
          ).map((opt) => (
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
          <BarChart data={mockProducts} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" hide={metric === "margin"} />
            <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={((value: unknown) =>
                metric === "margin" ? `${value}%` : `KES ${Number(value || 0).toLocaleString("en-KE")}`) as any}
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
