/**
 * Long-form visible copy per calculator to avoid thin pages. Unique per tool; not keyword stuffing.
 */
import type { AppLang } from "../utils/routes";

const EN: Record<string, string[]> = {
  interest: [
    "Compound interest is the mechanism by which money grows on both your original principal and the interest that has already been credited. The more often interest is compounded within a year—monthly versus annually, for example—the faster the balance increases, all else equal. Our calculator applies standard periodic compounding formulas so you can compare scenarios side by side before you commit to a real product.",
    "When you plan with this tool, treat the annual rate as the nominal rate quoted by a bank or bond, and align the compounding dropdown with how the product actually credits interest. Real institutions may use different day-count conventions (365 vs 360), fees, tiered rates, or taxes that are not modeled here. The output is best understood as a clean mathematical baseline, not a binding quote.",
    "Investors often use a compound-interest view to internalize how starting early beats chasing slightly higher rates later. Savers may check how a recurring deposit changes the curve. Whatever your goal, write down the assumptions you used (principal, rate, years, frequency) so you can revisit them when market conditions or your budget changes.",
  ],
  deposit: [
    "This savings projection combines an opening balance with optional equal monthly contributions and a constant annual rate over the term you specify. It is suited to modeling disciplined saving toward a down payment, emergency fund, or medium-term objective where you want a smooth curve rather than volatile market returns.",
    "Banks advertise annual percentage yields that may already reflect compounding frequency; here you choose term units (years or months) and the tool builds a schedule-style view where available. Taxes on interest, account fees, promotional rate expirations, and withdrawal penalties are not included unless you mentally adjust for them. If your institution compounds daily but quotes an APY, your real path may sit close to—but not exactly on—the line shown.",
    "Use the results to stress-test commitment: try a lower rate to see downside, or a shorter term to see how much you must contribute to hit a target. Pair numbers with a separate inflation check if the goal is far in the future, because purchasing power is a different question from nominal balance.",
  ],
  loan: [
    "An amortizing loan splits each payment into interest on the remaining balance and principal that reduces what you owe. Over time, the interest portion shrinks and the principal portion grows—a pattern this calculator illustrates when schedules are available. The classic use case is comparing offers on personal or auto loans where the headline rate and term drive affordability.",
    "Lenders may add origination fees, insurance bundles, or variable rates that change your true cost of borrowing. This interface assumes a stable annual rate and regular payments without prepayment for simplicity. If you plan extra principal payments, your actual payoff date and total interest will be lower than shown; use the table as a starting conversation with the lender’s official disclosure.",
    "Keeping total debt service within common budgeting guidelines (often discussed as a percentage of gross income) is a personal choice, not a rule enforced here. The value of the tool is transparency: you see how much of each currency unit goes to interest versus principal over the life of the loan.",
  ],
  mortgage: [
    "A mortgage blends the same amortization logic as smaller loans with larger principals and longer horizons. Down payment percentage immediately changes the borrowed amount and, indirectly, whether ancillary costs like mortgage insurance might apply in real life. Our optional PMI-style toggle is a simplified hint only; actual insurance rules depend on jurisdiction, lender, and loan program.",
    "Property taxes, homeowners insurance, and escrow handling vary enormously by location. Unless explicitly separated in your workflow, treat the monthly payment shown as principal-and-interest focused. Closing costs, points, and adjustable-rate features are also outside the default model. Always validate against a Loan Estimate or equivalent document before signing.",
    "Long-term homeowners may use the calculator to see how a few basis points on the rate or a slightly larger down payment shifts lifetime interest. That sensitivity analysis helps you negotiate or choose between products without relying on a single quoted payment.",
  ],
  days: [
    "Counting days between calendar dates is foundational for contracts, rental prorations, project timelines, and interest accrual windows. This tool focuses on whole calendar dates; it does not shift for business-day calendars, holidays, or time zones unless you interpret the output that way yourself.",
    "When legal language says “inclusive” or “exclusive” of endpoints, the counted days can differ by one. Check the on-screen labels and your jurisdiction’s norms. For payroll or bond accrual, professionals often follow industry-specific conventions this general-purpose calculator does not enforce.",
    "The weeks and months equivalents are intuitive approximations for communication, not precise astronomical intervals. Use exact day counts when stakes are high, and document the start and end dates you entered.",
  ],
  vat: [
    "Value-added tax appears in invoices either baked into the price (inclusive) or added at checkout (exclusive). Choosing the wrong mode is one of the most common data-entry mistakes; match the mode to how your supplier or customer quotes amounts. The math here is straight percentage arithmetic on your inputs.",
    "Rates and exemptions differ by country, product category, and whether the buyer is a business reclaiming input VAT. Cross-border sales add complexity. This calculator does not file returns, validate invoices, or choose the correct legal rate—you must supply the percentage that applies to your situation.",
    "Operators use quick VAT splits to sanity-check receipts, proposals, and expense reports. If a figure feels off, re-check inclusive vs exclusive, rounding rules (line vs invoice), and whether discounts were applied before or after tax in the source document.",
  ],
  emi: [
    "Equated monthly installment plans express borrowing as a fixed payment each period, which is how many consumer and education loans are marketed. Behind the constant EMI, the internal split between interest and principal still moves exactly like standard amortization. Reviewing the table helps you see how much early payments service interest.",
    "Floating-rate loans, step-up schedules, moratoriums, and balloon payments require different mathematics. This model assumes a fixed annual rate translated into the schedule the app uses, with equal installments through the tenure you enter. Banks may round per period or adjust the last payment by a few units of currency.",
    "Use EMI outputs to budget cash flow, not to replace the formal repayment schedule from your lender. If you prepay, EMI might stay constant while tenure shortens, or the bank might recalculate—policies vary.",
  ],
  bmi: [
    "Body Mass Index is weight in kilograms divided by height in meters squared. It correlates with population-level health risk categories but does not measure body fat percentage, bone density, or muscle mass. Athletes with high lean mass may land in a high category without the same metabolic risks as sedentary individuals at the same index.",
    "FinanceCalculator uses metric inputs only (kilograms and centimeters) to avoid silent unit errors. If you only know imperial measurements, convert carefully before typing. The category bands shown follow common WHO-style breakpoints used for screening, not diagnosis.",
    "Never use BMI alone to change medication, diet, or exercise plans. Pair screening tools with clinical advice, waist circumference, blood pressure, glucose, lipids, and personal history when evaluating health.",
  ],
  tax: [
    "Progressive taxation means higher slices of income can face higher marginal rates while lower slices still enjoy lower brackets. Our built-in estimator applies a simplified bracket stack to gross income for illustration. It does not know your filing status, dependents, deductions, credits, local taxes, or payroll items like retirement deferrals.",
    "Real tax systems may tax ordinary income, dividends, and capital gains differently. Self-employment adds layers. Treat the output as an educational visualization: it shows how bracket mechanics feel, not what you owe a revenue authority.",
    "If you compare countries or years, remember that bracket widths and rates change with legislation. Update your mental model when laws change; static demo parameters in any web tool can go stale.",
  ],
  currency: [
    "Currency conversion multiplies your amount by the ratio between two units. By default FinanceCalculator loads live reference rates in the browser: free ECB-based data via Frankfurter (no key), or—if you set VITE_EXCHANGE_RATE_API_KEY—broader coverage via ExchangeRate-API. These are still not your bank’s bid/ask, card FX markup, or wire desk quotes. For travel, trading, or invoicing, confirm with your institution.",
    "Retail conversions embed spreads and fees that widen the gap from the theoretical number. When reconciling accounts, always trace back to the statement line, not to a demo calculator.",
    "If you test scenarios (for example USD to EUR to RUB), you are exploring arithmetic relationships, not executing a chain hedge. Multi-leg conversions in the real world may not be transitive at identical rates because each leg is priced separately.",
  ],
  ti84: [
    "This page is a TI-84 Plus CE–style graphing workspace: home-screen math, a Y= editor for up to six functions, a WINDOW screen for xMin, xMax, yMin, yMax, and scales, plus GRAPH to plot on a grid. It is built for homework and review when you do not have the physical device—keyboard shortcuts mirror common classroom workflows (type x for the graphing variable, p for π, s/c/t for trig).",
    "Expressions use math.js for evaluation, with radian mode on the status bar like many calculus courses. Inverse sine, cosine, and tangent are available via 2nd + sin/cos/tan. For degree problems, convert inside the argument (for example multiply degrees by pi/180) so the value matches what your teacher expects.",
    "The emulator is not a byte-perfect clone: TI-BASIC programs, statistics apps, data lists, and some menus are not implemented. Zoom/Trace/Calc on the top row are placeholders today—use WINDOW to frame the graph and edit Y= to change functions. If a graph is blank, widen yMax or shift xMin/xMax; that is the same troubleshooting flow as on hardware.",
    "SAT, ACT, AP, and other tests require an approved handheld calculator on exam day; this tool is for practice only. FinanceCalculator is not affiliated with Texas Instruments. For official menus and every feature, use Texas Instruments’ guide PDF; for rules, read the current calculator policy from the testing organization.",
  ],
  basic: [
    "This scientific calculator is designed for expressive formulas: nested parentheses, transcendental functions, factorial on integers, and memory keys for repeated sub-expressions. Results round for display to fifteen decimal places to reduce runaway floating noise in long chains, though underlying IEEE binary floats still apply beneath the hood.",
    "The percent key behavior follows the documented rules: between two numbers it acts as remainder (modulo), while pct(x) turns a literal percentage into a decimal factor. Trigonometric functions expect degrees, not radians, which matches many classroom settings but differs from some engineering tools—always confirm the angular mode when mixing sources.",
    "History and memory live in your browser session for convenience. They are not a substitute for version-controlled worksheets or audited computation logs when correctness must be provable. For financial or safety-critical figures, cross-check with an independent method.",
  ],
  about: [
    "FinanceCalculator is a free, browser-based collection of financial and everyday calculators—compound interest, savings, loans, mortgages, EMI, VAT, tax estimates, currency conversion, BMI, and a full scientific keypad. The site is built for quick what-if checks and learning, with clear labels so you can see which assumptions drive each result.",
    "We publish short articles on the blog that tie real scenarios to the tools: when a metric matters, how to read an amortization table, and what typical calculators leave out (fees, taxes, floating rates, jurisdiction-specific rules). Nothing here replaces licensed tax, legal, or investment advice; use professionals when decisions have material consequences.",
    "FinanceCalculator runs in English and Russian with matching URLs so you can share links in either language. If you spot a bug, have a feature idea, or want to report unclear copy, use the contact page—we read feedback even when we cannot answer individualized planning questions by email.",
  ],
};

