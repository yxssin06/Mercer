import type { Booking, PatientInfo } from '../../types';
import { PHYSICIANS } from '../../data/physicians';
import { fmtFull, fmtTime } from '../../data/dateUtils';
import { AddToCalendar } from '../shared/AddToCalendar';

interface Props {
  booking: Booking;
  patient: PatientInfo;
  reason: string;
  onAnother: () => void;
  onHome: () => void;
  onDashboard?: () => void;
}

export function ConfirmStep({ booking, patient, reason, onAnother, onHome, onDashboard }: Props) {
  const physician = PHYSICIANS.find(p => p.id === booking.physicianId)!;
  const [first, ...rest] = physician.name.replace('Dr. ', '').split(' ');
  const firstName = patient.name.split(' ')[0] || 'there';

  return (
    <div className="confirm">
      <p className="pre">— Request received</p>
      <h1>Thank you, <em>{firstName}</em>.</h1>
      <p>
        We've sent a confirmation to <em style={{ color: 'var(--ink)' }}>{patient.email}</em>.
        The care team will review your request and confirm within one business day.
      </p>

      <div className="confirm-meta">
        <div className="summary-line">
          <span className="k">Reference</span>
          <span className="v mono">{booking.id}</span>
        </div>
        <div className="summary-line">
          <span className="k">Status</span>
          <span className="v"><span className="status pending">awaiting review</span></span>
        </div>
        <div className="summary-line">
          <span className="k">Physician</span>
          <span className="v">Dr. {first} <em>{rest.join(' ')}</em></span>
        </div>
        <div className="summary-line">
          <span className="k">When</span>
          <span className="v">{fmtFull(booking.date)}</span>
          <span className="v mono" style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            {fmtTime(booking.time)} · {booking.type}
          </span>
        </div>
        <div className="summary-line">
          <span className="k">Reason</span>
          <span className="v" style={{ fontSize: 16 }}>{reason}</span>
        </div>
      </div>

      <AddToCalendar booking={booking} physician={physician} />

      <div className="stage-nav" style={{ marginTop: 48 }}>
        <button className="text-btn" onClick={onHome}>← Back to home</button>
        {onDashboard ? (
          <button className="link-btn" onClick={onDashboard}>
            View my appointments <span className="arr">→</span>
          </button>
        ) : (
          <button className="link-btn" onClick={onAnother}>
            Book another visit <span className="arr">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
