import clsx from "clsx";
import NumericInput from "./NumericInput";

/** Module-level wrappers so React does not remount inputs every parent render (preserves focus). */

export function CalcField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fc-form-group">
      <label>{label}</label>
      {error ? (
        <div className="fc-field-error" role="alert">
          {error}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function MoneyInput({
  value,
  onChange,
  invalid,
  onDecimalSyntaxBad,
}: {
  value: number;
  onChange: (v: number) => void;
  invalid?: boolean;
  onDecimalSyntaxBad?: (bad: boolean) => void;
}) {
  return (
    <div className={clsx("fc-igroup", invalid && "fc-igroup--invalid")}>
      <span className="ig-addon">$</span>
      <NumericInput value={value} onChange={onChange} invalid={invalid} onDecimalSyntaxBad={onDecimalSyntaxBad} />
    </div>
  );
}

export function PctInput({
  value,
  onChange,
  invalid,
  step: _step,
  onDecimalSyntaxBad,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: string;
  invalid?: boolean;
  onDecimalSyntaxBad?: (bad: boolean) => void;
}) {
  return (
    <div className={clsx("fc-igroup", invalid && "fc-igroup--invalid")}>
      <NumericInput value={value} onChange={onChange} invalid={invalid} onDecimalSyntaxBad={onDecimalSyntaxBad} />
      <span className="ig-addon suffix">%</span>
    </div>
  );
}

export function YrsInput({
  value,
  onChange,
  suffix = "yrs",
  invalid,
  onDecimalSyntaxBad,
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  invalid?: boolean;
  onDecimalSyntaxBad?: (bad: boolean) => void;
}) {
  return (
    <div className={clsx("fc-igroup", invalid && "fc-igroup--invalid")}>
      <NumericInput value={value} onChange={onChange} invalid={invalid} onDecimalSyntaxBad={onDecimalSyntaxBad} />
      <span className="ig-addon suffix">{suffix}</span>
    </div>
  );
}

export function MoInput({
  value,
  onChange,
  invalid,
  onDecimalSyntaxBad,
}: {
  value: number;
  onChange: (v: number) => void;
  invalid?: boolean;
  onDecimalSyntaxBad?: (bad: boolean) => void;
}) {
  return (
    <div className={clsx("fc-igroup", invalid && "fc-igroup--invalid")}>
      <NumericInput value={value} onChange={onChange} invalid={invalid} onDecimalSyntaxBad={onDecimalSyntaxBad} />
      <span className="ig-addon suffix">mo</span>
    </div>
  );
}
