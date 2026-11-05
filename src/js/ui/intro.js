// Camera descends from the sky to the sand (three parallax layers), then the start screen assembles.
import { $, reducedMotion } from './dom.js';
import { cloneCat } from './cat.js?v=5';

export function runIntro(sceneSvg) {
  const el = $('#intro'), main = $('main');
  if (!el) return;
  if (reducedMotion()) { el.hidden = true; return; }
  el.insertBefore(sceneSvg, el.firstChild);
  main.classList.add('landing');

  // the sleeping cat on the sand is the same drawing
  const holder = $('[data-intro-cat]', el), src = cloneCat();
  while (src.firstChild) holder.appendChild(src.firstChild);

  const done = () => {
    if (el.hidden) return;
    el.classList.add('out');
    main.classList.remove('landing');
    main.classList.add('landed');
    setTimeout(() => { el.hidden = true; }, 850);
  };
  $('.layer.near', el).addEventListener('animationend', () => setTimeout(done, 1100));
  setTimeout(done, 7000);   // safety net if animationend never fires
}
