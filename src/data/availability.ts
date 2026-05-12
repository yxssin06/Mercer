import type { Day, Booking } from '../types';

// Anchor "today" at noon so DST shifts don't flip the day index
export const TODAY_MS = (() => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.getTime();
})();

// Deterministic pseudo-random availability per physician
export function makeAvailability(physicianId: string, todayMs: number): Day[] {
  const days: Day[] = [];
  const seed = physicianId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = (n: number) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };

  for (let i = 0; i < 14; i++) {
    const date = new Date(todayMs + i * 86400000);
    const dow = date.getDay();
    if (dow === 0) continue; // closed Sunday

    const slots: Day['slots'] = [];
    let dayIdx = i * 7;

    for (let h = 9; h < 12; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push({ time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, taken: rand(dayIdx++) < 0.45, period: 'morning' });
      }
    }
    for (let h = 13; h < (dow === 6 ? 14 : 17); h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push({ time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, taken: rand(dayIdx++) < 0.55, period: 'afternoon' });
      }
    }

    days.push({ iso: date.toISOString().slice(0, 10), ts: date.getTime(), slots });
  }
  return days;
}

export function seedBookings(todayMs: number): Booking[] {
  const d = (offset: number) => new Date(todayMs + offset * 86400000).toISOString().slice(0, 10);
  return [
    { id: 'BK-1042', physicianId: 'drmoreno', patient: { name: 'James Whitaker',   email: 'j.whitaker@mail.com', phone: '(415) 555-0184', dob: '1986-07-14', insurance: 'Blue Cross PPO' }, reason: 'Annual checkup',      notes: 'Patient mentioned recurring lower back stiffness.', date: d(0), time: '10:30', status: 'confirmed', createdAt: todayMs - 3 * 86400000, type: 'In-person' },
    { id: 'BK-1043', physicianId: 'drmoreno', patient: { name: 'Priya Ramanathan', email: 'priya.r@mail.com',    phone: '(415) 555-0192', dob: '1992-02-03', insurance: 'Aetna'         }, reason: 'Lab review',          notes: 'Reviewing TSH and iron panel results.', date: d(0), time: '14:00', status: 'pending',   createdAt: todayMs - 1 * 86400000, type: 'Telehealth' },
    { id: 'BK-1044', physicianId: 'drmoreno', patient: { name: 'Devon Park',       email: 'dpark@mail.com',      phone: '(415) 555-0210', dob: '1978-11-22', insurance: 'United'        }, reason: 'Follow-up',          notes: 'Two-week follow-up after starting BP medication.', date: d(1), time: '09:00', status: 'confirmed', createdAt: todayMs - 5 * 86400000, type: 'In-person' },
    { id: 'BK-1045', physicianId: 'drmoreno', patient: { name: 'Hannah Kessler',   email: 'hkessler@mail.com',   phone: '(415) 555-0233', dob: '2001-04-19', insurance: 'Self-pay'      }, reason: 'Prescription refill', notes: '',                                                date: d(1), time: '11:30', status: 'pending',   createdAt: todayMs - 0.5 * 86400000, type: 'Telehealth' },
    { id: 'BK-1046', physicianId: 'drmoreno', patient: { name: 'Alex Rivera',      email: 'alex.r@mail.com',     phone: '(415) 555-0277', dob: '1995-09-30', insurance: 'Cigna'         }, reason: 'New symptom',        notes: 'Persistent cough for 10 days, no fever.',          date: d(2), time: '13:30', status: 'confirmed', createdAt: todayMs - 2 * 86400000, type: 'In-person' },
    { id: 'BK-1041', physicianId: 'drmoreno', patient: { name: 'Ben Tomlin',       email: 'btomlin@mail.com',    phone: '(415) 555-0299', dob: '1969-12-08', insurance: 'Medicare'      }, reason: 'Follow-up',          notes: 'Cancelled by patient — rescheduling.',            date: d(-1), time: '10:00', status: 'cancelled', createdAt: todayMs - 6 * 86400000, type: 'In-person' },
    { id: 'BK-1047', physicianId: 'drmoreno', patient: { name: 'Mira Solis',       email: 'msolis@mail.com',     phone: '(415) 555-0301', dob: '1988-06-01', insurance: 'Blue Cross PPO'}, reason: 'Annual checkup',      notes: '',                                                date: d(4), time: '15:00', status: 'pending',   createdAt: todayMs - 0.2 * 86400000, type: 'In-person' },
  ];
}
