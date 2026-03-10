import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import type { PaymentMethodBreakdown } from "@/types";

const COLORS = ["#22c55e", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6"];
const LABELS: Record<string, string> = { cash: "Cash", mpesa: "M-Pesa", credit: "Credit", card: "Card", bank_transfer: "Bank" };

interface Props {
  data?: PaymentMethodBreakdown[];
  loading?: boolean;
}

const PaymentMethodPieChart = ({ data = [], loading = false }: Props) => {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length)
    return <EmptyState title="No payments yet" description="Record sales to see payment breakdown." />;

  const chartData = data.map((d) => ({
    name: LABELS[d.method] ?? d.method,
    value: d.total_amount,
  }));

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Payment Methods</p>
        <p className="text-xs text-slate-500">Last 30 days</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `KES ${Number(v).toLocaleString("en-KE")}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PaymentMethodPieChart;
