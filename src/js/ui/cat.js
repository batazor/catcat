// The cat: one SVG template cloned into every step; mood and accessories are toggled with data attributes.
import { $, replay, reducedMotion } from './dom.js';

const SAY = ['мяу', 'мрр', 'ещё!', '♥', 'мур-мур'];
const SAY_PLACES = ['left-top', 'left-middle', 'right-top', 'right-middle', 'above'];
const sayTimers = new WeakMap();
let catSerial = 0;
const cats = new Set();
let tracking = false;
let catSvg = null;   // the loaded <svg> to clone

export function setCatSvg(svg) { catSvg = svg; }
export function cloneCat() {
  const svg = catSvg.cloneNode(true);
  // Every clone needs its own clip ID, including the sleeping cat in the intro.
  const clip = svg.querySelector('clipPath');
  const id = `cat-eye-${++catSerial}`;
  clip.id = id;
  svg.querySelectorAll('[clip-path]').forEach(eye => eye.setAttribute('clip-path', `url(#${id})`));
  return svg;
}

export function mountCat(holder) {
  holder.appendChild(cloneCat());
  holder.addEventListener('click', () => pokeCat(holder));
  cats.add(holder);
  followCursor();
}

// One pointer listener for all cats; only the visible, awake cat follows it.
function followCursor() {
  if (tracking) return;
  tracking = true;
  let pointer = null, frame = null;
  const reset = () => {
    pointer = null;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    for (const cat of cats) {
      cat.style.setProperty('--gaze-x', '0px');
      cat.style.setProperty('--gaze-y', '0px');
    }
  };
  const update = () => {
    frame = null;
    if (!pointer || reducedMotion()) return;
    for (const cat of cats) {
      if (cat.dataset.mood !== 'awake' || cat.closest('[hidden]') || !cat.getClientRects().length) continue;
      const matrix = cat.querySelector('svg').getScreenCTM();
      if (!matrix) continue;
      const local = new DOMPoint(pointer.x, pointer.y).matrixTransform(matrix.inverse());
      const dx = local.x - 60, dy = local.y - 46;
      const distance = Math.hypot(dx, dy, 65);
      cat.style.setProperty('--gaze-x', `${(dx / distance * 1.7).toFixed(2)}px`);
      cat.style.setProperty('--gaze-y', `${(dy / distance * 1.1).toFixed(2)}px`);
    }
  };
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    if (reducedMotion()) { reset(); return; }
    pointer = { x: e.clientX, y: e.clientY };
    if (frame === null) frame = requestAnimationFrame(update);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('scroll', () => {
    if (pointer && frame === null) frame = requestAnimationFrame(update);
  }, { passive: true });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', reset);
}

// mood: 'asleep' | 'awake' | 'sad' | 'wistful'; acc: space-separated accessory ids ('shades cocktail')
export function setCat(sec, acc, mood, hop) {
  const el = $('[data-cat]', sec);
  if (!el) return;
  el.dataset.mood = mood;
  const show = acc ? acc.split(' ') : [];
  el.querySelectorAll('.acc').forEach(a => {
    if (show.includes(a.dataset.acc)) a.setAttribute('data-show', '');
    else a.removeAttribute('data-show');
  });
  el.classList.remove('hop');
  if (hop && mood !== 'sad') replay(el, 'hop');
}

export function pokeCat(el) {
  let say = el.querySelector('.say');
  if (!say) { say = document.createElement('span'); say.className = 'say'; el.appendChild(say); }
  el.classList.remove('poke', 'purr', 'hop');
  say.textContent = SAY[Math.floor(Math.random() * SAY.length)];
  placeSay(el, say);
  el.classList.add(Math.random() < 0.35 ? 'purr' : 'poke');
  replay(say, 'on');
  clearTimeout(sayTimers.get(say));
  sayTimers.set(say, setTimeout(() => { say.classList.remove('on'); sayTimers.delete(say); }, 1400));
  if (el.dataset.mood === 'asleep') el.dataset.mood = 'awake';
}

function placeSay(el, say) {
  const choices = SAY_PLACES.filter(place => place !== say.dataset.place);
  const place = choices[Math.floor(Math.random() * choices.length)];
  say.dataset.place = place;
  const cat = el.querySelector('svg').getBoundingClientRect();
  const parent = say.offsetParent;
  const origin = parent.getBoundingClientRect();
  const width = say.offsetWidth, height = say.offsetHeight;
  const gap = 4, edge = 12;
  const right = place.startsWith('right');
  // Anchor to the cheeks, rather than the SVG bounds (which include space and the tail).
  const headLeft = cat.left + cat.width * 29 / 130;
  const headRight = cat.left + cat.width * 91 / 130;
  let x = right ? headRight + gap : headLeft - width - gap;
  let y = cat.top + cat.height * (place.endsWith('middle') ? .5 : .28) - height / 2;
  if (place === 'above') {
    x = cat.left + cat.width * 60 / 130 - width / 2;
    y = cat.top + cat.height * .08 - height - gap;
  }
  // Keep the whole bubble, its shadow and its small exit drift inside the viewport.
  x = Math.max(edge, Math.min(x, document.documentElement.clientWidth - width - edge));
  y = Math.max(edge, Math.min(y, window.innerHeight - height - edge));
  say.style.left = `${x - origin.left - parent.clientLeft}px`;
  say.style.top = `${y - origin.top - parent.clientTop}px`;
}

// The cat proposes a different window; accepting and dismissing are separate actions.
export function catOffer(sec, text, onAccept) {
  const catEl = $('[data-cat]', sec);
  const old = catEl.querySelector('.offer');
  if (old) old.remove();
  if (!text) return;
  const b = document.createElement('div');
  b.className = 'offer';
  b.setAttribute('role', 'group');
  b.setAttribute('aria-label', text + '?');
  const sm = document.createElement('small'); sm.textContent = 'кот говорит';
  b.appendChild(sm);
  b.appendChild(document.createTextNode(text + '?'));
  const actions = document.createElement('div'); actions.className = 'offer-actions';
  const yes = document.createElement('button'); yes.type = 'button'; yes.className = 'btn'; yes.textContent = 'Да';
  const later = document.createElement('button'); later.type = 'button'; later.className = 'btn ghost'; later.textContent = 'В другой раз';
  actions.append(yes, later); b.appendChild(actions);
  for (const cls of ['orbit', 'orbit r']) {
    const o = document.createElement('span'); o.className = cls;
    o.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 3; i++) o.appendChild(document.createElement('i'));
    b.appendChild(o);
  }
  b.addEventListener('click', e => e.stopPropagation());
  yes.addEventListener('click', () => { b.remove(); onAccept(); pokeCat(catEl); });
  later.addEventListener('click', () => { b.remove(); $('[data-next]', sec)?.focus({ preventScroll: true }); });
  catEl.appendChild(b);
}

export function clearOffer(sec) {
  const o = sec.querySelector('.offer');
  if (o) o.remove();
}
