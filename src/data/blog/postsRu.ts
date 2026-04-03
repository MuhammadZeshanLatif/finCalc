import type { BlogArticle } from "./types";

/** Russian articles — same topicKey as EN for hreflang pairing. */
export const BLOG_POSTS_RU: BlogArticle[] = [
  {
    topicKey: "compound-interest",
    slug: "slozhnye-protsenty-apr",
    title: "Сложный процент: как время и частота капитализации меняют результат",
    metaTitle: "Сложный процент: APY, частота, ранний старт | FinCalc",
    metaDescription:
      "Как растёт капитал при сложном проценте, чем APY отличается от номинальной ставки и как проверить цифры на калькуляторе. С отсылками к базовым материалам для инвесторов.",
    keywords:
      "сложный процент, APY, капитализация процентов, рост сбережений, калькулятор процентов",
    excerpt:
      "Небольшая разница в сроке и частоте капитализации часто важнее погони за долями процента по ставке.",
    datePublished: "2026-01-15",
    dateModified: "2026-04-03",
    author: "Редакция FinCalc",
    readingTimeMinutes: 9,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Compound_interest.svg/960px-Compound_interest.svg.png",
      alt: "График: линейный рост против сложного процента",
      caption: "Разрыв между «простым» накоплением и сложным процентом растёт со временем.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Compound_interest.svg",
    },
    video: { youtubeId: "BFN9fUGmwEY", title: "Khan Academy — введение в сложный процент (англ., образовательное)" },
    keyPhrases: [
      "определение сложного процента",
      "годовая доходность APY",
      "ежемесячная и годовая капитализация",
      "раньше начать или выше ставка",
    ],
    blocks: [
      {
        t: "p",
        text: "Сложный процент начисляется на первоначальную сумму и на уже присоединённые проценты. Чем длиннее горизонт и чем чаще капитализация (при прочих равных), тем сильнее кривая роста — пока ставка стабильна и вы не выводите начисления.",
      },
      {
        t: "h2",
        id: "chto-vliyaet",
        text: "Что реально влияет на итог",
      },
      {
        t: "ul",
        items: [
          "Срок: больше периодов — больше циклов «процент на процент».",
          "Номинальная ставка и частота капитализации (день, месяц, год).",
          "Взносы и снятия: регулярные пополнения ускоряют рост, снятия — замедляют.",
          "Налоги, комиссии и инфляция: в учебнике их нет, в жизни они определяют покупательную способность.",
        ],
      },
      {
        t: "h2",
        id: "apy-i-nominal",
        text: "APY и номинальная годовая ставка",
      },
      {
        t: "p",
        text: "APY (annual percentage yield) часто указывают на накопительных продуктах, потому что отражает итог с учётом внутригодовой капитализации. Две «одинаковые» номинальные ставки с разной частотой капитализации дают разный APY.",
      },
      {
        t: "table",
        caption: "Иллюстрация: 5% номинально, разная капитализация (не оферта)",
        head: ["Капитализация", "Баланс через год на 10 000 (пример)"],
        rows: [
          ["Раз в год", "10 500,00"],
          ["Ежемесячно", "10 511,62"],
          ["Ежедневно", "10 512,67"],
        ],
      },
      {
        t: "callout",
        variant: "disclaimer",
        title: "Не инвестиционная рекомендация",
        text: "Цифры — учебные. В реальных продуктах бывают лестничные ставки, минимальные остатки и изменение условий. Решения согласуйте с документами банка или консультантом.",
      },
      {
        t: "h2",
        id: "rano-ili-stavka",
        text: "Раньше начать часто выгоднее чуть более высокой ставки",
      },
      {
        t: "p",
        text: "Два человека с одинаковым ежемесячным взносом, но разным годом старта получают разный итог: у раннего обычно больше, даже если поздний ловит чуть более высокую ставку. Калькулятор процентов на FinCalc позволяет распечатать два сценария с одинаковыми допущениями.",
      },
      {
        t: "h2",
        id: "istochniki",
        text: "Источники и следующий шаг",
      },
      {
        t: "p",
        text: "Введите в калькулятор сумму, ставку, срок и частоту капитализации из договора или презентации банка. Сравните с официальным расчётом: если расходятся — уточните базу дней, комиссии и округление.",
      },
    ],
    sources: [
      { title: "SEC Investor.gov — основы (англ.)", url: "https://www.investor.gov/additional-resources/information/your-money/investing-basics" },
      { title: "CFPB — что такое APY (англ.)", url: "https://www.consumerfinance.gov/ask-cfpb/what-is-apy-en-106/" },
    ],
    calcLink: "interest",
  },
  {
    topicKey: "mortgage-mistakes",
    slug: "ipoteka-oshibki-piti-pmi",
    title: "Ипотека: ошибки, которые переживают сделку",
    metaTitle: "Ипотека: PITI, PMI и полный платёж | FinCalc",
    metaDescription:
      "Почему цифра «только кредит» не равна ежемесячному оттоку денег: налоги, страховка, PMI. Как смоделировать в ипотечном калькуляторе.",
    keywords: "ипотека, PITI, PMI, первоначальный взнос, платёж по ипотеке",
    excerpt: "В рекламе часто показывают не всё, что уходит со счёта каждый месяц.",
    datePublished: "2026-02-01",
    dateModified: "2026-04-03",
    author: "Редакция FinCalc",
    readingTimeMinutes: 8,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Subprime_Mortgage_Market_Diagram.png/640px-Subprime_Mortgage_Market_Diagram.png",
      alt: "Схема участников рынка ипотеки",
      caption: "Цепочка банк—сервисер—инвесторы; в выписке видите только свою часть.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Subprime_Mortgage_Market_Diagram.png",
    },
    video: { youtubeId: "zQVUk1oTNdk", title: "Выбор ипотеки — обзор (YouTube, англ.)" },
    keyPhrases: ["что такое PITI", "PMI при малом взносе", "фиксированная ставка", "полная стоимость жилья"],
    blocks: [
      {
        t: "p",
        text: "Одобрение смотрит на долги и кредитную историю, а семейный бюджет — на регулярный отток наличных. Путаница между ними — частая причина стресса после переезда.",
      },
      {
        t: "h2",
        id: "piti",
        text: "Состав PITI",
      },
      {
        t: "ul",
        items: [
          "Тело кредита — уменьшает остаток долга.",
          "Проценты — стоимость заёмных средств.",
          "Налоги на недвижимость — часто через эскроу.",
          "Страхование — имущество; в ряде регионов нужны дополнительные полисы.",
        ],
      },
      {
        t: "h2",
        id: "pmi-vznos",
        text: "PMI и низкий взнос",
      },
      {
        t: "p",
        text: "При низкой доле собственности на старте банк может требовать страхование ипотеки до роста капитала. В калькуляторе FinCalc есть упрощённый переключатель PMI для стресс-теста платежа.",
      },
      {
        t: "h2",
        id: "stavka-i-apr",
        text: "Ставка и полная стоимость",
      },
      {
        t: "p",
        text: "APR частично учитывает комиссии для сравнения предложений, но не предсказывает будущие перерасчёты налога или обновление страховки. Составьте таблицу: предложение банка + ваши налоги/страховка + обслуживание дома.",
      },
      {
        t: "callout",
        variant: "note",
        title: "Практическая проверка",
        text: "Если платёж съедает слишком большую долю дохода, смоделируйте меньшую сумму кредита до отказа от условий сделки.",
      },
    ],
    sources: [
      { title: "CFPB — сравнение сделок (англ.)", url: "https://www.consumerfinance.gov/owning-a-home/compare/" },
    ],
    calcLink: "mortgage",
  },
  {
    topicKey: "emi-strategy",
    slug: "emi-dosrochnoe-pogashenie",
    title: "EMI-кредит: куда направлять досрочные платежи",
    metaTitle: "Досрочное погашение EMI: тело vs срок | FinCalc",
    metaDescription:
      "Как аннуитет делит проценты и тело долга и почему досрочка на тело снижает будущие проценты сильнее округления платежа.",
    keywords: "EMI, досрочное погашение, амортизация, график платежей",
    excerpt: "Деньги на погашение тела уменьшают базу для завтрашних процентов.",
    datePublished: "2026-02-12",
    dateModified: "2026-04-03",
    author: "Редакция FinCalc",
    readingTimeMinutes: 7,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Money_in_a_jar.jpg/640px-Money_in_a_jar.jpg",
      alt: "Деньги в банке",
      caption: "Фиксируйте досрочки по правилам договора.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Money_in_a_jar.jpg",
    },
    keyPhrases: ["доля процентов в EMI", "график амортизации", "комиссии за досрочку"],
    blocks: [
      {
        t: "p",
        text: "При EMI платёж постоянный, но внутри него доля процентов и тела меняется каждый месяц. В начале срока процентов больше — это нормальная амортизация.",
      },
      {
        t: "h2",
        id: "pochemu-telo",
        text: "Почему важно гасить тело",
      },
      {
        t: "p",
        text: "Проценты считаются с остатка. Уменьшили остаток — следующий период начисляет меньше. Сравните в калькуляторе EMI базовый график и вариант с дополнительным взносом на тело.",
      },
      {
        t: "h2",
        id: "ogranicheniya-banka",
        text: "Ограничения банка",
      },
      {
        t: "ul",
        items: [
          "Уточните, идёт ли частичный платёж в счёт тела или «вперёд» по графику.",
          "Политика пересчёта EMI и срока различается.",
        ],
      },
    ],
    sources: [{ title: "Банк России — справочная информация", url: "https://www.cbr.ru/" }],
    calcLink: "emi",
  },
  {
    topicKey: "emergency-fund",
    slug: "rezervnyy-fond-likvidnost",
    title: "Резервный фонд: сначала ликвидность, потом доходность",
    metaTitle: "Резервный фонд: сколько хранить и как считать рост | FinCalc",
    metaDescription:
      "Сколько месяцев расходов откладывать, где держать деньги и как смоделировать накопление в депозитном калькуляторе.",
    keywords: "резервный фонд, сбережения, ликвидность, депозитный калькулятор",
    excerpt: "Задача резерва — быть доступным при обрыве дохода, а не обогнать фондовый рынок.",
    datePublished: "2026-02-20",
    dateModified: "2026-04-03",
    author: "Редакция FinCalc",
    readingTimeMinutes: 6,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Piggy_bank_DSC08605.jpg/640px-Piggy_bank_DSC08605.jpg",
      alt: "Копилка",
      caption: "Психологически проще не трогать отдельный счёт.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Piggy_bank_DSC08605.jpg",
    },
    keyPhrases: ["3–6 месяцев расходов", "страхование вкладов", "инфляция и кэш"],
    blocks: [
      {
        t: "p",
        text: "Правило 3–6 месяцев критических расходов — ориентир. Семьям с одним доходом или нестабильным заработку разумно больше. Депозитный калькулятор покажет будущий баланс при постоянной ставке — сравните с условиями вашего банка.",
      },
      {
        t: "h2",
        id: "gde-hranit",
        text: "Где хранить",
      },
      {
        t: "ul",
        items: [
          "Банковский счёт с быстрым доступом и защитой вкладов в пределах лимита.",
          "Денежные фонды — читайте документы о правилах стабильности.",
        ],
      },
      {
        t: "callout",
        variant: "disclaimer",
        text: "Калькулятор не учитывает штрафы за досрочное снятие и смену акционной ставки.",
      },
    ],
    sources: [{ title: "ЦБ РФ — информация для вкладчиков", url: "https://www.cbr.ru/" }],
    calcLink: "deposit",
  },
  {
    topicKey: "tax-brackets",
    slug: "progressivnye-nalogovye-stavki",
    title: "Прогрессивные ставки: маржинальная и эффективная",
    metaTitle: "Налоговые «ступени»: маржинальная ставка | FinCalc",
    metaDescription:
      "Как работает налогообложение по диапазонам дохода и чем упрощённый калькулятор FinCalc помогает понять механику.",
    keywords: "налоговые ставки, маржинальная ставка, эффективная ставка, калькулятор налога",
    excerpt: "Повышенная ставка применяется к долям дохода выше порога, а не ко всей сумме с начала.",
    datePublished: "2026-02-25",
    dateModified: "2026-04-03",
    author: "Редакция FinCalc",
    readingTimeMinutes: 7,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/US_Federal_Leviathan_2016.png/640px-US_Federal_Leviathan_2016.png",
      alt: "Инфографика расходов бюджета (иллюстрация)",
      caption: "Налоговая политика и ваша зарплата — разные уровни абстракции.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:US_Federal_Leviathan_2016.png",
    },
    keyPhrases: ["маржинальная ставка", "эффективная ставка", "вычеты"],
    blocks: [
      {
        t: "p",
        text: "В ступенчатой модели каждая «полка» дохода облагается по своей ставке. Переход на следующую ступень не пересчитывает налог снизу вверх по новой ставке для старых долларов.",
      },
      {
        t: "h2",
        id: "marg-eff",
        text: "Маржинальная и эффективная",
      },
      {
        t: "p",
        text: "Маржинальная — со следующего рубля. Эффективная — доля налога от всего дохода. Демо-калькулятор FinCalc использует упрощённые диапазоны и не знает льгот, статуса НДФЛ и региональных налогов.",
      },
      {
        t: "table",
        caption: "Учебный пример, не закон",
        head: ["Диапазон", "Ставка (демо)", "Налог с диапазона"],
        rows: [
          ["0 – 10 000", "10%", "1 000"],
          ["Следующие 30 000", "15%", "4 500"],
        ],
      },
    ],
    sources: [{ title: "ФНС России", url: "https://www.nalog.gov.ru/" }],
    calcLink: "tax",
  },
  {
    topicKey: "currency-travel",
    slug: "valyuta-puteshestvie-kursy",
    title: "Валюта в поездке: спред важнее «межбанка»",
    metaTitle: "Обмен валюты в поездке: спреды и калькулятор | FinCalc",
    metaDescription:
      "Почему курс в аэропорту хуже, чем ориентир ЕЦБ, и как смотреть живые кресты рядом со статьёй.",
    keywords: "обмен валюты, курс евро, спред, конвертер валют, поездка",
    excerpt: "Курс в поиске и курс у кассы — разные вещи.",
    datePublished: "2026-03-01",
    dateModified: "2026-04-03",
    author: "Редакция FinCalc",
    readingTimeMinutes: 7,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Euro_coins_and_banknotes.jpg/640px-Euro_coins_and_banknotes.jpg",
      alt: "Евро монеты и купюры",
      caption: "Наличные — лишь часть расходов; карты добавляют свой конверт.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Euro_coins_and_banknotes.jpg",
    },
    keyPhrases: ["спред обменника", "динамическая конвертация DCC", "живые курсы ECB"],
    blocks: [
      {
        t: "p",
        text: "Розничный обмен включает маржу и иногда комиссию. Ориентиры ЕЦБ через открытые API помогают увидеть отклонение от справочного mid-market, но не цену покупки у банка.",
      },
      {
        t: "h2",
        id: "zhivye-kursy",
        text: "Живой блок курсов в статье",
      },
      {
        t: "p",
        text: "Ниже на странице — мини-виджет USD/EUR/GBP с тем же источником Frankfurter, что и основной конвертер. Обновляется при загрузке; банк выставляет свою цену.",
      },
      {
        t: "h2",
        id: "karty",
        text: "Оплата картой",
      },
      {
        t: "p",
        text: "DCC (списание в рублях/домашней валюте на терминале за рубежом) удобен, но часто дороже. Сравните курс терминала с конвертацией в местной валюте эмитентом карты.",
      },
    ],
    sources: [
      { title: "ЕЦБ — справочные курсы", url: "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/" },
      { title: "Frankfurter API", url: "https://www.frankfurter.app/" },
    ],
    calcLink: "currency",
    hasLiveRates: true,
  },
  {
    topicKey: "bmi-insurance",
    slug: "imt-strahovanie-zdorove",
    title: "ИМТ, скрининг и страховые программы",
    metaTitle: "ИМТ и страховые риски: что показывает индекс | FinCalc",
    metaDescription:
      "Почему ИМТ используют как грубый фильтр риска, границы ВОЗ и ограничения индекса для здоровья и финансов.",
    keywords: "ИМТ, калькулятор ИМТ, страхование, ожирение",
    excerpt: "ИМТ дёшев измерять массово; он не заменяет осмотр врача.",
    datePublished: "2026-03-05",
    dateModified: "2026-04-03",
    author: "Редакция FinCalc",
    readingTimeMinutes: 6,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Bathroom_scale.jpg/640px-Bathroom_scale.jpg",
      alt: "Весы в ванной",
      caption: "Вес без контекста состава тела — неполная картина.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Bathroom_scale.jpg",
    },
    keyPhrases: ["формула ИМТ", "категории ВОЗ", "метрические единицы"],
    blocks: [
      {
        t: "p",
        text: "ИМТ = масса (кг) / рост² (м). На уровне населения коррелирует с рядом рисков; врач добавляет анамнез, анализы и окружность талии.",
      },
      {
        t: "h2",
        id: "strahovanie",
        text: "Страховщики и велнес",
      },
      {
        t: "p",
        text: "Корпоративные программы иногда связывают премии с метриками здоровья — правила зависят от страны и работодателя. Калькулятор FinCalc только в кг и см, чтобы избежать путаницы единиц.",
      },
      {
        t: "callout",
        variant: "disclaimer",
        text: "Не медицинский совет. Категории — для скрининга, не для диагноза.",
      },
    ],
    sources: [{ title: "ВОЗ — ожирение и избыточный вес", url: "https://www.who.int/ru/news-room/fact-sheets/detail/obesity-and-overweight" }],
    calcLink: "bmi",
  },
  {
    topicKey: "vat-invoicing",
    slug: "nds-scheta-s-nalogom-i-bez",
    title: "НДС в счёте: «с налогом» и «без налога»",
    metaTitle: "НДС inclusive / exclusive в счетах | FinCalc",
    metaDescription:
      "Как выделить налог из суммы с НДС, типичные ошибки в КП и зачем фиксировать округление.",
    keywords: "НДС, счёт-фактура, калькулятор НДС, цена с налогом",
    excerpt: "Перепутать режим — значит исказить и выручку, и налог.",
    datePublished: "2026-03-10",
    dateModified: "2026-04-03",
    author: "Редакция FinCalc",
    readingTimeMinutes: 6,
    hero: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/ReceiptSwiss.jpg/640px-ReceiptSwiss.jpg",
      alt: "Бумажный чек",
      caption: "Чек должен однозначно показывать базу и налог.",
      credit: "Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:ReceiptSwiss.jpg",
    },
    keyPhrases: ["НДС из суммы с налогом", "округление по строкам", "B2B коммерческое предложение"],
    blocks: [
      {
        t: "p",
        text: "Цена «с НДС» уже включает налог; «без НДС» — налог сверху. В межстрановых сделках режимы и ставки меняются — экспорт в учётке должен совпадать с договором.",
      },
      {
        t: "h2",
        id: "vydelit-nds",
        text: "Выделить НДС из gross",
      },
      {
        t: "p",
        text: "База = сумма ÷ (1 + r/100). НДС = сумма − база. Переключатель в калькуляторе FinCalc совпадает с подписью на счёте.",
      },
      {
        t: "ul",
        items: [
          "Скидки: до или после налога — как в договоре.",
          "Округление по строке или по счёту — зафиксировать политику.",
          "Храните первичку для проверок.",
        ],
      },
    ],
    sources: [{ title: "ЕС — основы VAT", url: "https://taxation-customs.ec.europa.eu/vat_en" }],
    calcLink: "vat",
  },
];
