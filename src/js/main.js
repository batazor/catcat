import { createSchedule } from './schedule.js?v=10';
import { MSG } from './facts.js';
import { clock, fmtDur } from './time.js';
import { $, loadSvg } from './ui/dom.js?v=2';
import { setCatSvg, mountCat, setCat, catOffer, clearOffer } from './ui/cat.js?v=5';
import { buildStep, applyOptionWhen, fan, markPick, resetCards, paintFoils } from './ui/cards.js?v=20';
import { pawTap, isPawBusy } from './ui/paw.js?v=2';
import { readDraft, saveDraft } from './draft.js';
import { bubbles, parallax } from './ui/effects.js';
import { runIntro } from './ui/intro.js?v=5';
import { renderPlan, wireSubmit } from './ui/summary.js?v=7';
import { wireMood } from './ui/mood.js?v=4';

const BASE = import.meta.url ? new URL('../', import.meta.url) : null;   // src/ (empty inside the single-file build)
// SVG assets come from src/svg/*.svg; the single-file build inlines them into window.__ASSETS instead
function loadAsset(name) {
  const inline = window.__ASSETS && window.__ASSETS[name];
  if (inline) {
    const doc = new DOMParser().parseFromString(inline, 'image/svg+xml');
    return Promise.resolve(document.importNode(doc.documentElement, true));
  }
  if (!BASE) return Promise.reject(new Error(`no inline asset ${name}`));
  const version = name === 'cat' ? '?v=7' : name === 'scene' ? '?v=3' : '';
  return loadSvg(new URL(`svg/${name}.svg${version}`, BASE));
}

