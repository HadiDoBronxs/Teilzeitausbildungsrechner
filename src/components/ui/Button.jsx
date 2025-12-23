// Button.jsx – Reusable button for TZR calculator views. Supports the main action styles
// (primary submit, text link, pill badge, ghost close) with optional icons.
import React from "react";

const BASE_CLASS =
  "inline-flex items-center gap-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:shadow-none";

// variant -> visual treatment. primary = filled blue CTA, text = inline link, pill = rounded badge-like action, ghost = subtle icon/text button.
/**
 * Button Visual Styles
 * Define the appearance of buttons for each variant.
 * 
 * Dashdark X Note:
 * - Dark mode uses specific hex overrides (e.g. `dark:bg-[#5D5CFF]`) to match the deep navy/indigo theme.
 * - 'primary' and 'brand' variants use the Vibrant Indigo accent color in dark mode.
 */
const VARIANT_STYLES = {
  primary:
    "justify-center rounded-lg bg-slate-950 dark:bg-[#5D5CFF] border border-transparent dark:border-[#5D5CFF] px-4 py-2 text-white shadow-sm hover:bg-slate-900 dark:hover:bg-[#4B4ACF] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-700 dark:disabled:text-slate-500",
  text:
    "gap-1 rounded-none bg-transparent px-0 py-0 text-blue-700 dark:text-[#5D5CFF] underline underline-offset-2 hover:text-blue-900 dark:hover:text-[#818cf8] disabled:text-slate-500 dark:disabled:text-slate-600 disabled:no-underline",
  pill:
    "rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#151A23] px-3 py-1 text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-[#1e293b] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-700 dark:disabled:text-slate-500 disabled:border-slate-300 dark:disabled:border-slate-700",
  ghost:
    "gap-1 rounded-md px-3 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] disabled:text-slate-600 dark:disabled:text-slate-500 disabled:bg-slate-100 dark:disabled:bg-transparent",
  icon:
    "justify-center rounded-full p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] disabled:text-slate-600 dark:disabled:text-slate-500 disabled:bg-slate-100 dark:disabled:bg-transparent",
  secondary:
    "justify-center rounded-lg bg-slate-700 dark:bg-[#1e293b] border border-transparent dark:border-slate-600 px-4 py-2 text-white dark:text-slate-200 shadow-sm hover:bg-slate-600 dark:hover:bg-slate-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-700 dark:disabled:text-slate-500 dark:disabled:border-slate-800",
  destructive:
    "justify-center rounded-lg bg-red-600 dark:bg-red-900/50 border border-transparent dark:border-red-400/50 px-4 py-2 text-white dark:text-red-200 shadow-sm hover:bg-red-700 dark:hover:bg-red-900/70 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-700 dark:disabled:text-slate-500",
  success:
    "justify-center rounded-lg bg-green-600 dark:bg-green-900/50 border border-transparent dark:border-green-400/50 px-4 py-2 text-white dark:text-green-200 shadow-sm hover:bg-green-700 dark:hover:bg-green-900/70 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-700 dark:disabled:text-slate-500",
  brand:
    "justify-center rounded-lg bg-blue-600 dark:bg-[#5D5CFF] border border-transparent dark:border-[#5D5CFF] px-4 py-2 text-white shadow-sm hover:bg-blue-700 dark:hover:bg-[#4B4ACF] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-700 dark:disabled:text-slate-500",
};

// size prop only adjusts font sizing so spacing stays defined by variants.
const SIZE_STYLES = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

/**
 * Props:
 * - variant: "primary" (CTA), "text" (inline link), "pill" (badge-like), "ghost" (subtle utility),
 *            "icon" (circular), "secondary" (slate), "destructive" (red), "success" (green), "brand" (blue).
 * - size: "sm" | "md" | "lg" to tweak typography.
 * - as: optional element override (e.g. "a" for link-style buttons).
 * - icon: optional React node rendered with the label and marked aria-hidden.
 */
const Button = React.forwardRef(function Button(
  {
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
  },
  ref,
) {
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
        ref={ref}
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
      ref={ref}
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
});

export default Button;
