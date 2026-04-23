import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo((): AuthContextType => {
    if (!isFirebaseConfigured) {
      return {
        user: null,
        loading: false,
        signIn: async () => {
          throw new Error('Firebase no está configurado');
        },
        signUp: async () => {
          throw new Error('Firebase no está configurado');
        },
        signOut: async () => {},
      };
    }
    return {
      user,
      loading,
      signIn: (email, password) =>
        signInWithEmailAndPassword(getFirebaseAuth(), email, password).then(() => undefined),
      signUp: (email, password) =>
        createUserWithEmailAndPassword(getFirebaseAuth(), email, password).then(() => undefined),
      signOut: () => firebaseSignOut(getFirebaseAuth()),
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
