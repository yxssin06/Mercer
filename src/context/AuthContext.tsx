import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Ctx {
  isAdmin: boolean;
  login: (email: string, password: string) => string | null; // returns error string or null
  logout: () => void;
}

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  function login(email: string, password: string): string | null {
    if (!email.trim() || !password.trim()) return 'Please enter your email and password.';
    if (!/@mercer\.health$/i.test(email.trim()) && email.trim().toLowerCase() !== 'demo') {
      return 'Staff sign-in requires a @mercer.health email.';
    }
    if (password.length < 4) return 'Password is too short.';
    setIsAdmin(true);
    return null;
  }

  function logout() { setIsAdmin(false); }

  return <AuthContext.Provider value={{ isAdmin, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
