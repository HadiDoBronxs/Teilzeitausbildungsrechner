import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildReductionSummary } from "../../domain/schoolDegreeReductions.js";
import readFormAndCalc from "./readFormAndCalc";
import LegalPanel from "./LegalPanel.jsx";
import TransparencyPanel from "./TransparencyPanel";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import StatItem from "../../components/ui/StatItem.jsx";

/**
 * Formats delta months with an explicit sign for readability.
 * Displays positive values with a "+" prefix, zero as "0", and negative values with their "-" sign.
 * This makes it immediately clear whether the change is an increase or decrease.
 *
 * @param {number} value - The delta value to format (can be positive, negative, or zero)
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
 * ResultCard component - Central output card displaying calculated training durations.
 *
 * This component serves as the main results display, showing:
 * - Calculated fulltime and parttime training durations
 * - Difference (delta) between fulltime and parttime
 * - Reduction badges when reductions are applied
 * - Action buttons to open transparency and legal information dialogs
 *
 * The component handles two rendering modes:
 * 1. Success state: Shows calculated metrics and reduction information
 * 2. Error state: Shows error message when calculation fails or is not allowed
 *
 * Design decisions:
 * - Uses injectedResult prop for testing (allows injecting mock results)
 * - Local UI state only controls dialog visibility (keeps calculations pure)
 * - Reduction badges are derived textually to keep UI decoupled from calculation internals
 * - Overlays are rendered outside the Card to avoid clipping issues
 *
 * @param {Object} props - Component props
 * @param {Object} props.values - Form values object from useCalculator hook
 * @param {Object} [props.result] - Optional pre-calculated result (used for testing)
 * @returns {JSX.Element|null} ResultCard component or null if calculation cannot run
 */
