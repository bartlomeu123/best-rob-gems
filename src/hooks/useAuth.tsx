import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const getPreferredProfileValues = (authUser: User) => {
    const metadata = (authUser.user_metadata ?? {}) as Record<string, unknown>;

    const usernameCandidates = [
      metadata.username,
      metadata.full_name,
      metadata.name,
      authUser.email?.split('@')[0],
    ]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);

    const avatarCandidates = [metadata.avatar_url, metadata.picture]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);

    return {
      username: usernameCandidates[0] ?? `user_${authUser.id.slice(0, 8)}`,
      avatar_url: avatarCandidates[0] ?? null,
    };
  };

  const fetchProfile = async (authUser: User) => {
    const preferred = getPreferredProfileValues(authUser);

    // Upsert profile: insert if missing, update placeholder names/avatars
    const { data: upsertedProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id: authUser.id,
          username: preferred.username,
          avatar_url: preferred.avatar_url,
        },
        { onConflict: 'user_id', ignoreDuplicates: false }
      )
      .select('*')
      .maybeSingle();

    let nextProfile = upsertedProfile;

    if (upsertError) {
      console.error('Profile upsert failed:', upsertError.message);
      // Fallback: just fetch existing profile
      const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();
      nextProfile = existing;
    }

    if (nextProfile) {
      const hasPlaceholderName =
        nextProfile.username.toLowerCase() === 'me' || nextProfile.username.startsWith('user_');
      const needsAvatarSync = !nextProfile.avatar_url && !!preferred.avatar_url;

      if (hasPlaceholderName || needsAvatarSync) {
        const { data: updatedProfile } = await supabase
          .from('profiles')
          .update({
            username: hasPlaceholderName ? preferred.username : nextProfile.username,
            avatar_url: nextProfile.avatar_url || preferred.avatar_url,
          })
          .eq('user_id', authUser.id)
          .select('*')
          .maybeSingle();
        if (updatedProfile) nextProfile = updatedProfile;
      }
    }

    setProfile(nextProfile ?? null);

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id);

    setIsAdmin(roles?.some(r => r.role === 'admin') ?? false);
  };

  useEffect(() => {
    // Set up the listener FIRST so it catches all events including INITIAL_SESSION
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid blocking the auth state change callback
          setTimeout(() => {
            void fetchProfile(session.user);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    // Then get the current session (may already be processed by main.tsx bootstrap)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('getSession error (stale token?):', error.message);
        supabase.auth.signOut();
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        void fetchProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
