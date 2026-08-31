import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project') &&
  !supabaseAnonKey.includes('your_supabase_anon_key')
);

if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.warn('[Supabase Client] Failed to initialize Supabase client:', err.message);
  }
}

/**
 * Initiates Supabase Google OAuth Sign-In
 */
export async function signInWithSupabaseGoogle() {
  if (!supabase) {
    throw new Error(
      'Supabase Google Auth is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your frontend environment variables.'
    );
  }

  const redirectUrl = `${window.location.origin}/dashboard`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get current Supabase session
 */
export async function getSupabaseSession() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

/**
 * Sign out of Supabase
 */
export async function signOutSupabase() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[Supabase Client] Sign out error:', err.message);
  }
}

export { supabase, isConfigured as isSupabaseConfigured };
