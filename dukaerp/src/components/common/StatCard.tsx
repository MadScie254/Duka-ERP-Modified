import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  trend?: string;
  icon?: ReactNode;
  className?: string;
}

const StatCard = ({ title, value, hint, trend, icon, className }: StatCardProps) => {
  return (
    <Card className={cn("p-4 md:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-slate-900">
            {typeof value === "number" ? formatCurrency(value) : value}
          </p>
          {hint && <p className="text-sm text-slate-500">{hint}</p>}
        </div>
        {trend && <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-1 rounded-full">{trend}</span>}
        {icon && <div className="text-brand-600">{icon}</div>}
      </div>
    </Card>
  );
};

export default StatCard;
