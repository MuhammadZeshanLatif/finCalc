import type { AppLang } from "../utils/routes";

export type SeoFaq = { q: string; a: string };
export type SeoHowTo = { name: string; description: string; steps: string[] };

const FAQ_EN: Record<string, SeoFaq[]> = {
  home: [
    {
      q: "What is FinCalc?",
      a: "FinCalc is a free suite of online financial and utility calculators—interest, loans, mortgage, EMI, VAT, tax estimates, currency, BMI, and a scientific calculator—available in English and Russian.",
    },
    {
      q: "Is FinCalc free to use?",
      a: "Yes. All calculators on FinCalc are free to use in your browser. We do not charge for access to the tools.",
    },
    {
      q: "Does FinCalc provide financial or tax advice?",
      a: "No. Results are for educational and planning purposes only. Always confirm figures with a qualified professional before making financial or tax decisions.",
    },
  ],
  blog: [
    {
      q: "What topics does the FinCalc blog cover?",
      a: "Long-form guides on saving, debt, mortgages, tax brackets, VAT, travel FX, and health-cost context for BMI—each with a table of contents, cited sources, optional video, and links to the matching free calculator.",
    },
    {
      q: "Are blog articles personalized advice?",
      a: "No. Posts are general information. Your situation may differ; use professionals for personal advice.",
    },
  ],
  contact: [
    {
      q: "How can I contact FinCalc?",
      a: "Use the contact form on this page to send a message. We read feedback about bugs, ideas, and partnerships.",
    },
    {
      q: "Will you answer tax or investment questions by email?",
      a: "We cannot provide individualized financial, tax, or legal guidance. For those topics, consult a licensed professional.",
    },
  ],
  about: [
    {
      q: "What is FinCalc?",
      a: "A free suite of online calculators for interest, loans, savings, mortgage, EMI, VAT, tax estimates, currency, BMI, and scientific math, with articles and bilingual English/Russian support.",
    },
    {
      q: "Does FinCalc give financial advice?",
      a: "No. Tools and blog posts are for education and planning. Confirm important decisions with qualified professionals.",
    },
    {
      q: "How do I report a bug or suggest a feature?",
      a: "Use the Contact page to send a message. We appreciate concrete steps or screenshots when reporting issues.",
    },
  ],
  privacy: [
    {
      q: "What data does FinCalc collect?",
      a: "This policy describes typical website data such as logs and cookies. See the full text on this page for details.",
    },
    {
      q: "Can I use FinCalc without accepting marketing cookies?",
      a: "Core calculators work in your browser; third-party ad cookies depend on your browser settings and applicable consent flows.",
    },
  ],
  terms: [
    {
      q: "What are the FinCalc terms of use?",
      a: "The terms explain acceptable use of the website, disclaimers, and limitations of liability. Read the full document on this page.",
    },
    {
      q: "Are calculation results guaranteed?",
      a: "No. Calculators use standard formulas and your inputs; real fees, rates, and rules may differ. Use results at your own discretion.",
    },
  ],
  basic: [
    {
      q: "What can the scientific calculator do?",
      a: "It supports arithmetic, powers, roots, factorial, trigonometry (degrees), logarithms, parentheses, memory keys, and history—results round to 15 decimal places.",
    },
    {
      q: "How do I enter expressions?",
      a: "Type with the keypad or keyboard, then press Calculate or Enter. Use × and ÷ or * and / as shown in the functions table.",
    },
    {
      q: "Is my calculation history stored on a server?",
      a: "History is kept in your browser session for convenience; it is not sent to FinCalc as part of the calculator logic.",
    },
  ],
  interest: [
    {
      q: "What is compound interest?",
      a: "Compound interest is interest calculated on the initial principal and on accumulated interest from earlier periods, based on your compounding frequency.",
    },
    {
      q: "What does compounding frequency mean?",
      a: "It is how often interest is added to the balance—e.g. monthly, quarterly, or annually. More frequent compounding generally grows the balance faster at the same nominal rate.",
    },
    {
      q: "Will my bank match this exact number?",
      a: "Not necessarily. Banks may use different day-count conventions, fees, or rounding. Use FinCalc for estimates, not binding quotes.",
    },
  ],
  deposit: [
    {
      q: "What does the deposit calculator estimate?",
      a: "It projects balance over time with an initial deposit, optional monthly contributions, interest rate, and term—using the schedule shown in the app.",
    },
    {
      q: "Are taxes on interest included?",
      a: "No. The projection is before tax unless you adjust inputs yourself. Tax rules vary by country and account type.",
    },
    {
      q: "Can I change the term unit?",
      a: "Yes. Choose years or months for the savings term to match how you think about the goal.",
    },
  ],
  loan: [
    {
      q: "What does the loan calculator show?",
      a: "It estimates payments and amortization for a fixed-rate loan using principal, annual rate, and term—plus schedules where available.",
    },
    {
      q: "Does it include insurance or fees?",
      a: "Unless you model them elsewhere, standard results focus on principal and interest. Add fees manually to your planning if needed.",
    },
    {
      q: "Is this an offer of credit?",
      a: "No. FinCalc is not a lender. All numbers are illustrative.",
    },
  ],
  mortgage: [
    {
      q: "How is the mortgage payment estimated?",
      a: "Using home value, down payment %, interest rate, and loan term, the tool approximates monthly payment and related outputs shown on the page.",
    },
    {
      q: "What is PMI?",
      a: "Private mortgage insurance may apply when down payment is low; the optional checkbox lets you include a simple PMI-style estimate where implemented.",
    },
    {
      q: "Should I rely on this for a home purchase?",
      a: "Use it for planning only. Lenders use their own underwriting, escrows, and exact APR components.",
    },
  ],
  days: [
    {
      q: "How does the days calculator work?",
      a: "Pick a start and end date; the tool computes the difference in days and equivalent weeks and months.",
    },
    {
      q: "Are dates inclusive?",
      a: "The app follows the logic shown in results—check the labels on the page for how endpoints are counted.",
    },
    {
      q: "Does it handle time zones?",
      a: "Dates are treated as calendar dates without time-zone shifts unless specified in the UI.",
    },
  ],
  vat: [
    {
      q: "What is inclusive vs exclusive VAT?",
      a: "Inclusive means the amount you enter already contains VAT; exclusive means VAT is added on top. Choose the mode that matches your invoice.",
    },
    {
      q: "Are VAT rules the same in every country?",
      a: "No. Rates, exemptions, and rounding differ. This tool uses your entered rate for arithmetic only.",
    },
    {
      q: "Is this official tax filing software?",
      a: "No. It is a quick calculator, not a government filing tool.",
    },
  ],
  emi: [
    {
      q: "What is EMI?",
      a: "Equated Monthly Installment—a fixed payment each month toward principal and interest for a loan with the assumptions used in the calculator.",
    },
    {
      q: "Does EMI stay constant if rates float?",
      a: "The default model assumes a fixed rate. Floating-rate loans need different modeling.",
    },
    {
      q: "Does the table match my bank’s schedule exactly?",
      a: "Minor differences can come from rounding dates and bank policies. Use the table as a guide.",
    },
  ],
  bmi: [
    {
      q: "What is BMI?",
      a: "Body Mass Index is weight in kg divided by height in meters squared—a population screening metric, not a diagnosis.",
    },
    {
      q: "Should I use BMI alone for health decisions?",
      a: "No. Muscle mass, age, and other factors matter. Talk to a healthcare provider for personal guidance.",
    },
    {
      q: "Which units does FinCalc use?",
      a: "Weight in kilograms and height in centimeters, as labeled in the form.",
    },
  ],
  tax: [
    {
      q: "What does the tax calculator estimate?",
      a: "It applies the simplified progressive model built into FinCalc to your entered gross income—illustrative only.",
    },
    {
      q: "Will this match my real tax return?",
      a: "Unlikely. Real taxes depend on deductions, credits, filing status, and local rules not modeled here.",
    },
    {
      q: "Is this legal or tax advice?",
      a: "No. Consult a tax professional for compliance and planning.",
    },
  ],
  currency: [
    {
      q: "Where do exchange rates come from?",
      a: "Live reference rates load in your browser from Frankfurter (ECB data, no API key) or, if configured, ExchangeRate-API. If the network fails, a small demo table covers USD, EUR, and RUB only.",
    },
    {
      q: "Can I use this for trading or remittances?",
      a: "Only as a rough check. Banks and services quote their own spreads and fees.",
    },
    {
      q: "Which currencies are supported?",
      a: "The dropdown lists currencies from the active data source—typically dozens of majors with Frankfurter, or 160+ if you add an ExchangeRate-API key.",
    },
  ],
};

