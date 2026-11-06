// Cards as a fanned hand: build from <template>, fan layout, swipe-to-pick, touch glow, scratch foil.
import { $, $$, reducedMotion } from './dom.js';
import { tuckCard, stopCardMotion } from './motion.js?v=3';
import { ICON } from '../icons.js?v=9';

// ---------- build ----------
export function buildStep(step, host, onPick, onNext, onBack) {
  const node = $('#tpl-step').content.cloneNode(true);
  const sec = $('section', node);
  sec.id = 'step-' + step.id;
  sec.setAttribute('aria-labelledby', 'h-' + step.id);
  $('h1', sec).id = 'h-' + step.id;
  $('fieldset', sec).setAttribute('aria-labelledby', 'h-' + step.id);
  const pair = $('.pair', sec);
  step.options.forEach((opt, i) => {
    const c = $('#tpl-card').content.cloneNode(true);
    const label = $('.card', c), input = $('input', c);
    label.dataset.opt = opt.id;
    label.dataset.icon = opt.icon;
    label.style.setProperty('--i', i);
    glow(label);
    preview(label);
    drag(label, () => onPick(step, null));
    input.name = step.id; input.value = opt.id; input.id = `${step.id}-${opt.id}`;
    $('.art svg', c).innerHTML = `<g class="icon-motion">${ICON[opt.icon]}</g>`;
    $('.title', c).textContent = opt.label;
    $('.desc', c).textContent = opt.desc;
    pair.appendChild(c);
  });
  pair.addEventListener('change', e => onPick(step, e.target.value));
  fan(pair);
  $('[data-next]', sec).addEventListener('click', function () { onNext(this); });
  $('[data-back]', sec).addEventListener('click', onBack);
  host.appendChild(node);
  return $('#step-' + step.id);
}

// Hide cards whose `when` says no.
export function applyOptionWhen(sec, step, optionOn, onCleared) {
  for (const o of step.options) {
    const c = sec.querySelector(`.card[data-opt="${o.id}"]`), on = optionOn(step, o);
    c.hidden = !on;
    c.querySelector('input').disabled = !on;
    if (!on && c.querySelector('input').checked) {
      c.querySelector('input').checked = false;
      c.classList.remove('chosen', 'nofit');
      $('.pair', sec).classList.remove('picked');
      onCleared();
    }
  }
}

// ---------- fan ----------
export function fan(pair) {
  const cards = $$('.card', pair).filter(c => !c.hidden), n = cards.length;
  const spread = n === 2 ? 54 : n === 1 ? 0 : 58, tilt = n === 2 ? 7 : n === 1 ? 0 : 9;
  cards.forEach((c, i) => {
    const k = i - (n - 1) / 2;
    const picked = pair.classList.contains('picked'), chosen = c.classList.contains('chosen');
    const others = cards.filter(card => !card.classList.contains('chosen'));
    const side = others.length === 1 ? (k <= 0 ? -1 : 1) : others.indexOf(c) * 2 - 1;
    c.style.setProperty('--x', (picked ? chosen ? 0 : side * 44 : k * spread) + 'px');
    c.style.setProperty('--y', (picked ? chosen ? -10 : 14 + others.indexOf(c) * 4 : Math.abs(k) * 12) + 'px');
    c.style.setProperty('--rot', (picked ? chosen ? 0 : side * 4 : k * tilt) + 'deg');
    c.style.setProperty('--z', c.classList.contains('chosen') ? 10 : c.classList.contains('rejected') ? 1 : 2 + (n - Math.abs(k * 2)));
  });
}

function raise(label) {
  $$('.card', label.parentNode).forEach(c => { if (!c.classList.contains('chosen')) c.style.setProperty('--z', 2); });
  if (!label.classList.contains('chosen')) label.style.setProperty('--z', 9);
}

// mark the picked card in a pair; returns the picked card element
export function markPick(pair, optId, fits, msg) {
  pair.classList.add('picked');
  let picked = null;
  for (const c of $$('.card', pair)) {
    stopCardMotion(c);
    c.dispatchEvent(new Event('previewreset'));
    const mine = c.dataset.opt === optId;
    c.classList.toggle('nofit', mine && !fits);
    c.classList.toggle('chosen', mine);
    $('input', c).checked = mine;
    if (mine) { c.classList.remove('rejected'); $('.nofit-msg', c).textContent = msg; picked = c; }
  }
  fan(pair);
  return picked;
}

