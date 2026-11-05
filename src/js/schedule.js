// The time engine. No DOM here — it is unit-tested on its own.
// state.from / state.to are the window; state[stepId] holds the picked option id (or null).

import { SUNSET, SUNSET_AT, SUNSET_SLOT } from './facts.js';
import { clock, fmtDur } from './time.js';
import { makeSteps } from './steps.js?v=8';

export function createSchedule(initial = { from: 14, to: 18 }) {
  const state = { from: initial.from, to: initial.to };
  const fits = {}, why = {}, offered = {};
  let route = [];
  let steps = [];

  const budget = (s = state) => s.to - s.from;
  const byId = id => steps.find(st => st.id === id) || null;
  const optOf = (step, id) => step.options.find(o => o.id === id) || null;

  function costOf(st, s = state, o = s[st.id] ? optOf(st, s[st.id]) : null) {
    const c = o && o.cost != null ? o.cost : st.cost;
    return typeof c === 'function' ? c(s) : c;
  }
  function usedBefore(id, s = state) {
    let u = 0;
    for (const st of steps) { if (st.id === id) break; if (s[st.id] && fits[st.id]) u += costOf(st, s); }
    return u;
  }
  const start = (id, s = state) => s.from + usedBefore(id, s);
  function used() { return steps.reduce((u, st) => u + (state[st.id] && fits[st.id] ? costOf(st) : 0), 0); }
  const evening = s => s.to >= SUNSET + 0.25 && s.from <= SUNSET_SLOT;

  function sunsetCheck(s, stepId) {
    if (s.to < SUNSET + 0.25) return `Закат в ${SUNSET_AT}, а ты до ${clock(s.to)}`;
    const st = start(stepId, s);
    if (st > SUNSET_SLOT) return `К закату в ${SUNSET_AT} не успеем: освободимся в ${clock(st)}`;
    return '';
  }

  steps = makeSteps({ start, budget, evening, sunsetCheck });
  for (const st of steps) state[st.id] = null;

  // '' when the pick fits, otherwise the reason it doesn't
  function check(step, opt) {
    let w = opt.check ? opt.check(state, step.id) : '';
    if (!w && step.check) w = step.check(state, step.id);
    const left = budget() - usedBefore(step.id), c = costOf(step, state, opt);
    if (!w && c > left) w = `Нужно ${fmtDur(c)}, осталось ${fmtDur(Math.max(0, left))}`;
    return w;
  }

  // records a pick; returns true when it fits
  function pick(stepId, optId) {
    const step = byId(stepId);
    state[stepId] = optId;
    why[stepId] = check(step, optOf(step, optId));
    fits[stepId] = !why[stepId];
    if (stepId === 'where') computeRoute();
    return fits[stepId];
  }

  // how the window could change so this pick fits: {to}, {from} or {from,to}; null when nothing helps
  function needWindow(step, opt) {
    const saved = { from: state.from, to: state.to };
    const tryWith = (from, to) => { state.from = from; state.to = to; const ok = !check(step, opt); state.from = saved.from; state.to = saved.to; return ok; };
    for (let t = saved.to + 0.5; t <= 23; t += 0.5) if (tryWith(saved.from, t)) return { to: t };
    for (let t = saved.from - 0.5; t >= 8; t -= 0.5) if (tryWith(t, saved.to)) return { from: t };
    for (let d = 0.5; saved.from - d >= 8 && saved.to + d <= 23; d += 0.5) if (tryWith(saved.from - d, saved.to + d)) return { from: saved.from - d, to: saved.to + d };
    return null;
  }
  function windowLabel(w) {
    if (w.from != null && w.to != null) return `Будем ${clock(w.from)} → ${clock(w.to)}`;
    if (w.to != null) return `Останемся до ${clock(w.to)}`;
    return `Начнём с ${clock(w.from)}`;
  }

  function setWindow(from, to) {
    state.from = from; state.to = to;
  }

  function computeRoute() {
    route = [];
    for (const st of steps) {
      offered[st.id] = st.when(state);
      if (offered[st.id]) route.push(st.id);
      else { state[st.id] = st.fallback || null; fits[st.id] = !!st.fallback; why[st.id] = st.skipNote || ''; }
    }
    return route;
  }
  const order = () => ['time', ...route, 'summary'];
  const isLast = id => route[route.length - 1] === id;
  const optionOn = (step, opt) => !opt.when || opt.when(state);

  function rows() {
    return steps
      .filter(st => offered[st.id] && state[st.id] && fits[st.id])
      .map(st => {
        const opt = optOf(st, state[st.id]);
        if (st.noRow) return { at: '', what: opt.label, sub: '', acc: opt.acc, destination: true };
        const at = opt.fixedAt != null ? opt.fixedAt : st.fixedAt != null ? st.fixedAt : start(st.id);
        return {
          at: clock(at),
          what: opt.label,
          sub: `${opt.sub} · ${opt.hours || st.hours}`,
          acc: opt.acc
        };
      });
  }

  function planText() {
    const place = offered.where && state.where ? '' : state.where === 'bukit' ? ' на Буките' : ' в Чангу';
    return `Моя суббота${place}, ${clock(state.from)}–${clock(state.to)}:\n` +
      rows().map(r => r.at ? `${r.at} — ${r.what}` : r.what).join('\n');
  }
  function reset() {
    for (const st of steps) { state[st.id] = null; fits[st.id] = false; why[st.id] = ''; }
    route = [];
  }

  return {
    state, fits, why, offered, steps,
    get route() { return route; },
    budget, byId, optOf, costOf, usedBefore, start, used, evening, sunsetCheck,
    check, pick, needWindow, windowLabel, setWindow, computeRoute, order, isLast, optionOn, rows, planText, reset
  };
}
