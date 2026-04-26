import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only initialize if we have valid-looking credentials
const isConfigured = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 10;

if (!isConfigured) {
  console.warn('Supabase credentials missing or invalid. App will run in offline mode.');
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { 
      from: () => ({ 
        select: () => Promise.resolve({ count: 0, error: null }),
        insert: () => Promise.resolve({ error: new Error('Supabase not configured') })
      }) 
    } as any;