const FAQ_RU: Record<string, SeoFaq[]> = {
  home: [
    {
      q: "Что такое FinCalc?",
      a: "FinCalc — бесплатный набор онлайн-калькуляторов: проценты, кредит, ипотека, EMI, НДС, налог, валюта, ИМТ и научный калькулятор на русском и английском.",
    },
    {
      q: "FinCalc бесплатный?",
      a: "Да, инструменты в браузере бесплатны. Мы не взимаем плату за доступ к калькуляторам.",
    },
    {
      q: "Это финансовая или налоговая консультация?",
      a: "Нет. Результаты для обучения и планирования. Перед решениями уточняйте цифры у специалистов.",
    },
  ],
  blog: [
    {
      q: "О чём блог FinCalc?",
      a: "Развёрнутые материалы о сбережениях, долгах, ипотеке, налоговых шкалах, НДС, валюте в поездках и контексте ИМТ — с оглавлением, источниками, по желанию видео и ссылками на бесплатные калькуляторы.",
    },
    {
      q: "Это персональные рекомендации?",
      a: "Нет, это общая информация. Для личных решений обращайтесь к профессионалам.",
    },
  ],
  contact: [
    {
      q: "Как связаться с FinCalc?",
      a: "Через форму на этой странице: отзывы, идеи и вопросы по сайту.",
    },
    {
      q: "Ответите на налоговые вопросы по почте?",
      a: "Индивидуальные финансовые и налоговые консультации мы не даём — нужен лицензированный специалист.",
    },
  ],
  about: [
    {
      q: "Что такое FinCalc?",
      a: "Бесплатные онлайн-калькуляторы: проценты, кредиты, накопления, ипотека, EMI, НДС, налог, валюта, ИМТ и инженерная математика, плюс статьи и версии на EN/RU.",
    },
    {
      q: "Это финансовая консультация?",
      a: "Нет. Инструменты и блог — для обучения и планирования. Важные решения согласуйте со специалистами.",
    },
    {
      q: "Как сообщить об ошибке или предложить функцию?",
      a: "Напишите через страницу «Контакты». Для багов полезны шаги воспроизведения или скриншоты.",
    },
  ],
  privacy: [
    {
      q: "Какие данные собирает FinCalc?",
      a: "В политике описаны типичные данные сайта (логи, cookie). Подробности — в тексте на этой странице.",
    },
    {
      q: "Можно ли без маркетинговых cookie?",
      a: "Основные калькуляторы работа в браузере; сторонние cookie зависят от настроек и согласий.",
    },
  ],
  terms: [
    {
      q: "Что такое условия использования?",
      a: "Правила использования сайта, отказ от гарантий и ограничение ответственности — полный текст на странице.",
    },
    {
      q: "Гарантируются ли результаты расчётов?",
      a: "Нет. Формулы и ваши вводы могут отличаться от реальных ставок и комиссий.",
    },
  ],
  basic: [
    {
      q: "Что умеет научный калькулятор?",
      a: "Арифметика, степени, корни, факториал, тригонометрия (градусы), логарифмы, скобки, память и история — округление до 15 знаков.",
    },
    {
      q: "Как вводить выражения?",
      a: "С клавиатуры или кнопок, затем «Вычислить» или Enter. Символы ×, ÷, * и / — см. таблицу функций.",
    },
    {
      q: "История хранится на сервере?",
      a: "История в браузере для удобства; логика калькулятора не отправляет её на сервер FinCalc.",
    },
  ],
  interest: [
    {
      q: "Что такое сложный процент?",
      a: "Процент на сумму с учётом ранее начисленных процентов, с периодичностью, которую вы выбрали.",
    },
    {
      q: "Что значит частота капитализации?",
      a: "Как часто проценты присоединяются к сумме: ежемесячно, ежеквартально или ежегодно и т.д.",
    },
    {
      q: "Банк покажет те же цифры?",
      a: "Не обязательно: день счёта, округление и комиссии отличаются. Используйте как ориентир.",
    },
  ],
  deposit: [
    {
      q: "Что считает калькулятор вклада?",
      a: "Прогноз суммы с начальным взносом, ежемесячными пополнениями, ставкой и сроком по логике приложения.",
    },
    {
      q: "Учтён ли налог на проценты?",
      a: "Нет, без вашей корректировки. Налоги зависят от страны и типа счёта.",
    },
    {
      q: "Можно срок в месяцах?",
      a: "Да, переключите единицу срока на месяцы или годы.",
    },
  ],
  loan: [
    {
      q: "Что показывает кредитный калькулятор?",
      a: "Оценка платежей и графика для фиксированной ставки: сумма, ставка, срок.",
    },
    {
      q: "Включены ли страховки и комиссии?",
      a: "Базовая модель — тело и проценты, если не учитываете доп. расходы отдельно.",
    },
    {
      q: "Это предложение кредита?",
      a: "Нет, FinCalc не кредитор. Только иллюстрация.",
    },
  ],
  mortgage: [
    {
      q: "Как оценивается ипотечный платёж?",
      a: "По стоимости жилья, взносу %, ставке и сроку — как на странице результатов.",
    },
    {
      q: "Что такое PMI?",
      a: "Страхование при низком взносе; если есть переключатель, это упрощённая оценка.",
    },
    {
      q: "Достаточно ли для сделки с банком?",
      a: "Только для планирования. Банк использует свои правила и полную стоимость кредита.",
    },
  ],
  days: [
    {
      q: "Как считается разница дат?",
      a: "Выберите начало и конец — покажем дни и эквивалент в неделях и месяцах.",
    },
    {
      q: "Конечная дата включается?",
      a: "Смотрите подписи к результатам на странице — там указана логика включения границ.",
    },
    {
      q: "Учитываются часовые пояса?",
      a: "Используются календарные даты без сдвига времени, если не указано иное.",
    },
  ],
  vat: [
    {
      q: "НДС «включён» и «сверху»?",
      a: "Включённый — сумма уже с НДС; сверху — НДС добавляется к базе. Выберите как в документе.",
    },
    {
      q: "Одинаковы ли правила НДС везде?",
      a: "Нет, ставки и исключения различаются. Калькулятор считает по введённой ставке.",
    },
    {
      q: "Это официальная отчётность?",
      a: "Нет, только быстрый расчёт.",
    },
  ],
  emi: [
    {
      q: "Что такое EMI?",
      a: "Фиксированный ежемесячный платёж по кредиту при заданных ставке и сроке в модели приложения.",
    },
    {
      q: "EMI при плавающей ставке?",
      a: "Модель по умолчанию под фиксированную ставку; плавающая — другая логика.",
    },
    {
      q: "Таблица совпадёт с банком на 100%?",
      a: "Возможны отличия из-за округления и дат платежей.",
    },
  ],
  bmi: [
    {
      q: "Что такое ИМТ?",
      a: "Индекс массы тела — вес (кг) / рост (м)²; ориентир для населения, не диагноз.",
    },
    {
      q: "Достаточно ли ИМТ для здоровья?",
      a: "Нет, важны мышечная масса, возраст и др. Советуйтесь с врачом.",
    },
    {
      q: "Какие единицы?",
      a: "Вес в кг, рост в см, как в форме.",
    },
  ],
  tax: [
    {
      q: "Что оценивает налоговый калькулятор?",
      a: "Упрощённую прогрессивную модель по введёному доходу — только для примера.",
    },
    {
      q: "Совпадёт с декларацией?",
      a: "Маловероятно: вычеты, льготы и статус не учтены.",
    },
    {
      q: "Это налоговая консультация?",
      a: "Нет.",
    },
  ],
  currency: [
    {
      q: "Откуда курсы?",
      a: "В браузере подгружаются ориентиры: Frankfurter (данные ЕЦБ, без ключа) или при настройке — ExchangeRate-API. Без сети остаётся маленький демо-набор USD/EUR/RUB.",
    },
    {
      q: "Можно для перевода денег?",
      a: "Только грубая проверка; банки дают свои курсы и комиссии.",
    },
    {
      q: "Какие валюты?",
      a: "Список в селекте зависит от источника — обычно десятки кодов у Frankfurter или 160+ при ключе ExchangeRate-API.",
    },
  ],
};

