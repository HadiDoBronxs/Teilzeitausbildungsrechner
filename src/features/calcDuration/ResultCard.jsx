import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import readFormAndCalc from "./readFormAndCalc";

const formatDelta = (value) => {
  if (value === 0) return "0";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
};

export default function ResultCard({ values }) {
  const { t } = useTranslation();
  const result = useMemo(() => readFormAndCalc(values), [values]);
  const { reductionMonths = 0 } = values;
  const hasReduction = Number(reductionMonths) > 0;

  return (
    <section className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
      <h2 className="text-xl font-semibold text-slate-900">
        {t("result.headline", { value: result.formatted.parttime })}
      </h2>

      <p className="text-slate-700">
        {hasReduction
          ? t("result.compare.withReduction", {
              eff: result.effectiveFulltimeMonths,
              part: result.parttimeFinalMonths,
              delta: formatDelta(result.deltaMonths),
            })
          : t("result.compare.noReduction", {
              full: result.fulltimeMonths,
              part: result.parttimeFinalMonths,
              delta: formatDelta(result.parttimeFinalMonths - result.fulltimeMonths),
            })}
      </p>

      <p className="text-slate-700">
        {t("result.factor", { pct: (result.factor * 100).toFixed(0) })}
      </p>

      <a
        className="text-blue-600 underline font-medium inline-block"
        href="/transparenz#berechnung"
      >
        {t("result.howCalculated")}
      </a>
    </section>
  );
}
