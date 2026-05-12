import { useState } from 'react';
import type { PatientInfo, AppointmentType } from '../../types';
import { PHYSICIANS } from '../../data/physicians';
import { REASON_PRESETS } from '../../data/physicians';
import { fmtFull, fmtTime } from '../../data/dateUtils';
import { StageHeader } from './Progress';

interface Props {
  physicianId: string;
  date: string;
  time: string;
  type: AppointmentType;
  patient: PatientInfo;
  reason: string;
  notes: string;
  onSetPatient: (p: PatientInfo) => void;
  onSetReason: (r: string) => void;
  onSetNotes: (n: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function DetailsStep({ physicianId, date, time, type, patient, reason, notes, onSetPatient, onSetReason, onSetNotes, onBack, onSubmit }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const physician = PHYSICIANS.find(p => p.id === physicianId)!;
  const [first, ...rest] = physician.name.replace('Dr. ', '').split(' ');

  function validateAndSubmit() {
    const e: Record<string, string> = {};
    if (!patient.name.trim())         e.name   = 'Required';
    if (!patient.email.includes('@')) e.email  = 'Enter a valid email';
    if (!patient.phone.trim())        e.phone  = 'Required';
    if (!patient.dob)                 e.dob    = 'Required';
    if (!reason)                      e.reason = 'Pick a reason';
    setErrors(e);
    if (Object.keys(e).length === 0) onSubmit();
  }

  function clampYear(val: string) {
    if (!val) return val;
    const [y, ...rest] = val.split('-');
    return y.length > 4 ? [y.slice(0, 4), ...rest].join('-') : val;
  }

  function pat(key: keyof PatientInfo) {
    return {
      value: patient[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = key === 'dob' ? clampYear(e.target.value) : e.target.value;
        onSetPatient({ ...patient, [key]: val });
        setErrors(prev => ({ ...prev, [key]: '' }));
      },
    };
  }

  return (
    <div>
      <StageHeader
        step={2}
        title={<>A few <em>details</em>.</>}
        sub="We use this information to prepare for your visit and to reach you if anything changes."
      />

      <div className="details-grid">
        <div className="form-cols">
          <div className="field">
            <label htmlFor="pf-name">Full name</label>
            <input id="pf-name" placeholder="Jane Doe" {...pat('name')} />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="field">
            <label htmlFor="pf-dob">Date of birth</label>
            <input id="pf-dob" type="date" {...pat('dob')} />
            {errors.dob && <span className="error">{errors.dob}</span>}
          </div>
          <div className="field">
            <label htmlFor="pf-email">Email</label>
            <input id="pf-email" type="email" placeholder="you@email.com" {...pat('email')} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="pf-phone">Phone</label>
            <input id="pf-phone" type="tel" placeholder="(555) 123-4567" {...pat('phone')} />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
          <div className="field full">
            <label htmlFor="pf-ins">Insurance — optional</label>
            <input id="pf-ins" placeholder="Blue Cross PPO, self-pay, etc." {...pat('insurance')} />
          </div>
          <div className="field full">
            <label>Reason for visit</label>
            <div className="reason-list">
              {REASON_PRESETS.map(r => (
                <button
                  key={r}
                  aria-pressed={reason === r}
                  onClick={() => { onSetReason(r); setErrors(prev => ({ ...prev, reason: '' })); }}
                >
                  {r}
                </button>
              ))}
            </div>
            {errors.reason && <span className="error">{errors.reason}</span>}
          </div>
          <div className="field full">
            <label htmlFor="pf-notes">Anything else we should know?</label>
            <textarea
              id="pf-notes"
              value={notes}
              onChange={e => onSetNotes(e.target.value)}
              placeholder="Symptoms, medications, when things started…"
            />
          </div>
        </div>

        <aside className="summary-aside">
          <h5>Your appointment</h5>
          <div className="summary-line">
            <span className="k">With</span>
            <span className="v">Dr. {first} <em>{rest.join(' ')}</em></span>
          </div>
          <div className="summary-line">
            <span className="k">Specialty</span>
            <span className="v" style={{ fontSize: 16 }}>{physician.specialty}</span>
          </div>
          <div className="summary-line">
            <span className="k">When</span>
            <span className="v">{fmtFull(date)}</span>
            <span className="v mono" style={{ color: 'var(--muted)', marginTop: 4 }}>{fmtTime(time)}</span>
          </div>
          <div className="summary-line">
            <span className="k">Type</span>
            <span className="v" style={{ fontSize: 16 }}>{type}</span>
          </div>
          <div className="summary-line">
            <span className="k">Location</span>
            <span className="v" style={{ fontSize: 14 }}>{type === 'Telehealth' ? 'Video link emailed' : physician.location}</span>
          </div>
        </aside>
      </div>

      <div className="stage-nav">
        <button className="text-btn" onClick={onBack}>← Back</button>
        <button className="link-btn" onClick={validateAndSubmit}>
          Request appointment <span className="arr">→</span>
        </button>
      </div>
    </div>
  );
}
