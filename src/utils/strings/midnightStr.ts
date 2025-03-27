export default function midNightStr() {
  return `<t:${Math.floor(new Date().setHours(24, 0, 0, 0) / 1000)}:t>`;
}
