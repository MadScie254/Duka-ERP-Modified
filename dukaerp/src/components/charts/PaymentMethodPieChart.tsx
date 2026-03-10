import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";

const COLORS = ["#22c55e", "#0ea5e9", "#f59e0b", "#ef4444"];
const mockData = [
  { name: "Cash", value: 45 },
  { name: "M-Pesa", value: 40 },
  { name: "Credit", value: 10 },
  { name: "Card/Bank", value: 5 },
];

const PaymentMethodPieChart = ({ loading = false }: { loading?: boolean }) => {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!mockData.length)
    return <EmptyState title="No payments yet" description="Record sales to see payment breakdown." />;

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Payment Methods</p>
        <p className="text-xs text-slate-500">Last 30 days</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={mockData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
              {mockData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={((value: unknown) => `${value}%`) as any} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PaymentMethodPieChart;
