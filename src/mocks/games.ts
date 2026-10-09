import type { Game, OddRound, RoutineRound } from '@/types';

export const GAMES: Game[] = [
  {
    slug: 'my-day',
    skill: 'sequencing',
    theme: 'routine',
    minutes: 5,
    title: { az: 'Günümü düzürəm', en: 'I arrange my day', ru: 'Составляю свой день' },
    subtitle: { az: 'Gündəlik işləri ardıcıllıqla düz', en: 'Put daily activities in order', ru: 'Разложи дела дня по порядку' },
    instructions: {
      az: 'Kartlara toxun və onları yerlərinə qoy. İstəsən, kartı sürükləyə də bilərsən. Sonra “Yoxla” düyməsini bas.',
      en: 'Tap a card to place it in the next empty spot. You can also drag cards. Then press “Check”.',
      ru: 'Нажимай на карточки, чтобы поставить их по местам. Можно и перетаскивать. Потом нажми «Проверить».',
    },
  },
  {
    slug: 'odd-one-out',
    skill: 'attention',
    theme: 'odd',
    minutes: 4,
    title: { az: 'Fərqli olanı tap', en: 'Find the odd one', ru: 'Найди лишнее' },
    subtitle: { az: 'Diqqətlə bax və fərqli olanı seç', en: 'Look closely and pick the different one', ru: 'Смотри внимательно и выбери другое' },
    instructions: {
      az: 'Hər dəstədə bir əşya digərlərindən fərqlidir. Onu tap və ona toxun.',
      en: 'In each group one thing is different from the others. Find it and tap it.',
      ru: 'В каждой группе один предмет отличается от остальных. Найди его и нажми.',
    },
  },
];

export const ROUTINE_ROUNDS: RoutineRound[] = [
  {
    id: 'morning',
    title: { az: 'Səhər', en: 'Morning', ru: 'Утро' },
    hint: {
      az: 'Gün oyanmaqla başlayır. Yeməkdən əvvəl geyinirik.',
      en: 'The day starts with waking up. We get dressed before breakfast.',
      ru: 'День начинается с пробуждения. Одеваемся до завтрака.',
    },
    items: [
      { id: 'wake', visual: '🌅', label: { az: 'Oyanıram', en: 'Wake up', ru: 'Просыпаюсь' } },
      { id: 'teeth', visual: '🪥', label: { az: 'Dişlərimi fırçalayıram', en: 'Brush teeth', ru: 'Чищу зубы' } },
      { id: 'dress', visual: '👕', label: { az: 'Geyinirəm', en: 'Get dressed', ru: 'Одеваюсь' } },
      { id: 'breakfast', visual: '🥣', label: { az: 'Səhər yeməyi', en: 'Breakfast', ru: 'Завтрак' } },
    ],
  },
  {
    id: 'evening',
    title: { az: 'Axşam', en: 'Evening', ru: 'Вечер' },
    hint: {
      az: 'Axşam yeməyi birinci gəlir, yuxu isə ən sonda.',
      en: 'Dinner comes first and sleep comes last.',
      ru: 'Сначала ужин, а сон — в самом конце.',
    },
    items: [
      { id: 'dinner', visual: '🍲', label: { az: 'Axşam yeməyi', en: 'Dinner', ru: 'Ужин' } },
      { id: 'bath', visual: '🛁', label: { az: 'Çimirəm', en: 'Bath time', ru: 'Купаюсь' } },
      { id: 'pyjamas', visual: '🧸', label: { az: 'Pijama geyinirəm', en: 'Pyjamas on', ru: 'Надеваю пижаму' } },
      { id: 'sleep', visual: '🌙', label: { az: 'Yatıram', en: 'Sleep', ru: 'Сплю' } },
    ],
  },
];

