import { cn } from "@/lib/utils";

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("card", className)}>{children}</div>
);
