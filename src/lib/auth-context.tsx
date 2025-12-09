'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  data: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  data: null,
  status: 'loading',
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!mounted || isInitialized) return;
    
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setSession({ user: data.user });
          setStatus('authenticated');
        } else {
          setSession(null);
          setStatus('unauthenticated');
        }
      } else {
        setSession(null);
        setStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Auth session fetch error:', error);
      setSession(null);
      setStatus('unauthenticated');
    } finally {
      setIsInitialized(true);
    }
  }, [mounted, isInitialized]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isInitialized) {
      fetchSession();
    }
  }, [mounted, isInitialized, fetchSession]);

  const refresh = useCallback(async () => {
    setIsInitialized(false);
    await fetchSession();
  }, [fetchSession]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div style={{ display: 'none' }} />;
  }

  return (
    <AuthContext.Provider value={{ data: session, status, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
}