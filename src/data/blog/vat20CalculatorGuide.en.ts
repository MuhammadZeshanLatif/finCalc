import type { BlogArticle } from "./types";

/** EN: VAT 20% calculator guide — paired with RU via topicKey. */
export const vat20CalculatorGuideEn: BlogArticle = {
  topicKey: "vat-20-calculator",
  articleSection: "Business & tax",
  slug: "vat-20-percent-calculator-guide",
  title: "VAT 20% Calculator: Net, Tax, and Gross Amounts Explained",
  metaTitle: "VAT 20 Calculator: Net & Gross Amounts | FinanceCalculator",
  metaDescription:
    "A VAT calculator for 20% tax: net, VAT, and gross for inclusive or exclusive prices. Invoice formulas, worked examples, and free online tool.",
  keywords:
    "VAT calculator, VAT 20 percent, add VAT to price, extract VAT from gross, net gross VAT, inclusive exclusive VAT, invoice VAT calculation",
  excerpt:
    "A VAT calculator splits 20% tax from net or gross prices — with inclusive vs exclusive formulas, invoice examples, and our free browser tool.",
  datePublished: "2026-06-15",
  dateModified: "2026-06-15",
  author: "FinanceCalculator Editorial",
  readingTimeMinutes: 10,
  hero: {
    src: "/blog/vat-20-calculator-hero.svg",
    srcWebp: "/blog/vat-20-calculator-hero.webp",
    alt: "VAT calculator at 20 percent showing inclusive mode on 120.00 with net 100.00 and VAT 20.00 extracted.",
    caption: "At 20% VAT, gross 120.00 means net 100.00 and tax 20.00 — not a flat 20% off the gross.",
    credit: "FinanceCalculator",
  },
  keyPhrases: [
    "VAT calculator",
    "20% VAT formula",
    "inclusive vs exclusive price",
    "extract VAT from gross",
    "invoice net and gross",
  ],
  blocks: [
    {
      t: "p",
      text: "A shelf price of 120 with “VAT included” is not 120 plus another 20% on top. At the standard 20% rate, tax is already embedded — you must divide by 1.20 to recover the net amount. A VAT calculator handles that split in seconds for quotes, invoices, and supplier checks. This guide covers both exclusive and inclusive math, common mistakes, and our free tool.",
    },
    {
      t: "h2",
      id: "what-is-vat-calculator",
      text: "What is a VAT calculator?",
    },
    {
      t: "p",
      text: "A VAT calculator computes three numbers from an amount and rate: net (ex-VAT), VAT amount, and gross (inc-VAT). You choose whether your input is net or gross. At 20%, exclusive mode adds tax on top; inclusive mode extracts tax from inside the total. The same logic applies across the EU standard rate, UK VAT, and Russia’s 20% НДС on many goods and services — always confirm your local rate and exemptions.",
    },
    {
      t: "h2",
      id: "vat-20-formulas",
      text: "VAT 20% formulas: exclusive vs inclusive",
    },
    {
      t: "p",
      text: "Exclusive (net quoted): VAT = Net × 0.20, Gross = Net × 1.20. Inclusive (gross quoted): Net = Gross ÷ 1.20, VAT = Gross − Net (equivalently VAT = Gross × 20 ÷ 120). The inclusive shortcut matters on receipts: subtracting 20% of 120 gives 24, which is wrong — the correct VAT is 20.",
    },
    {
      t: "callout",
      variant: "note",
      title: "Quick check",
      text: "Gross 120 at 20% → net 100, VAT 20. If your calculator shows VAT 24, you treated gross as net.",
    },
    {
      t: "h2",
      id: "worked-examples",
      text: "Worked examples at 20%",
    },
    {
      t: "p",
      text: "Exclusive: net price 100.00 → VAT 20.00 → gross 120.00. Inclusive: gross 120.00 → net 100.00 → VAT 20.00. Multi-line invoice: sum each line’s net, compute VAT on the subtotal per your jurisdiction’s rounding rules, then add — do not mix modes on the same line.",
    },
    {
      t: "table",
      caption: "Same transaction, two presentations — totals must match.",
      head: ["Mode", "Input", "Net", "VAT 20%", "Gross"],
      rows: [
        ["Exclusive", "100 net", "100.00", "20.00", "120.00"],
        ["Inclusive", "120 gross", "100.00", "20.00", "120.00"],
        ["Wrong shortcut", "120 gross", "96.00", "24.00", "120.00"],
      ],
    },
    {
      t: "figure",
      src: "/blog/vat-20-net-gross.svg",
      srcWebp: "/blog/vat-20-net-gross.webp",
      alt: "Side-by-side diagram of 20 percent VAT on 100 net exclusive versus 120 gross inclusive.",
      caption: "Exclusive builds gross up; inclusive splits gross down.",
      credit: "FinanceCalculator",
    },
    {
      t: "h2",
      id: "russia-nds-20",
      text: "Russia НДС 20% and reduced 10%",
    },
    {
      t: "p",
      text: "Russia’s main VAT (НДС) rate is 20% on most B2B and retail supplies; 10% applies to certain food, medical, and children’s items; 0% and exemptions exist for exports and specific categories. Invoice lines must show taxable base and tax separately even when the contract price is “with VAT.” Use 20% in the calculator for standard goods; switch rate for reduced lines per your product class.",
    },
    {
      t: "h2",
      id: "invoices-rounding",
      text: "Invoices, rounding, and discounts",
    },
    {
      t: "p",
      text: "Apply discounts to net before VAT unless your contract states otherwise. Round per line or per invoice total depending on local rules — mismatched rounding between ERP and spreadsheet causes cent-level disputes that accumulate on large orders. For long invoice workflows, see our dedicated VAT invoicing guide.",
    },
    {
      t: "link",
      href: "/blog/vat-gst-invoicing-inclusive-exclusive",
      label: "VAT on invoices: inclusive vs exclusive",
      internal: true,
    },
    {
      t: "h2",
      id: "use-calculator",
      text: "How to use our VAT calculator",
    },
    {
      t: "p",
      text: "Open the VAT page, enter amount and rate (default 20%), and toggle inclusive or exclusive. The page shows net, VAT, and total instantly with a visual split. Use it to verify supplier PDFs, marketplace payouts, or quote templates before you send.",
    },
    {
      t: "link",
      href: "/vat",
      label: "Open the free VAT calculator",
      internal: true,
    },
    {
      t: "link",
      href: "https://taxation-customs.ec.europa.eu/taxation/vat-what-is-vat_en",
      label: "European Commission — What is VAT?",
      nofollow: true,
    },
    {
      t: "h2",
      id: "common-mistakes",
      text: "Common VAT 20% mistakes",
    },
    {
      t: "ul",
      items: [
        "Taking 20% of a gross inclusive price instead of dividing by 1.20.",
        "Quoting net in email but invoicing as if the number were gross.",
        "Using 20% on lines that qualify for 10% or zero rate.",
        "Ignoring cash-register rounding vs accounting rounding.",
        "Forgetting VAT on shipping when your jurisdiction taxes delivery.",
      ],
    },
    {
      t: "h2",
      id: "faq",
      text: "Frequently asked questions",
    },
    {
      t: "h3",
      id: "faq-add-vat",
      text: "How do I add 20% VAT to a net price?",
    },
    {
      t: "p",
      text: "Multiply the net amount by 1.20 for the gross total, or multiply net by 0.20 for the VAT portion alone. Example: 250 net → 50 VAT → 300 gross.",
    },
    {
      t: "h3",
      id: "faq-remove-vat",
      text: "How do I remove 20% VAT from a gross price?",
    },
    {
      t: "p",
      text: "Divide gross by 1.20 to get net, then subtract net from gross for VAT. Do not multiply gross by 0.20 unless you use the corrected factor 20/120.",
    },
    {
      t: "h3",
      id: "faq-vat-calculator-rate",
      text: "Can a VAT calculator use other rates?",
    },
    {
      t: "p",
      text: "Yes — change the rate field to 10%, 5%, or any local percentage. The same inclusive/exclusive logic applies with divisor (1 + r/100).",
    },
    {
      t: "h3",
      id: "faq-nds-russia",
      text: "Is 20% VAT the same as НДС in Russia?",
    },
    {
      t: "p",
      text: "НДС is Russia’s value-added tax; 20% is the standard rate for many supplies. Reduced 10% and zero-rated categories follow separate rules in the Tax Code.",
    },
    {
      t: "h3",
      id: "faq-b2b",
      text: "Do B2B quotes show net or gross?",
    },
    {
      t: "p",
      text: "B2B contracts often quote net ex-VAT because VAT-registered buyers reclaim input tax. Consumer retail usually shows gross inc-VAT. Match the mode to your audience.",
    },
    {
      t: "h3",
      id: "faq-accuracy",
      text: "Why does my ERP total differ by one cent?",
    },
    {
      t: "p",
      text: "Line-by-line rounding vs invoice-level rounding creates small gaps. Align method with your accounting policy and tax authority guidance.",
    },
    {
      t: "callout",
      variant: "disclaimer",
      title: "Disclaimer",
      text: "Educational content only — not tax advice. VAT rates, registration, and filing rules vary by country and product. Confirm with your accountant and official sources.",
    },
  ],
  sources: [
    {
      title: "European Commission — VAT",
      url: "https://taxation-customs.ec.europa.eu/taxation/vat-what-is-vat_en",
    },
    {
      title: "HMRC — VAT rates",
      url: "https://www.gov.uk/vat-rates",
    },
  ],
  calcLink: "vat",
};
