import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Masthead } from '../components/shared/Masthead';
import { usePatientAuth } from '../context/PatientAuthContext';
import { useToast } from '../context/ToastContext';

export function PatientProfilePage() {
  const navigate = useNavigate();
  const { currentPatient, updateAccount, logout } = usePatientAuth();
  const { addToast } = useToast();

  if (!currentPatient) return <Navigate to="/patient" replace />;

  const [name, setName]           = useState(currentPatient.name);
  const [phone, setPhone]         = useState(currentPatient.phone ?? '');
  const [dob, setDob]             = useState(currentPatient.dob ?? '');
  const [insurance, setInsurance] = useState(currentPatient.insurance ?? '');
  const [dirty, setDirty]         = useState(false);

  function mark() { setDirty(true); }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    updateAccount({ name: name.trim(), phone: phone.trim(), dob: dob.trim(), insurance: insurance.trim() });
    addToast('Profile updated.');
    setDirty(false);
  }

  function handleLogout() { logout(); navigate('/'); }

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <button className="text-btn" onClick={() => navigate('/patient/dashboard')}>← Dashboard</button>
            <button className="text-btn" onClick={handleLogout}>Sign out</button>
          </div>
        }
      />

      <div className="profile-page">
        <div className="profile-head">
          <div>
            <p className="pre">— My account</p>
            <h2>{currentPatient.name.split(' ')[0]}'s <em>profile</em>.</h2>
            <p className="sub">Update your contact and insurance details. These will be pre-filled when you book future appointments.</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-section">
            <div className="small-caps" style={{ marginBottom: 24 }}>Personal information</div>
            <div className="form-cols">
              <div className="field">
                <label htmlFor="pf-name">Full name</label>
                <input
                  id="pf-name"
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); mark(); }}
                  placeholder="Your full name"
                />
              </div>
              <div className="field">
                <label htmlFor="pf-email">Email address</label>
                <input
                  id="pf-email"
                  type="email"
                  value={currentPatient.email}
                  disabled
                  style={{ color: 'var(--muted)', cursor: 'not-allowed' }}
                />
                <span className="field-hint">Email cannot be changed.</span>
              </div>
              <div className="field">
                <label htmlFor="pf-phone">Phone number</label>
                <input
                  id="pf-phone"
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); mark(); }}
                  placeholder="(555) 000-0000"
                />
              </div>
              <div className="field">
                <label htmlFor="pf-dob">Date of birth</label>
                <input
                  id="pf-dob"
                  type="text"
                  value={dob}
                  onChange={e => { setDob(e.target.value); mark(); }}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="small-caps" style={{ marginBottom: 24 }}>Insurance</div>
            <div style={{ maxWidth: 480 }}>
              <div className="field">
                <label htmlFor="pf-ins">Insurance provider</label>
                <input
                  id="pf-ins"
                  type="text"
                  value={insurance}
                  onChange={e => { setInsurance(e.target.value); mark(); }}
                  placeholder="e.g. Blue Cross Blue Shield"
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="small-caps" style={{ marginBottom: 24 }}>Account</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Member since {new Date(currentPatient.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                <span style={{ marginLeft: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.08em' }}>
                  {currentPatient.id}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-foot">
            <button type="button" className="text-btn" onClick={() => navigate('/patient/dashboard')}>
              ← Back to dashboard
            </button>
            <button type="submit" className="link-btn" disabled={!dirty || !name.trim()}>
              Save changes <span className="arr">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
