// Every number here was checked against a source on 2026-11-05. Keep the link next to the fact.

export const SUNSET = 18.25;          // 18:16 — weather25.com, Canggu, 6 Nov 2026
export const SUNSET_AT = '18:16';
export const SUNSET_SLOT = SUNSET - 0.75;   // be in place by 17:30

export const BIRDS = { open: 9, close: 17.5, travel: 1 };
// Bali Bird Park, 9:00–17:30 daily — https://citynomads.com/bali-bird-and-reptile-park/ ; ~1 h from Canggu (estimate)

export const GARDEN = { open: 8, close: 17, travel: 2 };
// Kebun Raya Bali (Bedugul), Sat–Sun 8:00–17:00, ~2 h from Canggu, 1300 m, 18–24 °C — https://www.baliholidaysecrets.com/bali-botanical-garden/

export const KECAK = { show: 18, end: 19, arrive: 16.5 };
// Uluwatu temple Kecak, shows 18:00 & 19:00, arrive ~16:30, IDR 150k + 50k entry — https://www.baliholidaysecrets.com/uluwatu-kecak-dance/

export const MSG = 'Было бы круто, но нам не хватит времени';

export const SOURCES = [
  // Card descriptions, checked 2026-11-06: coast, species, orchid origins, and the Kecak chorus.
  { label: 'Букит и Меласти: скалы и берег', url: 'https://sita.badungkab.go.id/en/destinations/tracing-the-elegance-of-melasti-beach-the-jewel-of-uluwatu' },
  { label: 'Bali Bird Park: какаду, райские птицы, балийский скворец', url: 'https://www.balibirdpark.com/' },
  { label: 'Kebun Raya Bali: откуда орхидеи', url: 'https://kebunraya.id/r/bali/interesting-spot/taman-anggrek-IyMo' },
  { label: 'Кечак: хор, Рама и Сита, храм над океаном', url: 'https://www.indonesia.travel/id/id/travel-ideas/culture/cultural-experience-in-bali-uluwatu-kecak-dance' },

  { label: 'Закат в Чангу', url: 'https://www.weather25.com/asia/indonesia/bali/canggu?page=tomorrow' },
  { label: 'Bali Bird Park', url: 'https://citynomads.com/bali-bird-and-reptile-park/' },
  { label: 'Kebun Raya Bali', url: 'https://www.baliholidaysecrets.com/bali-botanical-garden/' },
  { label: 'Кечак в Улувату', url: 'https://www.baliholidaysecrets.com/uluwatu-kecak-dance/' },
  { label: 'Дорога Чангу → Улувату', url: 'https://www.baliholidaysecrets.com/canggu-to-uluwatu/' },
  { label: 'Гунунг-Паюнг', url: 'https://finnsbeachclub.com/guides/gunung-payung-beach' },
  { label: 'Меласти', url: 'https://finnsbeachclub.com/guides/melasti-beach-bali/' }
];
