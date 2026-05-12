import { useState, useMemo } from 'react';
import type { Booking, BookingStatus } from '../../types';
import { StatusPill } from '../shared/StatusPill';
import { PHYSICIANS } from '../../data/physicians';
import { TODAY_MS } from '../../data/availability';
import { fmtTime, fmtDate, fmtFull, relativeDay } from '../../data/dateUtils';
import { sendStatusUpdate } from '../../services/email';
import { useToast } from '../../context/ToastContext';

interface Props {
  bookings: Booking[];
  onUpdate: (id: string, patch: { status: BookingStatus }) => void;
}

const TODAY_STR = new Date(TODAY_MS).toLocaleDateString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric',
});

export function AdminView({ bookings, onUpdate }: Props) {
  const [physicianId, setPhysicianId] = useState('drmoreno');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const { addToast } = useToast();

  const physician = PHYSICIANS.find(p => p.id === physicianId)!;
  const [pfirst, ...prest] = physician.name.replace('Dr. ', '').split(' ');

  const myBookings = useMemo(() =>
    bookings
      .filter(b => b.physicianId === physicianId)
      .filter(b => statusFilter === 'all' || b.status === statusFilter)
      .sort((a, b) => (a.date + ' ' + a.time).localeCompare(b.date + ' ' + b.time)),
    [bookings, physicianId, statusFilter]
  );

  const counts = useMemo(() => {
    const mine = bookings.filter(b => b.physicianId === physicianId);
    const todayIso = new Date(TODAY_MS).toISOString().slice(0, 10);
    return {
      all:       mine.length,
      pending:   mine.filter(b => b.status === 'pending').length,
      confirmed: mine.filter(b => b.status === 'confirmed').length,
      cancelled: mine.filter(b => b.status === 'cancelled').length,
      today:     mine.filter(b => b.date === todayIso && b.status !== 'cancelled').length,
    };
  }, [bookings, physicianId]);

  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of myBookings) {
      if (!map.has(b.date)) map.set(b.date, []);
      map.get(b.date)!.push(b);
    }
    return Array.from(map.entries());
  }, [myBookings]);

  const open = openId ? bookings.find(b => b.id === openId) : null;

  function handleUpdate(id: string, patch: { status: BookingStatus }) {
    onUpdate(id, patch);
    if (patch.status === 'confirmed' || patch.status === 'cancelled') {
      const booking = bookings.find(b => b.id === id);
      const physician = booking ? PHYSICIANS.find(p => p.id === booking.physicianId) : null;
      if (booking && physician) {
        sendStatusUpdate(booking, physician, patch.status).catch(() => {});
      }
    }
    if (patch.status === 'confirmed') addToast('Appointment confirmed.');
    if (patch.status === 'cancelled') addToast('Appointment cancelled.', 'error');
    if (patch.status === 'pending') addToast('Request reopened.', 'info');
  }

  return (
    <div className="ledger">
      {/* ── Aside ── */}
      <aside className="ledger-aside">
        <div className="ledger-aside-block">
          <span className="small-caps">Physicians</span>
          {PHYSICIANS.map(p => {
            const n = bookings.filter(b => b.physicianId === p.id && b.status !== 'cancelled').length;
            const [f, ...r] = p.name.replace('Dr. ', '').split(' ');
            return (
              <button
                key={p.id}
                className="doc-pick"
                aria-selected={physicianId === p.id}
                onClick={() => { setPhysicianId(p.id); setOpenId(null); }}
              >
                <div>
                  <div className="dp-name">Dr. {f} <em>{r.join(' ')}</em></div>
                  <div className="dp-spec">{p.specialty}</div>
                </div>
                <div className="dp-num">{n}</div>
              </button>
            );
          })}
        </div>

        <div className="ledger-aside-block">
          <span className="small-caps">Filter by status</span>
          {([
            { id: 'all',       label: 'All requests' },
            { id: 'pending',   label: 'Pending review' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'cancelled', label: 'Cancelled' },
          ] as const).map(s => (
            <button
              key={s.id}
              className="status-pick"
              aria-selected={statusFilter === s.id}
              onClick={() => setStatusFilter(s.id)}
            >
              <span>{s.label}</span>
              <span className="sp-num">{counts[s.id]}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main ledger ── */}
      <main className="ledger-main">
        <div className="ledger-head">
          <div>
            <h2>Dr. {pfirst} <em>{prest.join(' ')}</em></h2>
            <p className="ledger-sub">{physician.specialty} — {physician.location}</p>
          </div>
          <div className="today">
            Today<br />
            <b>{TODAY_STR}</b>
          </div>
        </div>

        <div className="stat-strip">
          <div className="stat-cell">
            <span className="k">Today</span>
            <span className="v">{counts.today}</span>
            <span className="d">{counts.today === 1 ? 'visit scheduled' : 'visits scheduled'}</span>
          </div>
          <div className="stat-cell">
            <span className="k">Awaiting review</span>
            <span className={'v' + (counts.pending > 0 ? ' warn' : '')}>{counts.pending}</span>
            <span className="d">requests need action</span>
          </div>
          <div className="stat-cell">
            <span className="k">Confirmed</span>
            <span className="v">{counts.confirmed}</span>
            <span className="d">across the next 14 days</span>
          </div>
          <div className="stat-cell">
            <span className="k">Cancelled</span>
            <span className="v">{counts.cancelled}</span>
            <span className="d">last 30 days</span>
          </div>
        </div>

        {grouped.length === 0 ? (
          <div className="empty-ledger">
            <div className="big">Nothing here.</div>
            <div>Try a different filter.</div>
          </div>
        ) : (
          grouped.map(([date, items]) => (
            <div key={date}>
              <div className="day-divider">
                <div className="dd-date">
                  {fmtDate(date, { weekday: 'long' })},{' '}
                  <em>{fmtDate(date, { month: 'long', day: 'numeric' })}</em>
                </div>
                <div className="dd-meta">
                  {relativeDay(date, TODAY_MS)} · {items.length} {items.length === 1 ? 'appointment' : 'appointments'}
                </div>
              </div>
              {items.map(b => (
                <div
                  key={b.id}
                  className="booking-line"
                  onClick={() => setOpenId(b.id)}
                >
                  <div className="bl-time">{fmtTime(b.time)}</div>
                  <div className="bl-patient">
                    <span className="pn">{b.patient.name}</span>
                    <span className="pm">{b.id}</span>
                  </div>
                  <div className="bl-reason">{b.reason}</div>
                  <div className="bl-type">{b.type}</div>
                  <div><StatusPill status={b.status} /></div>
                  <div className="bl-actions" onClick={e => e.stopPropagation()}>
                    {b.status === 'pending' && (
                      <>
                        <button className="text-btn" onClick={() => handleUpdate(b.id, { status: 'confirmed' })}>Confirm</button>
                        <button className="text-btn danger" onClick={() => handleUpdate(b.id, { status: 'cancelled' })}>Decline</button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button className="text-btn danger" onClick={() => handleUpdate(b.id, { status: 'cancelled' })}>Cancel</button>
                    )}
                    {b.status === 'cancelled' && (
                      <button className="text-btn" onClick={() => handleUpdate(b.id, { status: 'pending' })}>Reopen</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </main>

      {/* ── Detail drawer ── */}
      <div className={'drawer-scrim' + (open ? ' open' : '')} onClick={() => setOpenId(null)} />
      <div className={'drawer' + (open ? ' open' : '')}>
        {open && (() => {
          const doc = PHYSICIANS.find(p => p.id === open.physicianId)!;
          const [df, ...dr] = doc.name.replace('Dr. ', '').split(' ');
          return (
            <>
              <div className="drawer-head">
                <div>
                  <div className="ref">{open.id}</div>
                  <h3 className="name">{open.patient.name}</h3>
                </div>
                <button className="close-x" onClick={() => setOpenId(null)}>×</button>
              </div>

              <div className="drawer-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <StatusPill status={open.status} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>
                    REQ {new Date(open.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                  </span>
                </div>
                <div className="drawer-block">
                  <span className="k">Appointment</span>
                  <span className="v large">{fmtFull(open.date)}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
                    {fmtTime(open.time)} · {open.type}
                  </span>
                </div>
                <div className="drawer-block">
                  <span className="k">With</span>
                  <span className="v">Dr. {df} <em>{dr.join(' ')}</em></span>
                  <span style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{doc.specialty}</span>
                </div>
                <div className="drawer-block">
                  <span className="k">Reason for visit</span>
                  <span className="v">{open.reason}</span>
                </div>
                {open.notes && (
                  <div className="drawer-block">
                    <span className="k">Patient notes</span>
                    <span className="v note">{open.notes}</span>
                  </div>
                )}
                <hr />
                <div className="drawer-grid">
                  <div className="drawer-block">
                    <span className="k">Email</span>
                    <span className="v" style={{ fontSize: 14 }}>{open.patient.email}</span>
                  </div>
                  <div className="drawer-block">
                    <span className="k">Phone</span>
                    <span className="v" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{open.patient.phone}</span>
                  </div>
                  <div className="drawer-block">
                    <span className="k">Date of birth</span>
                    <span className="v" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{open.patient.dob}</span>
                  </div>
                  <div className="drawer-block">
                    <span className="k">Insurance</span>
                    <span className="v" style={{ fontSize: 14 }}>{open.patient.insurance || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="drawer-foot">
                {open.status === 'pending' && (
                  <>
                    <button className="text-btn danger" onClick={() => handleUpdate(open.id, { status: 'cancelled' })}>Decline</button>
                    <button className="link-btn" onClick={() => handleUpdate(open.id, { status: 'confirmed' })}>
                      Confirm <span className="arr">→</span>
                    </button>
                  </>
                )}
                {open.status === 'confirmed' && (
                  <button className="text-btn danger" onClick={() => handleUpdate(open.id, { status: 'cancelled' })}>Cancel appointment</button>
                )}
                {open.status === 'cancelled' && (
                  <button className="text-btn" onClick={() => handleUpdate(open.id, { status: 'pending' })}>Reopen request</button>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