export function resetCards(sec) {
  sec.querySelectorAll('input').forEach(i => { i.checked = false; });
  $('.pair', sec).classList.remove('picked');
  sec.querySelectorAll('.card').forEach(c => {
    stopCardMotion(c);
    c.dispatchEvent(new Event('previewreset'));
    c.classList.remove('nofit', 'chosen', 'rejected');
  });
  sec.querySelectorAll('.foil').forEach(cv => { cv.classList.remove('done'); delete cv.dataset.painted; cv.replaceWith(cv.cloneNode(false)); });
  fan($('.pair', sec));
}

const topCards = new WeakMap();

// Pull a card out at its current depth, then leave it over the hand.
// Only the face moves: the label keeps a steady hit area while it is being lifted.
function preview(label) {
  const face = $('.face', label);
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let motion = null, depth = null;
  function clear() {
    if (motion) motion.cancel();
    if (depth) depth.cancel();
    motion = depth = null;
    label.classList.remove('previewing');
  }
  function depthFrames(z) {
    return [
      { zIndex: z, offset: 0 },
      { zIndex: z, offset: .46, easing: 'steps(1, end)' },
      { zIndex: 20, offset: .5 },
      { zIndex: 20, offset: 1 }
    ];
  }
  function update(active) {
    if (reducedMotion()) {
      clear();
      label.classList.toggle('previewing', active);
      return;
    }
    if (motion) {
      const direction = active ? 1 : -1;
      if (motion.playbackRate !== direction) {
        if (!active) {
          const z = label.classList.contains('chosen') ? 10 : label.style.getPropertyValue('--z') || 1;
          depth.effect.setKeyframes(depthFrames(z));
        }
        motion.reverse();
        depth.reverse();
      }
      return;
    }
    if (!active) return;
    const rect = label.getBoundingClientRect();
    const offset = parseFloat(label.style.getPropertyValue('--x')) || 0;
    const angle = parseFloat(label.style.getPropertyValue('--rot')) || 0;
    const leftRoom = Math.max(0, rect.left - 12);
    const rightRoom = Math.max(0, window.innerWidth - rect.right - 12);
    const side = offset ? Math.sign(offset) : leftRoom > rightRoom ? -1 : 1;
    const room = side < 0 ? leftRoom : rightRoom;
    const reach = Math.min(label.offsetWidth * .8, room);
    // On narrow screens use a higher arc to keep the card inside the viewport.
    const lift = 22 + 24 * (1 - reach / (label.offsetWidth * .8));
    const z = getComputedStyle(label).zIndex;
    const timing = { duration: 760, fill: 'both' };
    const easing = 'cubic-bezier(.4, 0, .2, 1)';
    label.classList.add('previewing');
    motion = face.animate([
      { translate: '0px 0px', rotate: '0deg', offset: 0, easing },
      { translate: `${side * reach}px ${-lift}px`, rotate: `${-side * 7}deg`, offset: .46 },
      { translate: `${side * reach}px ${-lift}px`, rotate: `${-side * 7}deg`, offset: .5, easing },
      { translate: '0px -10px', rotate: `${-angle * .65}deg`, offset: 1 }
    ], timing);
    depth = label.animate(depthFrames(z), timing);
    motion.onfinish = () => { if (motion && motion.playbackRate < 0) clear(); };
  }
  function activate() {
    if (label.classList.contains('in-motion')) return;
    const pair = label.parentNode;
    const previous = topCards.get(pair);
    if (previous === label) return;
    // Equal-depth cards are painted in DOM order: the last one is already on top.
    const front = $$('.card', pair).filter(c => !c.hidden).reduce((top, card) =>
      !top || +getComputedStyle(card).zIndex >= +getComputedStyle(top).zIndex ? card : top, null);
    topCards.set(pair, label);
    if (previous) previous.dispatchEvent(new Event('previewreturn'));
    if (front !== label) update(true);
  }
  // React to actual cursor movement, not enter/leave events caused by the shuffle itself.
  label.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' && hover.matches && !e.buttons) activate();
  });
  label.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) activate(); });
  label.addEventListener('previewreturn', () => update(false));
  // A grab or a scratch takes over the card in its top position.
  label.addEventListener('pointerdown', () => {
    if (motion && motion.playbackRate > 0) { motion.finish(); depth.finish(); }
  });
  label.addEventListener('previewreset', () => {
    if (topCards.get(label.parentNode) === label) topCards.delete(label.parentNode);
    clear();
  });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    const promoted = label.classList.contains('previewing');
    clear();
    if (promoted && topCards.get(label.parentNode) === label) update(true);
  });
}

