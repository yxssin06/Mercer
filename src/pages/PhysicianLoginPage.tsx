import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhysicianAuth } from '../context/PhysicianAuthContext';
import { Masthead } from '../components/shared/Masthead';

export function PhysicianLoginPage() {
  const { login } = usePhysicianAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 600));
    const err = login(email, password);
    setLoading(false);
    if (!err) {
      navigate('/physician/dashboard', { replace: true });
    } else {
      setError(err);
    }
  }

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={<span className="masthead-tag">Physician portal</span>}
      />

      <div className="signin">
        <div className="signin-back">
          <button className="text-btn" onClick={() => navigate('/')}>← Back to home</button>
        </div>
        <h2>Physician <em>portal</em>.</h2>
        <p className="sub">Sign in with your Mercer Health credentials to manage your schedule and patient appointments.</p>

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="ph-email">Physician email</label>
            <input
              id="ph-email"
              type="email"
              autoComplete="email"
              placeholder="drmoreno@mercer.health"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
          </div>
          <div className="field">
            <label htmlFor="ph-pw">Password</label>
            <input
              id="ph-pw"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
          </div>
          {error && <span style={{ color: 'var(--terracotta)', fontSize: 13 }}>{error}</span>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" className="link-btn" disabled={loading}>
              {loading ? 'Signing in…' : <><span>Sign in</span><span className="arr">→</span></>}
            </button>
          </div>
          <p className="hint">
            <b style={{ color: 'var(--ink-2)' }}>Demo:</b> use <code>drmoreno@mercer.health</code>,{' '}
            <code>drchen@mercer.health</code>, <code>drokafor@mercer.health</code>, etc.
            with password <code>mercer2026</code>.
          </p>
        </form>
      </div>
    </div>
  );
}
