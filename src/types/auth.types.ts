export interface AuthUser {
  id: string;
  email: string;
  artistName?: string;
  genre?: string;
  bio?: string;
  tone?: ArtistTone;
  onboardingComplete?: boolean;
}

export type ArtistTone =
  | 'Professional'
  | 'Conversational'
  | 'Direct'
  | 'Analytical'
  | 'Strategic';

export interface ArtistProfile {
  user_id: string;
  artist_name: string;
  genre: string;
  bio: string;
  tone: ArtistTone;
  onboarding_complete: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  artistName: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  profile: ArtistProfile | null;
  loading: boolean;
  emailJustConfirmed: boolean;
  clearEmailConfirmed: () => void;
  signUp: (credentials: SignUpCredentials) => Promise<{ error: string | null }>;
  signIn: (credentials: SignInCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  saveProfile: (profile: Omit<ArtistProfile, 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}
