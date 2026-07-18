/** All tournament calendar dates are America/Los_Angeles (PST/PDT). */
export const PST = 'America/Los_Angeles';

/** Today's calendar date in PST as YYYY-MM-DD. */
export function todayInPst(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/**
 * Parse a YYYY-MM-DD tournament date as noon Pacific (−08:00).
 * Keeps created_at on the same calendar day in PST/PDT.
 */
export function dateStringToPstDate(dateStr: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return new Date(dateStr);
  return new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00-08:00`);
}

/**
 * Format a YYYY-MM-DD tournament date for UI.
 * Does not use UTC midnight parsing (that shows the previous day in PST).
 */
export function formatTournamentDate(dateStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!m) return dateStr;
  const y = Number(m[1]);
  const month = Number(m[2]);
  const d = Number(m[3]);
  return new Date(Date.UTC(y, month - 1, d, 12)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
