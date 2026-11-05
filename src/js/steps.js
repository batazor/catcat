// Place details in card descriptions: checked 2026-11-06, links in facts.js SOURCES.
// Step and card configuration. Pure data plus small predicate functions.
// `when` decides whether a step (or a card) is offered — that's the branching.
// `check` returns a reason string when a pick does not fit, '' when it does.
// `api` is injected by the schedule so that predicates can use start()/budget() without a circular import.

import { SUNSET, SUNSET_AT, SUNSET_SLOT, BIRDS, GARDEN, KECAK } from './facts.js';
import { clock, travel } from './time.js';

export function makeSteps(api) {
  const { start, budget, evening, sunsetCheck } = api;

  return [
    {
      id: 'where', cost: 0, hours: '', noRow: true,
      when: s => budget(s) >= 4,
      fallback: 'canggu',
      title: () => 'Куда?',
      options: [
        { id: 'canggu', label: 'Остаёмся в Чангу', desc: 'Дом милый дом', icon: 'home', acc: '', sub: '' },
        { id: 'bukit', label: 'Букит и пляж', desc: 'Пляжи под скалами и храм Улувату над океаном', icon: 'cliff', acc: 'shades', sub: '' }
      ]
    },
    {
      id: 'short', cost: 2, hours: '~2 ч',
      when: s => budget(s) < 3,
      title: s => (evening(s) ? 'Два часа. Настолки или руфтоп?' : 'Два часа. Во что?'),
      options: [
        { id: 'boardgames', label: 'Настолки', desc: 'Тест на любовь к настолкам', icon: 'dice', acc: 'dice', sub: 'Начало' },
        { id: 'billiards', label: 'Бильярд', desc: 'Мастерство или удача?', icon: 'ball', acc: 'ball', sub: 'Начало', when: s => !evening(s) },
        { id: 'rooftop', label: 'На руфтопе', desc: 'Сочетание комфорта с небом', icon: 'roof', acc: 'shades cocktail', sub: `Закат в ${SUNSET_AT}, после ужин`, fixedAt: SUNSET_SLOT, check: sunsetCheck, when: s => evening(s) }
      ]
    },
    {
      id: 'game', cost: 2, hours: '~2 ч', branch: 'canggu',
      when: s => s.where !== 'bukit' && budget(s) >= 3,
      title: () => 'Чем займёмся сначала?',
      skipNote: 'Поздно начинаем, сразу закат',
      options: [
        { id: 'boardgames', label: 'Настолки', desc: 'Тест на любовь к настолкам', icon: 'dice', acc: 'dice', sub: 'Начало' },
        { id: 'billiards', label: 'Бильярд', desc: 'Мастерство или удача?', icon: 'ball', acc: 'ball', sub: 'Начало' },
        { id: 'origami', label: 'Оригами', desc: 'Журавлик с третьей попытки', icon: 'crane', acc: 'crane', sub: 'Начало' }
      ]
    },
    {
      id: 'nature', cost: 3, hours: '~3 ч с дорогой', branch: 'canggu',
      when: s => s.where !== 'bukit' && budget(s) >= 3 && start('nature', s) + 2 <= s.to,
      title: s => (s.game ? 'Теперь на воздух' : 'Начнём с природы'),
      skipNote: 'На природу времени не осталось',
      options: [
        {
          id: 'birds', label: 'Птицы', desc: 'Какаду, райские птицы и редкий балийский скворец', icon: 'bird', acc: 'bird', sub: 'Дорога и обед по пути',
          check(s) {
            const arrive = start('nature', s) + BIRDS.travel;
            if (arrive < BIRDS.open) return `Парк открывается в ${clock(BIRDS.open)}`;
            if (arrive > BIRDS.close - 1.5) return `Парк закрывается в ${clock(BIRDS.close)}, приедем поздно`;
            return '';
          }
        },
        {
          id: 'garden', label: 'Ботанический сад', desc: 'Орхидеи Сулавеси и Папуа в одном саду', icon: 'leaf', acc: 'leaf', sub: 'Дорога 2 ч, обед по пути', cost: 4, hours: '~4 ч с дорогой',
          check(s) {
            const arrive = start('nature', s) + GARDEN.travel;
            if (arrive > GARDEN.close - 2) return `Сад до ${clock(GARDEN.close)}, а приедем в ${clock(arrive)}`;
            return '';
          }
        }
      ]
    },
    {
      id: 'sunset', cost: 2, hours: '~2 ч', fixedAt: SUNSET_SLOT, branch: 'canggu',
      when: s => s.where !== 'bukit' && budget(s) >= 3,
      title: s => (s.nature ? 'Закат. Где?' : 'Остаётся закат. Где?'),
      check: sunsetCheck,
      options: [
        { id: 'beach', label: 'Закат на пляже', desc: 'Босиком по песку, пока солнце уходит в океан', icon: 'beach', acc: 'shades', sub: `Закат в ${SUNSET_AT}, после ужин` },
        { id: 'rooftop', label: 'На руфтопе', desc: 'Сочетание комфорта с небом', icon: 'roof', acc: 'shades cocktail', sub: `Закат в ${SUNSET_AT}, после ужин` }
      ]
    },
    {
      id: 'bbeach', hours: '~2,5 ч + дорога', branch: 'bukit',
      cost: s => travel(s.from) + 2.5,
      when: s => s.where === 'bukit',
      title: () => 'Какой пляж?',
      options: [
        { id: 'gpayung', label: 'Гунунг-Паюнг', desc: 'Спуск к белому песку через небольшой грот', icon: 'cave', acc: 'leaf', sub: 'Выезд из Чангу. Обратную дорогу не считаю' },
        { id: 'melasti', label: 'Меласти', desc: 'Дорога прорезает скалы и выходит прямо к океану', icon: 'bay', acc: 'shades', sub: 'Выезд из Чангу. Обратную дорогу не считаю' }
      ]
    },
    {
      id: 'bsunset', cost: 2, hours: '~2 ч', branch: 'bukit',
      when: s => s.where === 'bukit',
      title: () => 'А закат?',
      options: [
        {
          id: 'kecak', label: 'Кечак в Улувату', desc: 'Хор вместо оркестра. Танец с огнём', icon: 'fire', acc: 'shades cocktail', sub: 'Шоу 18:00–19:00', fixedAt: KECAK.arrive,
          check(s) {
            if (s.to < KECAK.end) return `Шоу до ${clock(KECAK.end)}, а ты до ${clock(s.to)}`;
            if (start('bsunset', s) > KECAK.arrive) return `В храме надо быть к ${clock(KECAK.arrive)}, а с пляжа уедем в ${clock(start('bsunset', s))}`;
            return '';
          }
        },
        { id: 'stay', label: 'Закат на пляже', desc: 'Босиком по песку, пока солнце уходит в океан', icon: 'beach', acc: 'shades', sub: `Закат в ${SUNSET_AT}, после ужин`, fixedAt: SUNSET_SLOT, check: sunsetCheck }
      ]
    }
  ];
}
