import { kenyaCounties } from '../../lib/counties';

type CountySelectProps = {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
};

export function CountySelect({ value, onChange, required }: CountySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      aria-label="County"
      className="w-full border border-border rounded-button px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue/40 bg-white"
    >
      <option value="">Select county</option>
      {kenyaCounties.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  );
}
