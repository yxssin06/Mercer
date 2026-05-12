import { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Masthead } from '../components/shared/Masthead';
import { StatusPill } from '../components/shared/StatusPill';
import { usePhysicianAuth } from '../context/PhysicianAuthContext';
import { useBookings } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { fmtFull, fmtTime, fmtDate, relativeDay } from '../data/dateUtils';
import { sendStatusUpdate } from '../services/email';
import { PHYSICIANS } from '../data/physicians';
import { TODAY_MS } from '../data/availability';
import type { BookingStatus } from '../types';

type TabId = 'pending' | 'confirmed' | 'cancelled' | 'all';

const TODAY_ISO = new Date(TODAY_MS).toISOString().slice(0, 10);

const TIME_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
];

const TABS: { id: TabId; label: string }[] = [
  { id: 'pending',   label: 'Awaiting review' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'all',       label: 'All' },
  { id: 'cancelled', label: 'Cancelled' },
];

export function PhysicianDashboardPage() {
  const navigate = useNavigate();
  const { currentPhysician, logout } = usePhysicianAuth();
  const { bookings, updateBooking } = useBookings();
  const { addToast } = useToast();

  const [tab, setTab]         = useState<TabId>('pending');
  const [openId, setOpenId]   = useState<string | null>(null);
  const [proposing, setProposing] = useState(false);
  const [propDate, setPropDate]   = useState('');
  const [propTime, setPropTime]   = useState('09:00');

  if (!currentPhysician) return <Navigate to="/physician/login" replace />;

  const myBookings = useMemo(() =>
    bookings.filter(b => b.physicianId === currentPhysician.id),
    [bookings, currentPhysician.id]
  );

  const tabBookings = useMemo(() => {
    const byDateTime = (a: typeof myBookings[0], b: typeof myBookings[0]) =>
      a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    return {
      pending:   myBookings.filter(b => b.status === 'pending').sort(byDateTime),
      confirmed: myBookings.filter(b => b.status === 'confirmed' || b.status === 'proposed').sort(byDateTime),
      cancelled: myBookings.filter(b => b.status === 'cancelled').sort((a, b) => b.date.localeCompare(a.date)),
      all:       [...myBookings].sort((a, b) => b.createdAt - a.createdAt),
    };
  }, [myBookings]);

  const counts = {
    pending:   tabBookings.pending.length,
    confirmed: tabBookings.confirmed.length,
    cancelled: tabBookings.cancelled.length,
    all:       tabBookings.all.length,
  };

  const todayCount = myBookings.filter(b => b.date === TODAY_ISO && b.status !== 'cancelled').length;
  const visibleBookings = tabBookings[tab];

  const grouped = useMemo(() => {
    const map = new Map<string, typeof visibleBookings>();
    for (const b of visibleBookings) {
      if (!map.has(b.date)) map.set(b.date, []);
      map.get(b.date)!.push(b);
    }
    return Array.from(map.entries());
  }, [visibleBookings]);

  const open = openId ? myBookings.find(b => b.id === openId) ?? null : null;

  function closeDrawer() { setOpenId(null); setProposing(false); setPropDate(''); }

  function handleUpdate(id: string, patch: { status: BookingStatus; proposedDate?: string; proposedTime?: string }) {
    updateBooking(id, patch);
    const booking = bookings.find(b => b.id === id);
    const phys = booking ? PHYSICIANS.find(p => p.id === booking.physicianId) : null;
    if (booking && phys && (patch.status === 'confirmed' || patch.status === 'cancelled')) {
      sendStatusUpdate(booking, phys, patch.status).catch(() => {});
    }
    if (patch.status === 'confirmed') addToast('Appointment confirmed.');
    if (patch.status === 'cancelled') addToast('Appointment cancelled.', 'error');
    closeDrawer();
  }

  function handlePropose() {
    if (!openId || !propDate) return;
    updateBooking(openId, { status: 'proposed', proposedDate: propDate, proposedTime: propTime });
    addToast('New time proposed — awaiting patient response.', 'info');
    closeDrawer();
  }

  function handleLogout() { logout(); navigate('/'); }

  const [df, ...dr] = currentPhysician.name.replace('Dr. ', '').split(' ');

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ color: 'var(--ink-2)' }}>Dr. {df} {dr.join(' ')}</span>
            <button className="text-btn" onClick={handleLogout}>Sign out</button>
          </div>
        }
      />

      <div className="ph-dash">
        {/* ── Header ── */}
        <div className="ph-dash-head">
          <div>
            <h2>Dr. {df} <em>{dr.join(' ')}</em></h2>
            <p className="ph-dash-sub">{currentPhysician.specialty} · {currentPhysician.location}</p>
          </div>
          <div className="ph-stat-strip">
            <div className="ph-stat">
              <span className="k">Today</span>
              <span className="v">{todayCount}</span>
              <span className="d">{todayCount === 1 ? 'visit' : 'visits'}</span>
            </div>
            <div className="ph-stat">
              <span className="k">Pending</span>
              <span className={'v' + (counts.pending > 0 ? ' warn' : '')}>{counts.pending}</span>
              <span className="d">need action</span>
            </div>
            <div className="ph-stat">
              <span className="k">Confirmed</span>
              <span className="v">{counts.confirmed}</span>
              <span className="d">upcoming</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="dash-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className="dash-tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span className="dash-tab-count">{counts[t.id]}</span>
            </button>
          ))}
        </div>

        {/* ── Booking list ── */}
        {visibleBookings.length === 0 ? (
          <div className="empty-ledger">
            <div className="big">All clear.</div>
            <div>No appointments in this category.</div>
          </div>
        ) : (
          <div className="ph-booking-list">
            {grouped.map(([date, items]) => (
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
                    onClick={() => { setOpenId(b.id); setProposing(false); }}
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
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <div className={'drawer-scrim' + (open ? ' open' : '')} onClick={closeDrawer} />
      <div className={'drawer' + (open ? ' open' : '')}>
        {open && (() => {
          return (
            <>
              <div className="drawer-head">
                <div>
                  <div className="ref">{open.id}</div>
                  <h3 className="name">{open.patient.name}</h3>
                </div>
                <button className="close-x" onClick={closeDrawer}>×</button>
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

                {open.status === 'proposed' && open.proposedDate && (
                  <div className="drawer-notice">
                    New time proposed: <strong>{fmtFull(open.proposedDate)}</strong> at <strong>{fmtTime(open.proposedTime!)}</strong>. Awaiting patient confirmation.
                  </div>
                )}

                <div className="drawer-block">
                  <span className="k">Reason for visit</span>
                  <span className="v">{open.reason || '—'}</span>
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

                {proposing && (
                  <div className="propose-section">
                    <div className="small-caps" style={{ marginBottom: 16 }}>Propose new time</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div className="field">
                        <label>New date</label>
                        <input
                          type="date"
                          value={propDate}
                          min={TODAY_ISO}
                          max="9999-12-31"
                          onChange={e => {
                            const [y, ...rest] = e.target.value.split('-');
                            setPropDate(y.length > 4 ? [y.slice(0, 4), ...rest].join('-') : e.target.value);
                          }}
                        />
                      </div>
                      <div className="field">
                        <label>New time</label>
                        <select value={propTime} onChange={e => setPropTime(e.target.value)}>
                          {TIME_SLOTS.map(t => (
                            <option key={t} value={t}>{fmtTime(t)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="drawer-foot">
                {proposing ? (
                  <>
                    <button className="text-btn" onClick={() => setProposing(false)}>Discard</button>
                    <button
                      className="link-btn"
                      disabled={!propDate}
                      onClick={handlePropose}
                    >
                      Send proposal <span className="arr">→</span>
                    </button>
                  </>
                ) : (
                  <>
                    {open.status === 'pending' && (
                      <>
                        <button className="text-btn danger" onClick={() => handleUpdate(open.id, { status: 'cancelled' })}>Decline</button>
                        <button className="text-btn" onClick={() => setProposing(true)}>Propose new time</button>
                        <button className="link-btn" onClick={() => handleUpdate(open.id, { status: 'confirmed' })}>
                          Confirm <span className="arr">→</span>
                        </button>
                      </>
                    )}
                    {open.status === 'confirmed' && (
                      <>
                        <button className="text-btn danger" onClick={() => handleUpdate(open.id, { status: 'cancelled' })}>Cancel</button>
                        <button className="text-btn" onClick={() => setProposing(true)}>Propose new time</button>
                      </>
                    )}
                    {open.status === 'proposed' && (
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>Awaiting patient response.</span>
                    )}
                    {open.status === 'cancelled' && (
                      <button className="text-btn" onClick={() => handleUpdate(open.id, { status: 'pending' })}>Reopen request</button>
                    )}
                  </>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
