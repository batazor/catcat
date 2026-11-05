// These are browser-reported hints, not proof of identity or a bot verdict.
export function collectClientInfo(nav = navigator, view = window) {
  const ua = (nav.userAgent || '').slice(0, 512);
  const ipad = /iPad/i.test(ua) || (/Macintosh/i.test(ua) && nav.maxTouchPoints > 1);
  let device = 'Unknown';
  if (/iPhone/i.test(ua)) device = 'iPhone';
  else if (ipad) device = 'iPad';
  else if (/Android/i.test(ua)) device = /Mobile/i.test(ua) ? 'Android phone' : 'Android tablet';
  else if (/Macintosh|Mac OS X/i.test(ua)) device = 'Mac';
  else if (/Windows/i.test(ua)) device = 'Windows PC';
  else if (/Linux/i.test(ua)) device = 'Linux PC';

  let browser = 'Unknown';
  if (/Edg(?:e|A|iOS)?\//i.test(ua)) browser = 'Edge';
  else if (/OPR\/|OPiOS\//i.test(ua)) browser = 'Opera';
  else if (/CriOS\/|Chrome\/|Chromium\//i.test(ua)) browser = 'Chrome';
  else if (/FxiOS\/|Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Version\/.*Safari\//i.test(ua)) browser = 'Safari';

  return {
    device,
    browser,
    user_agent: ua,
    language: (nav.language || '').slice(0, 64),
    viewport: { width: view.innerWidth, height: view.innerHeight },
    automation_hint: nav.webdriver === true || /bot|crawler|spider|Headless/i.test(ua)
  };
}
