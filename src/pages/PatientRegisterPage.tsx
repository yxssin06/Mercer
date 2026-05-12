import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Masthead } from '../components/shared/Masthead';
import { usePatientAuth } from '../context/PatientAuthContext';

export function PatientRegisterPage() {
  const navigate = useNavigate();
  const { register, currentPatient } = usePatientAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (currentPatient) return <Navigate to="/patient/dashboard" replace />;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const err = register(name, email, password);
    if (err) { setError(err); return; }
    navigate('/patient/dashboard');
  }

  return (
    <div className="app">
      <Masthead onHome={() => navigate('/')} right={null} />
      <div className="signin">
        <button className="text-btn signin-back" onClick={() => navigate('/patient')}>← Back</button>
        <h2>Create <em>account.</em></h2>
        <p className="sub">Join Mercer Health to track and manage your appointments.</p>
        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Jane Doe"
              autoFocus
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="jane@example.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            {error && <span className="error">{error}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="text-btn" onClick={() => navigate('/patient/signin')}>
              Already have an account?
            </button>
            <button type="submit" className="link-btn">
              Create account <span className="arr">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
