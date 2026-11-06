import { $, loadSvg, reducedMotion } from './dom.js';

const MESSAGE = 'Договорились ♥';
const WISH = 'Можно смеяться, менять планы и просто быть собой.';

export function wireMood() {
  const input = $('#mood-accept'), link = $('#mood-offer-link');
  const dialog = $('#mood-offer-dialog'), content = $('#mood-offer-content');
  const status = $('#mood-status');
  const ship = loadSvg(new URL('../../svg/airship.svg?v=2', import.meta.url)).catch(() => null);
  let documentReady = null, flight = null, timer = null, generation = 0;

  function stopFlight() {
    generation++;
    clearTimeout(timer);
    timer = null;
    if (flight) flight.remove();
    flight = null;
  }

  async function celebrate() {
    stopFlight();
    const current = generation;
    status.textContent = `${MESSAGE} ${WISH}`;
    if (reducedMotion()) return;
    const svg = await ship;
    if (current !== generation || !input.checked || reducedMotion()) return;
    flight = document.createElement('div');
    flight.className = 'mood-flight';
    flight.setAttribute('aria-hidden', 'true');
    const airship = document.createElement('div'); airship.className = 'mood-airship';
    const rig = document.createElement('div'); rig.className = 'mood-rig';
    if (svg) rig.appendChild(svg.cloneNode(true));
    const message = document.createElement('div'); message.className = 'mood-message';
    const title = document.createElement('strong'); title.textContent = MESSAGE;
    const wish = document.createElement('p'); wish.textContent = WISH;
    message.append(title, wish); rig.appendChild(message); airship.appendChild(rig);
    flight.appendChild(airship); document.body.appendChild(flight);
    airship.addEventListener('animationend', e => { if (e.animationName === 'moodCruise') stopFlight(); });
    timer = setTimeout(stopFlight, 11000);
  }

  input.addEventListener('change', () => {
    if (input.checked) celebrate();
    else { stopFlight(); status.textContent = ''; }
  });

  link.addEventListener('click', async e => {
    e.preventDefault();
    try {
      if (!documentReady) {
        documentReady = fetch(link.href).then(async response => {
          if (!response.ok) throw new Error('Offer unavailable');
          const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
          const article = doc.querySelector('.mood-document');
          if (!article) throw new Error('Offer missing');
          content.appendChild(document.importNode(article, true));
        });
      }
      await documentReady;
      if (!dialog.open) dialog.showModal();
    } catch {
      documentReady = null;
      window.location.assign(link.href);
    }
  });
  $('#mood-offer-close').addEventListener('click', () => dialog.close());
  $('#mood-offer-agree').addEventListener('click', () => {
    dialog.close();
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', stopFlight);

  return function resetMood() {
    stopFlight();
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    status.textContent = '';
    if (dialog.open) dialog.close();
  };
}
