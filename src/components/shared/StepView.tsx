import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props {
  step: number;
  children: (step: number) => ReactNode;
}

export function StepView({ step, children }: Props) {
  const [displayStep, setDisplayStep] = useState(step);
  const [barWidth, setBarWidth]       = useState(0);
  const [barVisible, setBarVisible]   = useState(false);
  const [entering, setEntering]       = useState(false);

  useEffect(() => {
    if (step === displayStep) return;
    setBarVisible(true);
    setBarWidth(0);
    const t1 = setTimeout(() => setBarWidth(80), 20);
    const t2 = setTimeout(() => setBarWidth(100), 500);
    const t3 = setTimeout(() => {
      setDisplayStep(step);
      setEntering(true);
      setTimeout(() => setEntering(false), 250);
      setBarVisible(false);
      setBarWidth(0);
    }, 650);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [step]);

  return (
    <>
      <div
        className="nav-bar"
        style={{
          width: `${barWidth}%`,
          opacity: barVisible ? 1 : 0,
          transition: barVisible
            ? 'width 0.55s cubic-bezier(0.1, 0.05, 0.0, 1), opacity 0.1s'
            : 'opacity 0.3s',
        }}
      />
      <div className={entering ? 'page-enter' : ''}>
        {children(displayStep)}
      </div>
    </>
  );
}
