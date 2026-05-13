import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 10;

if (!isConfigured) {
  console.warn('Supabase not configured — auth will run in demo mode.');
}

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createClient('https://placeholder.supabase.co', 'placeholder-key-for-dev-mode-only') as SupabaseClient);

export { isConfigured };
