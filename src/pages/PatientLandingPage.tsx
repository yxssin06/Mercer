import { useNavigate, Navigate } from 'react-router-dom';
import { Masthead } from '../components/shared/Masthead';
import { usePatientAuth } from '../context/PatientAuthContext';

export function PatientLandingPage() {
  const navigate = useNavigate();
  const { currentPatient } = usePatientAuth();

  if (currentPatient) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={<button className="text-btn" onClick={() => navigate('/')}>← Back to home</button>}
      />

      <div className="landing">
        <div className="landing-hero">
          <h1 className="display">
            Your care,<br /><em>your record.</em>
          </h1>
          <div className="landing-meta">
            <p>Create an account to track bookings and manage your care — or continue without one.</p>
          </div>
        </div>

        <div className="pat-opts">
          <button className="pat-opt" onClick={() => navigate('/patient/register')}>
            <span className="pat-opt-num">i.</span>
            <h3>Create account</h3>
            <p>Set up a patient account to track booking statuses, view past appointments, and request new ones.</p>
            <span className="pat-opt-arrow">→</span>
          </button>

          <button className="pat-opt" onClick={() => navigate('/patient/signin')}>
            <span className="pat-opt-num">ii.</span>
            <h3>Sign in</h3>
            <p>Already have an account? Sign in to see your bookings and manage your care.</p>
            <span className="pat-opt-arrow">→</span>
          </button>

          <button className="pat-opt" onClick={() => navigate('/book')}>
            <span className="pat-opt-num">iii.</span>
            <h3>Continue as guest</h3>
            <p>No account required. Book an appointment directly without creating a profile.</p>
            <span className="pat-opt-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
