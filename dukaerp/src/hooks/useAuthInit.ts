import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

/**
 * Initialises auth on app mount:
 * 1. Recovers the existing Supabase session (if any).
 * 2. Subscribes to onAuthStateChange so sign-in / sign-out
 *    events update the Zustand store automatically.
 * 3. Loads profile + shops whenever a session is present.
 *
 * Returns `ready` – the router should wait until this is `true`
 * before rendering protected pages.
 */
export function useAuthInit() {
  const {
    setSession,
    setUser,
    setProfile,
    setActiveShop,
    setShops,
    clearAuth,
    activeShop,
  } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUserData(userId: string) {
      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (profile && mounted) setProfile(profile);

      // Load shops
      const { data: shops } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", userId);
      if (shops && shops.length > 0 && mounted) {
        setShops(shops);
        // Only set activeShop if not already set (persist may have kept one)
        if (!useAuthStore.getState().activeShop) {
          setActiveShop(shops[0]);
        }
      }
    }

    // 1. Recover existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        setSession(session);
        setUser(session.user);
        loadUserData(session.user.id).finally(() => {
          if (mounted) setReady(true);
        });
      } else {
        setReady(true);
      }
    });

    // 2. Listen for future auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setSession(session);
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        clearAuth();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ready };
}
