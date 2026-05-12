# Mercer Health — Appointment Booking System

An editorial-design patient booking web app built with React, TypeScript, and Vite. Three distinct portals — patients, physicians, and staff — backed by localStorage for zero-setup persistence.

**[Live demo →](https://mercer-gules.vercel.app)**

---

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (default: `http://localhost:5173`).

**Demo credentials**

| Portal | URL | Credentials |
|---|---|---|
| Patient | `/patient/register` | Create any account |
| Physician | `/physician/login` | `drmoreno@mercer.health` / `mercer2026` |
| Staff / Admin | `/admin/login` | Any `@mercer.health` email + any password ≥ 4 chars |

Other physicians: `drchen`, `drpatel`, `drkwon`, `drsilva`, `dradeyemi` — all `@mercer.health` with `mercer2026`.

---

## What I built

**Mercer Health** is a full-featured appointment booking system styled like an editorial magazine — warm paper palette, serif typography (Newsreader), and clean grid layouts.

### Patient portal
- Register / sign in with localStorage-persisted accounts
- Browse physicians and view full bio pages
- Book appointments: choose physician → pick date and time slot → choose in-person or telehealth → confirm
- Patient dashboard with upcoming / past / cancelled / all tabs, real-time search, and an inline detail drawer
- Accept or decline physician-proposed reschedules
- Edit visit reason and notes after booking
- Profile page (name, phone, DOB, insurance)
- Print / save appointment card as PDF

### Physician portal
- Per-physician login (`drmoreno@mercer.health`, etc.)
- Dashboard with tab-filtered schedule grouped by day
- Confirm, decline, or cancel patient requests
- Propose a new time for a patient to accept or decline
- Inline drawer with full booking details

### Staff / admin portal
- Full cross-physician overview of all bookings
- Confirm, cancel, or reopen any appointment
- Filter by physician and status

### Shared
- Light / dark mode with a pill toggle (persisted to localStorage)
- Toast notification system with enter/exit animations
- iCalendar download (`Add to calendar`) that stays in sync when appointments are rescheduled
- Deterministic availability grid seeded from physician ID (no backend needed)
- 404 catch-all redirects to home

---

## Key technical and product decisions

**localStorage + useReducer instead of a backend**
The app is a portfolio sample. Using localStorage with a `useReducer`-powered context keeps the architecture clean and real — the same patterns (optimistic updates, derived views, serialised state) transfer directly to a real API layer with minimal changes.

**Three separate auth contexts**
`AuthContext` (admin), `PatientAuthContext`, and `PhysicianAuthContext` are intentionally separate rather than one unified auth system. Each portal has different session semantics (admin is ephemeral, patients use sessionStorage, physicians are in-memory) and the separation keeps each context small and easy to reason about.

**`'proposed'` booking status**
Rather than a separate negotiation table, proposed reschedules are encoded directly on the booking (`proposedDate`, `proposedTime`, `status: 'proposed'`). This keeps the data model flat and the UI straightforward — the patient dashboard notices the proposed status and renders an accept/decline prompt.

**Deterministic availability without a calendar service**
`makeAvailability(physicianId, todayMs)` generates a reproducible 14-day slot grid using a seeded pseudo-random function keyed to the physician's ID. Demo data always looks realistic without a real scheduling backend.

**Editorial design as a differentiator**
Most booking UIs default to dashboard-grey with blue buttons. The warm paper palette, narrow grid, and Newsreader serifs make the product feel considered — which is the point of including it in a portfolio.

---

## What I would improve with more time

1. **Real backend** — swap localStorage for Supabase (Postgres + Row Level Security) or a similar BaaS. The context layer is already structured to make this a near-mechanical substitution. Patient accounts, bookings, and physician profiles would all live in the database with proper auth tokens instead of sessionStorage.

2. **Email notifications** — the package.json already includes `@emailjs/browser`. I would wire up transactional emails for booking confirmation, status changes (confirmed / declined / proposed), and appointment reminders via a scheduled job.

3. **Real calendar integration** — replace the `.ics` file download with Google Calendar / Outlook OAuth so appointments sync directly rather than requiring a manual import step.

4. **Admin analytics view** — a simple chart (bookings per physician, status breakdown, weekly volume) would make the staff portal meaningfully more useful without much additional complexity.

5. **Accessibility audit** — the drawer, tabs, and booking flow need proper focus management, ARIA roles, and keyboard navigation tested end-to-end with a screen reader.

6. **Mobile layout** — the grid is readable on tablet but the physician dashboard and booking flow need dedicated mobile breakpoints.

7. **Test coverage** — unit tests for the booking reducer and availability generator; integration tests for the booking flow using React Testing Library.
