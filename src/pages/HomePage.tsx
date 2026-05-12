import { useNavigate } from 'react-router-dom';
import { Masthead } from '../components/shared/Masthead';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <Masthead onHome={() => {}} right={<span className="masthead-tag">Patient &amp; staff portal</span>} />

      <div className="landing">
        <div className="landing-hero">
          <h1 className="display">
            Care, <em>scheduled</em><br />on your terms.
          </h1>
          <div className="landing-meta">
            <p>A quiet, considered way to book time with the Mercer Health care team.</p>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>Volume XII · Issue 5 · May 2026</p>
          </div>
        </div>

        <div className="role-rows">
          <button className="role-row" onClick={() => navigate('/patient')}>
            <span className="role-num">i.</span>
            <div className="role-body">
              <h3>For patients</h3>
              <p>Browse our care team, choose a time, and request your appointment. No account required.</p>
            </div>
            <span className="role-arrow">→</span>
          </button>

          <button className="role-row" onClick={() => navigate('/physician/login')}>
            <span className="role-num">ii.</span>
            <div className="role-body">
              <h3>For physicians</h3>
              <p>View your schedule, confirm or decline requests, and propose new times for patients. Sign-in required.</p>
            </div>
            <span className="role-arrow">→</span>
          </button>

          <button className="role-row" onClick={() => navigate('/admin/login')}>
            <span className="role-num">iii.</span>
            <div className="role-body">
              <h3>Staff &amp; coordinators</h3>
              <p>Full overview of all physicians and appointments. Manage requests across the entire care team.</p>
            </div>
            <span className="role-arrow">→</span>
          </button>
        </div>

        <div className="landing-foot">
          <span>Mercer Health · est. 2026</span>
          <em>In case of emergency, dial 911.</em>
        </div>
      </div>
    </div>
  );
}
