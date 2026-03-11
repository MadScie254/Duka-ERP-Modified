import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mockSupabase';

// DEV_BYPASS must match the flag in authStore.ts
const DEV_BYPASS = true;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!DEV_BYPASS && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Supabase environment variables are missing. Check .env.local.');
}

const realClient = DEV_BYPASS
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = (DEV_BYPASS ? mockSupabase : realClient) as any;
