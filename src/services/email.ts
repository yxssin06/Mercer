import emailjs from '@emailjs/browser';
import type { Booking, BookingStatus, Physician } from '../types';
import { fmtFull, fmtTime } from '../data/dateUtils';

// ─────────────────────────────────────────────────────────────────────────────
// EmailJS config — fill these in after signing up at https://www.emailjs.com
//
// 1. Create a free account at emailjs.com
// 2. Add a service (Gmail / Outlook / etc.) → copy the Service ID
// 3. Create two templates (see template variable names below) → copy Template IDs
// 4. Copy your Public Key from Account → API Keys
// 5. Add to a .env file in the project root:
//
//   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
//   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
//   VITE_EMAILJS_TEMPLATE_BOOKING=template_xxxxxxx
//   VITE_EMAILJS_TEMPLATE_STATUS=template_xxxxxxx
//
// Template variables expected:
//
//   Booking template (VITE_EMAILJS_TEMPLATE_BOOKING):
//     {{to_email}}        {{patient_name}}   {{booking_id}}
//     {{physician_name}}  {{specialty}}      {{date}}
//     {{time}}            {{type}}           {{location}}  {{reason}}
//
//   Status template (VITE_EMAILJS_TEMPLATE_STATUS):
//     {{to_email}}        {{patient_name}}   {{booking_id}}
//     {{physician_name}}  {{status_label}}   {{date}}
//     {{time}}            {{location}}
// ─────────────────────────────────────────────────────────────────────────────

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string | undefined;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string | undefined;
const TPL_BOOKING = import.meta.env.VITE_EMAILJS_TEMPLATE_BOOKING as string | undefined;
const TPL_STATUS  = import.meta.env.VITE_EMAILJS_TEMPLATE_STATUS  as string | undefined;

const CONFIGURED = !!(SERVICE_ID && PUBLIC_KEY && TPL_BOOKING && TPL_STATUS);

if (CONFIGURED) {
  emailjs.init({ publicKey: PUBLIC_KEY! });
}

function location(booking: Booking, physician: Physician): string {
  return booking.type === 'Telehealth' ? 'Video link will be sent to your email' : physician.location;
}

export async function sendBookingConfirmation(booking: Booking, physician: Physician): Promise<void> {
  if (!CONFIGURED) {
    console.warn('[email] EmailJS not configured — skipping booking confirmation email.');
    return;
  }
  await emailjs.send(SERVICE_ID!, TPL_BOOKING!, {
    to_email:       booking.patient.email,
    patient_name:   booking.patient.name.split(' ')[0],
    booking_id:     booking.id,
    physician_name: physician.name,
    specialty:      physician.specialty,
    date:           fmtFull(booking.date),
    time:           fmtTime(booking.time),
    type:           booking.type,
    location:       location(booking, physician),
    reason:         booking.reason,
  });
}

export async function sendStatusUpdate(
  booking: Booking,
  physician: Physician,
  newStatus: Extract<BookingStatus, 'confirmed' | 'cancelled'>,
): Promise<void> {
  if (!CONFIGURED) {
    console.warn('[email] EmailJS not configured — skipping status update email.');
    return;
  }
  const statusLabel = newStatus === 'confirmed' ? 'confirmed' : 'declined';
  await emailjs.send(SERVICE_ID!, TPL_STATUS!, {
    to_email:       booking.patient.email,
    patient_name:   booking.patient.name.split(' ')[0],
    booking_id:     booking.id,
    physician_name: physician.name,
    status_label:   statusLabel,
    date:           fmtFull(booking.date),
    time:           fmtTime(booking.time),
    location:       location(booking, physician),
  });
}
