import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/authStore';
import type { Notification } from '../../lib/types';
import { Shell } from '../../components/layout/Shell';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/formatters';
import { Bell, CheckCheck, Circle } from 'lucide-react';

const iconMap: Record<string, string> = {
  rent_due: 'text-amber',
  rent_paid: 'text-green',
  rent_overdue: 'text-red',
  maintenance_update: 'text-blue',
  lease_expiring: 'text-amber',
  new_listing: 'text-blue',
  system_alert: 'text-gray',
};

export function NotificationsPage() {
  const profile = useAuthStore((s) => s.profile);
  const role = profile?.role ?? 'tenant';
  const [notes, setNotes] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    setNotes((data ?? []) as Notification[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [profile?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` }, (payload) => {
        setNotes((prev) => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile.id).eq('is_read', false);
    setNotes((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notes.filter((n) => !n.is_read).length;

  return (
    <Shell title="Notifications" role={role}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray">{unreadCount} unread</p>
        {unreadCount > 0 && (
          <button className="text-sm text-blue hover:underline flex items-center gap-1" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="card p-6 text-center text-gray">Loading...</div>
      ) : notes.length === 0 ? (
        <EmptyState icon={<Bell size={40} />} title="All clear" description="You have no notifications." />
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <button
              key={n.id}
              className={`card w-full text-left p-4 flex items-start gap-3 transition-colors ${n.is_read ? 'opacity-60' : ''}`}
              onClick={() => !n.is_read && markRead(n.id)}
            >
              <Circle size={8} className={`mt-1.5 ${n.is_read ? 'text-transparent' : iconMap[n.type] ?? 'text-blue'}`} fill="currentColor" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray mt-0.5 line-clamp-2">{n.body}</p>
              </div>
              <span className="text-xs text-gray whitespace-nowrap">{formatDate(n.created_at)}</span>
            </button>
          ))}
        </div>
      )}
    </Shell>
  );
}
