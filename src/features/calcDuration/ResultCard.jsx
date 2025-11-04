import React, { useMemo, useState } from "react";
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
  if (!result) {
    return null;
  }
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
        <section className="w-full max-w-2xl bg-white rounded-xl border border-red-200 shadow-sm p-4 space-y-4" role="status">
          <h2 className="text-2xl md:text-3xl font-bold text-red-700">
            {t("result.error.title")}
          </h2>
          <p className="text-slate-700 text-sm md:text-base">{t(errorKey)}</p>
          {transparencyButton}
        </section>
        {showTransparency && (
          <TransparencyPanel formValues={values} onClose={closeTransparency} />
        )}
      </>
    );
  }

  const baselineMonths = hasReduction
    ? result.effectiveFulltimeMonths
    : result.fulltimeMonths;

  const metrics = [
    {
      key: "full",
      label: t("result.labels.full"),
      value: t("result.months", { count: baselineMonths, value: baselineMonths }),
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

  const formattedParttime =
    result.formatted?.parttime ??
    t("result.months", {
      count: result.parttimeFinalMonths,
      value: result.parttimeFinalMonths,
    });

  return (
    <>
      <section
        className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6"
        role="status"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
          {t("result.headline", { value: formattedParttime })}
        </h2>

        <dl className="grid gap-5 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.key} className="space-y-1">
              <dt className="text-sm text-slate-600 font-medium">
                {metric.label}
              </dt>
              <dd className="text-3xl md:text-4xl font-extrabold text-slate-900">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>

        <div>{transparencyButton}</div>
      </section>
      {showTransparency && (
        <TransparencyPanel formValues={values} onClose={closeTransparency} />
      )}
    </>
  );
}
