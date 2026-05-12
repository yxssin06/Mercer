import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Masthead } from '../components/shared/Masthead';
import { StatusPill } from '../components/shared/StatusPill';
import { usePatientAuth } from '../context/PatientAuthContext';
import { useBookings } from '../context/BookingContext';
import { useToast } from '../context/ToastContext';
import { PHYSICIANS } from '../data/physicians';
import { fmtFull, fmtTime } from '../data/dateUtils';
import { AddToCalendar } from '../components/shared/AddToCalendar';
import { TODAY_MS } from '../data/availability';
import { printAppointmentCard } from '../services/print';

type TabId = 'upcoming' | 'past' | 'cancelled' | 'all';

const TODAY_ISO = new Date(TODAY_MS).toISOString().slice(0, 10);

const TABS: { id: TabId; label: string; empty: string }[] = [
  { id: 'upcoming',  label: 'Upcoming',  empty: 'No upcoming appointments.' },
  { id: 'past',      label: 'Past',      empty: 'No past appointments.' },
  { id: 'cancelled', label: 'Cancelled', empty: 'No cancelled appointments.' },
  { id: 'all',       label: 'All',       empty: 'No appointments on record yet.' },
];

export function PatientDashboardPage() {
  const navigate = useNavigate();
  const { currentPatient, logout } = usePatientAuth();
  const { bookings, updateBooking } = useBookings();
  const { addToast } = useToast();

  const [tab, setTab]               = useState<TabId>('upcoming');
  const [search, setSearch]         = useState('');
  const [openId, setOpenId]         = useState<string | null>(null);
  const [editing, setEditing]       = useState(false);
  const [editReason, setEditReason] = useState('');
  const [editNotes, setEditNotes]   = useState('');

  const myBookings = useMemo(() =>
    bookings.filter(b =>
      b.patient.email.toLowerCase() === (currentPatient?.email ?? '').toLowerCase()
    ),
    [bookings, currentPatient?.email]
  );

  // Tab-filtered + sorted views
  const tabBookings = useMemo(() => {
    const upcoming  = myBookings.filter(b => b.date >= TODAY_ISO && b.status !== 'cancelled')
                                .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    const past      = myBookings.filter(b => b.date < TODAY_ISO)
                                .sort((a, b) => b.date.localeCompare(a.date));
    const cancelled = myBookings.filter(b => b.status === 'cancelled')
                                .sort((a, b) => b.createdAt - a.createdAt);
    const all       = [...myBookings].sort((a, b) => b.createdAt - a.createdAt);
    return { upcoming, past, cancelled, all };
  }, [myBookings]);

  // Search filter on top of tab filter
  const visibleBookings = useMemo(() => {
    const base = tabBookings[tab];
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(b => {
      const physician = PHYSICIANS.find(p => p.id === b.physicianId);
      return (
        (physician?.name.toLowerCase().includes(q) ?? false) ||
        physician?.specialty.toLowerCase().includes(q) ||
        b.reason.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    });
  }, [tabBookings, tab, search]);

  // Tab counts (unfiltered by search)
  const counts = {
    upcoming:  tabBookings.upcoming.length,
    past:      tabBookings.past.length,
    cancelled: tabBookings.cancelled.length,
    all:       tabBookings.all.length,
  };

  // Reset edit state when a different booking is opened
  useEffect(() => {
    setEditing(false);
    if (openId) {
      const b = bookings.find(b => b.id === openId);
      setEditReason(b?.reason ?? '');
      setEditNotes(b?.notes ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  if (!currentPatient) return <Navigate to="/patient" replace />;

  const open      = openId ? myBookings.find(b => b.id === openId) ?? null : null;
  const firstName = currentPatient.name.split(' ')[0];
  const pendingCount   = myBookings.filter(b => b.status === 'pending').length;
  const confirmedCount = myBookings.filter(b => b.status === 'confirmed').length;

  function closeDrawer() { setOpenId(null); setEditing(false); }

  function handleCancel(id: string) {
    updateBooking(id, { status: 'cancelled' });
    addToast('Appointment cancelled.', 'error');
    closeDrawer();
  }

  function handleSaveInfo(id: string) {
    updateBooking(id, { reason: editReason.trim(), notes: editNotes.trim() });
    addToast('Changes saved.');
    setEditing(false);
  }

  function handleAcceptProposal(b: typeof open) {
    if (!b || !b.proposedDate || !b.proposedTime) return;
    updateBooking(b.id, {
      date: b.proposedDate,
      time: b.proposedTime,
      status: 'confirmed',
      proposedDate: undefined,
      proposedTime: undefined,
      calendarVersion: (b.calendarVersion ?? 0) + 1,
    });
    addToast('New time accepted — appointment confirmed.');
    closeDrawer();
  }

  function handleDeclineProposal(b: typeof open) {
    if (!b) return;
    updateBooking(b.id, { status: 'confirmed', proposedDate: undefined, proposedTime: undefined });
    addToast('Proposal declined — original time kept.');
    closeDrawer();
  }

  function handleLogout() { logout(); navigate('/'); }

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ color: 'var(--ink-2)' }}>{currentPatient.name}</span>
            <button className="text-btn" onClick={handleLogout}>Sign out</button>
          </div>
        }
      />

      <div className="pat-dash">
        {/* ── Header ── */}
        <div className="pat-dash-head">
          <div>
            <h2>Hello, <em>{firstName}.</em></h2>
            <p className="pat-dash-sub">
              {myBookings.length === 0
                ? 'No appointments on record yet.'
                : `${myBookings.length} ${myBookings.length === 1 ? 'appointment' : 'appointments'} on record`
                  + (pendingCount > 0   ? ` · ${pendingCount} awaiting review` : '')
                  + (confirmedCount > 0 ? ` · ${confirmedCount} confirmed` : '')
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <button className="text-btn" onClick={() => navigate('/patient/profile')}>Edit profile</button>
            <button className="link-btn" onClick={() => navigate('/book')}>
              Book new appointment <span className="arr">→</span>
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        {myBookings.length > 0 && (
          <div className="dash-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className="dash-tab"
                aria-selected={tab === t.id}
                onClick={() => { setTab(t.id); setSearch(''); }}
              >
                {t.label}
                <span className="dash-tab-count">{counts[t.id]}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Search ── */}
        {myBookings.length > 0 && (
          <div className="dash-search-row">
            <input
              className="dash-search"
              type="search"
              placeholder="Search by physician, specialty, or reason…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="text-btn" onClick={() => setSearch('')}>Clear</button>
            )}
          </div>
        )}

        {/* ── Booking list ── */}
        {myBookings.length === 0 ? (
          <div className="empty-ledger">
            <div className="big">No appointments yet.</div>
            <div>Book your first appointment with Mercer Health.</div>
          </div>
        ) : visibleBookings.length === 0 ? (
          <div className="empty-ledger">
            <div className="big">{search ? 'No results.' : TABS.find(t => t.id === tab)!.empty}</div>
            {search && <div>Try a different search term.</div>}
          </div>
        ) : (
          <div className="pat-booking-list">
            {visibleBookings.map(b => {
              const physician = PHYSICIANS.find(p => p.id === b.physicianId);
              return (
                <div key={b.id} className="pat-booking-card" onClick={() => setOpenId(b.id)}>
                  <div className="pbc-top">
                    <span className="pbc-id">{b.id}</span>
                    <StatusPill status={b.status} />
                  </div>
                  <div className="pbc-body">
                    <div className="pbc-main">
                      <div className="pbc-doc">{physician?.name ?? b.physicianId}</div>
                      <div className="pbc-spec">{physician?.specialty}</div>
                      <div className="pbc-reason">{b.reason}</div>
                    </div>
                    <div className="pbc-when">
                      <div className="pbc-date">{fmtFull(b.date)}</div>
                      <div className="pbc-time">{fmtTime(b.time)} · {b.type}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <div className={'drawer-scrim' + (open ? ' open' : '')} onClick={closeDrawer} />
      <div className={'drawer' + (open ? ' open' : '')}>
        {open && (() => {
          const physician = PHYSICIANS.find(p => p.id === open.physicianId)!;
          const [df, ...dr] = physician.name.replace('Dr. ', '').split(' ');
          const canEdit = open.status !== 'cancelled';

          return (
            <>
              <div className="drawer-head">
                <div>
                  <div className="ref">{open.id}</div>
                  <h3 className="name">Dr. {df} <em>{dr.join(' ')}</em></h3>
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
                  <div className="drawer-notice" style={{ borderLeftColor: 'var(--amber)' }}>
                    Your physician has proposed a new time:{' '}
                    <strong>{fmtFull(open.proposedDate)}</strong> at <strong>{fmtTime(open.proposedTime!)}</strong>.
                    Please accept or decline below.
                  </div>
                )}

                <div className="drawer-block">
                  <span className="k">Physician</span>
                  <span className="v">Dr. {df} <em>{dr.join(' ')}</em></span>
                  <span style={{ color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>{physician.specialty}</span>
                </div>

                <div className="drawer-block">
                  <span className="k">Location</span>
                  <span className="v" style={{ fontSize: 15 }}>
                    {open.type === 'Telehealth' ? 'Video link will be sent to your email' : physician.location}
                  </span>
                </div>

                <AddToCalendar booking={open} physician={physician} />

                <button
                  className="text-btn"
                  style={{ fontSize: 13, alignSelf: 'flex-start' }}
                  onClick={() => printAppointmentCard(open, physician)}
                >
                  Print / save as PDF
                </button>

                <hr />

                {editing ? (
                  <div className="drawer-edit-section">
                    <div className="field">
                      <label>Reason for visit / symptoms</label>
                      <textarea value={editReason} onChange={e => setEditReason(e.target.value)} rows={3} autoFocus />
                    </div>
                    <div className="field">
                      <label>Additional notes</label>
                      <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={3} placeholder="Anything else the care team should know…" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="drawer-block">
                      <span className="k">Reason for visit</span>
                      <span className="v">{open.reason || <em style={{ color: 'var(--muted)' }}>—</em>}</span>
                    </div>
                    {open.notes && (
                      <div className="drawer-block">
                        <span className="k">Notes</span>
                        <span className="v note">{open.notes}</span>
                      </div>
                    )}
                    {canEdit && (
                      <button className="text-btn" style={{ marginTop: 4 }} onClick={() => setEditing(true)}>
                        Edit symptoms &amp; notes
                      </button>
                    )}
                  </>
                )}

                {open.status === 'pending' && !editing && (
                  <div className="drawer-notice">Awaiting review by the care team. You'll receive an email once confirmed.</div>
                )}
                {open.status === 'confirmed' && !editing && (
                  <div className="drawer-notice confirmed">Your appointment is confirmed. See you then.</div>
                )}
                {open.status === 'cancelled' && (
                  <div className="drawer-notice cancelled">This appointment was cancelled.</div>
                )}
              </div>

              <div className="drawer-foot">
                {open.status === 'proposed' ? (
                  <>
                    <button className="text-btn danger" onClick={() => handleDeclineProposal(open)}>Decline</button>
                    <button className="link-btn" onClick={() => handleAcceptProposal(open)}>
                      Accept new time <span className="arr">→</span>
                    </button>
                  </>
                ) : editing ? (
                  <>
                    <button className="text-btn" onClick={() => setEditing(false)}>Discard</button>
                    <button className="link-btn" disabled={!editReason.trim()} onClick={() => handleSaveInfo(open.id)}>
                      Save changes <span className="arr">→</span>
                    </button>
                  </>
                ) : open.status !== 'cancelled' ? (
                  <>
                    <button className="text-btn danger" onClick={() => handleCancel(open.id)}>Cancel appointment</button>
                    <button className="link-btn" onClick={() => { closeDrawer(); navigate(`/patient/reschedule/${open.id}`); }}>
                      Reschedule <span className="arr">→</span>
                    </button>
                  </>
                ) : (
                  <button className="link-btn" onClick={() => { closeDrawer(); navigate('/book'); }}>
                    Book a new appointment <span className="arr">→</span>
                  </button>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
