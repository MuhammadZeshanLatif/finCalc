/**
 * A paragraph is plain text with optional inline links written as `[label](https://url)`.
 * A string array renders as a bullet list.
 */
export type LegalBlock = string | string[];

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: LegalBlock[];
};

export type LegalDocument = {
  title: string;
  /** Human-readable, e.g. "October 26, 2026". */
  lastUpdated: string;
  /** YYYY-MM-DD for the <time> element. */
  lastUpdatedIso: string;
  intro: string;
  sections: LegalSection[];
};
