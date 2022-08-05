export default function millisToReadableTime(millis: number): string {
  if (millis <= 1000) return '1s';

  const res: string[] = [];

  const date = new Date(millis);
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  const s = date.getUTCSeconds();

  if (h) res.push(`${h}h`);
  if (m) res.push(`${m}m`);
  if (s) res.push(`${s}s`);

  return res.join(' ');
}
