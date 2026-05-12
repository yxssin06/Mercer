import type { BookingStatus } from '../../types';

const LABELS: Record<BookingStatus, string> = {
  pending: 'pending review',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  proposed: 'new time proposed',
};

export function StatusPill({ status }: { status: BookingStatus }) {
  return <span className={`status ${status}`}>{LABELS[status]}</span>;
}
