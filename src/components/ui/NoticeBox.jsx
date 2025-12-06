// NoticeBox.jsx – Info/legal hint box reused across transparency and info pages.
import React from "react";
import Button from "./Button";

// variant toggles palette: info (blue highlight) vs legal (neutral slate).
const VARIANT_CLASS = {
  info: "border-blue-200 bg-blue-50 text-blue-900",
  legal: "border-slate-200 bg-slate-50 text-slate-900",
};

/**
 * Props:
 * - variant: palette key ("info", "legal") controlling background/border colors.
 * - title: optional heading text rendered atop the notice.
 * - href/linkLabel: optional link displayed at the bottom of the box.
 */
function NoticeBox({ title, children, linkLabel, href, variant = "info", className = "" }) {
  const tone = VARIANT_CLASS[variant] || VARIANT_CLASS.info;
  return (
    <section className={`space-y-2 rounded-lg border px-4 py-3 ${tone} ${className}`}>
      {title ? <h3 className="text-sm font-semibold">{title}</h3> : null}
      <div className="text-sm">{children}</div>
      {linkLabel && href ? (
        <Button
          as="a"
          variant="text"
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-sm font-semibold"
        >
          {linkLabel}
        </Button>
      ) : null}
    </section>
  );
}

export default NoticeBox;
