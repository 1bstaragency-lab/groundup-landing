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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(sessionToUser(session));
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(sessionToUser(session));
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, saveProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
