import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Masthead } from '../components/shared/Masthead';

export function AdminLoginPage() {
  const { login } = useAuth();
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
      navigate('/admin', { replace: true });
    } else {
      setError(err);
    }
  }

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={<span className="masthead-tag">Staff sign-in</span>}
      />

      <div className="signin">
        <div className="signin-back">
          <button className="text-btn" onClick={() => navigate('/')}>← Back to home</button>
        </div>
        <h2>Staff <em>sign-in</em>.</h2>
        <p className="sub">For physicians and clinical staff. Use your Mercer Health credentials to continue.</p>

        <form className="signin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="si-email">Work email</label>
            <input
              id="si-email"
              type="email"
              autoComplete="email"
              placeholder="you@mercer.health"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
          </div>
          <div className="field">
            <label htmlFor="si-pw">Password</label>
            <input
              id="si-pw"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
            />
          </div>
          {error && (
            <span style={{ color: 'var(--terracotta)', fontSize: 13 }}>{error}</span>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="submit" className="link-btn" disabled={loading}>
              {loading ? 'Signing in…' : <><span>Sign in</span><span className="arr">→</span></>}
            </button>
          </div>
          <p className="hint">
            <b style={{ color: 'var(--ink-2)' }}>Demo:</b> any email ending in <code>@mercer.health</code> (try{' '}
            <code>elena@mercer.health</code>) with a password 4+ characters.
          </p>
        </form>
      </div>
    </div>
  );
}
