// Card.jsx – Base container used for result cards and info panels in TZR.
import React from "react";

// variant palette mirrors ResultCard + error/notice sections.
const VARIANT_STYLES = {
  default: "bg-white border border-slate-200",
  error: "bg-white border border-red-200",
  info: "bg-blue-50 border border-blue-200",
};

/**
 * Props:
 * - variant: "default", "error", "info" to match the calculator palettes.
 * - as: element tag to render (section, article, div...) for semantic control.
 * - role: optional ARIA role (e.g. "status" for result summaries).
 * - header/footer: optional React nodes rendered above/below children content.
 */
function Card({
  children,
  variant = "default",
  padding = "p-6",
  as = "section",
  role,
  header,
  footer,
  className = "",
  ...rest
}) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  // Allow rendering as section/article/etc. to keep markup semantic per usage site.
  const ComponentTag = as;
  return (
    <ComponentTag
      role={role}
      className={`w-full rounded-xl shadow-sm ${variantClass} ${padding} ${className}`}
      {...rest}
    >
      {header ? <div className="mb-4">{header}</div> : null}
      <div>{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </ComponentTag>
  );
}

export default Card;
