import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Utilisateur = Database['public']['Tables']['utilisateurs']['Row'];

interface AuthContextType {
  user: Utilisateur | null;
  session: Session | null;
  cabinetId: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchUtilisateur(userId: string): Promise<Utilisateur | null> {
  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erreur lors du chargement du profil utilisateur:', error);
    return null;
  }
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [cabinetId, setCabinetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async (currentSession: Session | null) => {
    if (!currentSession?.user) {
      setUser(null);
      setCabinetId(null);
      setSession(null);
      setLoading(false);
      return;
    }

    setSession(currentSession);

    const utilisateur = await fetchUtilisateur(currentSession.user.id);
    if (utilisateur) {
      setUser(utilisateur);
      setCabinetId(utilisateur.cabinet_id);
    } else {
      setUser(null);
      setCabinetId(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Charger la session initiale
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      loadUserProfile(initialSession);
    });

    // Ecouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        loadUserProfile(newSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      if (signInError.message === 'Invalid login credentials') {
        setError('Email ou mot de passe incorrect');
      } else {
        setError('Erreur de connexion. Veuillez reessayer.');
      }
      throw signInError;
    }
    // Le onAuthStateChange se chargera de mettre a jour le state
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError('Erreur lors de la deconnexion');
      throw signOutError;
    }
    setUser(null);
    setSession(null);
    setCabinetId(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (resetError) {
      setError('Erreur lors de l\'envoi du lien de reinitialisation');
      throw resetError;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        cabinetId,
        loading,
        error,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit etre utilise a l\'interieur d\'un AuthProvider');
  }
  return context;
}
