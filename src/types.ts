export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'proposed';
export type AppointmentType = 'In-person' | 'Telehealth';

export interface Physician {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  bio: string;
  location: string;
  nextOpen: string;
  rating: string;
  visits: string;
  tone: number; // oklch hue for avatar tinting
  languages: string[];
  education: string;
}

export interface Slot {
  time: string;   // "09:00"
  taken: boolean;
  period: 'morning' | 'afternoon';
}

export interface Day {
  iso: string;
  ts: number;
  slots: Slot[];
}

export interface PatientInfo {
  name: string;
  email: string;
  phone: string;
  dob: string;
  insurance: string;
}

export interface Booking {
  id: string;
  physicianId: string;
  patient: PatientInfo;
  reason: string;
  notes: string;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: number;
  type: AppointmentType;
  calendarVersion?: number; // incremented on reschedule; used as iCal SEQUENCE
  proposedDate?: string;   // set when physician proposes a new time
  proposedTime?: string;
}

export interface PatientAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: number;
  phone?: string;
  dob?: string;
  insurance?: string;
}
