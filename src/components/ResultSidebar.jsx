// ResultSidebar.jsx – Desktop sidebar component displaying simplified calculation results.
// Shows only core metrics (training duration, fulltime months, parttime months, difference)
// without reduction reasons. Only visible on desktop (lg breakpoint and above).
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import readFormAndCalc from "../features/calcDuration/readFormAndCalc.js";
import Card from "./ui/Card.jsx";
import StatItem from "./ui/StatItem.jsx";

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
      className="hidden lg:block lg:sticky lg:top-8 lg:self-start lg:w-80"
      aria-label={t("result.headline", { value: formattedParttime })}
    >
      <Card className="space-y-6" padding="p-6" role="status">
        <header className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
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
      </Card>
    </aside>
  );
}

