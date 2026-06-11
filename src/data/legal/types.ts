export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};
