import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-white">
    <p className="text-lg font-semibold text-slate-900">{title}</p>
    <p className="text-sm text-slate-500 mt-2">{description}</p>
    {actionLabel && onAction && (
      <div className="mt-4 flex justify-center">
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    )}
  </div>
);

export default EmptyState;
