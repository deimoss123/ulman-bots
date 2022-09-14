const hours24 = 86_400_000;

export default function millisToReadableTime(millis: number): string {
  if (millis <= 1000) return '1s';

  const res: string[] = [];

  let d = 0;
  if (millis > hours24) {
    d = Math.floor(millis / hours24);
    millis -= d * hours24;
  }

  const date = new Date(millis);
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  const s = date.getUTCSeconds();

  if (d) res.push(`${d}d`);
  if (h) res.push(`${h}h`);
  if (!d && m) res.push(`${m}m`);
  if (!d && !h && s) res.push(`${s}s`);

  return res.join(' ');
}
