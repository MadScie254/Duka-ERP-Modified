import * as React from "react";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">KES</span>
      <input
        ref={ref}
        type="number"
        step="0.01"
        className={cn(
          "flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          className
        )}
        {...props}
      />
    </div>
  )
);
CurrencyInput.displayName = "CurrencyInput";
