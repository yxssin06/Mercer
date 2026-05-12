import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface Ctx {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<Ctx | null>(null);
let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++nextId;
    setToasts(t => [...t, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, exiting: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 300);
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}${t.exiting ? ' toast-exit' : ''}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
