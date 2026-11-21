import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// In dev, Vite proxies /functions/v1/* → Supabase to avoid CORS.
// In production builds, the full URL is used directly.
const fnBase = import.meta.env.DEV
  ? '/functions/v1'
  : `${supabaseUrl}/functions/v1`;

export { fnBase, supabaseAnonKey };

export async function callEdgeFunction<T>(
  name: string,
  options?: { method?: string; body?: unknown }
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
  };

  const response = await fetch(`${fnBase}/${name}`, {
    method: options?.method ?? 'GET',
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? 'Request failed');
  }

  return response.json();
}
