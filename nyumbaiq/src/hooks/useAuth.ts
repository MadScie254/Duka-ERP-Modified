import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';

export type { Profile } from '../store/authStore';

export function useAuth() {
  const { session, profile, loading, setSession, setProfile, setLoading, loadProfile } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [setSession, setProfile, setLoading, loadProfile]);

  return { session, profile, loading };
}