const HOWTO_EN: Record<string, SeoHowTo | undefined> = {
  interest: {
    name: "How to use the interest calculator",
    description: "Estimate compound growth with principal, rate, time, and compounding frequency.",
    steps: [
      "Enter the principal amount in dollars.",
      "Enter the annual interest rate as a percentage.",
      "Set the time in years and choose compounding (monthly, quarterly, or annual).",
      "Read total balance, interest earned, and return % in the results panel.",
    ],
  },
  deposit: {
    name: "How to use the deposit calculator",
    description: "Project savings with optional monthly contributions.",
    steps: [
      "Enter initial deposit and optional monthly contribution.",
      "Set annual rate and savings term in years or months.",
      "Pick the opening date if shown for schedule context.",
      "Review projected value and growth schedule outputs.",
    ],
  },
  loan: {
    name: "How to use the loan calculator",
    description: "Estimate payments for a fixed-rate loan.",
    steps: [
      "Enter loan amount, annual interest rate, and term in years.",
      "Set the first payment date when available.",
      "Check monthly payment and amortization schedule.",
      "Remember: exclude fees unless you add them separately in your plan.",
    ],
  },
  mortgage: {
    name: "How to use the mortgage calculator",
    description: "Approximate a home loan payment from value, down payment, rate, and term.",
    steps: [
      "Enter home value and down payment percentage.",
      "Set interest rate and loan term in years.",
      "Toggle PMI if you want a simple insurance estimate when applicable.",
      "Review payment, totals, and charts for planning only.",
    ],
  },
  days: {
    name: "How to use the days between dates calculator",
    description: "Find the number of days between two calendar dates.",
    steps: [
      "Select the start date.",
      "Select the end date on or after the start date.",
      "Read total days and equivalent weeks and months.",
    ],
  },
  vat: {
    name: "How to use the VAT calculator",
    description: "Split or add VAT using inclusive or exclusive mode.",
    steps: [
      "Enter the amount you want to analyze.",
      "Set the VAT rate percentage.",
      "Choose inclusive (VAT inside the amount) or exclusive (VAT on top).",
      "Read VAT amount and totals as labeled.",
    ],
  },
  emi: {
    name: "How to use the EMI calculator",
    description: "Compute equated monthly installment for a loan.",
    steps: [
      "Enter principal, annual rate, and tenure in months.",
      "Set first payment date if the form asks for it.",
      "Review monthly EMI, total payment, and amortization table.",
    ],
  },
  bmi: {
    name: "How to use the BMI calculator",
    description: "Calculate Body Mass Index from metric inputs.",
    steps: [
      "Enter weight in kilograms.",
      "Enter height in centimeters.",
      "Read BMI score and category for screening context only.",
    ],
  },
  tax: {
    name: "How to use the income tax estimator",
    description: "See a simplified progressive tax illustration.",
    steps: [
      "Enter annual gross income.",
      "Review estimated tax due and net income from the built-in brackets.",
      "Use a professional for real filing—this is illustrative.",
    ],
  },
  currency: {
    name: "How to use the currency converter",
    description: "Convert between supported currencies with demo rates.",
    steps: [
      "Enter the amount to convert.",
      "Choose source and target currency.",
      "Read the converted amount as an estimate, not a live trading quote.",
    ],
  },
  basic: {
    name: "How to use the scientific calculator",
    description: "Evaluate expressions with advanced math functions.",
    steps: [
      "Build an expression with the keypad or keyboard.",
      "Use the function reference for powers, roots, trig, and memory keys.",
      "Press Calculate or Enter to evaluate.",
      "Use history lines to recall past results when needed.",
    ],
  },
};

