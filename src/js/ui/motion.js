import { reducedMotion } from './dom.js';

const ease = 'cubic-bezier(.22,.7,.24,1)';
const active = new Set();
const cardMotions = new WeakMap();

function track(animation, cleanup = () => {}) {
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true; animation.cancel(); cleanup(); active.delete(stop);
  };
  active.add(stop);
  return { animation, stop, finished: animation.finished.catch(() => {}) };
}
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
  if (e.matches) [...active].forEach(stop => stop());
});
window.addEventListener('pagehide', () => [...active].forEach(stop => stop()));
window.addEventListener('resize', () => [...active].forEach(stop => stop()), { passive: true });

function pose(card) {
  return `translate(calc(-50% + ${card.style.getPropertyValue('--x') || '0px'}), ${card.style.getPropertyValue('--y') || '0px'}) rotate(${card.style.getPropertyValue('--rot') || '0deg'})`;
}
export function stopCardMotion(card) {
  cardMotions.get(card)?.stop();
  cardMotions.delete(card);
}
function animateCard(card, frames, timing) {
  stopCardMotion(card);
  const handle = track(card.animate(frames, timing), () => card.classList.remove('in-motion'));
  cardMotions.set(card, handle);
  card.classList.add('in-motion');
  handle.finished.then(() => { if (cardMotions.get(card) === handle) { handle.stop(); cardMotions.delete(card); } });
}

export function dealCards(pair) {
  if (!pair || reducedMotion() || !pair.getClientRects().length) return;
  [...pair.querySelectorAll('.card:not([hidden])')].forEach((card, i) => {
    animateCard(card, [
      { transform: 'translate(-50%, 30px) rotate(-4deg) scale(.96)', opacity: 0 },
      { transform: pose(card), opacity: card.classList.contains('rejected') || (pair.classList.contains('picked') && !card.classList.contains('chosen')) ? .55 : 1 }
    ], { duration: 480, delay: i * 65, easing: ease, fill: 'both' });
  });
}

// The cards gather while the paw reaches the button, then travel away together.
export function leaveDeck(pair) {
  if (!pair || reducedMotion() || !pair.getClientRects().length) return () => {};
  const handles = [...pair.querySelectorAll('.card:not([hidden])')].map((card, i) => {
    const from = getComputedStyle(card).transform;
    stopCardMotion(card);
    card.dispatchEvent(new Event('previewreset'));
    return track(card.animate([
      { transform: from, opacity: getComputedStyle(card).opacity, offset: 0 },
      { transform: `translate(calc(-50% + ${i * 3}px), ${12 + i * 2}px) rotate(${i - 1}deg)`, opacity: 1, offset: .5 },
      { transform: `translate(calc(-50% + 110px), ${30 + i * 2}px) rotate(8deg) scale(.94)`, opacity: 0, offset: 1 }
    ], { duration: 650, delay: 200, easing: ease, fill: 'both' }));
  });
  return () => handles.forEach(handle => handle.stop());
}

export function tuckCard(card, from) {
  if (reducedMotion()) return;
  const end = pose(card);
  animateCard(card, [
    { transform: from, zIndex: 12, opacity: .9, offset: 0 },
    { transform: 'translate(calc(-50% - 85px), 18px) rotate(-9deg)', zIndex: 12, opacity: .8, offset: .42, easing: 'steps(1,end)' },
    { transform: 'translate(calc(-50% - 85px), 18px) rotate(-9deg)', zIndex: 1, opacity: .8, offset: .46 },
    { transform: end, zIndex: 1, opacity: .55, offset: 1 }
  ], { duration: 520, easing: ease, fill: 'both' });
}

export function parcel(card) {
  if (!card || !card.getClientRects().length) return null;
  return { rect: card.getBoundingClientRect(), title: card.querySelector('.title').textContent,
    icon: card.querySelector('.art svg').cloneNode(true) };
}

export async function moveBetweenPlanAndCard(item, target, returning = false) {
  if (!item || !target || reducedMotion()) return;
  const to = target.getBoundingClientRect(), from = item.rect;
  if (!from.width || !to.width) return;
  const ghost = document.createElement('div');
  ghost.className = 'journey-card'; ghost.setAttribute('aria-hidden', 'true');
  const title = document.createElement('span'); title.textContent = item.title;
  ghost.append(item.icon, title);
  const frame = (rect, opacity) => ({ left: rect.left + 'px', top: rect.top + 'px',
    width: rect.width + 'px', height: rect.height + 'px', opacity });
  Object.assign(ghost.style, frame(from, 1));
  document.body.appendChild(ghost);
  const main = document.querySelector('main');
  main.inert = true;
  const destination = returning ? target : target.querySelector('.face') || target;
  destination.classList.add('journey-destination');
  const reveal = track(destination.animate([
    { opacity: 0, offset: 0 }, { opacity: 0, offset: .84 }, { opacity: 1, offset: 1 }
  ], { duration: 620, easing: ease, fill: 'both' }));
  const lift = Math.min(24, Math.max(0, Math.min(from.top, to.top) - 12));
  const middle = { left: (from.left + to.left) / 2, top: (from.top + to.top) / 2 - lift,
    width: (from.width + to.width) / 2, height: (from.height + to.height) / 2 };
  const handle = track(ghost.animate([
    { ...frame(from, 1), borderRadius: returning ? '20px' : '14px', offset: 0 },
    { ...frame(middle, 1), transform: `rotate(${returning ? -2 : 2}deg)`, offset: .48 },
    { ...frame(to, 1), transform: 'rotate(0deg)', borderRadius: returning ? '14px' : '20px', offset: .84 },
    { ...frame(to, 0), transform: 'rotate(0deg)', borderRadius: returning ? '14px' : '20px', offset: 1 }
  ], { duration: 620, easing: ease, fill: 'both' }), () => {
    ghost.remove(); reveal.stop(); destination.classList.remove('journey-destination'); main.inert = false;
  });
  await handle.finished;
  handle.stop();
  if (returning && !reducedMotion() && document.visibilityState !== 'hidden') {
    const flash = track(target.animate([{ backgroundColor: 'var(--surface)' }, { backgroundColor: 'var(--surface-2)', offset: .25 }, { backgroundColor: 'var(--surface)' }], { duration: 850, easing: 'ease-out' }));
    flash.finished.then(flash.stop);
  }
}
