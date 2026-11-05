// A cat paw comes in from a random side, presses a button and drags it away.
// Paw and button run the same 1.3 s keyframe timeline (see paw.css), started in the same frame.
import { $, reducedMotion } from './dom.js';

let busy = false;

export function pawTap(btn, cb) {
  const paw = $('#paw');
  if (reducedMotion() || busy || !paw) { cb(); return; }
  busy = true;
  const r = btn.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
  const side = ['left', 'right', 'bottom'][Math.floor(Math.random() * 3)];
  const sx = side === 'left' ? -(r.left + 260) : side === 'right' ? vw - r.left + 260 : 0;
  const sy = side === 'bottom' ? vh - r.top + 260 : 160;
  const rot = side === 'left' ? 32 : side === 'right' ? -32 : 0;
  const px = r.left + r.width * 0.5 - 44, py = r.top + r.height * 0.5 - 73;
  for (const [el, vars] of [[paw, { '--px': px + 'px', '--py': py + 'px' }], [paw, {}], [btn, {}]]) {
    for (const k in vars) el.style.setProperty(k, vars[k]);
    el.style.setProperty('--sx', sx + 'px'); el.style.setProperty('--sy', sy + 'px'); el.style.setProperty('--rot', rot + 'deg');
  }
  paw.classList.remove('go'); btn.classList.remove('taken');
  void paw.offsetWidth; void btn.offsetWidth;
  paw.classList.add('go'); btn.classList.add('taken');
  setTimeout(cb, 950);
  setTimeout(() => { busy = false; paw.classList.remove('go'); btn.classList.remove('taken'); }, 1400);
}
