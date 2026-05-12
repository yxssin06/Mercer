import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { PatientAccount } from '../types';

const STORAGE_KEY = 'mh_patients';
const SESSION_KEY = 'mh_patient_session';

interface Ctx {
  currentPatient: PatientAccount | null;
  register: (name: string, email: string, password: string) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  updateAccount: (patch: Partial<Pick<PatientAccount, 'name' | 'phone' | 'dob' | 'insurance'>>) => void;
}

const PatientAuthContext = createContext<Ctx | null>(null);

function loadAccounts(): PatientAccount[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<PatientAccount[]>(loadAccounts);
  const [currentPatient, setCurrentPatient] = useState<PatientAccount | null>(() => {
    try {
      const id = sessionStorage.getItem(SESSION_KEY);
      if (!id) return null;
      return loadAccounts().find(a => a.id === id) ?? null;
    } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentPatient) sessionStorage.setItem(SESSION_KEY, currentPatient.id);
    else sessionStorage.removeItem(SESSION_KEY);
  }, [currentPatient]);

  function register(name: string, email: string, password: string): string | null {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) return 'Please enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (accounts.some(a => a.email.toLowerCase() === email.trim().toLowerCase()))
      return 'An account with this email already exists.';
    const account: PatientAccount = {
      id: 'PT-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      createdAt: Date.now(),
    };
    setAccounts(prev => [...prev, account]);
    setCurrentPatient(account);
    return null;
  }

  function login(email: string, password: string): string | null {
    if (!email.trim() || !password) return 'Please enter your email and password.';
    const account = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!account) return 'No account found with this email.';
    if (account.password !== password) return 'Incorrect password.';
    setCurrentPatient(account);
    return null;
  }

  function logout() { setCurrentPatient(null); }

  function updateAccount(patch: Partial<Pick<PatientAccount, 'name' | 'phone' | 'dob' | 'insurance'>>) {
    if (!currentPatient) return;
    const updated = { ...currentPatient, ...patch };
    setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
    setCurrentPatient(updated);
  }

  return (
    <PatientAuthContext.Provider value={{ currentPatient, register, login, logout, updateAccount }}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const ctx = useContext(PatientAuthContext);
  if (!ctx) throw new Error('usePatientAuth must be inside PatientAuthProvider');
  return ctx;
}