const RU: Record<string, string[]> = {
  interest: [
    "Сложный процент начисляется и на первоначальную сумму, и на уже присоединённые проценты. Чем чаще капитализация в году (например ежемесячно вместо ежегодно), тем быстрее при прочих равных растёт баланс. Калькулятор использует стандартную периодическую модель, чтобы вы могли сравнить сценарии до выбора реального продукта.",
    "Указывайте номинальную годовую ставку и частоту так, как это делает ваш банк или эмитент. В жизни встречаются разные базы дней, комиссии, лестничные ставки и налоги — здесь это не моделируется. Результат — чистая математическая база, а не оферта.",
    "Инвесторы смотрят на кривую, чтобы увидеть эффект раннего старта и дисциплины. Запишите введённые допущения (сумма, ставка, срок, частота), чтобы позже сверить их при смене условий рынка или бюджета.",
  ],
  deposit: [
    "Прогноз сочетает начальный взнос, равные ежемесячные пополнения и постоянную годовую ставку на выбранный срок. Удобно для целей вроде подушки безопасности или накопления на крупную покупку без волатильности рынка.",
    "Банки указывают доходность с учётом капитализации; вы выбираете срок в годах или месяцах. Налоги, комиссии, акции «ставка на 3 месяца» и штрафы за досрочное снятие сюда не включены — учитывайте их отдельно.",
    "Проверяйте чувствительность: более низкая ставка или более короткий срок покажут, сколько нужно откладывать. Для далёких целей отдельно думайте об инфляции покупательной способности.",
  ],
  loan: [
    "Аннуитетный кредит делит платёж на проценты с остатка и основной долг. Со временем доля процентов падает, доля тела растёт — это видно в таблице, если она выводится. Типичный случай — потребительский или автокредит с фиксированной ставкой.",
    "Банк может добавить комиссии, страховки или плавающую ставку. Здесь — стабильная годовая ставка без досрочных погашений в модели. При досрочке фактические проценты и срок будут меньше расчётных.",
    "Инструмент даёт прозрачность: сколько из каждого платежа уходит на проценты за весь срок. Решение о долговой нагрузке остаётся за вами и вашим бюджетом.",
  ],
  mortgage: [
    "Ипотека — тот же принцип амортизации, но с крупной суммой и длинным горизонтом. Размер первоначального взноса меняет тело кредита и может влиять на страхование — переключатель PMI здесь лишь упрощённая подсказка, не норма конкретной страны.",
    "Налоги на недвижимость, страхование дома и эскроу сильно зависят от региона. Платёж на экране ориентирован на тело и проценты; закрытие сделки и плавающие ставки требуют отдельных документов от банка.",
    "Несколько базисных пунктов по ставке или чуть больший взнос заметно меняют переплату за десятилетия — калькулятор помогает увидеть это до переговоров.",
  ],
  days: [
    "Подсчёт дней между датами нужен для договоров, аренды, сроков проектов и окон начислений. Инструмент работает с календарными датами; рабочие дни, праздники и часовые пояса вы учитываете сами.",
    "Юридически важно, включаются ли границы интервала — иногда итог отличается на один день. Для зарплаты и облигаций часто действуют отраслевые правила, которые универсальный калькулятор не навязывает.",
    "Эквиваленты в неделях и месяцах — для наглядности, а не астрономическая точность. В спорных случаях опирайтесь на точное число дней и зафиксированные даты ввода.",
  ],
  vat: [
    "НДС в цене (inclusive) или сверху (exclusive) — разные режимы; перепутать их — частая ошибка. Сопоставьте режим с тем, как выставлен счёт или ценник. Расчёт — процент от ваших вводимых сумм.",
    "Ставки, льготы и вычеты различаются по стране и категории товара; трансграничные поставки сложнее. Калькулятор не подбирает законную ставку и не заменяет отчётность — вы задаёте процент вручную.",
    "Быстрая проверка полезна для актов, КП и авансов. При расхождении смотрите округление, скидки до/после налога и формулировки в документе.",
  ],
  emi: [
    "EMI — фиксированный ежемесячный платёж: внутри него доля процентов и тела меняется по амортизации. Таблица показывает, как много ранних платежей уходит на проценты.",
    "Плавающая ставка, каникулы и шаровые платежи требуют других формул. Модель здесь — фиксированная ставка и равные взносы; банк может округлять помесячно.",
    "Используйте цифры для бюджета, а официальный график — у кредитора. Досрочка может сокращать срок при том же EMI или пересчитывать платёж — по правилам договора.",
  ],
  bmi: [
    "ИМТ — вес в килограммах на квадрат роста в метрах. На уровне населения коррелирует с рисками, но не измеряет жир, кость и мышцы. Спортсмены могут попадать в «высокую» зону без тех же рисков, что у малоподвижных людей.",
    "FinanceCalculator принимает только кг и см, чтобы не было скрытой путаницы единиц. Категории — скрининг по распространённым порогам ВОЗ, не диагноз.",
    "Не меняйте лечение или режим только из-за ИМТ. Нужны врач, анамнез и при необходимости другие анализы.",
  ],
  tax: [
    "Прогрессия означает, что разные части дохода могут облагаться по разным ставкам. Демо-модель накладывает упрощённую лестницу на валовой доход. Статус, вычеты, кредиты, местные налоги и разные виды дохода здесь не учтены.",
    "Реальные системы разделяют обычные дивиденды, капитальную прибыль и самозанятость по-разному. Считайте вывод учебной визуализацией, а не декларацией.",
    "Ширины диапазонов и ставки меняются законами — сверяйтесь с актуальными правилами вашей страны.",
  ],
  currency: [
    "Конвертация умножает сумму на отношение единиц. По умолчанию FinanceCalculator подгружает в браузере актуальные ориентиры: бесплатные курсы ЕЦБ через Frankfurter (без ключа) или, если задан VITE_EXCHANGE_RATE_API_KEY, расширенный набор через ExchangeRate-API. Это всё ещё не спред банка, наценка карты или курс для перевода. Для сделок сверяйтесь с вашей организацией.",
    "В рознице есть спред и комиссии — они шире, чем «идеальная» цифра на экране. Сверяйтесь с выпиской.",
    "Цепочки валют в примере показывают арифметику, а не реальный арбитраж: каждое плечо в жизни ценообразуется отдельно.",
  ],
  ti84: [
    "Здесь эмуляция в духе TI-84 Plus CE: вычисления на главном экране, редактор Y= до шести функций, экран WINDOW для xMin, xMax, yMin, yMax и масштабов, кнопка GRAPH для графика на сетке. Удобно для домашней работы, если под рукой нет прибора; горячие клавиши повторяют привычный ввод (x, p для π, s/c/t для тригонометрии).",
    "Выражения считает math.js; в строке статуса указан RADIAN, как во многих курсах матанализа. Обратные sin/cos/tan — через 2nd и соответствующую клавишу. Для градусов вводите преобразование в аргументе (например градусы × pi/180).",
    "Это не полная копия прошивки: нет TI-BASIC, статистических приложений, списков и части меню. Кнопки zoom/trace в ряду F могут быть заглушками — настройте окно WINDOW и функции в Y=. Пустой график чаще всего из‑за узкого окна: увеличьте yMax или сдвиньте пределы по x.",
    "На экзаменах нужен разрешённый физический калькулятор; онлайн-версия только для тренировки. FinanceCalculator не связан с Texas Instruments. Официальные функции — в руководстве TI; правила — на сайте вашей экзаменационной организации.",
  ],
  basic: [
    "Калькулятор поддерживает скобки, тригонометрию в градусах, логарифмы, факториал целых и память. Пятнадцать знаков после запятой уменьшают визуальный шум в длинных цепочках, но внутри остаётся двоичная арифметика с плавающей точкой.",
    "Процент между числами — остаток; pct(x) переводит проценты в долю. Режим углов — градусы, не радианы: проверяйте при смешении с инженерными программами.",
    "История и память живут в сессии браузера. Для аудита или критичных расчётов дублируйте методом или в таблице с контролем версий.",
  ],
  about: [
    "FinanceCalculator — бесплатный набор финансовых и бытовых калькуляторов в браузере: сложный процент, накопления, кредиты, ипотека, EMI, НДС, упрощённый налог, валюта, ИМТ и полноценный инженерный режим. Интерфейс заточен под быстрые сценарии «что если» и обучение: видно, какие допущения стоят за результатом.",
    "В блоге мы публикуем короткие материалы: как читать график амортизации, когда важна ставка против срока, чего типичные калькулятор не учитывают (комиссии, налоги, плавающие ставки, местные правила). Это не замена консультации налогового юриста или инвестора — при серьёзных решениях обращайтесь к специалистам.",
    "Сайт доступен на английском и русском с согласованными URL, чтобы делиться ссылками на нужном языке. Ошибки в расчётах, идеи функций и замечания по тексту можно отправить через страницу контактов — мы читаем обращения, даже если не отвечаем на персональные финансовые вопросы в переписке.",
  ],
};

export function getRichParagraphs(lang: AppLang, calculatorId: string): string[] {
  const pack = lang === "ru" ? RU : EN;
  return pack[calculatorId] ?? [];
}