async function boot() {
  const [cat, paw, scene] = await Promise.allSettled(['cat', 'paw', 'scene'].map(loadAsset));
  if (cat.status !== 'fulfilled') throw cat.reason;
  setCatSvg(cat.value);
  if (paw.status === 'fulfilled') $('#paw').appendChild(paw.value);
  const sceneSvg = scene.status === 'fulfilled' ? scene.value : null;
  const draft = readDraft();

  const sched = createSchedule(draft?.state || { from: 14, to: 18 });
  const { state } = sched;
  const sections = { time: $('#step-time'), summary: $('#step-summary') };
  let cur = 'time';
  let confirmStage = 0;
  let touched = !!draft;
  let editing = null;
  const persist = () => saveDraft(state, cur, editing);
  document.querySelector('main').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.closest('.nav')) e.preventDefault();
  });
  document.querySelector('main').addEventListener('click', e => {
    if (isPawBusy()) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  // ---------- cats on the static steps ----------
  for (const el of document.querySelectorAll('[data-cat]')) mountCat(el);

  // ---------- generated steps ----------
  for (const step of sched.steps) {
    sections[step.id] = buildStep(step, $('#steps'), pick, btn => pawTap(btn, () => go(+1)), () => go(-1));
    mountCat($('[data-cat]', sections[step.id]));
  }

  function pick(step, optId) {
    if (optId === null) {
      clearPick(step);
      $('[data-next]', sections[step.id]).disabled = true;
      setCat(sections[step.id], null, 'awake', false);
      persist();
      return;
    }
    const fits = sched.pick(step.id, optId);
    const sec = sections[step.id], opt = sched.optOf(step, optId);
    markPick($('.pair', sec), optId, fits, `${MSG}. ${sched.why[step.id]}`);
    const next = $('[data-next]', sec);
    next.disabled = false;
    next.textContent = fits ? (sched.isLast(step.id) ? 'Собрать день' : 'Дальше') : 'Пропустить';
    setCat(sec, fits ? opt.acc : null, fits ? 'awake' : 'sad', true);
    const w = fits ? null : sched.needWindow(step, opt);
    catOffer(sec, w && sched.windowLabel(w), () => extendWindow(step, w));
    if (editing === step.id) next.textContent = fits ? 'Сохранить' : 'Убрать из плана';
    persist();
  }

  function extendWindow(step, w) {
    fromEl.value = w.from != null ? w.from : state.from;
    toEl.value = w.to != null ? w.to : state.to;
    touched = true;
    syncRange();
    for (const id of sched.route) if (id !== step.id && state[id]) pick(sched.byId(id), state[id]);   // earlier picks move with the window
    pick(step, state[step.id]);
  }

  // ---------- navigation ----------
  const hasChoice = step => step.options.some(opt => sched.optionOn(step, opt) && !sched.check(step, opt));
  function clearPick(step) {
    state[step.id] = null;
    sched.fits[step.id] = false;
    sched.why[step.id] = '';
    resetCards(sections[step.id]);
    clearOffer(sections[step.id]);
  }
  function afterEmpty(id) {
    const ord = sched.order();
    for (const next of ord.slice(ord.indexOf(id) + 1)) {
      if (next === 'summary' || hasChoice(sched.byId(next))) return next;
      clearPick(sched.byId(next));
    }
  }
  function show(id) {
    cur = id;
    document.querySelectorAll('.btn.taken').forEach(b => b.classList.remove('taken'));
    for (const k in sections) sections[k].hidden = k !== id;
    const step = sched.byId(id);
    if (step) {
      const sec = sections[id];
      applyOptionWhen(sec, step, sched.optionOn, () => { state[id] = null; $('[data-next]', sec).disabled = true; });
      const empty = !hasChoice(step);
      sec.dataset.exhausted = String(empty);
      $('fieldset', sec).hidden = empty;
      $('.step-empty', sec).hidden = !empty;
      fan($('.pair', sec));
      $('h1', sec).textContent = empty ? 'В другой раз' : step.title(state);
      if (empty) {
        clearPick(step);
        const next = $('[data-next]', sec);
        next.disabled = false;
        next.textContent = afterEmpty(id) === 'summary' ? 'Собрать день' : 'Дальше';
        setCat(sec, null, 'awake', false);
      } else {
        const next = $('[data-next]', sec);
        next.disabled = !state[id];
        next.textContent = state[id] && !sched.fits[id] ? 'Пропустить' : sched.isLast(id) ? 'Собрать день' : 'Дальше';
        if (!state[id]) setCat(sec, null, 'awake', false);
        requestAnimationFrame(() => paintFoils(sec));
      }
    }
    if (id === 'summary') {
      editing = null;
      renderPlan(sched, id => { editing = id; show(id); });
      refreshSubmission();
      setCat(sections.summary, 'shades', 'awake', true);
      bubbles();
    }
    if (editing === id) {
      const next = id === 'time' ? timeNext : $('[data-next]', sections[id]);
      next.textContent = id === 'where' ? 'Дальше' : 'Сохранить';
      if (id !== 'time') $('[data-back]', sections[id]).textContent = 'К плану';
    } else if (step) $('[data-back]', sections[id]).textContent = 'Назад';
    persist();
    window.scrollTo(0, 0);
  }
  function recheckPlan() {
    sched.computeRoute();
    for (const id of sched.route) {
      const st = sched.byId(id), opt = sched.optOf(st, state[id]);
      if (opt && (!sched.optionOn(st, opt) || !sched.pick(id, opt.id))) clearPick(st);
    }
  }
  function go(dir) {
    if (editing && cur === editing) {
      if (cur === 'where' && dir > 0) { editing = null; }
      else { recheckPlan(); show('summary'); return; }
    }
    if (dir > 0 && sections[cur].dataset.exhausted === 'true') {
      show(afterEmpty(cur));
      return;
    }
    if (dir > 0 && state[cur] && !sched.fits[cur]) clearPick(sched.byId(cur));
    const ord = sched.order(), i = ord.indexOf(cur) + dir;
    show(ord[Math.max(0, Math.min(ord.length - 1, i))]);
  }
  // ---------- time window ----------
  const fromEl = $('#from'), toEl = $('#to'), fill = $('#r-fill'), hint = $('#r-hint'), timeNext = $('#time-next');
  function syncRange(src) {
    let a = +fromEl.value, b = +toEl.value;
    const min = +fromEl.min, max = +fromEl.max;
    if (a > b - 1) { if (src === fromEl) { a = b - 1; fromEl.value = a; } else { b = a + 1; toEl.value = b; } }
    sched.setWindow(a, b);
    $('#r-from').value = clock(a); $('#r-to').value = clock(b); $('#r-dur').value = fmtDur(b - a);
    fill.style.setProperty('--lf', (a - min) / (max - min));
    fill.style.setProperty('--rf', 1 - (b - min) / (max - min));
    confirmStage = 0; timeNext.textContent = 'Дальше';
    let mood = touched ? 'awake' : 'asleep';
    if (b - a < 2) { hint.hidden = false; hint.dataset.level = 'stop'; hint.textContent = 'Так не играем. За два часа ничего не успеем.'; timeNext.disabled = true; mood = 'sad'; }
    else if (b - a < 4) { hint.hidden = true; hint.textContent = ''; timeNext.disabled = false; mood = 'wistful'; }
    else { hint.hidden = true; timeNext.disabled = false; }
    setCat(sections.time, null, mood, false);
    if (editing === 'time' && !timeNext.disabled) timeNext.textContent = 'Сохранить';
    persist();
  }
  for (const el of [fromEl, toEl]) el.addEventListener('input', () => { touched = true; syncRange(el); });
  timeNext.addEventListener('click', () => {
    if (editing === 'time') {
      pawTap(timeNext, () => {
        recheckPlan();
        editing = null;
        show(sched.rows().length ? 'summary' : sched.order()[1]);
      });
      return;
    }
    const labels = ['Уверена?', 'Точно-точно?'];
    if (sched.budget() < 4 && confirmStage < labels.length) {
      timeNext.textContent = labels[confirmStage++];
      setCat(sections.time, null, 'wistful', false);
      return;
    }
    pawTap(timeNext, () => {
      sched.computeRoute();
      for (const id of sched.route) if (state[id]) pick(sched.byId(id), state[id]);   // re-check picks against the new window
      show(sched.order()[1]);
    });
  });

  // ---------- summary ----------
  const refreshSubmission = wireSubmit(sched);
  const resetMood = wireMood();
  $('#restart').addEventListener('click', () => {
    resetMood();
    editing = null;
    sched.reset();
    for (const step of sched.steps) {
      const sec = sections[step.id];
      resetCards(sec);
      $('[data-next]', sec).disabled = true;
      setCat(sec, null, 'awake', false);
      clearOffer(sec);
    }
    touched = false;
    syncRange();
    show('time');
  });

  fromEl.value = state.from; toEl.value = state.to;
  if (draft) {
    sched.computeRoute();
    for (const st of sched.steps) {
      const opt = sched.optOf(st, draft.state[st.id]);
      if (sched.offered[st.id] && opt && sched.optionOn(st, opt)) pick(st, opt.id);
    }
    editing = ['time', ...sched.route].includes(draft.editing) ? draft.editing : null;
  }
  parallax();
  if (sceneSvg && !draft) runIntro(sceneSvg);
  else $('#intro').hidden = true;
  syncRange();
  const resume = draft && sched.order().includes(draft.current) && sched.budget() >= 2 ? draft.current : 'time';
  show(resume);
}

boot().catch(err => {
  console.error(err.stack || err);
  $('#intro').hidden = true;
  const main = document.querySelector('main');
  main.classList.remove('landing');
  main.replaceChildren();
  const p = document.createElement('p');
  p.className = 'hint'; p.dataset.level = 'stop';
  p.textContent = 'Не загрузились части страницы. Обнови, пожалуйста.';
  const retry = document.createElement('button');
  retry.type = 'button'; retry.className = 'btn'; retry.textContent = 'Попробовать ещё раз';
  retry.addEventListener('click', () => location.reload());
  const box = document.createElement('section'); box.className = 'step load-error';
  box.append(p, retry); main.append(box);
});