// ---------- swipe ----------
function drag(label, onReject) {
  let x0, y0, dx = 0, dy = 0, on = false;
  label.addEventListener('pointerdown', e => {
    if (e.target.classList.contains('foil')) return;   // scratching, not dragging
    stopCardMotion(label);
    on = true; x0 = e.clientX; y0 = e.clientY; dx = dy = 0;
    raise(label);
    label.setPointerCapture(e.pointerId);
    label.classList.add('dragging');
  });
  label.addEventListener('pointermove', e => {
    if (!on) return;
    dx = e.clientX - x0; dy = e.clientY - y0;
    label.style.setProperty('--dx', dx + 'px');
    label.style.setProperty('--dy', dy * 0.4 + 'px');
    label.style.setProperty('--drot', dx / 14 + 'deg');
    label.style.setProperty('--yes', Math.min(1, Math.max(0, (dx - 20) / 70)));
    label.style.setProperty('--no', Math.min(1, Math.max(0, (-dx - 20) / 70)));
  });
  function end() {
    if (!on) return;
    on = false;
    const from = getComputedStyle(label).transform;
    label.classList.remove('dragging');
    for (const [k, v] of [['--dx', '0px'], ['--dy', '0px'], ['--drot', '0deg'], ['--yes', 0], ['--no', 0]]) label.style.setProperty(k, v);
    if (dx > 80) {
      const inp = label.querySelector('input');
      if (!inp.checked) { inp.checked = true; inp.dispatchEvent(new Event('change', { bubbles: true })); }
    } else if (dx < -80) {
      if (label.querySelector('input').checked) onReject();
      label.classList.add('rejected'); label.classList.remove('chosen');
      fan(label.parentNode);
      tuckCard(label, from);
    }
  }
  label.addEventListener('pointerup', end);
  label.addEventListener('pointercancel', () => { dx = dy = 0; end(); });
  label.addEventListener('click', e => { if (Math.abs(dx) > 6 || Math.abs(dy) > 6) { e.preventDefault(); dx = dy = 0; } });
}

// ---------- glow under the finger ----------
function glow(label) {
  let off;
  const at = e => {
    const r = label.getBoundingClientRect();
    label.style.setProperty('--px', e.clientX - r.left + 'px');
    label.style.setProperty('--py', e.clientY - r.top + 'px');
  };
  label.addEventListener('pointerdown', e => { clearTimeout(off); at(e); label.classList.add('touch'); });
  label.addEventListener('pointermove', e => {
    if (e.pressure > 0 || e.pointerType === 'mouse') at(e);
    if (e.pointerType === 'mouse') label.classList.add('touch');
  });
  for (const t of ['pointerup', 'pointercancel', 'pointerleave']) {
    label.addEventListener(t, () => { off = setTimeout(() => label.classList.remove('touch'), 350); });
  }
}

// ---------- scratch foil over the description ----------
export function paintFoils(sec) {
  if (!sec) return;
  sec.querySelectorAll('.foil').forEach(paintFoil);
}

function paintFoil(cv) {
  const box = cv.parentNode, w = box.clientWidth, h = box.clientHeight;
  if (!w || !h || cv.dataset.painted) return;
  const dpr = window.devicePixelRatio || 1;
  cv.width = w * dpr; cv.height = h * dpr;
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#f4d98c'); g.addColorStop(0.5, '#e9b949'); g.addColorStop(1, '#f7e3a8');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#6b4a0c';
  ctx.font = '700 11px ' + getComputedStyle(document.body).fontFamily;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('потри ✦', w / 2, h / 2);
  cv.dataset.painted = '1';

  let down = false, moved = 0, n = 0;
  const rub = e => {
    const r = cv.getBoundingClientRect();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(e.clientX - r.left, e.clientY - r.top, 16, 0, 7); ctx.fill();
    if (++n % 6 === 0) {
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0;
      for (let k = 3; k < d.length; k += 36) if (d[k] < 40) clear++;
      if (clear / (d.length / 36) > 0.45) cv.classList.add('done');
    }
  };
  cv.addEventListener('pointerdown', e => { down = true; moved = 0; cv.setPointerCapture(e.pointerId); rub(e); });
  cv.addEventListener('pointermove', e => { if (down) { moved++; rub(e); } });
  cv.addEventListener('pointerup', () => { down = false; });
  cv.addEventListener('pointercancel', () => { down = false; });
  cv.addEventListener('click', e => { if (moved > 2) e.preventDefault(); });   // a drag scratches; a tap still picks the card
}
