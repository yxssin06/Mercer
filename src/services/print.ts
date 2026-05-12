import type { Booking, Physician } from '../types';
import { fmtFull, fmtTime } from '../data/dateUtils';

export function printAppointmentCard(booking: Booking, physician: Physician) {
  const location = booking.type === 'Telehealth'
    ? 'Video link will be sent to your email'
    : physician.location;

  const statusLabel: Record<string, string> = {
    pending: 'Awaiting confirmation',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    proposed: 'New time proposed',
  };

  const win = window.open('', '_blank', 'width=680,height=900');
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Appointment ${booking.id} — Mercer Health</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;1,400&family=Newsreader:ital,wght@0,400;1,400&family=JetBrains+Mono:wght@400&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter Tight', sans-serif;
      background: #f4efe6;
      color: #1a1a1a;
      padding: 56px 64px;
      font-size: 14px;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    .wordmark {
      font-family: 'Inter Tight', sans-serif;
      font-size: 28px;
      font-weight: 500;
      letter-spacing: -0.025em;
      margin-bottom: 4px;
    }
    .wordmark .amp { color: #5a6a3a; }
    .head-meta { font-size: 11px; color: #7a7670; letter-spacing: 0.08em; text-transform: uppercase; }
    .divider { border: 0; border-top: 1px solid #1a1a1a; margin: 24px 0; }
    .divider-light { border: 0; border-top: 1px solid #cfc8b9; margin: 20px 0; }
    .ref {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #7a7670;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .appt-date {
      font-family: 'Newsreader', serif;
      font-size: 42px;
      letter-spacing: -0.02em;
      line-height: 1;
      margin-bottom: 6px;
    }
    .appt-time {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #7a7670;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px; margin-top: 28px; }
    .field-k { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #7a7670; margin-bottom: 3px; }
    .field-v { font-size: 16px; }
    .field-v.serif { font-family: 'Newsreader', serif; font-size: 22px; letter-spacing: -0.01em; }
    .field-v em { color: #5a6a3a; font-style: normal; }
    .status-pill {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; color: #b58a2b;
    }
    .status-pill::before {
      content: ''; width: 6px; height: 6px; border-radius: 50%;
      background: currentColor; display: inline-block;
    }
    .status-confirmed { color: #5a6a3a; }
    .notice {
      margin-top: 32px;
      padding: 12px 16px;
      border-left: 2px solid #cfc8b9;
      font-size: 13px;
      color: #7a7670;
      line-height: 1.6;
    }
    .foot {
      margin-top: 48px;
      padding-top: 20px;
      border-top: 1px solid #cfc8b9;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #7a7670;
      letter-spacing: 0.06em;
    }
    @media print {
      body { background: white; padding: 32px 40px; }
    }
  </style>
</head>
<body>
  <div class="wordmark">Mercer <span class="amp">&amp;</span> Health</div>
  <div class="head-meta">Appointment summary · Printed ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>

  <hr class="divider" />

  <div class="ref">${booking.id}</div>
  <div class="appt-date">${fmtFull(booking.date)}</div>
  <div class="appt-time">${fmtTime(booking.time)} &nbsp;·&nbsp; ${booking.type}</div>

  <div class="grid">
    <div>
      <div class="field-k">Physician</div>
      <div class="field-v serif">${physician.name.replace('Dr. ', 'Dr. <em>').replace(/(\w+)$/, '$1</em>')}</div>
      <div style="color:#7a7670;font-size:13px;margin-top:3px">${physician.specialty}</div>
    </div>
    <div>
      <div class="field-k">Patient</div>
      <div class="field-v" style="font-size:18px">${booking.patient.name}</div>
      <div style="color:#7a7670;font-size:13px;margin-top:3px">${booking.patient.email}</div>
    </div>
    <div>
      <div class="field-k">Location</div>
      <div class="field-v" style="font-size:15px">${location}</div>
    </div>
    <div>
      <div class="field-k">Status</div>
      <div class="status-pill ${booking.status === 'confirmed' ? 'status-confirmed' : ''}">${statusLabel[booking.status] ?? booking.status}</div>
    </div>
    ${booking.reason ? `
    <div style="grid-column:1/-1">
      <div class="field-k">Reason for visit</div>
      <div class="field-v" style="font-size:15px">${booking.reason}</div>
    </div>` : ''}
    ${booking.patient.insurance ? `
    <div>
      <div class="field-k">Insurance</div>
      <div class="field-v" style="font-size:15px">${booking.patient.insurance}</div>
    </div>` : ''}
    ${booking.patient.phone ? `
    <div>
      <div class="field-k">Phone</div>
      <div class="field-v" style="font-family:'JetBrains Mono',monospace;font-size:13px">${booking.patient.phone}</div>
    </div>` : ''}
  </div>

  <div class="notice">
    Please bring a valid photo ID and your insurance card. Arrive 10 minutes early for in-person visits.
    For telehealth appointments, a video link will be emailed before your appointment time.
  </div>

  <div class="foot">
    <span>MERCER &amp; HEALTH · EST. 1962</span>
    <span>In case of emergency, dial 911</span>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`);
  win.document.close();
}
