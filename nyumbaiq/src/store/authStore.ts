import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export type UserRole = 'admin' | 'landlord' | 'agent' | 'tenant';

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  county: string | null;
  national_id: string | null;
  is_active: boolean;
};

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (s: Session | null) => void;
  setProfile: (p: Profile | null) => void;
  setLoading: (l: boolean) => void;
  loadProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// DEV BYPASS: fake admin profile so you can see the dashboard without logging in
const DEV_BYPASS = true;
const devProfile: Profile = {
  id: 'dev-user',
  full_name: 'Dev Admin',
  email: 'dev@nyumbaiq.test',
  phone: '+254700000000',
  role: 'admin',
  avatar_url: null,
  county: 'Nairobi',
  national_id: null,
  is_active: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: DEV_BYPASS ? devProfile : null,
  loading: DEV_BYPASS ? false : true,
  setSession: (s) => set({ session: s }),
  setProfile: (p) => set({ profile: p }),
  setLoading: (l) => set({ loading: l }),
  loadProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Unable to fetch profile', error.message);
      return;
    }
    set({ profile: data as Profile });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));
