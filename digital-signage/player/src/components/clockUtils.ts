/**
 * Returns numeric time parts for a given Date in a specific IANA timezone.
 * Uses Intl.DateTimeFormat to correctly account for DST and offsets.
 */
export function getTimeParts(date: Date, timeZone: string): { hour: number; minute: number; second: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = fmt.formatToParts(date);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const s = Number(parts.find((p) => p.type === 'second')?.value ?? 0);
  return { hour: h, minute: m, second: s };
}

/**
 * Computes analog clock hand angles for a specific date/time in a given timezone.
 * - hour hand goes 360° per 12 hours
 * - minute hand goes 360° per 60 minutes
 * - second hand goes 360° per 60 seconds
 * msFraction is a 0..1 fraction of the current second for smooth animation
 */
export function computeHandAngles(date: Date, timeZone: string, msFraction: number): { hourDeg: number; minuteDeg: number; secondDeg: number } {
  const { hour, minute, second } = getTimeParts(date, timeZone);
  const s = second + Math.max(0, Math.min(1, msFraction));
  const minuteWithFrac = minute + s / 60;
  const hourWithFrac = (hour % 12) + minuteWithFrac / 60;
  const secondDeg = (s / 60) * 360;
  const minuteDeg = (minuteWithFrac / 60) * 360;
  const hourDeg = (hourWithFrac / 12) * 360;
  return { hourDeg, minuteDeg, secondDeg };
}


