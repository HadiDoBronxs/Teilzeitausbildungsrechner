// ResultBottomBar.jsx – Mobile bottom bar component displaying part-time duration.
// Shows only "Ihre Teilzeit" label and value. Only visible on mobile/tablet (hidden on desktop).
// Should only display when the main ResultCard is not visible in the viewport.
import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import readFormAndCalc from "../features/calcDuration/readFormAndCalc.js";

// Helper to check if an element is visible in the viewport
function isElementVisible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * ResultBottomBar component displays a minimal result indicator at the bottom of mobile screens.
 * Only renders on mobile/tablet (hidden on desktop via Tailwind classes).
 * Shows only "Ihre Teilzeit" (Your part-time) label and value.
 * Automatically hides when the main ResultCard becomes visible in the viewport.
 *
 * Props:
 * - values: Form values object from useCalculator hook
 * - resultCardId: ID of the main ResultCard element to check visibility against
 */
export default function ResultBottomBar({ values, resultCardId = "result-card" }) {
  const { t } = useTranslation();
  const [isResultCardVisible, setIsResultCardVisible] = useState(false);

  const result = useMemo(() => {
    if (!values) return null;
    return readFormAndCalc(values);
  }, [values]);

  // Check if ResultCard is visible in viewport
  useEffect(() => {
    function checkVisibility() {
      const resultCard = document.getElementById(resultCardId);
      setIsResultCardVisible(isElementVisible(resultCard));
    }

    // Check on mount and scroll
    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [resultCardId]);

  // Don't show if calculation is invalid or ResultCard is visible
  if (!result || result.allowed === false || isResultCardVisible) {
    return null;
  }

  const formattedParttime =
    result.formatted?.parttime ??
    t("result.months", {
      count: result.parttimeFinalMonths,
      value: result.parttimeFinalMonths,
    });

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#151A23] border-t-2 border-slate-200 dark:border-[#2D3748] shadow-lg z-50"
      role="status"
      aria-label={t("result.labels.part")}
    >
      <div className="px-4 py-3 flex items-center justify-between max-w-md mx-auto">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {t("result.labels.part")}:
        </span>
        <span className="text-lg font-bold text-slate-900 dark:text-white">{formattedParttime}</span>
      </div>
    </div>
  );
}

