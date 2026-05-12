import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Masthead } from '../components/shared/Masthead';
import { usePatientAuth } from '../context/PatientAuthContext';

export function PatientSignInPage() {
  const navigate = useNavigate();
  const { login, currentPatient } = usePatientAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (currentPatient) return <Navigate to="/patient/dashboard" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const err = login(email, password);
    if (err) { setError(err); return; }
    navigate('/patient/dashboard');
  }

  return (
    <div className="app">
      <Masthead onHome={() => navigate('/')} right={null} />
      <div className="signin">
        <button className="text-btn signin-back" onClick={() => navigate('/patient')}>← Back</button>
        <h2>Patient <em>sign-in.</em></h2>
        <p className="sub">Welcome back. Sign in to your Mercer Health account.</p>
        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="jane@example.com"
              autoFocus
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Your password"
              autoComplete="current-password"
            />
            {error && <span className="error">{error}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="text-btn" onClick={() => navigate('/patient/register')}>
              Create an account
            </button>
            <button type="submit" className="link-btn">
              Sign in <span className="arr">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
