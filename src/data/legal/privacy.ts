import type { LegalDocument } from "./types";

const SITE = "https://financcalculator.ru";
const EMAIL = "contact@financcalculator.ru";

export const privacyPolicy: Record<"en" | "ru", LegalDocument> = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "June 11, 2026",
    intro:
      "FinanceCalculator (“we”, “us”) operates financcalculator.ru. This policy explains what information we collect, how we use cookies and third-party advertising, and what choices you have. Calculator inputs are processed in your browser; we do not require an account to use our tools.",
    sections: [
      {
        id: "information-we-collect",
        title: "Information we collect",
        paragraphs: [
          "Calculator data: Numbers you enter (loan amount, interest rate, dates, etc.) are processed locally in your browser unless a specific tool states otherwise. We do not store your calculation inputs on our servers.",
          "Contact form: If you send a message via our contact page, we receive the name, email address, and message text you submit so we can respond.",
          "Server logs: Our hosting provider may automatically log IP address, browser type, referring URL, request time, and pages viewed. This is standard web-server logging used for security and troubleshooting.",
          "Advertising data: Google AdSense and other ad partners may collect or receive device identifiers, cookie IDs, approximate location (derived from IP), and interaction data to deliver and measure ads. See the sections below for opt-out links.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies and similar technologies",
        paragraphs: [
          "We use cookies and similar technologies for: (1) remembering your cookie consent choice, (2) serving and measuring advertisements, and (3) basic site functionality.",
          "Google AdSense: Google uses cookies (including the DoubleClick cookie) to serve ads based on your visits to this and other websites. You can opt out of personalized advertising by visiting Google Ads Settings: https://www.google.com/settings/ads",
          "Other ad partners: We may work with additional advertising networks (for example, programmatic partners) that set their own cookies to deliver ads and limit repeat impressions. Those partners are required to comply with applicable laws and their own policies.",
          "Essential preference cookie: When you click “Accept” on our cookie banner, we store a local preference (localStorage / cookie) so we do not show the banner on every visit.",
          "You can block or delete cookies in your browser settings. Blocking cookies may affect how ads display but calculators will still work.",
        ],
      },
      {
        id: "how-we-use",
        title: "How we use information",
        paragraphs: [
          "To operate, secure, and improve FinanceCalculator.",
          "To respond to contact messages and support requests.",
          "To display advertisements that help keep the site free.",
          "To comply with legal obligations and enforce our Terms of Use.",
          "We do not sell your personal information to data brokers.",
        ],
      },
      {
        id: "third-parties",
        title: "Third-party services",
        paragraphs: [
          `Google AdSense and Google marketing products — privacy policy: https://policies.google.com/privacy`,
          "Advertising and analytics partners listed in our ads.txt file at /ads.txt on this domain.",
          "Currency tools may call public exchange-rate APIs (for example, Frankfurter or ExchangeRate-API when configured). Those requests send only the data needed to fetch rates, not your identity.",
          "Embedded content (such as YouTube tutorials where linked) is governed by the third party’s policy when you interact with it.",
        ],
      },
      {
        id: "your-rights",
        title: "Your rights (EEA, UK, and similar regions)",
        paragraphs: [
          "Depending on where you live, you may have the right to access, correct, delete, or restrict processing of personal data, and to object to certain processing or withdraw consent where processing is consent-based.",
          "To exercise these rights, email us at the address below. We will respond within a reasonable time as required by applicable law.",
          "You may lodge a complaint with your local data-protection authority if you believe we have not handled your data lawfully.",
        ],
      },
      {
        id: "children",
        title: "Children’s privacy",
        paragraphs: [
          "FinanceCalculator is a general-audience financial education site. We do not knowingly collect personal information from children under 13 (or under 16 in the EEA where applicable). If you believe a child has provided us personal data, contact us and we will delete it.",
        ],
      },
      {
        id: "retention",
        title: "Data retention",
        paragraphs: [
          "Contact messages are kept only as long as needed to handle your request and for reasonable record-keeping.",
          "Server logs are retained according to our host’s standard rotation schedule (typically weeks to months).",
          "Cookie duration is set by each provider; see their policies for details.",
        ],
      },
      {
        id: "security",
        title: "Security",
        paragraphs: [
          "We use HTTPS across the site. No method of transmission over the Internet is 100% secure; we follow reasonable practices appropriate to a free calculator website.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy from time to time. The “Last updated” date at the top will change when we do. Continued use of the site after changes means you accept the updated policy.",
        ],
      },
      {
        id: "contact",
        title: "Contact us",
        paragraphs: [
          `Questions about this Privacy Policy or your data: ${EMAIL}`,
          `Website: ${SITE}/contact`,
        ],
      },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    lastUpdated: "11 июня 2026 г.",
    intro:
      "FinanceCalculator («мы») управляет сайтом financcalculator.ru. Здесь описано, какие данные мы собираем, как используются cookie и сторонняя реклама, и какие у вас есть права. Ввод в калькуляторах обрабатывается в браузере; регистрация не требуется.",
    sections: [
      {
        id: "information-we-collect",
        title: "Какие данные мы собираем",
        paragraphs: [
          "Данные калькуляторов: введённые суммы, ставки и даты обрабатываются локально в браузере, если иное не указано для конкретного инструмента. Мы не сохраняем ваши расчёты на сервере.",
          "Форма обратной связи: при отправке сообщения мы получаем имя, email и текст, чтобы ответить вам.",
          "Серверные логи: хостинг может автоматически записывать IP, тип браузера, источник перехода, время запроса и просмотренные страницы — для безопасности и диагностики.",
          "Рекламные данные: Google AdSense и другие партнёры могут получать идентификаторы устройства, cookie, приблизительное местоположение (по IP) и данные о показах для доставки и измерения рекламы.",
        ],
      },
      {
        id: "cookies",
        title: "Cookie и похожие технологии",
        paragraphs: [
          "Мы используем cookie для: (1) запоминания согласия на cookie, (2) показа и учёта рекламы, (3) базовой работы сайта.",
          "Google AdSense: Google использует cookie (включая DoubleClick) для показа рекламы с учётом посещений этого и других сайтов. Отключить персонализированную рекламу: https://www.google.com/settings/ads",
          "Другие рекламные сети могут устанавливать собственные cookie для показа объявлений.",
          "При нажатии «Принять» в баннере мы сохраняем выбор в localStorage / cookie.",
          "Вы можете заблокировать cookie в настройках браузера. Калькуляторы продолжат работать.",
        ],
      },
      {
        id: "how-we-use",
        title: "Как мы используем данные",
        paragraphs: [
          "Для работы, безопасности и улучшения FinanceCalculator.",
          "Для ответов на обращения через форму контактов.",
          "Для показа рекламы, благодаря которой сайт остаётся бесплатным.",
          "Для соблюдения закона и наших Условий использования.",
          "Мы не продаём персональные данные брокерам.",
        ],
      },
      {
        id: "third-parties",
        title: "Сторонние сервисы",
        paragraphs: [
          "Google AdSense — политика: https://policies.google.com/privacy",
          "Рекламные партнёры перечислены в файле /ads.txt на этом домене.",
          "Конвертер валют может обращаться к публичным API курсов (Frankfurter и др.) — передаются только данные запроса курса.",
          "Встроенный контент третьих лиц (например, YouTube) регулируется их политиками.",
        ],
      },
      {
        id: "your-rights",
        title: "Ваши права",
        paragraphs: [
          "В зависимости от страны вы можете запросить доступ, исправление, удаление или ограничение обработки данных, а также отозвать согласие, где обработка основана на согласии.",
          `Запросы направляйте на ${EMAIL}.`,
          "Вы можете обратиться в надзорный орган по защите данных в вашей стране.",
        ],
      },
      {
        id: "children",
        title: "Дети",
        paragraphs: [
          "Сайт общей аудитории. Мы сознательно не собираем данные детей младше 13 лет (в ЕС — 16, где применимо). Если вы считаете, что ребёнок передал нам данные, напишите нам — мы удалим их.",
        ],
      },
      {
        id: "retention",
        title: "Срок хранения",
        paragraphs: [
          "Сообщения из формы хранятся столько, сколько нужно для ответа и учёта.",
          "Логи сервера ротируются по правилам хостинга.",
          "Срок cookie задаётся каждым провайдером.",
        ],
      },
      {
        id: "security",
        title: "Безопасность",
        paragraphs: [
          "Сайт работает по HTTPS. Полная безопасность передачи в Интернете не гарантируется; мы применяем разумные меры для бесплатного информационного сервиса.",
        ],
      },
      {
        id: "changes",
        title: "Изменения политики",
        paragraphs: [
          "Мы можем обновлять политику. Дата «Последнее обновление» вверху страницы будет меняться. Продолжая пользоваться сайтом, вы принимаете актуальную версию.",
        ],
      },
      {
        id: "contact",
        title: "Контакты",
        paragraphs: [
          `Вопросы по конфиденциальности: ${EMAIL}`,
          `Страница связи: ${SITE}/ru/contact`,
        ],
      },
    ],
  },
};
