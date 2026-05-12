import { useState, useEffect } from 'react';

const KEY = 'mh_theme';

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) return stored === 'dark';
    return false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, () => setDark(d => !d)] as const;
}
