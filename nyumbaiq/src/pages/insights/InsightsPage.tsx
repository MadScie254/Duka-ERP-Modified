import { useEffect, useCallback, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import type { AIInsight } from '../../lib/types';
import { Shell } from '../../components/layout/Shell';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ChartCard } from '../../components/ui/ChartCard';
import { formatDate } from '../../lib/formatters';
import { CHART_COLORS, PIE_PALETTE } from '../../lib/chartColors';
import { Sparkles, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const severityTone = (s: string) => {
  if (s === 'info') return 'info' as const;
  if (s === 'warning') return 'warning' as const;
  if (s === 'critical') return 'danger' as const;
  return 'success' as const; // opportunity
};

const typeLabel: Record<string, string> = {
  vacancy: 'Vacancy',
  revenue: 'Revenue',
  risk: 'Risk',
  market: 'Market',
  maintenance: 'Maintenance',
  forecast: 'Forecast',
};

export function InsightsPage() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role ?? 'landlord';
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('generated_for', profile.id)
      .order('created_at', { ascending: false });
    setInsights((data ?? []) as AIInsight[]);
    setLoading(false);
  }, [profile]);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  /* ── Derived chart data ── */
  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach((i) => { map[typeLabel[i.insight_type] ?? i.insight_type] = (map[typeLabel[i.insight_type] ?? i.insight_type] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [insights]);

  const sevData = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach((i) => { map[i.severity] = (map[i.severity] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [insights]);

  const sevColor: Record<string, string> = { info: CHART_COLORS.blue, warning: CHART_COLORS.amber, critical: CHART_COLORS.red, opportunity: CHART_COLORS.green };

  const generateInsights = async () => {
    setGenerating(true);
    try {
      await supabase.functions.invoke('generate-insights', { body: { user_id: profile?.id } });
      await fetchInsights();
    } catch {
      // Edge function may not be deployed yet
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Shell title="AI Insights" role={role}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray">{insights.length} insight{insights.length !== 1 ? 's' : ''}</p>
        <button
          className="btn flex items-center gap-2"
          onClick={generateInsights}
          disabled={generating}
        >
          <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generating...' : 'Generate New'}
        </button>
      </div>

      {loading ? (
        <div className="card p-6 text-center text-gray">Loading...</div>
      ) : insights.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={40} />}
          title="No insights yet"
          description="Click 'Generate New' to get AI-powered insights about your portfolio."
          action={<button className="btn" onClick={generateInsights}>Generate Insights</button>}
        />
      ) : (
        <>
          {/* ── Insight distribution charts ── */}
          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <ChartCard title="By Category" subtitle="Insight topic distribution">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={typeData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Insights" fill={CHART_COLORS.blue} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="By Severity" subtitle="How urgent are the insights">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={sevData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={3} label={({ name, value }) => `${name} (${value})`}>
                    {sevData.map((entry, i) => (
                      <Cell key={i} fill={sevColor[entry.name] ?? PIE_PALETTE[i % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Insight cards ── */}
          <div className="space-y-4">
            {insights.map((i) => (
            <div key={i.id} className="card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue" />
                  <span className="text-xs font-medium text-gray">{typeLabel[i.insight_type] ?? i.insight_type}</span>
                </div>
                <Badge tone={severityTone(i.severity)}>{i.severity}</Badge>
              </div>
              <h3 className="font-semibold">{i.title}</h3>
              <p className="text-sm text-gray whitespace-pre-line">{i.body}</p>
              <p className="text-xs text-gray/60">{formatDate(i.created_at)}</p>
            </div>
          ))}
          </div>
        </>
      )}
    </Shell>
  );
}
