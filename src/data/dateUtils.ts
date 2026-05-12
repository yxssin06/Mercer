export function fmtWeekday(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', opts);
}

export function fmtFull(iso: string) {
  return fmtDate(iso, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function fmtTime(t: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, '0')} ${period}`;
}

export function relativeDay(iso: string, todayMs: number) {
  const d = new Date(iso + 'T12:00:00').getTime();
  const today = new Date(new Date(todayMs).toISOString().slice(0, 10) + 'T12:00:00').getTime();
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return fmtDate(iso, { weekday: 'long' });
  return fmtDate(iso, { month: 'short', day: 'numeric' });
}
