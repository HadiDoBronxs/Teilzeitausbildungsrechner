// ResultSidebar.jsx – Desktop sidebar component displaying simplified calculation results.
// Shows only core metrics (training duration, fulltime months, parttime months, difference)
// without reduction reasons. Only visible on desktop (lg breakpoint and above).
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import readFormAndCalc from "../features/calcDuration/readFormAndCalc.js";
import Card from "./ui/Card.jsx";
import StatItem from "./ui/StatItem.jsx";
import Button from "./ui/Button.jsx";

// Helper to display delta months with an explicit sign for readability.
function formatDelta(value) {
  if (value === 0) {
    return "0";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
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

  const result = useMemo(() => {
    if (!values) return null;
    return readFormAndCalc(values);
  }, [values]);

  if (!result || result.allowed === false) {
    // Don't show sidebar if calculation is invalid
    return null;
  }

  const baselineMonths = result.effectiveFulltimeMonths ?? result.fulltimeMonths;

  const formattedParttime =
    result.formatted?.parttime ??
    t("result.months", {
      count: result.parttimeFinalMonths,
      value: result.parttimeFinalMonths,
    });

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

