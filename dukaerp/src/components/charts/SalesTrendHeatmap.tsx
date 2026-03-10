import React from "react";
import * as d3 from "d3";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }).map((_, i) => i);
const mock = dayLabels.flatMap((label, dayIndex) =>
  hours.map((hour) => ({
    dayLabel: label,
    dayIndex,
    hour,
    sales_count: Math.round(Math.random() * 20),
    revenue: Math.round(500 + Math.random() * 3000),
  }))
);

const color = d3.scaleLinear<string>().domain([0, 20]).range(["#E0F7FA", "#006064"]);

const SalesTrendHeatmap = ({ loading = false }: { loading?: boolean }) => {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!mock.length)
    return <EmptyState title="No sales yet" description="Sales heatmap will appear after transactions." />;

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Sales Heatmap</p>
        <p className="text-xs text-slate-500">Peak hours (last 90 days)</p>
      </div>
      <div className="overflow-x-auto">
        <div className="grid" style={{ gridTemplateColumns: `80px repeat(${hours.length}, minmax(18px, 1fr))` }}>
          <div />
          {hours.map((h) => (
            <div key={h} className="text-[10px] text-center text-slate-500">
              {h}
            </div>
          ))}
          {dayLabels.map((label) => (
            <React.Fragment key={label}>
              <div className="text-xs font-semibold text-slate-600 flex items-center">{label}</div>
              {hours.map((hour) => {
                const cell = mock.find((c) => c.dayLabel === label && c.hour === hour)!;
                return (
                  <div
                    key={`${label}-${hour}`}
                    title={`${label} ${hour}:00 - ${cell.sales_count} sales, KES ${cell.revenue.toLocaleString("en-KE")}`}
                    className="h-6 w-full"
                    style={{ backgroundColor: color(cell.sales_count) }}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesTrendHeatmap;
