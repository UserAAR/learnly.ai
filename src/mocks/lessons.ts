import type { Lesson } from '@/types';

/**
 * Lesson content. Visual keys are rendered by `LessonVisual` (local SVG/CSS/emoji compositions).
 * Info steps teach; choice/tap/sequence steps are tracked as learning steps.
 */
export const LESSONS: Lesson[] = [
  {
    slug: 'handwashing',
    skill: 'hygiene',
    theme: 'hygiene',
    minutes: 6,
    title: { az: 'Əllərimizi yuyuruq', en: 'We wash our hands', ru: 'Моем руки' },
    subtitle: {
      az: 'Su, sabun və dəsmal ilə təmiz əllər',
      en: 'Clean hands with water, soap and a towel',
      ru: 'Чистые руки с водой, мылом и полотенцем',
    },
    goal: {
      az: 'Əl yumağın addımlarını tanımaq və ardıcıllıqla yerinə yetirmək.',
      en: 'Recognise the handwashing steps and do them in order.',
      ru: 'Узнать шаги мытья рук и выполнять их по порядку.',
    },
    steps: [
      {
        kind: 'info',
        id: 'hw-intro',
        visual: 'scene-sink',
        title: { az: 'Gəl əllərimizi yuyaq!', en: "Let's wash our hands!", ru: 'Давай помоем руки!' },
        body: {
          az: 'Əllərimiz gün ərzində çox şeyə toxunur. Su və sabun əllərimizi təmiz saxlayır.',
          en: 'Our hands touch many things during the day. Water and soap keep them clean.',
          ru: 'За день наши руки трогают много вещей. Вода и мыло помогают сохранить их чистыми.',
        },
      },
      {
        kind: 'tap',
        id: 'hw-faucet',
        scene: 'sink',
        prompt: { az: 'Əvvəlcə suyu açaq. Krana toxun.', en: 'First, turn on the water. Tap the faucet.', ru: 'Сначала откроем воду. Нажми на кран.' },
        targets: [
          { id: 'faucet', visual: 'faucet', label: { az: 'Kran', en: 'Faucet', ru: 'Кран' } },
          { id: 'soap', visual: 'soap', label: { az: 'Sabun', en: 'Soap', ru: 'Мыло' } },
          { id: 'towel', visual: 'towel', label: { az: 'Dəsmal', en: 'Towel', ru: 'Полотенце' } },
        ],
        correctId: 'faucet',
        hint: {
          az: 'Su kranın içindən gəlir. Lavabonun üstündəki metal hissəyə bax.',
          en: 'Water comes out of the faucet. Look at the metal part above the sink.',
          ru: 'Вода течёт из крана. Посмотри на металлическую часть над раковиной.',
        },
        explanation: {
          az: 'Su krandan gəlir. Ona görə də əvvəlcə kranı açırıq.',
          en: 'Water comes from the faucet, so we turn it on first.',
          ru: 'Вода идёт из крана, поэтому сначала мы открываем кран.',
        },
        success: { az: 'Su axır! Əllərini islada bilərsən.', en: 'The water is running! You can wet your hands.', ru: 'Вода течёт! Можно намочить руки.' },
      },
      {
        kind: 'choice',
        id: 'hw-after-wet',
        visual: 'hands-wet',
        prompt: {
          az: 'Əllərimiz islandı. İndi nə edirik?',
          en: 'Our hands are wet. What do we do now?',
          ru: 'Руки мокрые. Что мы делаем теперь?',
        },
        options: [
          { id: 'soap', visual: 'soap', label: { az: 'Sabun götürürük', en: 'Use soap', ru: 'Берём мыло' } },
          { id: 'towel', visual: 'towel', label: { az: 'Dəsmalla qurulayırıq', en: 'Dry with a towel', ru: 'Вытираем полотенцем' } },
          { id: 'cookie', visual: 'cookie', label: { az: 'Peçenye yeyirik', en: 'Eat a cookie', ru: 'Едим печенье' } },
        ],
        correctId: 'soap',
        hint: {
          az: 'Köpük əlləri təmizləyir. Köpük nədən yaranır?',
          en: 'Bubbles clean our hands. What makes bubbles?',
          ru: 'Пена очищает руки. Из чего получается пена?',
        },
        explanation: {
          az: 'Əllər isləndikdən sonra sabun götürürük. Sabun köpük yaradır və mikrobları təmizləyir.',
          en: 'After wetting our hands we use soap. Soap makes bubbles that wash germs away.',
          ru: 'После того как руки намокли, мы берём мыло. Мыло даёт пену и смывает микробы.',
        },
      },
      {
        kind: 'tap',
        id: 'hw-soap',
        scene: 'sink',
        prompt: { az: 'Sabunu tap və ona toxun.', en: 'Find the soap and tap it.', ru: 'Найди мыло и нажми на него.' },
        targets: [
          { id: 'towel', visual: 'towel', label: { az: 'Dəsmal', en: 'Towel', ru: 'Полотенце' } },
          { id: 'soap', visual: 'soap', label: { az: 'Sabun', en: 'Soap', ru: 'Мыло' } },
          { id: 'faucet', visual: 'faucet', label: { az: 'Kran', en: 'Faucet', ru: 'Кран' } },
        ],
        correctId: 'soap',
        hint: {
          az: 'Sabun çəhrayı və yumşaqdır, lavabonun yanında durur.',
          en: 'The soap is pink and soft. It sits next to the sink.',
          ru: 'Мыло розовое и мягкое, оно лежит рядом с раковиной.',
        },
        explanation: {
          az: 'Bu çəhrayı qalıb sabundur. Ondan köpük yaranır.',
          en: 'The pink bar is the soap. It makes bubbles.',
          ru: 'Розовый брусок — это мыло. От него получается пена.',
        },
        success: { az: 'Köpüklər! Əllərini yaxşıca ovuşdur.', en: 'Bubbles! Rub your hands well.', ru: 'Пузырьки! Хорошо потри ладошки.' },
      },
      {
        kind: 'info',
        id: 'hw-rub',
        visual: 'hands-soap',
        title: { az: 'Əlləri ovuşdururuq', en: 'We rub our hands', ru: 'Трём ладошки' },
        body: {
          az: 'Ovucları, əlin üstünü və barmaqların arasını ovuşdururuq. Tələsmirik — sakitcə sayaq.',
          en: 'We rub our palms, the backs of our hands and between our fingers. No rush — we can count slowly.',
          ru: 'Трём ладони, тыльную сторону и между пальцами. Не спешим — можно спокойно посчитать.',
        },
      },
      {
        kind: 'sequence',
        id: 'hw-order',
        prompt: {
          az: 'Kartları düzgün ardıcıllıqla düz.',
          en: 'Put the cards in the right order.',
          ru: 'Разложи карточки по порядку.',
        },
        items: [
          { id: 'wet', visual: 'hands-wet', label: { az: 'Əlləri islat', en: 'Wet hands', ru: 'Намочить руки' } },
          { id: 'soap', visual: 'hands-soap', label: { az: 'Sabunla', en: 'Use soap', ru: 'Намылить' } },
          { id: 'rinse', visual: 'hands-rinse', label: { az: 'Yaxala', en: 'Rinse', ru: 'Смыть' } },
          { id: 'dry', visual: 'hands-dry', label: { az: 'Qurula', en: 'Dry', ru: 'Вытереть' } },
        ],
        hint: {
          az: 'Hər şey su ilə başlayır və dəsmalla bitir.',
          en: 'Everything starts with water and ends with a towel.',
          ru: 'Всё начинается с воды и заканчивается полотенцем.',
        },
        explanation: {
          az: 'Əvvəl islat, sonra sabunla, sonra yaxala, ən sonda qurula.',
          en: 'First wet, then soap, then rinse, and finally dry.',
          ru: 'Сначала намочить, потом намылить, затем смыть и в конце вытереть.',
        },
      },
      {
        kind: 'choice',
        id: 'hw-dry',
        visual: 'hands-rinse',
        prompt: {
          az: 'Köpüklər yuyuldu. Əllərimizi nə ilə qurulayırıq?',
          en: 'The bubbles are rinsed away. What do we dry our hands with?',
          ru: 'Пена смыта. Чем мы вытираем руки?',
        },
        options: [
          { id: 'water', visual: 'droplet', label: { az: 'Su', en: 'Water', ru: 'Вода' } },
          { id: 'towel', visual: 'towel', label: { az: 'Dəsmal', en: 'Towel', ru: 'Полотенце' } },
          { id: 'soap', visual: 'soap', label: { az: 'Sabun', en: 'Soap', ru: 'Мыло' } },
        ],
        correctId: 'towel',
        hint: {
          az: 'Bu, yumşaq və quru bir şeydir. Asılqanda durur.',
          en: 'It is soft and dry. It hangs on a hook.',
          ru: 'Оно мягкое и сухое. Висит на крючке.',
        },
        explanation: {
          az: 'Təmiz dəsmal əllərimizi qurulayır. Əllər təmiz və qurudur!',
          en: 'A clean towel dries our hands. Clean and dry hands!',
          ru: 'Чистое полотенце вытирает руки. Руки чистые и сухие!',
        },
      },
    ],
  },
  {
    slug: 'road-safety',
    skill: 'safety',
    theme: 'safety',
    minutes: 7,
    title: { az: 'Yolu təhlükəsiz keçirik', en: 'Crossing the road safely', ru: 'Безопасно переходим дорогу' },
    subtitle: {
      az: 'Dayan, bax, yaşılı gözlə',
      en: 'Stop, look, wait for green',
      ru: 'Стой, смотри, жди зелёный',
    },
    goal: {
      az: 'Piyada keçidini, svetoforun siqnallarını və təhlükəsiz keçidin addımlarını öyrənmək.',
      en: 'Learn the pedestrian crossing, traffic light signals and safe crossing steps.',
      ru: 'Узнать пешеходный переход, сигналы светофора и шаги безопасного перехода.',
    },
    steps: [
      {
        kind: 'info',
        id: 'rs-intro',
        visual: 'scene-road',
        title: { az: 'Yolun kənarında dayanırıq', en: 'We stop at the edge of the road', ru: 'Останавливаемся у края дороги' },
        body: {
          az: 'Yolda maşınlar hərəkət edir. Yola çatanda əvvəlcə dayanırıq və böyüyün əlindən tuturuq.',
          en: 'Cars move on the road. When we reach the road, we stop first and hold a grown-up’s hand.',
          ru: 'По дороге ездят машины. Когда мы подходим к дороге, сначала останавливаемся и берём взрослого за руку.',
        },
      },
      {
        kind: 'choice',
        id: 'rs-where',
        prompt: { az: 'Yolu harada keçirik?', en: 'Where do we cross the road?', ru: 'Где мы переходим дорогу?' },
        options: [
          { id: 'zebra', visual: 'zebra', label: { az: 'Piyada keçidində', en: 'At the zebra crossing', ru: 'По пешеходному переходу' } },
          { id: 'cars', visual: 'parked-cars', label: { az: 'Maşınların arasından', en: 'Between parked cars', ru: 'Между машинами' } },
          { id: 'anywhere', visual: 'road-plain', label: { az: 'İstədiyimiz yerdən', en: 'Anywhere we like', ru: 'Где захочется' } },
        ],
        correctId: 'zebra',
        hint: {
          az: 'Yolda ağ zolaqlar olan yeri axtar — zebra kimi.',
          en: 'Look for white stripes on the road — like a zebra.',
          ru: 'Ищи белые полоски на дороге — как у зебры.',
        },
        explanation: {
          az: 'Ağ zolaqlı yer piyada keçididir. Sürücülər orada piyadaları gözləyir.',
          en: 'The striped place is the pedestrian crossing. Drivers expect people to cross there.',
          ru: 'Полосатое место — пешеходный переход. Водители ждут пешеходов именно там.',
        },
      },
      {
        kind: 'tap',
        id: 'rs-red',
        scene: 'light',
        prompt: {
          az: 'Hansı işıq “dayan və gözlə” deməkdir? Ona toxun.',
          en: 'Which light means “stop and wait”? Tap it.',
          ru: 'Какой сигнал значит «стой и жди»? Нажми на него.',
        },
        targets: [
          { id: 'red', visual: 'light-red', label: { az: 'Qırmızı adam', en: 'Red figure', ru: 'Красный человечек' } },
          { id: 'green', visual: 'light-green', label: { az: 'Yaşıl adam', en: 'Green figure', ru: 'Зелёный человечек' } },
        ],
        correctId: 'red',
        hint: {
          az: 'Bu işıqda adamcıq yerində dayanıb. Onun rəngi qırmızıdır.',
          en: 'In this light the little figure is standing still. Its colour is red.',
          ru: 'На этом сигнале человечек стоит на месте. Он красного цвета.',
        },
        explanation: {
          az: 'Qırmızı adamcıq dayanıb — biz də dayanırıq və gözləyirik.',
          en: 'The red figure is standing still — so we stop and wait too.',
          ru: 'Красный человечек стоит — значит, мы тоже стоим и ждём.',
        },
        success: { az: 'Doğrudur, qırmızıda gözləyirik.', en: 'Yes, on red we wait.', ru: 'Верно, на красный мы ждём.' },
      },
      {
        kind: 'info',
        id: 'rs-look',
        visual: 'look-both',
        title: { az: 'Sola, sağa, yenə sola bax', en: 'Look left, right, then left again', ru: 'Посмотри налево, направо и снова налево' },
        body: {
          az: 'Yaşıl işıq yansa belə, başımızı çevirib baxırıq: maşın gəlmir? Sonra keçirik.',
          en: 'Even when the light is green, we turn our head and look: is a car coming? Then we cross.',
          ru: 'Даже на зелёный мы поворачиваем голову и смотрим: не едет ли машина? Потом переходим.',
        },
      },
      {
        kind: 'tap',
        id: 'rs-green',
        scene: 'light',
        prompt: {
          az: 'İndi hansı işıqda keçə bilərik? Ona toxun.',
          en: 'Now, which light lets us cross? Tap it.',
          ru: 'На какой сигнал можно переходить? Нажми на него.',
        },
        targets: [
          { id: 'red', visual: 'light-red', label: { az: 'Qırmızı adam', en: 'Red figure', ru: 'Красный человечек' } },
          { id: 'green', visual: 'light-green', label: { az: 'Yaşıl adam', en: 'Green figure', ru: 'Зелёный человечек' } },
        ],
        correctId: 'green',
        hint: {
          az: 'Bu adamcıq addımlayır. Yarpaq kimi yaşıl rəngdədir.',
          en: 'This figure is walking. It is green like a leaf.',
          ru: 'Этот человечек шагает. Он зелёный, как листик.',
        },
        explanation: {
          az: 'Yaşıl adamcıq addımlayır — ətrafa baxıb böyüklə birlikdə keçə bilərik.',
          en: 'The green figure is walking — we look around and cross with a grown-up.',
          ru: 'Зелёный человечек шагает — смотрим по сторонам и переходим вместе со взрослым.',
        },
        success: { az: 'Yaşıl yandı! Baxırıq və keçirik.', en: 'Green is on! We look and cross.', ru: 'Горит зелёный! Смотрим и переходим.' },
      },
      {
        kind: 'sequence',
        id: 'rs-order',
        prompt: {
          az: 'Yolu keçməyin addımlarını düz.',
          en: 'Put the crossing steps in order.',
          ru: 'Разложи шаги перехода по порядку.',
        },
        items: [
          { id: 'stop', visual: 'stop', label: { az: 'Dayan', en: 'Stop', ru: 'Остановись' } },
          { id: 'look', visual: 'look', label: { az: 'Ətrafa bax', en: 'Look around', ru: 'Посмотри вокруг' } },
          { id: 'wait', visual: 'light-green', label: { az: 'Yaşılı gözlə', en: 'Wait for green', ru: 'Дождись зелёного' } },
          { id: 'cross', visual: 'cross-adult', label: { az: 'Böyüklə keç', en: 'Cross with a grown-up', ru: 'Переходи со взрослым' } },
        ],
        hint: {
          az: 'Əvvəlcə ayaqlarımız dayanır, ən sonda isə yolu keçirik.',
          en: 'First our feet stop, and crossing comes last.',
          ru: 'Сначала ноги останавливаются, а переходим мы в самом конце.',
        },
        explanation: {
          az: 'Dayan → bax → yaşılı gözlə → böyüklə keç.',
          en: 'Stop → look → wait for green → cross with a grown-up.',
          ru: 'Стой → смотри → жди зелёный → переходи со взрослым.',
        },
      },
      {
        kind: 'choice',
        id: 'rs-who',
        prompt: {
          az: 'Yolu kiminlə keçirik?',
          en: 'Who do we cross the road with?',
          ru: 'С кем мы переходим дорогу?',
        },
        options: [
          { id: 'alone', visual: 'alone', label: { az: 'Tək-tənha, qaçaraq', en: 'Alone, running', ru: 'Один и бегом' } },
          { id: 'adult', visual: 'cross-adult', label: { az: 'Böyüyün əlindən tutaraq', en: 'Holding a grown-up’s hand', ru: 'Держась за руку взрослого' } },
          { id: 'ball', visual: 'ball', label: { az: 'Topun arxasınca', en: 'Chasing a ball', ru: 'Догоняя мяч' } },
        ],
        correctId: 'adult',
        hint: {
          az: 'Kim bizi qoruyur və yolu yaxşı tanıyır?',
          en: 'Who keeps us safe and knows the road well?',
          ru: 'Кто нас защищает и хорошо знает дорогу?',
        },
        explanation: {
          az: 'Böyüyün əlindən tutub sakitcə addımlayırıq. Yolda qaçmırıq.',
          en: 'We hold a grown-up’s hand and walk calmly. We do not run on the road.',
          ru: 'Держим взрослого за руку и идём спокойно. По дороге не бегаем.',
        },
      },
    ],
  },
  {
    slug: 'emotions',
    skill: 'emotions',
    theme: 'emotions',
    minutes: 6,
    title: { az: 'Hisslərimizi tanıyırıq', en: 'Recognising feelings', ru: 'Узнаём чувства' },
    subtitle: {
      az: 'Sevinc, kədər və hirs',
      en: 'Happy, sad and angry',
      ru: 'Радость, грусть и злость',
    },
    goal: {
      az: 'Üz ifadələrindəki ipuclarını görmək və hisslərin adlarını öyrənmək.',
      en: 'Notice clues in facial expressions and learn the names of feelings.',
      ru: 'Замечать подсказки в выражении лица и узнавать названия чувств.',
    },
    steps: [
      {
        kind: 'info',
        id: 'em-intro',
        visual: 'scene-faces',
        title: { az: 'Hisslərin adı var', en: 'Feelings have names', ru: 'У чувств есть названия' },
        body: {
          az: 'Hamı hisslərini fərqli göstərir. Üzdəki ipuclarına birlikdə baxaq: gözlər, qaşlar və ağız.',
          en: 'Everyone shows feelings differently. Let’s look at clues on a face together: eyes, eyebrows and mouth.',
          ru: 'Каждый показывает чувства по-своему. Давай вместе посмотрим на подсказки на лице: глаза, брови и рот.',
        },
      },
      {
        kind: 'choice',
        id: 'em-happy',
        visual: 'face-happy',
        prompt: {
          az: 'Bu üz necə hiss edə bilər?',
          en: 'How might this face be feeling?',
          ru: 'Что может чувствовать это лицо?',
        },
        options: [
          { id: 'sad', visual: 'face-sad', label: { az: 'Kədərli', en: 'Sad', ru: 'Грустно' } },
          { id: 'happy', visual: 'face-happy', label: { az: 'Sevincli', en: 'Happy', ru: 'Радостно' } },
          { id: 'angry', visual: 'face-angry', label: { az: 'Hirsli', en: 'Angry', ru: 'Сердито' } },
        ],
        correctId: 'happy',
        hint: {
          az: 'Ağıza bax: o, yuxarı əyilib — gülümsəyir.',
          en: 'Look at the mouth: it curves up — a smile.',
          ru: 'Посмотри на рот: он изогнут вверх — это улыбка.',
        },
        explanation: {
          az: 'Gülümsəyən ağız və parlaq gözlər çox vaxt sevinc deməkdir.',
          en: 'A smiling mouth and bright eyes often mean happy.',
          ru: 'Улыбка и яркие глаза часто означают радость.',
        },
      },
      {
        kind: 'choice',
        id: 'em-sad',
        visual: 'face-sad',
        prompt: {
          az: 'Bəs bu üz necə hiss edə bilər?',
          en: 'And how might this face be feeling?',
          ru: 'А что может чувствовать это лицо?',
        },
        options: [
          { id: 'happy', visual: 'face-happy', label: { az: 'Sevincli', en: 'Happy', ru: 'Радостно' } },
          { id: 'angry', visual: 'face-angry', label: { az: 'Hirsli', en: 'Angry', ru: 'Сердито' } },
          { id: 'sad', visual: 'face-sad', label: { az: 'Kədərli', en: 'Sad', ru: 'Грустно' } },
        ],
        correctId: 'sad',
        hint: {
          az: 'Ağız aşağı əyilib, gözdən kiçik bir damla axır.',
          en: 'The mouth curves down and a small tear falls.',
          ru: 'Рот изогнут вниз, и катится маленькая слезинка.',
        },
        explanation: {
          az: 'Aşağı əyilmiş ağız və göz yaşı kədər ipucu ola bilər.',
          en: 'A downturned mouth and a tear can be clues for sad.',
          ru: 'Опущенные уголки рта и слезинка могут подсказывать грусть.',
        },
      },
      {
        kind: 'choice',
        id: 'em-angry',
        visual: 'face-angry',
        prompt: {
          az: 'Bu üzdə hansı hiss görünür?',
          en: 'Which feeling shows on this face?',
          ru: 'Какое чувство видно на этом лице?',
        },
        options: [
          { id: 'angry', visual: 'face-angry', label: { az: 'Hirsli', en: 'Angry', ru: 'Сердито' } },
          { id: 'sad', visual: 'face-sad', label: { az: 'Kədərli', en: 'Sad', ru: 'Грустно' } },
          { id: 'happy', visual: 'face-happy', label: { az: 'Sevincli', en: 'Happy', ru: 'Радостно' } },
        ],
        correctId: 'angry',
        hint: {
          az: 'Qaşlara bax: onlar aşağı və bir-birinə yaxın enib.',
          en: 'Look at the eyebrows: they are pulled down and close together.',
          ru: 'Посмотри на брови: они опущены и сдвинуты друг к другу.',
        },
        explanation: {
          az: 'Çatılmış qaşlar və sıxılmış ağız hirs ipucu ola bilər.',
          en: 'Frowning eyebrows and a tight mouth can be clues for angry.',
          ru: 'Нахмуренные брови и сжатый рот могут подсказывать злость.',
        },
      },
      {
        kind: 'choice',
        id: 'em-icecream',
        visual: 'icecream-fall',
        prompt: {
          az: 'Dondurma yerə düşdü. Bir çox uşaq necə hiss edə bilər?',
          en: 'The ice cream fell on the ground. How might many children feel?',
          ru: 'Мороженое упало на землю. Что могут почувствовать многие дети?',
        },
        options: [
          { id: 'happy', visual: 'face-happy', label: { az: 'Sevincli', en: 'Happy', ru: 'Радостно' } },
          { id: 'sad', visual: 'face-sad', label: { az: 'Kədərli', en: 'Sad', ru: 'Грустно' } },
          { id: 'angry', visual: 'face-angry', label: { az: 'Hirsli', en: 'Angry', ru: 'Сердито' } },
        ],
        correctId: 'sad',
        hint: {
          az: 'Sevdiyimiz bir şeyi itirəndə ürəyimiz necə olur?',
          en: 'How does our heart feel when we lose something we like?',
          ru: 'Что чувствует сердце, когда мы теряем что-то любимое?',
        },
        explanation: {
          az: 'Çoxları kədərlənə bilər. Bəzən insan başqa cür də hiss edir — bu da normaldır.',
          en: 'Many people might feel sad. Sometimes people feel something else — that is okay too.',
          ru: 'Многим может стать грустно. Иногда люди чувствуют что-то другое — это тоже нормально.',
        },
      },
      {
        kind: 'choice',
        id: 'em-gift',
        visual: 'gift',
        prompt: {
          az: 'Sənə hədiyyə verdilər. Bir çox uşaq necə hiss edə bilər?',
          en: 'Someone gave you a present. How might many children feel?',
          ru: 'Тебе подарили подарок. Что могут почувствовать многие дети?',
        },
        options: [
          { id: 'angry', visual: 'face-angry', label: { az: 'Hirsli', en: 'Angry', ru: 'Сердито' } },
          { id: 'happy', visual: 'face-happy', label: { az: 'Sevincli', en: 'Happy', ru: 'Радостно' } },
          { id: 'sad', visual: 'face-sad', label: { az: 'Kədərli', en: 'Sad', ru: 'Грустно' } },
        ],
        correctId: 'happy',
        hint: {
          az: 'Hədiyyə çox vaxt üzümüzə təbəssüm gətirir.',
          en: 'A present often brings a smile.',
          ru: 'Подарок часто вызывает улыбку.',
        },
        explanation: {
          az: 'Hədiyyə alanda çoxları sevinir. Bəzən həyəcan da hiss olunur.',
          en: 'Many people feel happy getting a present. Sometimes they feel excited too.',
          ru: 'Многие радуются подарку. Иногда ещё чувствуют волнение.',
        },
      },
      {
        kind: 'info',
        id: 'em-calm',
        visual: 'breathe',
        title: { az: 'Hirslənəndə nə edə bilərik?', en: 'What can we do when we feel angry?', ru: 'Что можно делать, когда злишься?' },
        body: {
          az: 'Yavaşca nəfəs alırıq: burnumuzla iylə — çiçək kimi, ağzımızla üflə — şam kimi. Böyükdən kömək istəyə bilərik.',
          en: 'We breathe slowly: smell a flower through the nose, blow out a candle through the mouth. We can ask a grown-up for help.',
          ru: 'Дышим медленно: нюхаем цветок носом, задуваем свечку ртом. Можно попросить взрослого о помощи.',
        },
      },
    ],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function questionCount(lesson: Lesson): number {
  return lesson.steps.filter((s) => s.kind !== 'info').length;
}
