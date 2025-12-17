// ResultSidebar.jsx – Desktop sidebar component displaying simplified calculation results.
// Shows only core metrics (training duration, fulltime months, parttime months, difference)
// Only visible on desktop (lg breakpoint and above).

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import readFormAndCalc from "../features/calcDuration/readFormAndCalc.js";
import Card from "./ui/Card.jsx";
import StatItem from "./ui/StatItem.jsx";
import Button from "./ui/Button.jsx";

function formatDelta(value) {
  if (value === 0) return "0";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

function calculateResult(formValues) {
  if (!formValues) return null;
  return readFormAndCalc(formValues);
}

function getBaselineMonths(result) {
  return result.effectiveFulltimeMonths ?? result.fulltimeMonths;
}

function formatParttimeMonths(result, translate) {
  if (result.formatted?.parttime) return result.formatted.parttime;

  return translate("result.months", {
    count: result.parttimeFinalMonths,
    value: result.parttimeFinalMonths,
  });
}

function formatMonths(months, translate) {
  return translate("result.months", {
    count: months,
    value: months,
  });
}

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

export default function ResultSidebar({ values }) {
  const { t } = useTranslation();

  // Scroll-to-top functionality
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToResults() {
    const resultCard = document.getElementById("result-card");
    if (resultCard) {
      resultCard.scrollIntoView({ behavior: "smooth" });
    }
  }

  const result = useMemo(() => calculateResult(values), [values]);

  const errorKey = result?.errorCode
    ? `result.error.${result.errorCode}`
    : "result.error.generic";

  //
  // ERROR STATE — tests require exactly 2 buttons:
  // 1) Scroll to top (disabled)
  // 2) Scroll to results (disabled)
  //
  if (!result || result.allowed === false) {
    return (
      <aside className="w-full min-w-0" aria-label={t("result.error.title")}>
        <Card
          className="space-y-4 xl:space-y-6"
          padding="p-4 xl:p-6"
          variant="error"
          role="status"
        >
          <header className="space-y-2">
            <h2 className="text-lg xl:text-xl 2xl:text-2xl font-bold text-red-700 break-words">
              {t("result.error.title")}
            </h2>
            <p className="text-slate-700 text-sm md:text-base">{t(errorKey)}</p>
          </header>

          {/* Navigation section for error state */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            {/* Scroll-to-top disabled in error state */}
            <Button
              disabled
              variant="pill"
              size="sm"
              aria-label={t("result.navigation.scrollToTop")}
              className="w-full justify-start"
            >
              ↑ {t("result.navigation.scrollToTop")}
            </Button>

            {/* Disabled scroll-to-results button */}
            <Button
              disabled
              variant="ghost"
              size="sm"
              aria-label={`${t("result.navigation.scrollToResults")} (${t(
                "result.navigation.comingSoon"
              )})`}
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
  // NORMAL STATE with valid calculation results
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

        {/* Metrics display section */}
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

        {/* Navigation section */}
        <div className="space-y-2 pt-4 border-t border-slate-200">
          {/* Scroll-to-top enabled in normal state */}
          <Button
            onClick={scrollToTop}
            variant="pill"
            size="sm"
            aria-label={t("result.navigation.scrollToTop")}
            className="w-full justify-start"
          >
            ↑ {t("result.navigation.scrollToTop")}
          </Button>

          {/* Scroll-to-results enabled */}
          <Button
            onClick={scrollToResults}
            variant="secondary"
            size="sm"
            aria-label={t("result.navigation.scrollToResults")}
            className="w-full justify-start"
          >
            ↓ {t("result.navigation.scrollToResults")}
          </Button>
        </div>
      </Card>
    </aside>
  );
}
