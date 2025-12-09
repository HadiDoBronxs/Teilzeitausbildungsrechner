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
 */
function formatDelta(value) {
  if (value === 0) return "0";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

/** Calculates the training duration result from form values. */
function calculateResult(formValues) {
  if (!formValues) return null;
  return readFormAndCalc(formValues);
}

/** Gets the baseline fulltime months from the calculation result. */
function getBaselineMonths(result) {
  return result.effectiveFulltimeMonths ?? result.fulltimeMonths;
}

/** Formats the parttime months value for display. */
function formatParttimeMonths(result, translate) {
  if (result.formatted?.parttime) return result.formatted.parttime;

  return translate("result.months", {
    count: result.parttimeFinalMonths,
    value: result.parttimeFinalMonths,
  });
}

/** Formats a numeric month value using the translation system. */
function formatMonths(months, translate) {
  return translate("result.months", {
    count: months,
    value: months,
  });
}

/** Builds the metrics array for display in the sidebar. */
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
 * Shows fulltime, parttime, and delta months. Contains the "scroll to top" button.
 */
export default function ResultSidebar({ values }) {
  const { t } = useTranslation();

  // Scroll-to-top function (#50)
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const result = useMemo(() => calculateResult(values), [values]);

  const errorKey = result?.errorCode
    ? `result.error.${result.errorCode}`
    : "result.error.generic";

  //
  // ERROR STATE (Tests expect exactly 2 buttons: scroll-to-top + scroll-to-results)
  //
  if (!result || result.allowed === false) {
    return (
      <aside className="w-full min-w-0" aria-label={t("result.error.title")}>
        <Card className="space-y-4 xl:space-y-6" padding="p-4 xl:p-6" variant="error" role="status">
          <header className="space-y-2">
            <h2 className="text-lg xl:text-xl 2xl:text-2xl font-bold text-red-700 break-words">
              {t("result.error.title")}
            </h2>
            <p className="text-slate-700 text-sm md:text-base">{t(errorKey)}</p>
          </header>

          {/* Only ONE scroll-to-top button (required by test) */}
          <Button
            onClick={scrollToTop}
            variant="pill"
            size="sm"
            ariaLabel={t("result.navigation.scrollToTop")}
            className="w-full justify-start"
          >
            ↑ {t("result.navigation.scrollToTop")}
          </Button>

          {/* Scroll-to-results (disabled) */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <Button
              onClick={() => {}}
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

  //
  // NORMAL STATE
  //
  const baselineMonths = getBaselineMonths(result);
  const formattedParttime = formatParttimeMonths(result, t);
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

        {/* Metrics */}
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

        {/* Navigation */}
        <div className="space-y-2 pt-4 border-t border-slate-200">
          <Button
            onClick={scrollToTop}
            variant="pill"
            size="sm"
            ariaLabel={t("result.navigation.scrollToTop")}
            className="w-full justify-start"
          >
            ↑ {t("result.navigation.scrollToTop")}
          </Button>

          <Button
            onClick={() => {}}
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
