import { useEffect, useState } from 'react';
import type { Booking, Physician } from '../../types';
import { googleCalendarUrl, buildIcsString, buildCancelIcsString } from '../../services/calendar';

interface Props {
  booking: Booking;
  physician: Physician;
}

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

export function AddToCalendar({ booking, physician }: Props) {
  const [icsUrl, setIcsUrl] = useState('');

  const isCancelled = booking.status === 'cancelled';
  const version     = booking.calendarVersion ?? 0;
  const isUpdated   = !isCancelled && version > 0;

  useEffect(() => {
    const str  = isCancelled ? buildCancelIcsString(booking, physician) : buildIcsString(booking, physician);
    const blob = new Blob([str], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    setIcsUrl(url);
    return () => URL.revokeObjectURL(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id, booking.date, booking.time, booking.physicianId, booking.type, booking.status, version]);

  const filename = isCancelled ? `cancel-${booking.id}.ics` : `appointment-${booking.id}.ics`;
  const appleLabel = isIOS
    ? (isCancelled ? 'Remove from Apple Calendar ↗' : isUpdated ? 'Update Apple Calendar ↗' : 'Apple Calendar ↗')
    : (isCancelled ? 'Apple / Outlook (.ics) ↓' : isUpdated ? 'Update Apple / Outlook (.ics) ↓' : 'Apple / Outlook (.ics) ↓');

  // ── Cancelled: remove from calendar ─────────────────────────────────────────
  if (isCancelled) {
    return (
      <div className="cal-section cal-cancel">
        <span className="small-caps">Remove from calendar</span>
        <div className="cal-btns">
          <a
            href={icsUrl || '#'}
            download={isIOS ? undefined : filename}
            className="cal-btn"
          >
            {appleLabel}
          </a>
          <span className="cal-sep">·</span>
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="cal-btn"
          >
            Open Google Calendar ↗
          </a>
        </div>
        <p className="cal-note">
          {isIOS
            ? 'Tap above to remove the event from Apple Calendar. For Google Calendar, delete it manually.'
            : 'Import the .ics to remove the event from Apple Calendar / Outlook. For Google Calendar, delete it manually.'}
        </p>
      </div>
    );
  }

  // ── Rescheduled: update existing calendar event ──────────────────────────────
  if (isUpdated) {
    return (
      <div className="cal-section cal-update">
        <span className="small-caps">Calendar update available</span>
        <div className="cal-btns">
          <a
            href={icsUrl || '#'}
            download={isIOS ? undefined : filename}
            className="cal-btn"
          >
            {appleLabel}
          </a>
          <span className="cal-sep">·</span>
          <a
            href={googleCalendarUrl(booking, physician)}
            target="_blank"
            rel="noopener noreferrer"
            className="cal-btn"
          >
            Update Google Calendar ↗
          </a>
        </div>
        <p className="cal-note">
          {isIOS
            ? 'Tap above — Apple Calendar will update the existing event automatically.'
            : 'Import the .ics to update the existing event in Apple Calendar / Outlook. For Google Calendar, the link adds a new event — remove the old one manually.'}
        </p>
      </div>
    );
  }

  // ── Default: save new event ──────────────────────────────────────────────────
  return (
    <div className="cal-section">
      <span className="small-caps">Save to calendar</span>
      <div className="cal-btns">
        <a
          href={googleCalendarUrl(booking, physician)}
          target="_blank"
          rel="noopener noreferrer"
          className="cal-btn"
        >
          Google Calendar ↗
        </a>
        <span className="cal-sep">·</span>
        <a
          href={icsUrl || '#'}
          download={isIOS ? undefined : filename}
          className="cal-btn"
        >
          {appleLabel}
        </a>
      </div>
    </div>
  );
}
