/**
 * prerender.js — Generate static HTML shells for each route after `vite build`.
 *
 * Usage: node scripts/prerender.js  (run after vite build)
 *
 * Since finCalc uses viteSingleFile, dist/index.html has all JS inlined.
 * This script copies that file for each route, injecting per-page:
 *   - <title> and meta description / canonical
 *   - Static JSON-LD (BlogPosting / SoftwareApplication / BreadcrumbList)
 *   - <noscript> block with readable article content for AI crawlers
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const SITE = 'https://financcalculator.ru';
const DIST = 'dist';

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('ERROR: dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const baseHtml = readFileSync(join(DIST, 'index.html'), 'utf-8');

// ── Route definitions ──────────────────────────────────────────────────────────

const CALCULATOR_ROUTES = [
  { path: 'interest', title: 'Compound Interest Calculator | FinanceCalculator', desc: 'Calculate compound interest with principal, rate, compounding frequency and time. See APY, future value, and interest earned.', section: 'Compound Interest' },
  { path: 'loan', title: 'Loan Calculator — Monthly Payment & Amortization | FinanceCalculator', desc: 'Calculate monthly loan payments, total interest, and full amortization schedule for personal or auto loans.', section: 'Loan' },
  { path: 'mortgage', title: 'Mortgage Calculator — PITI, PMI & Amortization | FinanceCalculator', desc: 'Calculate mortgage payments including principal, interest, taxes, insurance (PITI) and PMI. Full 30-year amortization breakdown.', section: 'Mortgage' },
  { path: 'deposit', title: 'Savings & Deposit Calculator | FinanceCalculator', desc: 'Project savings account growth with regular contributions and compound interest over any time period.', section: 'Savings & Deposit' },
  { path: 'emi', title: 'EMI Calculator — Loan Monthly Payment | FinanceCalculator', desc: 'Calculate Equated Monthly Installment (EMI) for loans. Compare reducing tenure vs reducing EMI and see prepayment savings.', section: 'EMI' },
  { path: 'vat', title: 'VAT Calculator — Add or Remove Tax | FinanceCalculator', desc: 'Add or remove VAT/GST from prices. Calculate tax-inclusive or tax-exclusive amounts for any VAT rate.', section: 'VAT' },
  { path: 'tax', title: 'Tax Bracket Calculator — Marginal vs Effective Rate | FinanceCalculator', desc: 'Visualize progressive tax brackets. See marginal vs effective tax rate on any income level.', section: 'Tax' },
  { path: 'currency', title: 'Currency Converter | FinanceCalculator', desc: 'Convert between major world currencies. Quick and easy foreign exchange rate calculator.', section: 'Currency' },
  { path: 'bmi', title: 'BMI Calculator — Body Mass Index | FinanceCalculator', desc: 'Calculate Body Mass Index with metric units. See BMI category and health range interpretation.', section: 'BMI' },
  { path: 'days', title: 'Date Difference Calculator — Days Between Dates | FinanceCalculator', desc: 'Calculate the number of days, weeks, or months between any two dates.', section: 'Date Calculator' },
  { path: 'basic', title: 'Scientific Calculator Online | FinanceCalculator', desc: 'Full-featured scientific calculator with trigonometry, logarithms, exponents, and more.', section: 'Scientific Calculator' },
  { path: 'salestax', title: 'Sales Tax Calculator | FinanceCalculator', desc: 'Calculate sales tax and after-tax price for any sales tax rate or US state.', section: 'Sales Tax' },
  { path: 'ti84', title: 'TI-84 Plus CE Graphing Calculator Online | FinanceCalculator', desc: 'Online graphing calculator inspired by TI-84. Plot functions, solve equations, and explore mathematics.', section: 'Graphing Calculator' },
  { path: 'desmos', title: 'Desmos Graphing Calculator | FinanceCalculator', desc: 'Interactive graphing calculator to plot equations, explore functions, and visualize mathematics.', section: 'Graphing Calculator' },
];

const BLOG_POSTS_EN = [
  {
    slug: 'compound-interest-guide',
    title: 'Compound Interest: How Timing and Frequency Change Real Returns | FinanceCalculator',
    desc: 'Learn how timing and compounding frequency change real returns. See formula, practical examples, common mistakes, and ways to maximize results.',
    datePublished: '2026-01-15',
    dateModified: '2026-04-06',
    section: 'Personal finance',
    excerpt: 'Start date and compounding frequency can change your outcome more than tiny rate differences. Compound interest means your money earns on principal and on past gains, creating a snowball effect over time.',
    faqs: [
      { q: 'What is compound interest?', a: 'Compound interest is interest calculated on both the initial principal and the accumulated interest from earlier periods, creating a snowball effect over time.' },
      { q: 'Is daily compounding always better than monthly?', a: 'Daily usually gives a slightly higher result, but the gap is often small compared with start timing, contribution size, and fees.' },
      { q: 'What is the difference between APY and interest rate?', a: 'APY (Annual Percentage Yield) accounts for compounding frequency, while the nominal interest rate does not. APY enables fair comparison between products with different compounding schedules.' },
    ],
  },
  {
    slug: 'common-mortgage-mistakes-how-to-avoid',
    title: '10 Common Mortgage Mistakes and How to Avoid Them | FinanceCalculator',
    desc: 'Top 10 mortgage mistakes homebuyers make—pre-approval, credit score timing, rate shopping, and closing-cost planning.',
    datePublished: '2026-04-07',
    dateModified: '2026-04-08',
    section: 'Mortgage',
    excerpt: 'The mortgage piece is where many homebuyers trip. From skipping pre-approval to forgetting closing costs and ignoring PITI — these ten common mistakes cost real money.',
    faqs: [
      { q: 'What is the difference between pre-approval and pre-qualification?', a: 'Pre-qualification is a quick estimate. Pre-approval involves verified income, assets, and a credit check — much closer to what the lender will actually commit to.' },
      { q: 'How much should I budget for closing costs?', a: 'Many buyers plan for 2% to 5% of the purchase price. Your Loan Estimate from the lender is the real source of truth.' },
    ],
  },
  {
    slug: 'emi-prepayment-strategy',
    title: 'EMI Loan Prepayment: Where It Really Cuts Interest | FinanceCalculator',
    desc: 'When extra loan payments cut interest, when they don\'t (Rule of 78s), and how to force principal-only posting with your loan servicer.',
    datePublished: '2026-02-12',
    dateModified: '2026-04-07',
    section: 'Personal finance',
    excerpt: 'Your extra payment may not reduce your principal. Many loan servicers advance your due date instead. This guide explains reducing-balance vs Rule of 78s loans, and the one instruction most borrowers skip.',
    faqs: [
      { q: 'Does an extra payment reduce my next month\'s EMI automatically?', a: 'No. Your EMI amount is fixed for the full loan term. An extra payment reduces your principal balance but the total payment stays the same unless you ask your servicer to re-amortize.' },
      { q: 'Should I reduce tenure or reduce EMI after a prepayment?', a: 'Reducing tenure saves significantly more interest. Reducing EMI is better only if monthly cash flow is genuinely tight.' },
    ],
  },
  {
    slug: 'emergency-fund-high-yield-savings',
    title: 'Emergency Funds: Liquidity First, Yield Second | FinanceCalculator',
    desc: 'How much emergency cash to save, where to keep it liquid, and why safety and access beat chasing the highest APY.',
    datePublished: '2026-02-20',
    dateModified: '2026-04-08',
    section: 'Personal finance',
    excerpt: 'A layoff, medical bill, or broken car can hit before your next paycheck. An emergency fund must be accessible immediately — liquidity and safety come before yield.',
    faqs: [
      { q: 'How many months of expenses should my emergency fund cover?', a: 'Three months for stable dual-income households; six months for single earners; nine to twelve months for self-employed or variable income.' },
      { q: 'Should I invest my emergency fund for higher returns?', a: 'Generally no. Investments can drop right when you need the money. Keep the emergency tier in liquid, insured accounts.' },
    ],
  },
  {
    slug: 'progressive-tax-brackets-net-income',
    title: 'Progressive Tax Brackets: Why a Raise Does Not Tax Your Whole Paycheck | FinanceCalculator',
    desc: 'How marginal vs effective tax rates work in the U.S. and Russia (NDFL 2025). Higher brackets apply only to income above each threshold.',
    datePublished: '2026-02-25',
    dateModified: '2026-04-08',
    section: 'Tax',
    excerpt: 'Many people fear a raise will push them into a higher bracket and reduce their take-home pay. That is a myth. Progressive brackets apply each rate only to the slice of income within that band.',
    faqs: [
      { q: 'Will a raise reduce my take-home pay by pushing me into a higher bracket?', a: 'No. Only the dollars above the bracket line are taxed at the higher rate. All income below keeps its original rate, so a raise always increases net pay.' },
      { q: 'What is the difference between marginal and effective tax rate?', a: 'Marginal rate is the rate on the next dollar earned. Effective rate is total tax divided by total income — always lower than your top bracket in a progressive system.' },
    ],
  },
  {
    slug: 'currency-exchange-travel-budget',
    title: 'Currency Exchange for Travel: Budget Smarter | FinanceCalculator',
    desc: 'How to get better exchange rates, avoid hidden fees, and budget accurately for international travel.',
    datePublished: '2026-03-01',
    dateModified: '2026-04-08',
    section: 'Currency',
    excerpt: 'Hidden exchange fees can cost travelers 5–10% more than expected. This guide explains mid-market rates, bank vs. currency exchange fees, and how to avoid the most expensive conversion traps.',
    faqs: [
      { q: 'What is the mid-market exchange rate?', a: 'The mid-market rate is the midpoint between buy and sell rates — the "real" rate without markup. Banks and exchange services add their margin on top of this.' },
    ],
  },
  {
    slug: 'vat-gst-invoicing-inclusive-exclusive',
    title: 'VAT and GST Invoicing: Inclusive vs Exclusive Explained | FinanceCalculator',
    desc: 'How VAT-inclusive and VAT-exclusive pricing works for business invoicing, compliance, and reverse-charging VAT.',
    datePublished: '2026-03-05',
    dateModified: '2026-04-08',
    section: 'VAT',
    excerpt: 'VAT-inclusive means the tax is already in the price. VAT-exclusive means tax is added on top. Getting this wrong on invoices creates accounting errors and compliance issues.',
    faqs: [
      { q: 'What is the difference between VAT-inclusive and VAT-exclusive pricing?', a: 'VAT-inclusive: the stated price already contains the tax. VAT-exclusive: VAT is added on top of the stated price. The formula to extract VAT from an inclusive price is: VAT = Price × (rate ÷ (100 + rate)).' },
    ],
  },
  {
    slug: 'bmi-screening-insurance-pricing',
    title: 'BMI, Health Screening, and Insurance Pricing | FinanceCalculator',
    desc: 'How BMI affects health insurance underwriting, wellness programs, and life insurance pricing.',
    datePublished: '2026-03-10',
    dateModified: '2026-04-08',
    section: 'BMI',
    excerpt: 'BMI is a simple screening tool that insurance companies use as one data point in underwriting. Understanding how BMI categories map to insurance decisions helps you plan.',
    faqs: [
      { q: 'Does BMI affect health insurance premiums?', a: 'In markets where medical underwriting is permitted, high BMI can increase premiums or affect coverage. In ACA-compliant plans in the US, insurers cannot use BMI to set premiums.' },
    ],
  },
  {
    slug: 'how-to-calculate-emi-loan-monthly-payment',
    title: 'How to Calculate EMI: Loan Monthly Payment Formula | FinanceCalculator',
    desc: 'Step-by-step EMI formula with worked examples for home loans, car loans, and personal loans.',
    datePublished: '2026-03-15',
    dateModified: '2026-04-08',
    section: 'EMI',
    excerpt: 'EMI (Equated Monthly Installment) is the fixed monthly payment for a loan. The formula is: EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly rate, n is number of months.',
    faqs: [
      { q: 'What is the EMI formula?', a: 'EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P = loan principal, r = monthly interest rate (annual rate ÷ 12), n = total number of monthly payments.' },
    ],
  },
  {
    slug: 'sales-tax-calculator-russia-property-ndfl',
    title: 'Sales Tax Calculator: Russia Property and NDFL | FinanceCalculator',
    desc: 'How Russian property sales tax and NDFL applies to real estate transactions, including exemptions and calculation methods.',
    datePublished: '2026-03-20',
    dateModified: '2026-04-08',
    section: 'Tax',
    excerpt: 'Selling property in Russia triggers NDFL on the gain. Exemptions exist after 3 or 5 years of ownership depending on how the property was acquired.',
    faqs: [
      { q: 'Do I pay tax when selling property in Russia?', a: 'If you owned the property less than the minimum ownership period (3 or 5 years depending on acquisition), you pay NDFL (13% or 15% for residents) on the gain above an exemption amount.' },
    ],
  },
  {
    slug: 'ti84-plus-ce-calculator-online',
    title: 'TI-84 Plus CE Calculator Online: Guide & Alternatives | FinanceCalculator',
    desc: 'Features of the TI-84 Plus CE graphing calculator and how to use online graphing calculator alternatives.',
    datePublished: '2026-03-25',
    dateModified: '2026-04-08',
    section: 'Tools',
    excerpt: 'The TI-84 Plus CE is a popular graphing calculator used in high school and college math. Online alternatives offer similar functionality for free in a web browser.',
    faqs: [
      { q: 'Can I use a graphing calculator online for free?', a: 'Yes. Online graphing calculators like those available on FinanceCalculator provide similar functionality to the TI-84 for plotting functions, solving equations, and statistical analysis.' },
    ],
  },
  {
    slug: 'what-is-graphing-calculator',
    title: 'What Is a Graphing Calculator? Features, Uses & Guide | FinanceCalculator',
    desc: 'What a graphing calculator does, how it differs from scientific calculators, and when you need one for math and science.',
    datePublished: '2026-04-01',
    dateModified: '2026-04-08',
    section: 'Tools',
    excerpt: 'A graphing calculator plots mathematical functions, solves equations, and performs statistical analysis. It is standard equipment in high school and college STEM courses.',
    faqs: [
      { q: 'What is the difference between a scientific and graphing calculator?', a: 'A scientific calculator performs numerical computations. A graphing calculator adds the ability to plot functions, visualize equations, and perform more advanced math like calculus and statistics.' },
    ],
  },
];

const BLOG_POSTS_RU = [
  {
    slug: 'slozhnye-protsenty-apr',
    title: 'Сложные проценты: как срок и частота меняют реальный доход | FinanceCalculator',
    desc: 'Формула сложных процентов, влияние частоты начисления и срока вклада. Примеры расчётов и типичные ошибки.',
    datePublished: '2026-01-15',
    dateModified: '2026-04-06',
    section: 'Личные финансы',
    excerpt: 'Дата начала и частота начисления процентов влияют на итоговую сумму больше, чем небольшая разница в ставке.',
    faqs: [
      { q: 'Что такое сложные проценты?', a: 'Сложные проценты — это проценты, начисляемые на основную сумму и на ранее накопленные проценты. Чем дольше срок, тем сильнее эффект.' },
    ],
  },
  {
    slug: 'ipoteka-oshibki-piti-pmi',
    title: '10 ошибок при ипотеке и как их избежать | FinanceCalculator',
    desc: 'Топ-10 ошибок при оформлении ипотеки: предодобрение, кредитная история, закрывающие расходы и расчёт PITI.',
    datePublished: '2026-04-07',
    dateModified: '2026-04-08',
    section: 'Ипотека',
    excerpt: 'Покупка жилья требует понимания не только ставки, но и предодобрения, кредитного профиля и полного платежа PITI.',
    faqs: [
      { q: 'Чем отличается предодобрение от предквалификации?', a: 'Предквалификация — быстрая оценка. Предодобрение — проверка доходов, активов и кредитной истории, более надёжный сигнал для продавца.' },
    ],
  },
  {
    slug: 'emi-dosrochnoe-pogashenie',
    title: 'Досрочное погашение кредита EMI: где реально экономятся проценты | FinanceCalculator',
    desc: 'Когда досрочное погашение выгодно, ловушка «правила 78», и как правильно указать назначение платежа.',
    datePublished: '2026-02-12',
    dateModified: '2026-04-07',
    section: 'Личные финансы',
    excerpt: 'Дополнительный платёж не всегда снижает основной долг. Многие банки засчитывают его как аванс следующего месяца.',
    faqs: [
      { q: 'Что выгоднее: сократить срок или снизить платёж?', a: 'Сокращение срока экономит значительно больше процентов. Снижение платежа имеет смысл только при реальных трудностях с денежным потоком.' },
    ],
  },
  {
    slug: 'rezervnyy-fond-likvidnost',
    title: 'Резервный фонд: сначала ликвидность, потом доходность | FinanceCalculator',
    desc: 'Сколько откладывать в резервный фонд, где хранить, и почему безопасность важнее высокой ставки.',
    datePublished: '2026-02-20',
    dateModified: '2026-04-08',
    section: 'Личные финансы',
    excerpt: 'Резервный фонд должен быть доступен мгновенно. Ликвидность и сохранность важнее доходности.',
    faqs: [
      { q: 'На сколько месяцев расходов должен быть резервный фонд?', a: 'Три месяца — для стабильной семьи с двумя доходами; шесть месяцев — для одного кормильца; 9–12 месяцев — для самозанятых.' },
    ],
  },
  {
    slug: 'progressivnye-nalogovye-stavki',
    title: 'Прогрессивные налоговые ставки: почему повышение зарплаты не облагается по максимальной ставке | FinanceCalculator',
    desc: 'Как работает прогрессивная шкала НДФЛ 2025 в России (13–22%). Предельная и эффективная ставка на примерах.',
    datePublished: '2026-02-25',
    dateModified: '2026-04-08',
    section: 'Налоги',
    excerpt: 'По прогрессивной шкале каждая следующая ставка применяется только к части дохода выше порога, а не ко всей зарплате.',
    faqs: [
      { q: 'Облагается ли весь доход по максимальной ставке при переходе в новую ступень?', a: 'Нет. Только часть дохода, превышающая порог, облагается по более высокой ставке. Всё, что ниже порога, остаётся по прежней ставке.' },
    ],
  },
  {
    slug: 'valyuta-puteshestvie-kursy',
    title: 'Обмен валюты в путешествии: как сэкономить | FinanceCalculator',
    desc: 'Где выгоднее менять валюту, как избежать скрытых комиссий и правильно спланировать бюджет поездки.',
    datePublished: '2026-03-01',
    dateModified: '2026-04-08',
    section: 'Валюта',
    excerpt: 'Скрытые наценки при обмене валюты могут съесть 5–10% бюджета. Рассказываем, как этого избежать.',
    faqs: [
      { q: 'Что такое курс по середине рынка?', a: 'Это среднее между курсом покупки и продажи — «реальный» курс без наценки банка. Именно от него отталкиваются при сравнении предложений.' },
    ],
  },
  {
    slug: 'nds-scheta-s-nalogom-i-bez',
    title: 'НДС в счетах-фактурах: с налогом и без — разница и расчёт | FinanceCalculator',
    desc: 'Как работает НДС включённый и НДС сверху при выставлении счетов. Формулы расчёта и примеры.',
    datePublished: '2026-03-05',
    dateModified: '2026-04-08',
    section: 'НДС',
    excerpt: 'Цена «с НДС» включает налог внутри. Цена «без НДС» — налог добавляется сверху. Путаница стоит денег.',
    faqs: [
      { q: 'Как выделить НДС из суммы с НДС?', a: 'НДС = Сумма с НДС × ставка / (100 + ставка). Например, при ставке 20%: НДС = цена × 20 / 120 = цена / 6.' },
    ],
  },
  {
    slug: 'ti84-plus-ce-kalkulyator-onlayn',
    title: 'TI-84 Plus CE онлайн-калькулятор: руководство | FinanceCalculator',
    desc: 'Функции графического калькулятора TI-84 Plus CE и бесплатные онлайн-аналоги для построения графиков.',
    datePublished: '2026-03-25',
    dateModified: '2026-04-08',
    section: 'Инструменты',
    excerpt: 'TI-84 Plus CE — популярный графический калькулятор для школы и вуза. Онлайн-аналоги работают бесплатно в браузере.',
    faqs: [
      { q: 'Можно ли использовать графический калькулятор онлайн бесплатно?', a: 'Да. Онлайн-калькуляторы на FinanceCalculator позволяют строить графики функций, решать уравнения и проводить статистический анализ бесплатно.' },
    ],
  },
  {
    slug: 'imt-skrining-i-stoimost-strahovki',
    title: 'ИМТ, медицинские скрининги и стоимость страховки | FinanceCalculator',
    desc: 'Как индекс массы тела влияет на андеррайтинг страхования здоровья и жизни.',
    datePublished: '2026-03-10',
    dateModified: '2026-04-08',
    section: 'ИМТ',
    excerpt: 'Индекс массы тела — один из показателей, который страховщики используют при расчёте тарифов. Понимание этого помогает планировать расходы на страхование.',
    faqs: [
      { q: 'Влияет ли ИМТ на стоимость страховки?', a: 'В системах, допускающих медицинский андеррайтинг, высокий ИМТ может повлиять на тариф или условия страхования.' },
    ],
  },
  {
    slug: 'kak-rasschitat-emi-ezhemesyachnyy-platezh',
    title: 'Как рассчитать EMI: формула ежемесячного платежа по кредиту | FinanceCalculator',
    desc: 'Формула EMI с пошаговыми примерами для ипотеки, автокредита и потребительского кредита.',
    datePublished: '2026-03-15',
    dateModified: '2026-04-08',
    section: 'EMI',
    excerpt: 'EMI — фиксированный ежемесячный платёж по кредиту. Формула: EMI = P × r × (1+r)^n / ((1+r)^n − 1).',
    faqs: [
      { q: 'Какова формула расчёта EMI?', a: 'EMI = P × r × (1+r)^n / ((1+r)^n − 1), где P — сумма кредита, r — месячная ставка (годовая ÷ 12), n — количество месяцев.' },
    ],
  },
  {
    slug: 'kalkulyator-naloga-s-prodazh-nedvizhimost',
    title: 'Калькулятор налога: продажа недвижимости и НДФЛ в России | FinanceCalculator',
    desc: 'Как рассчитать НДФЛ при продаже недвижимости в России: освобождения, минимальный срок владения и примеры.',
    datePublished: '2026-03-20',
    dateModified: '2026-04-08',
    section: 'Налоги',
    excerpt: 'При продаже квартиры до истечения минимального срока владения нужно заплатить НДФЛ с дохода.',
    faqs: [
      { q: 'Нужно ли платить налог при продаже квартиры в России?', a: 'Если квартира в собственности менее минимального срока (3 или 5 лет в зависимости от способа приобретения), уплачивается НДФЛ с дохода за вычетом расходов или имущественного вычета.' },
    ],
  },
  {
    slug: 'chto-takoe-graficheskiy-kalkulyator',
    title: 'Что такое графический калькулятор: функции и применение | FinanceCalculator',
    desc: 'Чем графический калькулятор отличается от научного, для чего он используется в математике и физике.',
    datePublished: '2026-04-01',
    dateModified: '2026-04-08',
    section: 'Инструменты',
    excerpt: 'Графический калькулятор строит графики функций, решает уравнения и выполняет статистический анализ. Стандартный инструмент в STEM-дисциплинах.',
    faqs: [
      { q: 'В чём разница между научным и графическим калькулятором?', a: 'Научный калькулятор выполняет числовые вычисления. Графический дополнительно строит графики функций, решает уравнения визуально и поддерживает более сложные вычисления.' },
    ],
  },
];

const SPECIAL_PAGES_EN = [
  { path: 'about', title: 'About FinanceCalculator — Free Financial Calculator Tools', desc: 'About FinanceCalculator: our mission, editorial standards, and the team behind free financial calculator tools for English and Russian speakers.', noscript: '<h1>About FinanceCalculator</h1><p>FinanceCalculator is a free bilingual (English and Russian) financial calculator web application. We provide tools for compound interest, loan payments, mortgage amortization, EMI, VAT, currency conversion, BMI, tax brackets, and more.</p><h2>Our Mission</h2><p>To make financial math accessible and understandable for everyone. All calculators are free, no sign-up required.</p><h2>Editorial Standards</h2><p>All content is reviewed for accuracy and updated when calculation standards change. Results are educational estimates only.</p>' },
  { path: 'contact', title: 'Contact FinanceCalculator', desc: 'Get in touch with the FinanceCalculator team for questions, corrections, or feedback.', noscript: '<h1>Contact FinanceCalculator</h1><p>Use our contact form to reach the FinanceCalculator team for questions about our tools or content.</p>' },
  { path: 'blog', title: 'Financial Education Blog | FinanceCalculator', desc: 'Financial education articles covering compound interest, mortgage, EMI loans, tax brackets, VAT, currency, BMI, and personal finance.', noscript: '<h1>FinanceCalculator Financial Education Blog</h1><p>Articles covering personal finance, loans, mortgage, tax, EMI, VAT, currency, and more.</p>' },
];

const SPECIAL_PAGES_RU = [
  { path: 'ru/about', title: 'О FinanceCalculator — бесплатные финансовые калькуляторы', desc: 'О проекте FinanceCalculator: наша миссия, редакционные стандарты и инструменты для русскоязычной аудитории.', noscript: '<h1>О FinanceCalculator</h1><p>FinanceCalculator — бесплатное двуязычное веб-приложение с финансовыми калькуляторами. Мы предоставляем инструменты для расчёта сложных процентов, кредитов, ипотеки, EMI, НДС, валюты, ИМТ и налогов.</p>' },
  { path: 'ru/contact', title: 'Контакты FinanceCalculator', desc: 'Свяжитесь с командой FinanceCalculator по вопросам о наших инструментах или контенте.', noscript: '<h1>Контакты FinanceCalculator</h1><p>Используйте форму обратной связи для вопросов о калькуляторах или контенте.</p>' },
  { path: 'ru/blog', title: 'Финансовый блог | FinanceCalculator', desc: 'Статьи по личным финансам: сложные проценты, ипотека, EMI, налоги, НДС, валюта и многое другое.', noscript: '<h1>Финансовый блог FinanceCalculator</h1><p>Статьи по личным финансам: кредиты, ипотека, налоги, НДС, валюта и другие темы.</p>' },
];

// ── HTML generation helpers ───────────────────────────────────────────────────

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function faqSchema(faqs, pageUrl) {
  if (!faqs || faqs.length === 0) return '';
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }, null, 0);
}

function breadcrumbSchema(items) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }, null, 0);
}

function blogPostingSchema(post, pageUrl, lang) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${pageUrl}#article`,
    url: pageUrl,
    headline: post.title.replace(/ \| FinanceCalculator$/, ''),
    description: post.desc,
    datePublished: `${post.datePublished}T08:00:00.000Z`,
    dateModified: `${post.dateModified}T08:00:00.000Z`,
    author: [
      { '@type': 'Person', name: 'FinanceCalculator Editorial', url: `${SITE}/about` },
      { '@type': 'Organization', '@id': `${SITE}/#org` },
    ],
    publisher: { '@id': `${SITE}/#org` },
    inLanguage: lang === 'ru' ? 'ru-RU' : 'en-US',
    articleSection: post.section,
    isAccessibleForFree: true,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${pageUrl}#webpage` },
  }, null, 0);
}

function softwareAppSchema(route, pageUrl, lang) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    '@id': `${pageUrl}#app`,
    name: route.title.replace(/ \| FinanceCalculator$/, ''),
    url: pageUrl,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    inLanguage: lang === 'ru' ? 'ru-RU' : 'en-US',
  }, null, 0);
}

function blogNoscript(post) {
  const faqHtml = post.faqs && post.faqs.length
    ? `<h2>Frequently Asked Questions</h2><dl>${post.faqs.map(f => `<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`).join('')}</dl>`
    : '';
  return `<h1>${escapeHtml(post.title.replace(/ \| FinanceCalculator$/, ''))}</h1>
<p>${escapeHtml(post.excerpt)}</p>
${faqHtml}
<p><a href="${SITE}/blog">Back to Blog</a> | <a href="${SITE}/">FinanceCalculator Home</a></p>`;
}

function calcNoscript(route, lang) {
  const home = lang === 'ru' ? `${SITE}/ru` : SITE;
  return `<h1>${escapeHtml(route.title.replace(/ \| FinanceCalculator$/, ''))}</h1>
<p>${escapeHtml(route.desc)}</p>
<p>This calculator requires JavaScript to function. Please enable JavaScript in your browser.</p>
<p><a href="${home}">Back to FinanceCalculator Home</a></p>`;
}

function injectIntoHtml(html, { title, desc, canonical, schemaBlocks, noscriptBody }) {
  // Update <title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);

  // Update meta description
  html = html.replace(
    /(<meta\s+name=["']description["']\s+content=["'])[^"']*["']/i,
    `$1${escapeHtml(desc)}'`
  );

  // Update og:title
  html = html.replace(
    /(<meta\s+property=["']og:title["']\s+content=["'])[^"']*["']/i,
    `$1${escapeHtml(title)}'`
  );

  // Update og:description
  html = html.replace(
    /(<meta\s+property=["']og:description["']\s+content=["'])[^"']*["']/i,
    `$1${escapeHtml(desc)}'`
  );

  // Update og:url and canonical
  html = html.replace(
    /(<meta\s+property=["']og:url["']\s+content=["'])[^"']*["']/i,
    `$1${canonical}'`
  );
  html = html.replace(
    /(<link\s+rel=["']canonical["']\s+href=["'])[^"']*["']/i,
    `$1${canonical}'`
  );

  // Inject schema blocks before </head>
  if (schemaBlocks && schemaBlocks.length > 0) {
    const scriptTags = schemaBlocks
      .map(s => `<script type="application/ld+json">${s}</script>`)
      .join('\n    ');
    html = html.replace('</head>', `    ${scriptTags}\n  </head>`);
  }

  // Replace noscript content
  if (noscriptBody) {
    html = html.replace(
      /(<noscript>)([\s\S]*?)(<\/noscript>)/,
      `$1\n      ${noscriptBody}\n    $3`
    );
  }

  return html;
}

function writeFile(relativePath, content) {
  const fullPath = join(DIST, relativePath);
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/') !== -1 ? fullPath.lastIndexOf('/') : fullPath.lastIndexOf('\\'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
  console.log(`  ✓ ${relativePath}`);
}

// ── Main render loop ──────────────────────────────────────────────────────────

let count = 0;

console.log('\nPrerendering EN calculator pages...');
for (const route of CALCULATOR_ROUTES) {
  const pageUrl = `${SITE}/${route.path}`;
  const html = injectIntoHtml(baseHtml, {
    title: route.title,
    desc: route.desc,
    canonical: pageUrl,
    schemaBlocks: [
      softwareAppSchema(route, pageUrl, 'en'),
      breadcrumbSchema([
        { name: 'Home', url: SITE },
        { name: route.section, url: pageUrl },
      ]),
    ],
    noscriptBody: calcNoscript(route, 'en'),
  });
  writeFile(`${route.path}/index.html`, html);
  count++;
}

console.log('\nPrerendering RU calculator pages...');
for (const route of CALCULATOR_ROUTES) {
  const pageUrl = `${SITE}/ru/${route.path}`;
  const html = injectIntoHtml(baseHtml, {
    title: route.title,
    desc: route.desc,
    canonical: pageUrl,
    schemaBlocks: [
      softwareAppSchema(route, pageUrl, 'ru'),
      breadcrumbSchema([
        { name: 'Главная', url: `${SITE}/ru` },
        { name: route.section, url: pageUrl },
      ]),
    ],
    noscriptBody: calcNoscript(route, 'ru'),
  });
  writeFile(`ru/${route.path}/index.html`, html);
  count++;
}

console.log('\nPrerendering EN blog posts...');
for (const post of BLOG_POSTS_EN) {
  const pageUrl = `${SITE}/blog/${post.slug}`;
  const html = injectIntoHtml(baseHtml, {
    title: post.title,
    desc: post.desc,
    canonical: pageUrl,
    schemaBlocks: [
      blogPostingSchema(post, pageUrl, 'en'),
      breadcrumbSchema([
        { name: 'Home', url: SITE },
        { name: 'Blog', url: `${SITE}/blog` },
        { name: post.title.replace(/ \| FinanceCalculator$/, ''), url: pageUrl },
      ]),
      post.faqs && post.faqs.length ? faqSchema(post.faqs, pageUrl) : null,
    ].filter(Boolean),
    noscriptBody: blogNoscript(post),
  });
  writeFile(`blog/${post.slug}/index.html`, html);
  count++;
}

console.log('\nPrerendering RU blog posts...');
for (const post of BLOG_POSTS_RU) {
  const pageUrl = `${SITE}/ru/blog/${post.slug}`;
  const html = injectIntoHtml(baseHtml, {
    title: post.title,
    desc: post.desc,
    canonical: pageUrl,
    schemaBlocks: [
      blogPostingSchema(post, pageUrl, 'ru'),
      breadcrumbSchema([
        { name: 'Главная', url: `${SITE}/ru` },
        { name: 'Блог', url: `${SITE}/ru/blog` },
        { name: post.title.replace(/ \| FinanceCalculator$/, ''), url: pageUrl },
      ]),
      post.faqs && post.faqs.length ? faqSchema(post.faqs, pageUrl) : null,
    ].filter(Boolean),
    noscriptBody: blogNoscript(post),
  });
  writeFile(`ru/blog/${post.slug}/index.html`, html);
  count++;
}

console.log('\nPrerendering special pages (EN)...');
for (const page of SPECIAL_PAGES_EN) {
  const pageUrl = `${SITE}/${page.path}`;
  const html = injectIntoHtml(baseHtml, {
    title: page.title,
    desc: page.desc,
    canonical: pageUrl,
    schemaBlocks: [],
    noscriptBody: page.noscript,
  });
  writeFile(`${page.path}/index.html`, html);
  count++;
}

console.log('\nPrerendering special pages (RU)...');
for (const page of SPECIAL_PAGES_RU) {
  const pageUrl = `${SITE}/${page.path}`;
  const html = injectIntoHtml(baseHtml, {
    title: page.title,
    desc: page.desc,
    canonical: pageUrl,
    schemaBlocks: [],
    noscriptBody: page.noscript,
  });
  writeFile(`${page.path}/index.html`, html);
  count++;
}

console.log(`\n✅ Prerendering complete — ${count} files written to dist/\n`);
