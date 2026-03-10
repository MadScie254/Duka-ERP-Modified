import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session, User } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Shop = Database["public"]["Tables"]["shops"]["Row"];

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  activeShop: Shop | null;
  shops: Shop[];
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setActiveShop: (shop: Shop | null) => void;
  setShops: (shops: Shop[]) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      profile: null,
      activeShop: null,
      shops: [],
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setProfile: (profile) => set({ profile }),
      setActiveShop: (activeShop) => set({ activeShop }),
      setShops: (shops) => set({ shops }),
      clearAuth: () => set({ user: null, session: null, profile: null, activeShop: null, shops: [] }),
    }),
    { name: "duka-auth" }
  )
);
