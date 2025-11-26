import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildReductionSummary } from "../../domain/schoolDegreeReductions.js";
import readFormAndCalc from "./readFormAndCalc";
import TransparencyPanel from "./TransparencyPanel";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import StatItem from "../../components/ui/StatItem";

function formatDelta(value) {
  if (value === 0) {
    return "0";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}`;
}

export default function ResultCard({ values, result: injectedResult }) {
  const { t } = useTranslation();
  const [showTransparency, setShowTransparency] = useState(false);

  function resolveResult() {
    return injectedResult ?? readFormAndCalc(values);
  }

  const result = useMemo(resolveResult, [values, injectedResult]);
  if (!result) {
    return null;
  }

  // Gather the reduction data once so the rendering logic stays focused on layout.
  const reduction = buildReductionSummary({
    schoolDegreeId: values?.schoolDegreeId,
    degreeReductionMonths: values?.degreeReductionMonths,
    manualReductionMonths: values?.manualReductionMonths,
    qualificationReductionMonths: values?.qualificationReductionRawMonths,
    labelKey: values?.schoolDegreeLabelKey,
    maxTotalMonths: values?.maxTotalReduction ?? 12,
  });

  // The summary keeps total, degree-based, qualification-based and manual reductions in sync for the UI badges.
  const hasReduction = reduction.total > 0;
  const hasDegreeReduction = reduction.degree > 0;
  const hasQualificationReduction = reduction.qualification > 0;
  const hasManualReduction = reduction.manual > 0;
  const reductionLabel = reduction.labelKey ? t(reduction.labelKey) : null;
  const errorKey = result?.errorCode
    ? `result.error.${result.errorCode}`
    : "result.error.generic";

  function openTransparency() {
    setShowTransparency(true);
  }

  function closeTransparency() {
    setShowTransparency(false);
  }

  const transparencyButton = (
    <Button
      type="button"
      variant="text"
      size="md"
      onClick={openTransparency}
      ariaHaspopup="dialog"
      ariaExpanded={showTransparency}
    >
      {t("result.howCalculated")}
    </Button>
  );

  // When the calculation reports "not allowed" we skip the regular summary and show the error details.
  if (result && result.allowed === false) {
    return (
      <>
        <Card
          className="w-full max-w-2xl"
          variant="error"
          role="status"
        >
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-red-700">
              {t("result.error.title")}
            </h2>
            <p className="text-slate-700 text-sm md:text-base">{t(errorKey)}</p>
            {transparencyButton}
          </div>
        </Card>
        {showTransparency && (
          <TransparencyPanel formValues={values} onClose={closeTransparency} />
        )}
      </>
    );
  }

  // Baseline is what the apprentice would do in full-time after reductions; without reductions it equals the original duration.
  const baselineMonths = hasReduction
    ? result.effectiveFulltimeMonths
    : result.fulltimeMonths;

  // Build the three key figures the card shows underneath the headline.
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

  // Prefer the formatted string coming from the calculator (already localized), otherwise fall back to a simple months string.
  const formattedParttime =
    result.formatted?.parttime ??
    t("result.months", {
      count: result.parttimeFinalMonths,
      value: result.parttimeFinalMonths,
    });

  return (
    <>
      <Card className="w-full max-w-2xl" role="status">
        <div className="space-y-6">
          <header className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {t("result.headline", { value: formattedParttime })}
            </h2>
            {hasReduction ? (
              <div className="flex flex-wrap items-start gap-2">
                <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                  {t("reduction.totalApplied", {
                    months: reduction.total,
                  })}
                </div>
                {hasDegreeReduction && reductionLabel ? (
                  <div className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {t("reduction.applied", {
                      months: reduction.degree,
                      label: reductionLabel,
                    })}
                  </div>
                ) : null}
                {hasQualificationReduction ? (
                  <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {t("reduction.qualificationApplied", {
                      months: reduction.qualification,
                    })}
                  </div>
                ) : null}
                {hasManualReduction ? (
                  <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {t("reduction.manualApplied", {
                      months: reduction.manual,
                    })}
                  </div>
                ) : null}
                {reduction.capExceeded ? (
                  <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {t("reduction.capWarning", {
                      total: reduction.totalRaw,
                      max: values?.maxTotalReduction ?? 12,
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </header>

          <div className="grid gap-5 sm:grid-cols-3">
            {metrics.map((metric) => (
              <StatItem
                key={metric.key}
                label={metric.label}
                value={metric.value}
              />
            ))}
          </div>

          <div>{transparencyButton}</div>
        </div>
      </Card>
      {showTransparency && (
        <TransparencyPanel formValues={values} onClose={closeTransparency} />
      )}
    </>
  );
}
