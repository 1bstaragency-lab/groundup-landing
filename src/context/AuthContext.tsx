import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type {
  AuthContextValue,
  AuthUser,
  ArtistProfile,
  SignUpCredentials,
  SignInCredentials,
} from '../types/auth.types';

const AuthContext = createContext<AuthContextValue | null>(null);

function isEmailConfirmationUrl(): boolean {
  const hash   = window.location.hash;
  const search = window.location.search;
  return (
    hash.includes('type=signup') ||
    hash.includes('type=email') ||
    search.includes('type=signup') ||
    search.includes('type=email') ||
    // PKCE flow: code param present on first load (before exchange)
    (search.includes('code=') && !sessionStorage.getItem('gu_code_consumed'))
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,               setUser]               = useState<AuthUser | null>(null);
  const [profile,            setProfile]            = useState<ArtistProfile | null>(null);
  const [loading,            setLoading]            = useState(true);
  const [emailJustConfirmed, setEmailJustConfirmed] = useState(false);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('artist_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (!error && data) setProfile(data as ArtistProfile);
  }

  function sessionToUser(session: Session): AuthUser {
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      artistName: session.user.user_metadata?.artist_name,
    };
  }

  useEffect(() => {
    // Mark PKCE code as consumed so we only fire the banner once
    if (window.location.search.includes('code=')) {
      sessionStorage.setItem('gu_code_consumed', '1');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(sessionToUser(session));
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(sessionToUser(session));
        fetchProfile(session.user.id);

        // Detect email confirmation: fires on SIGNED_IN when the URL
        // carries confirmation tokens (implicit) or the PKCE code
        if (event === 'SIGNED_IN' && isEmailConfirmationUrl()) {
          setEmailJustConfirmed(true);
          // Clean up URL so refreshes don't re-trigger
          window.history.replaceState(null, '', window.location.pathname);
          sessionStorage.removeItem('gu_code_consumed');
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function clearEmailConfirmed() {
    setEmailJustConfirmed(false);
  }

  async function signUp({ email, password, artistName }: SignUpCredentials) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { artist_name: artistName } },
    });

    if (error) return { error: error.message };

    if (data.user) {
      await supabase.from('waitlist').insert([{
        email,
        artist_name: artistName,
        platform: 'groundupapp',
      }]).maybeSingle();

      // Track referral if user landed via ?ref=
      try {
        const refCode = localStorage.getItem('gup_ref_code');
        if (refCode) {
          await fetch('/.netlify/functions/track-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referredUserId: data.user.id, referralCode: refCode }),
          }).catch(() => {});
          localStorage.removeItem('gup_ref_code');
        }
      } catch { /* noop */ }
    }

    return { error: null };
  }

  async function signIn({ email, password }: SignInCredentials) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function resetPasswordForEmail(email: string) {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error ? error.message : null };
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? error.message : null };
  }

  async function resendVerificationEmail(email: string) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    return { error: error ? error.message : null };
  }

  async function saveProfile(
    profileData: Omit<ArtistProfile, 'user_id' | 'created_at' | 'updated_at'>
  ) {
    if (!user) return { error: 'Not authenticated' };

    const row: ArtistProfile = { ...profileData, user_id: user.id };

    const { error } = await supabase
      .from('artist_preferences')
      .upsert(row, { onConflict: 'user_id' });

    if (!error) {
      setProfile(row);
      setUser(prev => prev
        ? { ...prev, artistName: profileData.artist_name, tone: profileData.tone }
        : prev
      );
    }

    return { error: error ? error.message : null };
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      emailJustConfirmed, clearEmailConfirmed,
      signUp, signIn, signOut, saveProfile, refreshProfile,
      resetPasswordForEmail, updatePassword, resendVerificationEmail,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
