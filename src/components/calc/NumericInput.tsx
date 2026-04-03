import { useState } from "react";
import clsx from "clsx";
import { isMalformedDecimalInput, parseDecimal } from "../../utils/parseDecimal";

/**
 * Text + inputMode=decimal for flexible typing. No useEffect syncing `value` on every keystroke
 * (that re-triggers renders and can reset caret). Parent still gets live updates when the
 * string parses to a number. Empty while typing does not force 0 until blur.
 */
export default function NumericInput({
  value,
  onChange,
  className = "form-control",
  invalid,
  onDecimalSyntaxBad,
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
  invalid?: boolean;
  /** Report when the raw text has invalid characters / malformed decimal (not range errors). */
  onDecimalSyntaxBad?: (bad: boolean) => void;
}) {
  const [text, setText] = useState(() => (Number.isFinite(value) ? String(value) : "0"));

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={clsx(className, invalid && "is-invalid")}
      value={text}
      onChange={e => {
        const raw = e.target.value;
        setText(raw);
        onDecimalSyntaxBad?.(isMalformedDecimalInput(raw));
        const v = parseDecimal(raw);
        if (v !== null) onChange(v);
      }}
      onBlur={() => {
        const v = parseDecimal(text);
        if (v !== null) {
          onChange(v);
          setText(String(v));
          onDecimalSyntaxBad?.(false);
        } else {
          onChange(0);
          setText("0");
          onDecimalSyntaxBad?.(false);
        }
      }}
    />
  );
}
