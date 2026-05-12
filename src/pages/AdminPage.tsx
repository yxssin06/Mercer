import { useNavigate } from 'react-router-dom';
import { AdminView } from '../components/admin/AdminView';
import { useBookings } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { Masthead } from '../components/shared/Masthead';

export function AdminPage() {
  const { bookings, updateBooking } = useBookings();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const pending = bookings.filter(b => b.status === 'pending').length;

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={
          <span style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {pending > 0 && (
              <span className="status pending">{pending} pending</span>
            )}
            <span className="masthead-tag" style={{ color: 'var(--muted)', fontSize: 12 }}>Signed in as Staff</span>
            <button className="text-btn" onClick={handleLogout}>Sign out</button>
          </span>
        }
      />

      <AdminView bookings={bookings} onUpdate={updateBooking} />
    </div>
  );
}
