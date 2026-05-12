import type { ReactNode } from 'react';

const STEPS = ['Physician', 'Time', 'Details', 'Confirm'];

export function Breadcrumb({ step }: { step: number }) {
  return (
    <div className="breadcrumb">
      {STEPS.map((s, i) => {
        const cls = i < step ? 'step done' : i === step ? 'step active' : 'step';
        return (
          <div key={s} className={cls}>
            <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
            <span>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

interface StageHeaderProps {
  step: number;
  title: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
}

export function StageHeader({ step, title, sub, children }: StageHeaderProps) {
  return (
    <div className="stage-header">
      <Breadcrumb step={step} />
      <div>
        <h1 className="display stage-title">{title}</h1>
        {sub && <p className="stage-sub">{sub}</p>}
        {children}
      </div>
    </div>
  );
}
