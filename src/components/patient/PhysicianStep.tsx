import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PHYSICIANS } from '../../data/physicians';
import { StageHeader } from './Progress';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}

export function PhysicianStep({ selectedId, onSelect, onNext }: Props) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const specialties = ['All', ...new Set(PHYSICIANS.map(p => p.specialty))];
  const filtered = filter === 'All' ? PHYSICIANS : PHYSICIANS.filter(p => p.specialty === filter);

  return (
    <div>
      <StageHeader
        step={0}
        title={<>The right <em>physician</em>.</>}
        sub="Browse our care team. Choose someone whose practice matches your needs — you can switch any time before confirming."
      />

      <div className="spec-bar">
        {specialties.map(s => (
          <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s}>
            {s === 'All' ? 'All specialties' : s}
          </button>
        ))}
      </div>

      <div className="roster">
        {filtered.map(p => {
          const [first, ...rest] = p.name.replace('Dr. ', '').split(' ');
          const isSelected = selectedId === p.id;
          return (
            <div
              key={p.id}
              className="doc-entry"
              role="button"
              tabIndex={0}
              aria-selected={isSelected}
              onClick={() => onSelect(p.id)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelect(p.id); }}
            >
              <div className="doc-main">
                <div className="doc-name">Dr. {first} <em>{rest.join(' ')}</em></div>
                <div className="doc-spec">{p.specialty}</div>
                <p className="doc-bio">{p.bio}</p>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 24 }} onClick={e => e.stopPropagation()}>
                  <button
                    className="text-btn"
                    style={{ fontSize: 13 }}
                    onClick={() => navigate(`/physicians/${p.id}`)}
                  >
                    Full profile →
                  </button>
                  {isSelected && (
                    <button className="link-btn desktop-continue" onClick={onNext}>
                      Continue to scheduling <span className="arr">→</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="doc-meta">
                <div>
                  <span className="k">Next opening</span>
                  <span className="v">{p.nextOpen}</span>
                </div>
                <div>
                  <span className="k">Patients seen</span>
                  <span className="v">{p.visits}</span>
                </div>
                <div>
                  <span className="k">Location</span>
                  <span className="v" style={{ fontSize: 14 }}>{p.location}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="stage-nav">
        <span style={{ color: 'var(--muted)', fontSize: 14 }}>
          {selectedId ? 'Ready — continue to scheduling.' : 'Choose a physician to continue.'}
        </span>
        {selectedId && (
          <button className="link-btn desktop-continue" onClick={onNext}>
            Continue to scheduling <span className="arr">→</span>
          </button>
        )}
      </div>

      {selectedId && (() => {
        const p = PHYSICIANS.find(ph => ph.id === selectedId)!;
        const [first, ...rest] = p.name.replace('Dr. ', '').split(' ');
        return (
          <div className="mobile-continue-bar">
            <div className="mobile-continue-info">
              <span className="mobile-continue-label">Selected</span>
              <span className="mobile-continue-name">Dr. {first} {rest.join(' ')}</span>
            </div>
            <button className="link-btn" onClick={onNext}>
              Continue <span className="arr">→</span>
            </button>
          </div>
        );
      })()}
    </div>
  );
}
