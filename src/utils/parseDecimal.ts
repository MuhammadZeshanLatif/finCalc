/** Parse flexible money / decimal text (commas, spaces). */
export function parseDecimal(raw: string): number | null {
  const t = raw.trim().replace(/,/g, "").replace(/\s/g, "");
  if (t === "" || t === "-" || t === ".") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/**
 * True when the field has text that cannot be a valid decimal (letters, extra symbols,
 * multiple dots, etc.). Empty string and partial input (`-`, `.`, `-.`) are not malformed.
 */
export function isMalformedDecimalInput(raw: string): boolean {
  const t = raw.trim().replace(/,/g, "").replace(/\s/g, "");
  if (t === "") return false;
  if (t === "-" || t === "+" || t === "." || t === "-." || t === "+.") return false;
  if (!/^[-+]?[\d.]*$/.test(t)) return true;
  const body = t.replace(/^[-+]/, "");
  if ((body.match(/\./g) ?? []).length > 1) return true;
  const n = Number(t);
  return !Number.isFinite(n);
}

export function clampNonNeg(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}
