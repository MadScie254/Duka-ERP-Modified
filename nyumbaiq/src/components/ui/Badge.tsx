import { clsx } from 'clsx';

type BadgeProps = {
  children: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
};

const colors: Record<string, string> = {
  default: 'bg-gray/10 text-gray',
  success: 'bg-green/10 text-green',
  warning: 'bg-amber/10 text-amber',
  danger: 'bg-red/10 text-red',
  info: 'bg-blue/10 text-blue',
};

export function Badge({ children, tone = 'default' }: BadgeProps) {
  return (
    <span className={clsx('inline-block px-2.5 py-0.5 rounded-badge text-xs font-semibold', colors[tone])}>
      {children}
    </span>
  );
}
