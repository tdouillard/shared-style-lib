import { useLayoutEffect, useRef, type InputHTMLAttributes } from "react";
import { setRangeFill } from "../range.ts";

/** `<input type="range">` whose filled part follows the value. Same props as the native input. */
export function RangeSlider({ className = "", ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (ref.current) setRangeFill(ref.current);
  });
  return <input ref={ref} type="range" className={`g-range ${className}`} {...props} />;
}

/** On/off switch (a button with role="switch"). */
export function Switch({ on, label, disabled, onChange, tone }: { on: boolean; label: string; disabled?: boolean; onChange: (on: boolean) => void; tone?: "violet" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className={`g-switch ${tone ? `g-switch--${tone}` : ""}`}
      onClick={() => onChange(!on)}
    />
  );
}

/** Power glyph as an SVG: the ⏻ character is missing from many fonts. */
export function PowerIcon() {
  return (
    <svg className="g-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
      <path d="M12 3v9" />
      <path d="M6.3 6.8a8 8 0 1 0 11.4 0" />
    </svg>
  );
}
