export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function reducedMotion() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// restart a CSS animation by toggling a class
export function replay(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// fetch an SVG file and return its <svg> element
export async function loadSvg(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
    const err = doc.querySelector('parsererror');
    if (err) throw new Error(`${url}: ${err.textContent.split('\n')[0]}`);
    return document.importNode(doc.documentElement, true);
  } finally { clearTimeout(timeout); }
}
