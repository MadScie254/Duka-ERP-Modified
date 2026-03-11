type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
};

const toneMap = {
  default: 'bg-white',
  success: 'bg-green/10 border border-green/30 text-green-900',
  warning: 'bg-amber/10 border border-amber/30 text-amber-900',
  danger: 'bg-red/10 border border-red/30 text-red-900',
};

export function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
  return (
    <div className={`card ${toneMap[tone]} p-4`}>
      <p className="text-xs uppercase tracking-wide text-gray">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {hint && <p className="text-sm text-gray mt-1">{hint}</p>}
    </div>
  );
}
