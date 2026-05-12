import { useParams, useNavigate } from 'react-router-dom';
import { Masthead } from '../components/shared/Masthead';
import { Avatar } from '../components/shared/Avatar';
import { PHYSICIANS } from '../data/physicians';

export function PhysicianBioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const physician = PHYSICIANS.find(p => p.id === id);

  if (!physician) {
    return (
      <div className="app">
        <Masthead onHome={() => navigate('/')} />
        <div className="bio-page">
          <p style={{ color: 'var(--muted)' }}>Physician not found.</p>
          <button className="text-btn" onClick={() => navigate('/book')}>← Back to booking</button>
        </div>
      </div>
    );
  }

  const [first, ...rest] = physician.name.replace('Dr. ', '').split(' ');

  return (
    <div className="app">
      <Masthead
        onHome={() => navigate('/')}
        right={
          <button className="text-btn" onClick={() => navigate(-1)}>← Back</button>
        }
      />

      <div className="bio-page">
        {/* ── Hero ── */}
        <div className="bio-hero">
          <Avatar initials={physician.initials} tone={physician.tone} size={96} />
          <div className="bio-hero-text">
            <p className="pre">— Physician profile</p>
            <h1>Dr. {first} <em>{rest.join(' ')}</em></h1>
            <p className="bio-specialty">{physician.specialty}</p>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--ink)', margin: '32px 0' }} />

        {/* ── Body ── */}
        <div className="bio-body">
          <div className="bio-main">
            <p className="bio-text">{physician.bio}</p>

            <div className="bio-field" style={{ marginTop: 40 }}>
              <span className="small-caps">Education &amp; training</span>
              <p className="bio-edu">{physician.education}</p>
            </div>

            <div className="bio-field" style={{ marginTop: 28 }}>
              <span className="small-caps">Languages</span>
              <p className="bio-langs">{physician.languages.join(' · ')}</p>
            </div>
          </div>

          <div className="bio-aside">
            <div className="bio-stat">
              <span className="k">Specialty</span>
              <span className="v">{physician.specialty}</span>
            </div>
            <div className="bio-stat">
              <span className="k">Location</span>
              <span className="v" style={{ fontSize: 15 }}>{physician.location}</span>
            </div>
            <div className="bio-stat">
              <span className="k">Patient rating</span>
              <span className="v">{physician.rating} <span style={{ fontSize: 13, color: 'var(--muted)' }}>/ 5.0</span></span>
            </div>
            <div className="bio-stat">
              <span className="k">Patients seen</span>
              <span className="v">{physician.visits}</span>
            </div>
            <div className="bio-stat">
              <span className="k">Next opening</span>
              <span className="v" style={{ color: 'var(--olive)' }}>{physician.nextOpen}</span>
            </div>

            <div style={{ marginTop: 40 }}>
              <button
                className="link-btn"
                onClick={() => navigate('/book')}
                style={{ fontSize: 16 }}
              >
                Book an appointment <span className="arr">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