const HOWTO_RU: Record<string, SeoHowTo | undefined> = {
  interest: {
    name: "Как пользоваться калькулятором процентов",
    description: "Оценка сложного процента: сумма, ставка, срок и периодичность.",
    steps: [
      "Введите сумму (principal).",
      "Введите годовую ставку в процентах.",
      "Укажите срок в годах и частоту капитализации.",
      "Смотрите итог, начисленные проценты и доходность % в результатах.",
    ],
  },
  deposit: {
    name: "Как пользоваться калькулятором вклада",
    description: "Прогноз с начальным взносом и ежемесячными пополнениями.",
    steps: [
      "Введите начальный взнос и при желании ежемесячный платёж.",
      "Укажите ставку и срок (годы или месяцы).",
      "При необходимости дату открытия.",
      "Изучите прогноз и таблицу по странице.",
    ],
  },
  loan: {
    name: "Как пользоваться кредитным калькулятором",
    description: "Оценка аннуитетного платежа при фиксированной ставке.",
    steps: [
      "Введите сумму кредита, ставку и срок в годах.",
      "Укажите дату первого платежа, если есть поле.",
      "Смотрите платёж и график.",
      "Комиссии учитывайте отдельно при планировании.",
    ],
  },
  mortgage: {
    name: "Как пользоваться ипотечным калькулятором",
    description: "Приблизительный платёж по стоимости, взносу, ставке и сроку.",
    steps: [
      "Введите стоимость жилья и процент первоначального взноса.",
      "Укажите ставку и срок.",
      "При необходимости включите упрощённую оценку PMI.",
      "Используйте только для планирования.",
    ],
  },
  days: {
    name: "Как пользоваться калькулятором дней",
    description: "Разница между двумя датами.",
    steps: [
      "Выберите начальную дату.",
      "Выберите конечную дату не раньше начальной.",
      "Читайте дни и эквивалент в неделях и месяцах.",
    ],
  },
  vat: {
    name: "Как пользоваться калькулятором НДС",
    description: "Режимы «включён» и «сверху».",
    steps: [
      "Введите сумму.",
      "Укажите ставку НДС %.",
      "Выберите inclusive или exclusive.",
      "Смотрите НДС и итоги по подписям.",
    ],
  },
  emi: {
    name: "Как пользоваться калькулятором EMI",
    description: "Ежемесячный платёж по кредиту.",
    steps: [
      "Введите сумму, ставку и срок в месяцах.",
      "При необходимости дату первого платежа.",
      "Смотрите EMI, общую сумму и таблицу.",
    ],
  },
  bmi: {
    name: "Как пользоваться калькулятором ИМТ",
    description: "Расчёт по весу (кг) и росту (см).",
    steps: [
      "Введите вес в килограммах.",
      "Введите рост в сантиметрах.",
      "Читайте ИМТ и категорию только как ориентир.",
    ],
  },
  tax: {
    name: "Как пользоваться налоговым калькулятором",
    description: "Упрощённая прогрессивная модель.",
    steps: [
      "Введите годовой доход.",
      "Смотрите оценку налога и дохода «на руки».",
      "Для реальной отчётности обратитесь к специалисту.",
    ],
  },
  currency: {
    name: "Как пользоваться конвертером валют",
    description: "Пересчёт по демо-курсам.",
    steps: [
      "Введите сумму.",
      "Выберите исходную и целевую валюту.",
      "Помните: это оценка, не котировка банка.",
    ],
  },
  basic: {
    name: "Как пользоваться научным калькулятором",
    description: "Выражения с функциями и памятью.",
    steps: [
      "Наберите выражение кнопками или клавиатурой.",
      "Смотрите справку по функциям на странице.",
      "Нажмите «Вычислить» или Enter.",
      "Используйте историю для прошлых результатов.",
    ],
  },
};

export function getSeoFaqs(lang: AppLang, page: string): SeoFaq[] {
  const pack = lang === "ru" ? FAQ_RU : FAQ_EN;
  return pack[page] ?? [];
}

export function getSeoHowTo(lang: AppLang, page: string): SeoHowTo | null {
  const pack = lang === "ru" ? HOWTO_RU : HOWTO_EN;
  return pack[page] ?? null;
}
