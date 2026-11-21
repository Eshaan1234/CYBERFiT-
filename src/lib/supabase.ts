import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase is the single source of truth for auth + persistence.
 * If env vars are missing we still construct a client against a placeholder so
 * the UI can boot into "offline demo" mode without crashing.
 */
export const supabaseUrl = url || 'https://placeholder.supabase.co';
export const supabaseAnonKey = anonKey || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: { 'x-application-name': 'cybernet-fit' },
  },
});

export const STORAGE_BUCKET = 'progress-photos';
