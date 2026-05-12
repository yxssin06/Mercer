import type { ReactNode } from 'react';
import { TODAY_MS } from '../../data/availability';
import { useDarkMode } from '../../hooks/useDarkMode';

const TODAY_STR = new Date(TODAY_MS).toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});

interface Props {
  onHome: () => void;
  right?: ReactNode;
}

export function Masthead({ onHome, right }: Props) {
  const [dark, toggleDark] = useDarkMode();

  return (
    <header className="masthead">
      <div className="masthead-left">
        <span>{TODAY_STR}</span>
        <button
          className={'theme-toggle' + (dark ? ' dark' : '')}
          onClick={toggleDark}
          role="switch"
          aria-checked={dark}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="toggle-icon">☀</span>
          <span className="toggle-thumb" />
          <span className="toggle-icon">☾</span>
        </button>
      </div>
      <button className="wordmark" onClick={onHome}>
        Mercer <span className="amp">&amp;</span> Health
      </button>
      <div className="masthead-right">{right}</div>
    </header>
  );
}
