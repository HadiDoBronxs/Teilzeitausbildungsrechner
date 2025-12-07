// StatItem.jsx – Renders a single statistic (label + value + optional description) for result cards.
import React from "react";

// emphasisLevel: \"strong\" for key metrics, anything else for lighter emphasis.
/**
 * Props:
 * - label: short descriptor for the metric (e.g. "Full-time").
 * - value: highlighted figure or formatted text.
 * - description: optional supporting text shown below the value.
 */
function StatItem({ label, value, description, emphasisLevel = "strong", className = "" }) {
  const valueClass =
    emphasisLevel === "strong"
      ? "text-3xl md:text-4xl font-extrabold text-slate-900"
      : "text-2xl font-bold text-slate-800";

  return (
    <div className={`space-y-1 text-center ${className}`}>
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className={valueClass}>{value}</dd>
      {description ? (
        <p className="text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export default StatItem;
