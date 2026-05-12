import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Booking } from '../types';
import { seedBookings, TODAY_MS } from '../data/availability';

const STORAGE_KEY = 'mh_bookings';

function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Booking[];
  } catch {}
  return seedBookings(TODAY_MS);
}

interface State { bookings: Booking[]; }
type Action =
  | { type: 'ADD'; booking: Booking }
  | { type: 'UPDATE'; id: string; patch: Partial<Booking> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD':    return { bookings: [...state.bookings, action.booking] };
    case 'UPDATE': return { bookings: state.bookings.map(b => b.id === action.id ? { ...b, ...action.patch } : b) };
    default:       return state;
  }
}

interface Ctx {
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
}

const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({ bookings: loadBookings() }));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bookings));
  }, [state.bookings]);

  return (
    <BookingContext.Provider value={{
      bookings: state.bookings,
      addBooking: (booking) => dispatch({ type: 'ADD', booking }),
      updateBooking: (id, patch) => dispatch({ type: 'UPDATE', id, patch }),
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookings must be inside BookingProvider');
  return ctx;
}
