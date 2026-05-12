import type { Booking, Physician } from '../types';

function icsStamp(dateIso: string, timeStr: string): string {
  return dateIso.replace(/-/g, '') + 'T' + timeStr.replace(':', '') + '00';
}

function icsStampPlus30(dateIso: string, timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const end = h * 60 + m + 30;
  const eh  = Math.floor(end / 60);
  const em  = end % 60;
  return dateIso.replace(/-/g, '') + 'T' + String(eh).padStart(2, '0') + String(em).padStart(2, '0') + '00';
}

function locationFor(booking: Booking, physician: Physician): string {
  return booking.type === 'Telehealth'
    ? 'Telehealth — video link sent to your email'
    : physician.location;
}

export function buildIcsString(booking: Booking, physician: Physician): string {
  const start    = icsStamp(booking.date, booking.time);
  const end      = icsStampPlus30(booking.date, booking.time);
  const sequence = booking.calendarVersion ?? 0;
  const desc     = `Reason: ${booking.reason}\\nReference: ${booking.id}\\nPhysician: ${physician.name}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mercer Health//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${booking.id}@mercer.health`,
    `SEQUENCE:${sequence}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Appointment with ${physician.name}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${locationFor(booking, physician)}`,
    'STATUS:TENTATIVE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// METHOD:CANCEL with a higher SEQUENCE tells Apple Calendar / Outlook to delete the event.
export function buildCancelIcsString(booking: Booking, physician: Physician): string {
  const start    = icsStamp(booking.date, booking.time);
  const sequence = (booking.calendarVersion ?? 0) + 1;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mercer Health//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:${booking.id}@mercer.health`,
    `SEQUENCE:${sequence}`,
    `DTSTART:${start}`,
    `SUMMARY:Appointment with ${physician.name}`,
    'STATUS:CANCELLED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function googleCalendarUrl(booking: Booking, physician: Physician): string {
  const start   = icsStamp(booking.date, booking.time);
  const end     = icsStampPlus30(booking.date, booking.time);
  const details = `Reason for visit: ${booking.reason}\nReference: ${booking.id}\nPhysician: ${physician.name}`;

  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     `Appointment with ${physician.name}`,
    dates:    `${start}/${end}`,
    details,
    location: locationFor(booking, physician),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
