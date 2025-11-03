import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import readFormAndCalc from "./readFormAndCalc";
import TransparencyPanel from "./TransparencyPanel";

const formatDelta = (value) => {
  if (value === 0) return "0";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
};

export default function ResultCard({ values, result: injectedResult }) {
  const { t } = useTranslation();
  const [showTransparency, setShowTransparency] = useState(false);
  const result = useMemo(
    () => injectedResult ?? readFormAndCalc(values),
    [values, injectedResult]
  );
  const { reductionMonths = 0 } = values;
  const hasReduction = Number(reductionMonths) > 0;
  const errorKey = result?.errorCode
    ? `result.error.${result.errorCode}`
    : "result.error.generic";

  const openTransparency = () => setShowTransparency(true);
  const closeTransparency = () => setShowTransparency(false);

  const transparencyButton = (
    <button
      type="button"
      className="text-blue-600 underline font-semibold inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      onClick={openTransparency}
      aria-haspopup="dialog"
      aria-expanded={showTransparency}
    >
      {t("result.howCalculated")}
    </button>
  );

  if (result && result.allowed === false) {
    return (
      <>
        <section
          className="w-full max-w-2xl bg-white rounded-xl border border-red-200 shadow-sm p-4 space-y-2"
          aria-live="polite"
        >
          <h2 className="text-xl font-semibold text-red-700">
            {t("result.error.title")}
          </h2>
          <p className="text-slate-700">{t(errorKey)}</p>
          {transparencyButton}
        </section>
        {showTransparency && (
          <TransparencyPanel formValues={values} onClose={closeTransparency} />
        )}
      </>
    );
  }

  return (
    <>
      <section
        className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2"
        aria-live="polite"
      >
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
                delta: formatDelta(
                  result.parttimeFinalMonths - result.fulltimeMonths
                ),
              })}
        </p>

        <p className="text-slate-700">
          {t("result.factor", { pct: (result.factor * 100).toFixed(0) })}
        </p>

        {transparencyButton}
      </section>
      {showTransparency && (
        <TransparencyPanel formValues={values} onClose={closeTransparency} />
      )}
    </>
  );
}
