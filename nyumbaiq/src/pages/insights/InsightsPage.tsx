import { useEffect, useCallback, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import type { AIInsight } from '../../lib/types';
import { Shell } from '../../components/layout/Shell';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/formatters';
import { Sparkles, RefreshCw } from 'lucide-react';

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
      )}
    </Shell>
  );
}
