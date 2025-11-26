// SectionHeader.jsx – Reusable heading block for TZR form/result sections.
import React from "react";

const ALIGN_CLASSES = {
  start: "items-start text-left",
  center: "items-center text-center",
};

/**
 * Props:
 * - level: heading level (1-3) mapped to h1/h2/h3 tags.
 * - align: layout alignment ("start"/left or "center").
 * - title/subtitle: primary text and optional supporting text.
 * - actions: optional node for right-aligned buttons/links.
 */
function SectionHeader({
  title,
  subtitle,
  badgeList = [],
  align = "start",
  level = 2,
  actions,
  className = "",
}) {
  const HeadingTag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
  const alignClass = ALIGN_CLASSES[align] || ALIGN_CLASSES.start;

  return (
    <header className={`flex flex-col gap-3 ${alignClass} ${className}`}>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <HeadingTag className="text-2xl font-bold text-slate-900">
          {title}
        </HeadingTag>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </div>
      {subtitle ? (
        <p className="text-base text-slate-700">{subtitle}</p>
      ) : null}
      {badgeList.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {badgeList.map((badge, index) => (
            <span key={badge?.key || index}>{badge}</span>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export default SectionHeader;
