// ResultSidebar.jsx – Desktop sidebar component displaying simplified calculation results.
// Shows only core metrics (training duration, fulltime months, parttime months, difference)
// without reduction reasons. Only visible on desktop (lg breakpoint and above).
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import readFormAndCalc from "../features/calcDuration/readFormAndCalc.js";
import Card from "./ui/Card.jsx";
import StatItem from "./ui/StatItem.jsx";
import Button from "./ui/Button.jsx";

/**
 * Formats delta months with an explicit sign for readability.
 * Positive values get a "+" prefix, zero returns "0", negative values keep their "-" sign.
 *
 * @param {number} value - The delta value to format
 * @returns {string} Formatted delta string (e.g., "+12", "0", "-5")
 */
function formatDelta(value) {
  if (value === 0) {
    return "0";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

/**
 * Calculates the training duration result from form values.
 * Returns null if values are not provided, otherwise performs the calculation.
 *
 * @param {Object|null} formValues - Form values object from useCalculator hook
 * @returns {Object|null} Calculation result object or null if values are missing
 */
function calculateResult(formValues) {
  if (!formValues) {
    return null;
  }
  return readFormAndCalc(formValues);
}

/**
 * Gets the baseline fulltime months from the calculation result.
 * Prefers effectiveFulltimeMonths if available, otherwise falls back to fulltimeMonths.
 *
 * @param {Object} result - Calculation result object
 * @returns {number} Baseline fulltime months value
 */
function getBaselineMonths(result) {
  return result.effectiveFulltimeMonths ?? result.fulltimeMonths;
}

/**
 * Formats the parttime months value for display.
 * Uses pre-formatted value if available, otherwise generates formatted string via translation.
 *
 * @param {Object} result - Calculation result object
 * @param {Function} translate - Translation function from useTranslation hook
 * @returns {string} Formatted parttime months string (e.g., "48 months")
 */
function formatParttimeMonths(result, translate) {
  // Check if result already contains a formatted parttime value
  if (result.formatted?.parttime) {
    return result.formatted.parttime;
  }

  // Otherwise, generate formatted string using translation function
  return translate("result.months", {
    count: result.parttimeFinalMonths,
    value: result.parttimeFinalMonths,
  });
}

/**
 * Formats a numeric month value using the translation system.
 *
 * @param {number} months - Number of months to format
 * @param {Function} translate - Translation function from useTranslation hook
 * @returns {string} Formatted months string (e.g., "36 months")
 */
function formatMonths(months, translate) {
  return translate("result.months", {
    count: months,
    value: months,
  });
}

/**
 * Builds the metrics array for display in the sidebar.
 * Creates metric objects for fulltime, parttime, and change (delta) values.
 *
 * @param {Object} result - Calculation result object
 * @param {number} baselineMonths - Baseline fulltime months value
 * @param {Function} translate - Translation function from useTranslation hook
 * @returns {Array<Object>} Array of metric objects with key, label, and value properties
 */
function buildMetrics(result, baselineMonths, translate) {
  return [
    {
      key: "full",
      label: translate("result.labels.full"),
      value: formatMonths(baselineMonths, translate),
    },
    {
      key: "part",
      label: translate("result.labels.part"),
      value: formatMonths(result.parttimeFinalMonths, translate),
    },
    {
      key: "change",
      label: translate("result.labels.change"),
      value: translate("result.months", {
        count: Math.abs(result.deltaMonths),
        value: formatDelta(result.deltaMonths),
      }),
    },
  ];
}

/**
 * ResultSidebar component displays simplified results in a desktop sidebar.
 * Only renders on desktop (hidden on mobile/tablet via Tailwind classes).
 * Shows: training duration headline, fulltime months, parttime months, and difference.
 * Does not show reduction reasons or action buttons (those are in the main ResultCard).
 *
 * Props:
 * - values: Form values object from useCalculator hook
 */
export default function ResultSidebar({ values }) {
  const { t } = useTranslation();

  // Calculate result from form values, memoized to avoid unnecessary recalculations
  const result = useMemo(() => calculateResult(values), [values]);

  // Early return if calculation is invalid or not allowed
  if (!result || result.allowed === false) {
    return null;
  }

  // Extract baseline months (preferring effective over standard fulltime months)
  const baselineMonths = getBaselineMonths(result);

  // Format parttime months for display in headline and aria-label
  const formattedParttime = formatParttimeMonths(result, t);

  // Build metrics array for the sidebar display
  const metrics = buildMetrics(result, baselineMonths, t);

  return (
    <aside
      className="w-full min-w-0"
      aria-label={t("result.headline", { value: formattedParttime })}
    >
      <Card className="space-y-4 xl:space-y-6" padding="p-4 xl:p-6" role="status">
        <header className="space-y-2">
          <h2 className="text-lg xl:text-xl 2xl:text-2xl font-bold text-slate-900 break-words">
            {t("result.headline", { value: formattedParttime })}
          </h2>
        </header>

        {/* Metrics display */}
        <div className="space-y-4">
          {metrics.map((metric) => (
            <StatItem
              key={metric.key}
              label={metric.label}
              value={metric.value}
              emphasisLevel="strong"
            />
          ))}
        </div>

        {/* Navigation buttons (placeholder - not yet implemented) */}
        <div className="space-y-2 pt-4 border-t border-slate-200">
          <Button
            onClick={() => {
              // Placeholder: Navigation to top will be implemented later
            }}
            variant="ghost"
            size="sm"
            disabled
            ariaLabel={`${t("result.navigation.scrollToTop")} (${t("result.navigation.comingSoon")})`}
            className="w-full justify-start"
          >
            ↑ {t("result.navigation.scrollToTop")}
          </Button>
          <Button
            onClick={() => {
              // Placeholder: Navigation to result card will be implemented later
            }}
            variant="ghost"
            size="sm"
            disabled
            ariaLabel={`${t("result.navigation.scrollToResults")} (${t("result.navigation.comingSoon")})`}
            className="w-full justify-start"
          >
            ↓ {t("result.navigation.scrollToResults")}
          </Button>
        </div>
      </Card>
    </aside>
  );
}

