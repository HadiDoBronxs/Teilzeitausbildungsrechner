// Badge.jsx – Pill-style label used across TZR to highlight reductions and status hints.
import React from "react";

// variant: default (neutral), positive (emerald success), info (blue accent).
const VARIANT_MAP = {
  default: "border-slate-200 bg-slate-100 text-slate-800",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

// size toggles padding + font size for tight vs generous pills.
const SIZE_MAP = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
};

/**
 * Props:
 * - variant: palette key ("default", "positive", "info") to communicate tone.
 * - children/label: text content displayed inside the badge.
 * - className: extra Tailwind classes appended to the badge wrapper.
 */
function Badge({
  variant = "default",
  icon,
  label,
  ariaLabel,
  size = "md",
  className = "",
  ...rest
}) {
  const colors = VARIANT_MAP[variant] || VARIANT_MAP.default;
  const sizing = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <span
      role="status"
      aria-label={ariaLabel || label}
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${colors} ${sizing} ${className}`}
      {...rest}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{label}</span>
    </span>
  );
}

export default Badge;
