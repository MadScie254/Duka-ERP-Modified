import type { ReactNode } from 'react';

type Props = { title: string; subtitle?: string; children: ReactNode; className?: string };

export function ChartCard({ title, subtitle, children, className = '' }: Props) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-gray mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
