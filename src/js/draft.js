const KEY = 'ideal-saturday:draft';
const VERSION = 1;

export function readDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(KEY));
    const { from, to } = draft?.state || {};
    if (draft?.version !== VERSION || !Number.isFinite(from) || !Number.isFinite(to) ||
        from < 8 || to > 23 || to - from < 1 || from * 2 % 1 || to * 2 % 1) return null;
    return draft;
  } catch { return null; }
}

export function saveDraft(state, current, editing) {
  try { localStorage.setItem(KEY, JSON.stringify({ version: VERSION, state, current, editing })); }
  catch { /* The plan still works when storage is full or unavailable. */ }
}
