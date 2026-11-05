import { $, reducedMotion } from './dom.js';

// soft bubbles rising over the finished plan
export function bubbles() {
  if (reducedMotion()) return;
  const box = document.createElement('div');
  box.className = 'bubbles'; box.setAttribute('aria-hidden', 'true');
  const colors = ['var(--mango)', 'var(--accent)', 'var(--glow-b)', 'var(--glow-a)'];
  for (let i = 0; i < 16; i++) {
    const b = document.createElement('i');
    b.style.setProperty('--x', Math.random() * 96 + '%');
    b.style.setProperty('--s', 14 + Math.random() * 34 + 'px');
    b.style.setProperty('--c', colors[i % colors.length]);
    b.style.setProperty('--d', 3.2 + Math.random() * 2 + 's');
    b.style.setProperty('--delay', Math.random() * 1.2 + 's');
    b.style.setProperty('--sway', (Math.random() - 0.5) * 60 + 'px');
    box.appendChild(b);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 6500);
}

// the warm backdrop blobs drift under the pointer and with device tilt
export function parallax() {
  const bd = $('.backdrop');
  if (!bd || reducedMotion()) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  const tick = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    bd.style.transform = `translate(${cx}px,${cy}px)`;
    raf = Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1 ? requestAnimationFrame(tick) : null;
  };
  const aim = (x, y) => { tx = x * 14; ty = y * 14; if (!raf) raf = requestAnimationFrame(tick); };
  document.addEventListener('pointermove', e => aim(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5), { passive: true });
  window.addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    aim(Math.max(-1, Math.min(1, e.gamma / 30)), Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
  }, { passive: true });
}