export const ODD_ROUNDS: OddRound[] = [
  {
    id: 'fruit',
    prompt: { az: 'Hansı meyvə deyil?', en: 'Which one is not a fruit?', ru: 'Что здесь не фрукт?' },
    items: [
      { id: 'apple', emoji: '🍎', tone: '#FFE1DD', label: { az: 'Alma', en: 'Apple', ru: 'Яблоко' } },
      { id: 'banana', emoji: '🍌', tone: '#FFF2C2', label: { az: 'Banan', en: 'Banana', ru: 'Банан' } },
      { id: 'car', emoji: '🚗', tone: '#DDE7FF', label: { az: 'Maşın', en: 'Car', ru: 'Машина' } },
      { id: 'pear', emoji: '🍐', tone: '#E1F6E9', label: { az: 'Armud', en: 'Pear', ru: 'Груша' } },
    ],
    correctId: 'car',
    hint: { az: 'Hansını yemək olmaz?', en: 'Which one can’t we eat?', ru: 'Что нельзя съесть?' },
    explanation: { az: 'Maşın meyvə deyil — onu yemirik, onunla gedirik.', en: 'A car is not a fruit — we ride in it, we don’t eat it.', ru: 'Машина — не фрукт: на ней ездят, её не едят.' },
  },
  {
    id: 'animals',
    prompt: { az: 'Hansı heyvan deyil?', en: 'Which one is not an animal?', ru: 'Что здесь не животное?' },
    items: [
      { id: 'cat', emoji: '🐱', tone: '#FFF2C2', label: { az: 'Pişik', en: 'Cat', ru: 'Кошка' } },
      { id: 'ball', emoji: '⚽', tone: '#E8EEFF', label: { az: 'Top', en: 'Ball', ru: 'Мяч' } },
      { id: 'dog', emoji: '🐶', tone: '#FFE8D6', label: { az: 'İt', en: 'Dog', ru: 'Собака' } },
      { id: 'rabbit', emoji: '🐰', tone: '#F1E9FF', label: { az: 'Dovşan', en: 'Rabbit', ru: 'Кролик' } },
    ],
    correctId: 'ball',
    hint: { az: 'Hansı nəfəs almır və qaça bilmir?', en: 'Which one doesn’t breathe or run by itself?', ru: 'Что не дышит и не бегает само?' },
    explanation: { az: 'Top oyuncaqdır, heyvan deyil.', en: 'A ball is a toy, not an animal.', ru: 'Мяч — игрушка, а не животное.' },
  },
  {
    id: 'colors',
    prompt: { az: 'Hansı rəngi fərqlidir?', en: 'Which colour is different?', ru: 'У чего другой цвет?' },
    items: [
      { id: 'b1', emoji: '🔵', tone: '#E8EEFF', label: { az: 'Mavi dairə', en: 'Blue circle', ru: 'Синий круг' } },
      { id: 'b2', emoji: '🔵', tone: '#E8EEFF', label: { az: 'Mavi dairə', en: 'Blue circle', ru: 'Синий круг' } },
      { id: 'b3', emoji: '🔵', tone: '#E8EEFF', label: { az: 'Mavi dairə', en: 'Blue circle', ru: 'Синий круг' } },
      { id: 'r1', emoji: '🔴', tone: '#FFE1DD', label: { az: 'Qırmızı dairə', en: 'Red circle', ru: 'Красный круг' } },
    ],
    correctId: 'r1',
    hint: { az: 'Üç dairə eyni rəngdədir. Biri isə başqadır.', en: 'Three circles share a colour. One is different.', ru: 'Три круга одного цвета, а один — другого.' },
    explanation: { az: 'Qırmızı dairə mavilərdən fərqlidir.', en: 'The red circle is different from the blue ones.', ru: 'Красный круг отличается от синих.' },
  },
  {
    id: 'vehicles',
    prompt: { az: 'Hansı nəqliyyat deyil?', en: 'Which one is not a vehicle?', ru: 'Что здесь не транспорт?' },
    items: [
      { id: 'bus', emoji: '🚌', tone: '#FFF2C2', label: { az: 'Avtobus', en: 'Bus', ru: 'Автобус' } },
      { id: 'bike', emoji: '🚲', tone: '#E1F6E9', label: { az: 'Velosiped', en: 'Bicycle', ru: 'Велосипед' } },
      { id: 'flower', emoji: '🌻', tone: '#FFF2C2', label: { az: 'Çiçək', en: 'Flower', ru: 'Цветок' } },
      { id: 'train', emoji: '🚆', tone: '#DDE7FF', label: { az: 'Qatar', en: 'Train', ru: 'Поезд' } },
    ],
    correctId: 'flower',
    hint: { az: 'Hansı bağçada bitir?', en: 'Which one grows in a garden?', ru: 'Что растёт в саду?' },
    explanation: { az: 'Çiçək bitir, nəqliyyat isə bizi aparır.', en: 'A flower grows; vehicles carry us.', ru: 'Цветок растёт, а транспорт нас возит.' },
  },
  {
    id: 'weather',
    prompt: { az: 'Hansı geyim deyil?', en: 'Which one is not clothing?', ru: 'Что здесь не одежда?' },
    items: [
      { id: 'hat', emoji: '🧢', tone: '#DDE7FF', label: { az: 'Papaq', en: 'Cap', ru: 'Кепка' } },
      { id: 'sock', emoji: '🧦', tone: '#FFE1DD', label: { az: 'Corab', en: 'Sock', ru: 'Носок' } },
      { id: 'dress', emoji: '👗', tone: '#F1E9FF', label: { az: 'Don', en: 'Dress', ru: 'Платье' } },
      { id: 'spoon', emoji: '🥄', tone: '#EEF1F6', label: { az: 'Qaşıq', en: 'Spoon', ru: 'Ложка' } },
    ],
    correctId: 'spoon',
    hint: { az: 'Hansını geyinmək olmaz?', en: 'Which one can’t we wear?', ru: 'Что нельзя надеть?' },
    explanation: { az: 'Qaşıqla yemək yeyirik, onu geyinmirik.', en: 'We eat with a spoon — we don’t wear it.', ru: 'Ложкой едят, её не надевают.' },
  },
];

export function getGame(slug: string): Game | undefined {
  return GAMES.find((g) => g.slug === slug);
}
