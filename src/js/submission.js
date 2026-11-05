import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './supabase-config.js';

export function buildSubmission(sched) {
  return {
    window_start: sched.state.from,
    window_end: sched.state.to,
    time_zone: 'Asia/Makassar',
    destination: sched.state.where || 'canggu',
    selections: Object.fromEntries(sched.steps
      .filter(step => sched.state[step.id] && sched.fits[step.id])
      .map(step => [step.id, sched.state[step.id]])),
    plan: sched.rows(),
    plan_text: sched.planText(),
    offer_accepted: true,
    offer_version: '2026-11-06'
  };
}

export async function sendPlan(payload, signal) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/saturday_plans`, {
    method: 'POST',
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(payload),
    signal
  });
  if (response.status === 409) {
    const error = await response.json();
    if (error.code === '23505') return payload.id; // A retry of the same submission.
  }
  if (!response.ok) throw new Error(`Plan submission failed (${response.status})`);
  return payload.id;
}
