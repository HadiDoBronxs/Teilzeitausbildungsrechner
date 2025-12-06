import React from "react";
import { useTranslation } from "react-i18next";

/**
 * ReductionInfo component - displays reduction information text.
 * Reusable component for showing reduction months across different reduction types.
 *
 * @param {Object} props
 * @param {number} props.months - Number of reduction months to display
 * @param {string} props.translationKey - Translation key to use (e.g., "reduction.applied", "reduction.qualificationApplied", "reduction.manualApplied")
 * @param {string} [props.label] - Optional label for translation keys that require it (e.g., "reduction.applied")
 */
export default function ReductionInfo({ months, translationKey, label }) {
  const { t } = useTranslation();

  // Don't render if months is 0, invalid, or not a number
  const numericMonths = Number(months);
  if (!months || numericMonths <= 0 || Number.isNaN(numericMonths)) {
    return null;
  }

  const translationParams = label
    ? { months: numericMonths, label }
    : { months: numericMonths };

  return (
    <p className="text-sm text-slate-600" aria-live="polite">
      {t(translationKey, translationParams)}
    </p>
  );
}
