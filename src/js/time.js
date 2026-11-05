// Hours are plain numbers: 14.5 === 14:30. Keeps the schedule maths trivial.

export function clock(h) {
  const m = Math.round(h * 60);
  return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2);
}

export function fmtDur(h) {
  return (h % 1 ? h.toFixed(1).replace('.', ',') : h) + ' ч';
}

// Canggu → Bukit drive time by departure hour.
// baliholidaysecrets.com/canggu-to-uluwatu: before 8:00 ~1h15, 11–14 ~1h45, 15–18 2.5–3h, after 21 ~55 min; gaps interpolated.
export function travel(dep) {
  if (dep < 8) return 1.25;
  if (dep < 11) return 1.5;
  if (dep < 15) return 1.75;
  if (dep < 18) return 2.75;
  if (dep < 21) return 1.75;
  return 1;
}
