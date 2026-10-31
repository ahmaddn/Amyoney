import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/services/auth-service';
import { syncLocalToFirebase } from '@/services/sync';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: false,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  continueAsGuest: () => {},
  exitGuestMode: () => {},
});

const GUEST_STORAGE_KEY = 'amyoney_guest_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Periksa apakah sebelumnya memilih sesi tamu
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const guestSaved = window.localStorage.getItem(GUEST_STORAGE_KEY);
        if (guestSaved === 'true') {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setIsGuest(true);
        }
      }
    } catch {
      // Storage fallback
    }

    const unsubscribe = authService.subscribeAuth(async (u) => {
      setUser(u);
      if (u) {
        // Jika berhasil login dan sebelumnya tamu -> sinkronkan data lokal ke cloud!
        setIsGuest(false);
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(GUEST_STORAGE_KEY);
          }
        } catch {
          // ignore
        }
        await syncLocalToFirebase();
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const continueAsGuest = () => {
    setIsGuest(true);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(GUEST_STORAGE_KEY, 'true');
      }
    } catch {
      // ignore
    }
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(GUEST_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const signOut = async () => {
    exitGuestMode();
    await authService.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        loading,
        signInWithGoogle,
        signOut,
        continueAsGuest,
        exitGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
