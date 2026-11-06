import { $ } from './dom.js';
import { clock } from '../time.js';
import { buildSubmission, sendPlan } from '../submission.js';
import { collectClientInfo } from '../client-info.js';

export function renderPlan(sched, onEdit) {
  const el = $('#plan');
  el.innerHTML = '';
  const selected = sched.steps.filter(st => sched.offered[st.id] && sched.state[st.id] && sched.fits[st.id]);
  function editButton(id, name) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'plan-edit';
    button.textContent = 'Изменить';
    button.setAttribute('aria-label', `Изменить: ${name}`);
    button.addEventListener('click', () => onEdit(id));
    return button;
  }
  for (const [index, r] of sched.rows().entries()) {
    const li = document.createElement('li');
    if (r.destination) {
      li.className = 'destination';
      const title = document.createElement('div'); title.className = 'what'; title.textContent = r.what;
      li.append(title, editButton(selected[index].id, r.what)); el.appendChild(li);
      continue;
    }
    const t = document.createElement(r.at ? 'time' : 'span');
    if (!r.at) t.className = 'dash';
    t.textContent = r.at || '—';
    const box = document.createElement('div');
    const w = document.createElement('div'); w.className = 'what'; w.textContent = r.what;
    const s = document.createElement('div'); s.className = 'sub'; s.textContent = r.sub;
    box.append(w, s, editButton(selected[index].id, r.what)); li.append(t, box); el.appendChild(li);
  }
  const tot = document.createElement('li'); tot.className = 'total';
  const span = document.createElement('span'); span.textContent = `${clock(sched.state.from)} → ${clock(sched.state.to)}`;
  tot.append(span, editButton('time', 'время')); el.appendChild(tot);
  $('#toast').textContent = '';
}

export function wireSubmit(sched) {
  const button = $('#submit-plan'), consent = $('#mood-accept');
  const restart = $('#restart'), toast = $('#toast');
  const storageKey = 'ideal-saturday:submission';
  const records = new Map();
  let sending = false;
  try {
    const record = JSON.parse(localStorage.getItem(storageKey));
    if (record && typeof record.fingerprint === 'string' && typeof record.id === 'string') {
      records.set(record.fingerprint, record);
    }
  } catch { /* Sending still works when browser storage is unavailable. */ }

  function persist(record) {
    records.set(record.fingerprint, record);
    try { localStorage.setItem(storageKey, JSON.stringify(record)); } catch { /* Keep the in-memory receipt. */ }
  }
  const currentRecord = () => records.get(JSON.stringify(buildSubmission(sched)));
  function sync() {
    const sent = currentRecord()?.sent;
    button.disabled = !consent.checked || sending || !!sent || !sched.rows().length;
    button.textContent = sending ? 'Отправляю…' : sent ? 'Отправлено ♥' : 'Отправить план';
    button.setAttribute('aria-busy', String(sending));
    restart.disabled = sending;
    document.querySelectorAll('.plan-edit').forEach(button => { button.disabled = sending; });
    consent.disabled = sending;
  }
  consent.addEventListener('change', sync);
  button.addEventListener('click', async () => {
    if (!consent.checked || sending || currentRecord()?.sent || !sched.rows().length) return;
    const draft = buildSubmission(sched), fingerprint = JSON.stringify(draft);
    const record = records.get(fingerprint) || { fingerprint, id: crypto.randomUUID(), sent: false };
    persist(record);
    sending = true; sync();
    toast.textContent = ''; delete toast.dataset.state;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      await sendPlan({ ...draft, id: record.id, client_info: collectClientInfo() }, controller.signal);
      record.sent = true; persist(record);
      toast.dataset.state = 'success';
      toast.textContent = 'План отправлен. До субботы ♥';
    } catch {
      toast.dataset.state = 'error';
      toast.textContent = 'Не получилось отправить. Попробуй ещё раз.';
    } finally {
      clearTimeout(timeout);
      sending = false; sync();
    }
  });
  sync();
  return function refreshSubmission() {
    toast.textContent = currentRecord()?.sent ? 'План отправлен. До субботы ♥' : '';
    delete toast.dataset.state;
    sync();
  };
}