export default function ResultCard({ values, result: injectedResult }) {
  const { t } = useTranslation();

  // Local UI state controls dialog visibility only - calculations remain pure functions
  // This separation ensures calculations can be tested independently of UI state
  const [showTransparency, setShowTransparency] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  /**
   * Resolves the calculation result to use.
   * Prefers injectedResult (for testing), otherwise computes from form values.
   * This pattern allows tests to inject mock results without running actual calculations.
   *
   * @returns {Object|null} Calculation result object or null if values are missing
   */
  function resolveResult() {
    return injectedResult ?? readFormAndCalc(values);
  }

  // Memoize result calculation to avoid unnecessary recalculations on re-renders
  const result = useMemo(resolveResult, [values, injectedResult]);

  // Early return if calculation cannot run (e.g., missing required inputs)
  if (!result) {
    return null;
  }

  /**
   * Builds reduction summary from form values.
   * Derives reduction badges textually so UI stays decoupled from calculation internals.
   * This allows the UI to display reduction information without knowing calculation details.
   *
   * The summary includes:
   * - Total reduction months (sum of all reduction types)
   * - Individual reduction types (degree, qualification, manual)
   * - Cap exceeded warning if total exceeds maximum allowed
   * - Label key for degree reduction display
   */
  const reduction = buildReductionSummary({
    schoolDegreeId: values?.schoolDegreeId,
    degreeReductionMonths: values?.degreeReductionMonths,
    manualReductionMonths: values?.manualReductionMonths,
    qualificationReductionMonths: values?.qualificationReductionRawMonths,
    labelKey: values?.schoolDegreeLabelKey,
    maxTotalMonths: values?.maxTotalReduction ?? 12,
  });

  // Derive boolean flags for conditional rendering of reduction badges
  // These flags make the JSX more readable and easier to maintain
  const hasReduction = reduction.total > 0;
  const hasDegreeReduction = reduction.degree > 0;
  const hasQualificationReduction = reduction.qualification > 0;
  const hasManualReduction = reduction.manual > 0;

  // Get translated label for degree reduction (if available)
  const reductionLabel = reduction.labelKey ? t(reduction.labelKey) : null;

  // Determine error message key based on result error code
  // Falls back to generic error if no specific error code is provided
  const errorKey = result?.errorCode
    ? `result.error.${result.errorCode}`
    : "result.error.generic";

  /**
   * Opens the transparency dialog.
   * Shows detailed calculation breakdown and step-by-step explanation.
   */
  function openTransparency() {
    setShowTransparency(true);
  }

  /**
   * Closes the transparency dialog.
   */
  function closeTransparency() {
    setShowTransparency(false);
  }

  /**
   * Opens the legal basis dialog.
   * Shows legal information and regulations related to training duration calculations.
   */
  function openLegal() {
    setShowLegal(true);
  }

  /**
   * Closes the legal basis dialog.
   */
  function closeLegal() {
    setShowLegal(false);
  }

  /**
   * Transparency dialog button component.
   * Opens a dialog showing detailed calculation breakdown and step-by-step explanation.
   * Uses ARIA attributes for accessibility (dialog popup, expanded state).
   */
  const transparencyButton = (
    <Button
      type="button"
      variant="primary"
      size="md"
      className="w-full sm:flex-1 whitespace-nowrap"
      onClick={openTransparency}
      ariaHaspopup="dialog"
      ariaExpanded={showTransparency}
    >
      {t("result.howCalculated")}
    </Button>
  );

  /**
   * Legal basis dialog button component.
   * Opens a dialog showing legal information and regulations related to training duration calculations.
   * Uses ARIA attributes for accessibility (dialog popup, expanded state).
   */
  const legalButton = (
    <Button
      type="button"
      variant="primary"
      size="md"
      className="w-full sm:flex-1"
      onClick={openLegal}
      ariaHaspopup="dialog"
      ariaExpanded={showLegal}
    >
      {t("legal.title")}
    </Button>
  );

  // Render error state when calculation is not allowed (e.g., invalid inputs, calculation errors)
  // Still provides access to transparency dialog for users to understand why calculation failed
  if (result && result.allowed === false) {
    return (
      <>
        <Card className="w-full" variant="error" role="status">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-red-700 dark:text-red-400">
              {t("result.error.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base">{t(errorKey)}</p>
            {transparencyButton}
            { }
          </div>
        </Card>
        {showTransparency && (
          <TransparencyPanel formValues={values} onClose={closeTransparency} />
        )}
      </>
    );
  }

  /**
   * Determines baseline fulltime months for display.
   * Uses effectiveFulltimeMonths when reductions are applied (shows reduced baseline),
   * otherwise uses standard fulltimeMonths (shows original baseline).
   * This ensures users see the correct baseline that was used in the calculation.
   */
  const baselineMonths = hasReduction
    ? result.effectiveFulltimeMonths
    : result.fulltimeMonths;

  /**
   * Primary metrics array for the three-column display.
   * Each metric represents a key calculation result:
   * - Full: Baseline fulltime months (may be reduced if reductions applied)
   * - Part: Calculated parttime months (final result)
   * - Change: Delta between parttime and fulltime (shows increase/decrease)
   *
   * The three-column layout matches the visual grid structure in the card.
   */
  const metrics = [
    {
      key: "full",
      label: t("result.labels.full"),
      value: t("result.months", {
        count: baselineMonths,
        value: baselineMonths,
      }),
    },
    {
      key: "part",
      label: t("result.labels.part"),
      value: t("result.months", {
        count: result.parttimeFinalMonths,
        value: result.parttimeFinalMonths,
      }),
    },
    {
      key: "change",
      label: t("result.labels.change"),
      value: t("result.months", {
        count: Math.abs(result.deltaMonths),
        value: formatDelta(result.deltaMonths),
      }),
    },
  ];

  /**
   * Formats parttime months for display in the headline.
   * Uses pre-formatted value if available (from calculation result),
   * otherwise generates formatted string via translation function.
   * This value is used in both the main headline and aria-label for accessibility.
   */
  const formattedParttime =
    result.formatted?.parttime ??
    t("result.months", {
      count: result.parttimeFinalMonths,
      value: result.parttimeFinalMonths,
    });

  return (
    <>
      <Card className="w-full" role="status">
        <div className="space-y-6">
          <header className="space-y-3">
            {/* Main headline showing the calculated parttime training duration */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {t("result.headline", { value: formattedParttime })}
            </h2>

            {/* Reduction badges section - only shown when reductions are applied */}
            {/* Badges use color coding to distinguish reduction types:
                - Emerald: Total reduction (always shown when reductions exist)
                - Blue: Degree-based reduction (school degree reduction)
                - Amber: Qualification reduction or cap warning
                - Slate: Manual reduction (user-entered)
            */}
            {hasReduction ? (
              <div className="flex flex-wrap items-start gap-2">
                {/* Total reduction badge - shows sum of all reduction types */}
                <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                  {t("reduction.totalApplied", {
                    months: reduction.total,
                  })}
                </div>

                {/* Degree reduction badge - shown when school degree reduction is applied */}
                {hasDegreeReduction && reductionLabel ? (
                  <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {t("reduction.applied", {
                      months: reduction.degree,
                      label: reductionLabel,
                    })}
                  </div>
                ) : null}

                {/* Qualification reduction badge - shown when qualification reduction is applied */}
                {hasQualificationReduction ? (
                  <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {t("reduction.qualificationApplied", {
                      months: reduction.qualification,
                    })}
                  </div>
                ) : null}

                {/* Manual reduction badge - shown when user-entered manual reduction exists */}
                {hasManualReduction ? (
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t("reduction.manualApplied", {
                      months: reduction.manual,
                    })}
                  </div>
                ) : null}

                {/* Cap warning badge - shown when total reduction exceeds maximum allowed */}
                {reduction.capExceeded ? (
                  <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {t("reduction.capWarning", {
                      total: reduction.totalRaw,
                      max: values?.maxTotalReduction ?? 12,
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </header>

          {/* Primary metrics row displaying fulltime, parttime, and change values */}
          {/* Grid layout: 3 equal-width columns on small screens and up, single column on mobile */}
          {/* Items are centered within each grid cell for consistent alignment */}
          <div className="grid gap-8 sm:grid-cols-3 justify-items-center">
            {metrics.map((metric) => (
              <StatItem
                key={metric.key}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </div>

          {/* Action buttons row - transparency and legal dialogs */}
          {/* Layout: Stacked on mobile, side-by-side on small screens and up */}
          {/* Both buttons have equal visual weight (same variant and size) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
            {transparencyButton}
            {legalButton}
          </div>
        </div>
      </Card>

      {/* Dialog overlays rendered outside Card to avoid clipping issues */}
      {/* Rendering at root level ensures overlays can properly cover the entire viewport */}
      {showLegal && <LegalPanel onClose={closeLegal} />}
      {showTransparency && (
        <TransparencyPanel formValues={values} onClose={closeTransparency} />
      )}
    </>
  );
}
