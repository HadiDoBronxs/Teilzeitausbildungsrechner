import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSchoolDegreeOption } from "../../domain/schoolDegreeReductions.js";
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
  const totalReduction = Math.max(0, Number(values?.reductionMonths ?? 0));
  const degreeReduction = Math.max(
    0,
    Number(
      values?.degreeReductionMonths ??
        getSchoolDegreeOption(values?.schoolDegreeId)?.months ??
        0
    )
  );
  const manualReduction = Math.max(
    0,
    Number(values?.manualReductionMonths ?? totalReduction - degreeReduction)
  );
  const hasReduction = totalReduction > 0;
  const hasDegreeReduction = degreeReduction > 0;
  const hasManualReduction = manualReduction > 0;
  const degreeLabelKey =
    values?.schoolDegreeLabelKey ??
    getSchoolDegreeOption(values?.schoolDegreeId)?.labelKey ??
    null;
  const reductionLabel = degreeLabelKey ? t(degreeLabelKey) : null;
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
        <header className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            {t("result.headline", { value: formattedParttime })}
          </h2>
          {hasReduction ? (
            <div className="flex flex-wrap items-start gap-2">
              <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                {t("reduction.totalApplied", {
                  months: totalReduction,
                })}
              </div>
              {hasDegreeReduction && reductionLabel ? (
                <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {t("reduction.applied", {
                    months: degreeReduction,
                    label: reductionLabel,
                  })}
                </div>
              ) : null}
              {hasManualReduction ? (
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {t("reduction.manualApplied", {
                    months: manualReduction,
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </header>

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
