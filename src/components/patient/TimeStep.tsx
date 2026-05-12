import { useState, useMemo } from 'react';
import type { AppointmentType } from '../../types';
import { PHYSICIANS } from '../../data/physicians';
import { makeAvailability, TODAY_MS } from '../../data/availability';
import { fmtWeekday, fmtDate, fmtFull, fmtTime, relativeDay } from '../../data/dateUtils';
import { StageHeader } from './Progress';

interface Props {
  physicianId: string;
  dateIso: string;
  time: string;
  type: AppointmentType;
  onSetType: (t: AppointmentType) => void;
  onPick: (date: string, time: string) => void;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}

export function TimeStep({ physicianId, dateIso, time, type, onSetType, onPick, onBack, onNext, nextLabel = 'Continue to details' }: Props) {
  const physician = PHYSICIANS.find(p => p.id === physicianId)!;
  const [first, ...rest] = physician.name.replace('Dr. ', '').split(' ');
  const days = useMemo(() => makeAvailability(physicianId, TODAY_MS), [physicianId]);
  const [activeDay, setActiveDay] = useState(() => dateIso || days[0]?.iso || '');
  const day = days.find(d => d.iso === activeDay) || days[0];

  const morningSlots   = day?.slots.filter(s => s.period === 'morning') ?? [];
  const afternoonSlots = day?.slots.filter(s => s.period === 'afternoon') ?? [];
  const openCount = (d: typeof days[0]) => d.slots.filter(s => !s.taken).length;

  const selectedOnThisDay = day?.iso === dateIso && !!time;
  const selectedInMorning   = selectedOnThisDay && morningSlots.some(s => s.time === time);
  const selectedInAfternoon = selectedOnThisDay && afternoonSlots.some(s => s.time === time);

  function TimeSection({ label, slots, showContinue }: { label: string; slots: typeof morningSlots; showContinue: boolean }) {
    return (
      <div className="time-section">
        <div className="time-section-head">
          <span className="small-caps">{label}</span>
          <hr />
        </div>
        <div className="time-list">
          {slots.map(s => (
            <button
              key={s.time}
              className="time-slot"
              disabled={s.taken}
              aria-selected={day.iso === dateIso && s.time === time}
              onClick={() => onPick(day.iso, s.time)}
            >
              {fmtTime(s.time)}
            </button>
          ))}
        </div>
        {showContinue && (
          <div style={{ marginTop: 20 }}>
            <button className="link-btn" onClick={onNext}>
              {nextLabel} <span className="arr">→</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <StageHeader
        step={1}
        title={<>When works <em>for you?</em></>}
        sub={<>Showing availability for Dr. {first} <em>{rest.join(' ')}</em> across the next two weeks.</>}
      />

      <div className="type-switch">
        {(['In-person', 'Telehealth'] as AppointmentType[]).map(t => (
          <button key={t} onClick={() => onSetType(t)} aria-pressed={type === t}>{t}</button>
        ))}
      </div>

      <div className="picker">
        <aside className="picker-aside">
          <span className="small-caps">Available days</span>
          <div className="day-list">
            {days.map(d => (
              <button
                key={d.iso}
                className="day-row"
                aria-selected={activeDay === d.iso}
                onClick={() => setActiveDay(d.iso)}
                disabled={openCount(d) === 0}
              >
                <div className="day-label-wrap">
                  <span className="day-weekday">{fmtWeekday(d.iso)} · {relativeDay(d.iso, TODAY_MS)}</span>
                  <span className="day-date">{fmtDate(d.iso, { month: 'long', day: 'numeric' })}</span>
                </div>
                <span className="day-count">{openCount(d)} open</span>
              </button>
            ))}
          </div>
        </aside>

        {day && (
          <div className="picker-times">
            <h4>{fmtFull(day.iso)}</h4>
            <p className="day-sub">{openCount(day)} openings · {type.toLowerCase()}</p>

            <TimeSection label="Morning"   slots={morningSlots}   showContinue={selectedInMorning} />
            <TimeSection label="Afternoon" slots={afternoonSlots} showContinue={selectedInAfternoon} />
          </div>
        )}
      </div>

      <div className="stage-nav">
        <button className="text-btn" onClick={onBack}>← Back</button>
        {!selectedOnThisDay && (
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>Choose a time to continue.</span>
        )}
      </div>
    </div>
  );
}
