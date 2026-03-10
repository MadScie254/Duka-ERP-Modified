import React from "react";
import * as d3 from "d3";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import type { SalesHeatmapRow } from "@/types";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }).map((_, i) => i);

interface Props {
  data?: SalesHeatmapRow[];
  loading?: boolean;
}

const SalesTrendHeatmap = ({ data = [], loading = false }: Props) => {
  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!data.length)
    return <EmptyState title="No sales yet" description="Sales heatmap will appear after transactions." />;

  const maxCount = Math.max(...data.map((d) => d.sale_count), 1);
  const color = d3.scaleLinear<string>().domain([0, maxCount]).range(["#E0F7FA", "#006064"]);

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
          {dayLabels.map((label, dayIndex) => (
            <React.Fragment key={label}>
              <div className="text-xs font-semibold text-slate-600 flex items-center">{label}</div>
              {hours.map((hour) => {
                const cell = data.find((c) => c.day_of_week === dayIndex && c.hour_of_day === hour);
                const count = cell?.sale_count ?? 0;
                const revenue = cell?.total_revenue ?? 0;
                return (
                  <div
                    key={`${label}-${hour}`}
                    title={`${label} ${hour}:00 - ${count} sales, KES ${revenue.toLocaleString("en-KE")}`}
                    className="h-6 w-full"
                    style={{ backgroundColor: color(count) }}
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
