import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  phone: string;
  display_name: string | null;
  avatar_url: string | null;
  balance: number;
  total_income: number;
  daily_revenue: number;
  monthly_revenue: number;
  total_profit: number;
  total_withdrawals: number;
  work_deposit: number;
  vip_level: string;
  referral_code: string;
  checkin_streak?: number;
  last_checkin?: string | null;
  is_admin: boolean;
  is_banned: boolean;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      logout: () => {
        set({ user: null, profile: null });
        localStorage.removeItem('vipearner-auth');
        supabase.auth.signOut().catch(() => {});
      },
    }),
    { name: 'vipearner-auth' }
  )
);
