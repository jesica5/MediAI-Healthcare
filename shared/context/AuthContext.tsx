'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { firebaseAuth } from '../services/firebaseClient';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  setPatientSessionToken: (token: string) => void;
  patientSessionToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('Anonymous Patient');
  const [token, setToken] = useState<string | null>(null);
  const [patientSessionToken, setPatientSessionTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Determine user role from email pattern
  const resolveRoleFromEmail = (email?: string | null): UserRole => {
    if (!email) return 'Anonymous Patient';
    const emailLower = email.toLowerCase();
    if (emailLower.includes('doctor') || emailLower.includes('doc')) {
      return 'Attending Doctor';
    }
    if (emailLower.includes('admin') || emailLower.includes('sysadmin')) {
      return 'System Administrator';
    }
    return 'Triage Nurse';
  };

  useEffect(() => {
    // Check saved local patient intake session token
    const savedToken = localStorage.getItem('mediai_patient_token');
    if (savedToken) {
      setPatientSessionTokenState(savedToken);
    }

    // Subscribe to Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const idToken = await fbUser.getIdToken();
        const userRole = resolveRoleFromEmail(fbUser.email);
        setUser({
          id: fbUser.uid,
          email: fbUser.email || '',
          role: userRole,
          fullName: fbUser.displayName || fbUser.email?.split('@')[0].toUpperCase(),
        });
        setRole(userRole);
        setToken(idToken);
      } else {
        // If not signed into Firebase staff auth, maintain existing local state or reset
        setUser((prev) => (prev?.id.startsWith('usr_') ? prev : null));
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setPatientSessionToken = (t: string) => {
    setPatientSessionTokenState(t);
    localStorage.setItem('mediai_patient_token', t);
  };

  const signIn = async (email: string, password: string) => {
    try {
      // 1. Call server authentication API route
      const res = await fetch('/api/v1/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const envelope = await res.json();

      if (envelope.error) {
        return { success: false, error: envelope.error.message };
      }

      // 2. Client-side Firebase Auth sign-in attempt (optional fallback for client state)
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } catch {
        // Firebase client sign-in fallback handled via API session
      }

      if (envelope.data?.user) {
        setUser(envelope.data.user);
        setRole(envelope.data.user.role);
        setToken(envelope.data.token || 'firebase_id_token_' + Date.now());
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Network or authentication error.' };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/v1/auth/signout', { method: 'POST' });
      await firebaseSignOut(firebaseAuth);
    } catch {
      // Ignore errors on signout
    } finally {
      setUser(null);
      setRole('Anonymous Patient');
      setToken(null);
      localStorage.removeItem('mediai_patient_token');
      setPatientSessionTokenState(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isLoading,
        signIn,
        signOut,
        setPatientSessionToken,
        patientSessionToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
