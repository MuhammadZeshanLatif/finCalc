/** Show at most `maxDigits` digit characters; full string in tooltip via caller (title attr). */
export function truncateDigitsDisplay(display: string, maxDigits = 10): { short: string; full: string } {
  const full = display;
  let digits = 0;
  let cut = display.length;
  for (let i = 0; i < display.length; i++) {
    if (/\d/.test(display[i]!)) {
      digits++;
      if (digits > maxDigits) {
        cut = i;
        break;
      }
    }
  }
  if (digits <= maxDigits) return { short: full, full };
  return { short: `${display.slice(0, cut)}…`, full };
}
