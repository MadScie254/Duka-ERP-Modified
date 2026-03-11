/** Shared color palette for recharts, matching tailwind.config.js theme */
export const CHART_COLORS = {
  blue: '#1B4FD8',
  green: '#00A86B',
  amber: '#F59E0B',
  red: '#EF4444',
  navy: '#0A1628',
  purple: '#7C3AED',
  cyan: '#06B6D4',
  pink: '#EC4899',
  lime: '#84CC16',
  slate: '#64748B',
} as const;

export const PIE_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.amber,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.cyan,
  CHART_COLORS.pink,
  CHART_COLORS.lime,
];

export const STATUS_COLORS: Record<string, string> = {
  occupied: CHART_COLORS.green,
  vacant: CHART_COLORS.red,
  reserved: CHART_COLORS.amber,
  under_maintenance: CHART_COLORS.slate,

  confirmed: CHART_COLORS.green,
  partial: CHART_COLORS.amber,
  pending: CHART_COLORS.red,

  open: CHART_COLORS.red,
  in_progress: CHART_COLORS.amber,
  awaiting_parts: CHART_COLORS.purple,
  resolved: CHART_COLORS.green,
  closed: CHART_COLORS.slate,

  low: CHART_COLORS.cyan,
  medium: CHART_COLORS.blue,
  high: CHART_COLORS.amber,
  emergency: CHART_COLORS.red,
};
