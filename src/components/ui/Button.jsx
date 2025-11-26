// Button.jsx – Reusable button for TZR calculator views. Supports the main action styles
// (primary submit, text link, pill badge, ghost close) with optional icons.
import React from "react";

const BASE_CLASS =
  "inline-flex items-center gap-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-60 disabled:cursor-not-allowed";

// variant -> visual treatment. primary = filled blue CTA, text = inline link, pill = rounded badge-like action, ghost = subtle icon/text button.
const VARIANT_STYLES = {
  primary:
    "justify-center rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300",
  text:
    "gap-1 rounded-none bg-transparent px-0 py-0 text-blue-700 underline underline-offset-2 hover:text-blue-900 disabled:text-blue-300",
  pill:
    "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-800 shadow-sm hover:bg-slate-100",
  ghost:
    "gap-1 rounded-md px-3 py-1 text-slate-700 hover:bg-slate-100 disabled:text-slate-400",
};

// size prop only adjusts font sizing so spacing stays defined by variants.
const SIZE_STYLES = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

/**
 * Props:
 * - variant: "primary" (CTA), "text" (inline link), "pill" (badge-like), "ghost" (subtle utility).
 * - size: "sm" | "md" | "lg" to tweak typography.
 * - as: optional element override (e.g. "a" for link-style buttons).
 * - icon: optional React node rendered with the label and marked aria-hidden.
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  type = "button",
  disabled,
  ariaLabel,
  onClick,
  as,
  ariaHaspopup,
  ariaExpanded,
  className = "",
  ...rest
}) {
  const Component = as || "button";
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeClass = SIZE_STYLES[size] || "";
  const mergedClassName = `${BASE_CLASS} ${variantClass} ${sizeClass} ${className}`.trim();
  const content = (
    <>
      {icon ? <span aria-hidden="true" className="inline-flex items-center">{icon}</span> : null}
      <span>{children}</span>
    </>
  );

  if (Component === "button") {
    return (
      <button
        type={type}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup={ariaHaspopup}
        aria-expanded={ariaExpanded}
        onClick={onClick}
        className={mergedClassName}
        {...rest}
      >
        {content}
      </button>
    );
  }

  // Non-button renders (e.g. anchor) still carry the same className and ARIA details.
  return (
    <Component
      aria-label={ariaLabel}
      aria-haspopup={ariaHaspopup}
      aria-expanded={ariaExpanded}
      className={mergedClassName}
      onClick={onClick}
      {...rest}
    >
      {content}
    </Component>
  );
}

export default Button;
