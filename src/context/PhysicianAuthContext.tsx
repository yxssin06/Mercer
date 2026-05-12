import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { PHYSICIANS } from '../data/physicians';
import type { Physician } from '../types';

const PASSWORD = 'mercer2026';

interface Ctx {
  currentPhysician: Physician | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
}

const PhysicianAuthContext = createContext<Ctx | null>(null);

export function PhysicianAuthProvider({ children }: { children: ReactNode }) {
  const [currentPhysician, setCurrentPhysician] = useState<Physician | null>(null);

  function login(email: string, password: string): string | null {
    if (!email.trim() || !password.trim()) return 'Please enter your credentials.';
    if (password !== PASSWORD) return 'Incorrect password.';
    const id = email.trim().toLowerCase().replace(/@mercer\.health$/, '');
    const physician = PHYSICIANS.find(p => p.id === id);
    if (!physician) return 'No physician account found for this email.';
    setCurrentPhysician(physician);
    return null;
  }

  function logout() { setCurrentPhysician(null); }

  return (
    <PhysicianAuthContext.Provider value={{ currentPhysician, login, logout }}>
      {children}
    </PhysicianAuthContext.Provider>
  );
}

export function usePhysicianAuth() {
  const ctx = useContext(PhysicianAuthContext);
  if (!ctx) throw new Error('usePhysicianAuth must be inside PhysicianAuthProvider');
  return ctx;
}
