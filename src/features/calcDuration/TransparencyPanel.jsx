import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildReductionSummary } from "../../domain/schoolDegreeReductions.js";
import readFormAndCalc from "./readFormAndCalc";
import Dialog from "../../components/ui/Dialog";
import NoticeBox from "../../components/ui/NoticeBox";
import Button from "../../components/ui/Button";

const MAX_EXTENSION_MONTHS = 6;
const DURATION_CAP_MULTIPLIER = 1.5;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveMinDuration(fulltimeMonths, override) {
  const safeFull = Number.isFinite(fulltimeMonths) ? fulltimeMonths : 0;
  const fallback = Math.max(0, Math.floor(safeFull / 2));
  if (override === undefined || override === null || override === "") {
    return fallback;
  }
  const parsed = Number(override);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, parsed);
}

function formatYearsMonths(months, t) {
  const safeValue = Number.isFinite(months) ? months : 0;
  const rounded = Math.max(0, Math.round(safeValue));
  const years = Math.floor(rounded / 12);
  const remaining = rounded % 12;
  const yearLabel = years === 1 ? t("format.year") : t("format.years");
  const monthLabel = remaining === 1 ? t("format.month") : t("format.months");
  return `${years} ${yearLabel} ${remaining} ${monthLabel}`;
}

function formatSigned(value, formatter) {
  if (!Number.isFinite(value) || value === 0) {
    return formatter(0);
  }
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatter(Math.abs(value))}`;
}

function buildNumberFormatter(language) {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function resolveRoundingLabelKey(mode) {
  if (mode === "ceil") {
    return "transparency.rounding.ceil";
  }
  if (mode === "floor") {
    return "transparency.rounding.floor";
  }
  return "transparency.rounding.round";
}

export default function TransparencyPanel({ formValues, onClose }) {
  const { t, i18n } = useTranslation();
  const [showExpertMode, setShowExpertMode] = useState(false);
  const calculation = useMemo(() => readFormAndCalc(formValues), [formValues]);

  const weeklyFull = toNumber(formValues?.weeklyFull);
  const weeklyPart = toNumber(formValues?.weeklyPart);
  const fulltimeMonths = toNumber(formValues?.fullDurationMonths);

  const reduction = buildReductionSummary({
    schoolDegreeId: formValues?.schoolDegreeId,
    degreeReductionMonths: formValues?.degreeReductionMonths,
    manualReductionMonths: formValues?.manualReductionMonths,
    qualificationReductionMonths: formValues?.qualificationReductionRawMonths,
    labelKey: formValues?.schoolDegreeLabelKey,
    maxTotalMonths: formValues?.maxTotalReduction ?? 12,
  });

  const totalReductionMonths = reduction.total;
  const minDurationMonths = resolveMinDuration(
    fulltimeMonths,
    formValues?.minDurationMonths
  );
  const rawBase = Math.max(0, fulltimeMonths - totalReductionMonths);

  const formatter = useMemo(
    () => buildNumberFormatter(i18n.language),
    [i18n.language]
  );
  const formatNumber = (value) => formatter.format(value);

  const factor =
    Number.isFinite(calculation?.factor) && calculation.factor > 0
      ? calculation.factor
      : weeklyFull > 0
        ? weeklyPart / weeklyFull
        : 0;

  const percent =
    weeklyFull > 0 && Number.isFinite(factor) ? Math.round(factor * 100) : 0;

  const basis =
    Number.isFinite(calculation?.effectiveFulltimeMonths) &&
      calculation.effectiveFulltimeMonths >= 0
      ? calculation.effectiveFulltimeMonths
      : Math.max(rawBase, minDurationMonths);

  const theoretical =
    Number.isFinite(calculation?.theoreticalDuration) &&
      calculation.theoreticalDuration >= 0
      ? calculation.theoreticalDuration
      : factor > 0
        ? basis / factor
        : basis;

  const extension = Math.max(0, theoretical - basis);
  const sixMonthRuleApplied =
    extension > 0 && extension <= MAX_EXTENSION_MONTHS;
  const durationAfterSixMonths = sixMonthRuleApplied ? basis : theoretical;

  const capLimit = fulltimeMonths * DURATION_CAP_MULTIPLIER;
  const capApplied =
    Number.isFinite(durationAfterSixMonths) &&
    Number.isFinite(capLimit) &&
    durationAfterSixMonths > capLimit &&
    capLimit > 0;

  const durationAfterCap = capApplied ? capLimit : durationAfterSixMonths;

  const roundingMode = formValues?.rounding ?? "round";
  const roundedDuration =
    Number.isFinite(calculation?.parttimeFinalMonths) &&
      calculation.parttimeFinalMonths >= 0
      ? calculation.parttimeFinalMonths
      : Math.floor(durationAfterCap);

  const deltaVsBasis =
    Number.isFinite(calculation?.deltaMonths) && calculation?.allowed
      ? calculation.deltaMonths
      : roundedDuration - basis;

  const deltaVsOriginal = Number.isFinite(calculation?.deltaVsOriginal)
    ? calculation.deltaVsOriginal
    : null;

  const basisYM = formatYearsMonths(basis, t);
  const roundedYM = formatYearsMonths(roundedDuration, t);

  // Common values
  const roundedYears = Math.floor(roundedDuration / 12);
  const roundedMonthsRem = roundedDuration % 12;

  // Expert Mode Values
  const ratioValues = {
    part: formatNumber(weeklyPart),
    full: formatNumber(weeklyFull),
    pct: formatNumber(percent),
  };
  const step2Values = {
    part: formatNumber(weeklyPart),
    full: formatNumber(weeklyFull),
    factor: formatNumber(factor),
  };
  const reductionLabel = reduction.labelKey ? t(reduction.labelKey) : null;
  const reductionBreakdownParts = [];
  if (reduction.degree > 0) {
    reductionBreakdownParts.push(
      t("reduction.breakdown.degree", {
        months: formatNumber(reduction.degree),
        label: reductionLabel ?? t("reduction.selectPlaceholder"),
      })
    );
  }
  if (reduction.manual > 0) {
    reductionBreakdownParts.push(
      t("reduction.breakdown.manual", {
        months: formatNumber(reduction.manual),
      })
    );
  }
  if (reduction.qualification > 0) {
    reductionBreakdownParts.push(
      t("reduction.breakdown.qualification", {
        months: formatNumber(reduction.qualification),
      })
    );
  }
  const reductionBreakdown =
    reductionBreakdownParts.length > 0
      ? reductionBreakdownParts.join(", ")
      : t("reduction.breakdown.none");

  const step3Values = {
    fullM: formatNumber(fulltimeMonths),
    reductions: reductionBreakdown,
    rawBase: formatNumber(rawBase),
    minM: formatNumber(minDurationMonths),
    basis: formatNumber(basis),
    basisYM,
  };
  const step4Values = {
    basis: formatNumber(basis),
    factor: formatNumber(factor),
    dtheo: formatNumber(theoretical),
  };
  const roundingLabel = t(resolveRoundingLabelKey(roundingMode));
  const step6Values = {
    value: formatNumber(durationAfterCap),
    rounding: roundingLabel,
    rounded: formatNumber(roundedDuration),
    roundedYM,
  };
  const protectionValues = {
    extension: formatNumber(extension),
    limited: formatNumber(durationAfterSixMonths),
    afterSix: formatNumber(durationAfterSixMonths),
    cap: formatNumber(capLimit),
  };

  const showBelowFiftyError =
    !calculation?.allowed &&
    (percent < 50 || calculation?.errorCode === "minFactor");

  if (showBelowFiftyError) {
    return renderShell(
      onClose,
      t,
      <div className="space-y-4">
        <p className="text-slate-800">{t("error.below50")}</p>
        <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-slate-800">
          {t("transparency.ratio", ratioValues)}
        </div>
        <p className="text-sm font-semibold text-red-700">
          {t("transparency.step1.fail")}
        </p>
        {renderLegalHint(t)}
      </div>
    );
  }

  if (!calculation?.allowed) {
    const errorKey = calculation?.errorCode
      ? `result.error.${calculation.errorCode}`
      : "result.error.generic";

    return renderShell(
      onClose,
      t,
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900">
          {t("result.error.title")}
        </h3>
        <p className="text-slate-800">{t(errorKey)}</p>
        {renderLegalHint(t)}
      </div>
    );
  }

  // --- Simplified View Render ---
  const simpleView = (
    <div className="space-y-8">
      {/* Teaser */}
      <p className="text-base text-slate-800 leading-relaxed">
        {t("transparency.simple.teaser", {
          desiredHours: formatNumber(weeklyPart),
          percentage: formatNumber(percent),
          fullTimeHours: formatNumber(weeklyFull),
        })}
      </p>

      {/* Diagram */}
      <div
        className="space-y-4"
        role="img"
        aria-label={t("transparency.chart.partTime", { hours: formatNumber(weeklyPart), percent: formatNumber(percent) })}
      >
        {/* Full-time Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
            <span>{t("transparency.simple.chart.fullLabel")}</span>
            <span>{formatNumber(weeklyFull)} h</span>
          </div>
          <div className="h-6 w-full rounded bg-slate-200 relative">
          </div>
        </div>

        {/* Part-time Bar */}
        <div className="w-full">
          <div className="flex justify-between text-xs font-medium text-blue-700 mb-1">
            <span>{t("result.labels.part")}</span>
            <span className="font-bold">{formatNumber(weeklyPart)} h ({formatNumber(percent)}%)</span>
          </div>
          <div className="h-6 w-full rounded bg-slate-100 relative overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-700 ease-out rounded shadow-sm"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Simple Steps */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step}>
            <h3 className="font-semibold text-base text-slate-900 mb-1">
              {t(`transparency.simple.step${step}.title`)}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t(`transparency.simple.step${step}.text`)}
            </p>
          </div>
        ))}
      </div>

      {/* Result Line */}
      <div className="bg-blue-50 rounded-lg p-5 text-center space-y-2 border border-blue-100 shadow-sm">
        <p className="text-xl font-bold text-blue-900">
          {t("transparency.simple.result.main", {
            months: formatNumber(roundedDuration),
            years: roundedYears,
            remMonths: roundedMonthsRem,
          })}
        </p>
        <p className="text-sm font-medium text-blue-700">
          {t("transparency.simple.result.diff", {
            diff: formatNumber(
              Number.isFinite(deltaVsOriginal) && deltaVsOriginal !== 0
                ? deltaVsOriginal
                : deltaVsBasis
            ),
          })}
        </p>
      </div>
    </div>
  );

  // --- Expert View Render (Existing logic) ---
  const expertView = (
    <div className="space-y-6 mt-8 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {t("transparency.simple.actions.showExpert").replace("anzeigen", "").replace("Show", "")} Details
      </h3>

      <p className="text-sm text-slate-700">{t("transparency.intro")}</p>

      <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
        {t("transparency.ratio", ratioValues)}
      </div>

      <section className="space-y-1">
        <h4 className="font-semibold text-slate-900">{t("transparency.step1.title")}</h4>
        <p className="text-sm text-slate-600">
          {t(percent >= 50 ? "transparency.step1.ok" : "transparency.step1.fail")}
        </p>
      </section>

      <section className="space-y-1">
        <h4 className="font-semibold text-slate-900">{t("transparency.step2.title")}</h4>
        <p className="text-sm text-slate-600">{t("transparency.step2.text", step2Values)}</p>
      </section>

      <section className="space-y-1">
        <h4 className="font-semibold text-slate-900">{t("transparency.step3.title")}</h4>
        <p className="text-sm text-slate-600">{t("transparency.step3.text", step3Values)}</p>
      </section>

      <section className="space-y-1">
        <h4 className="font-semibold text-slate-900">{t("transparency.step4.title")}</h4>
        <p className="text-sm text-slate-600">{t("transparency.step4.text", step4Values)}</p>
      </section>

      <section className="space-y-1">
        <h4 className="font-semibold text-slate-900">{t("transparency.step5.title")}</h4>
        <p className="text-sm text-slate-600">
          {t(sixMonthRuleApplied ? "transparency.step5.sixApplied" : "transparency.step5.sixSkipped", protectionValues)}
        </p>
        <p className="text-sm text-slate-600">
          {t(capApplied ? "transparency.step5.capApplied" : "transparency.step5.capSkipped", protectionValues)}
        </p>
      </section>

      <section className="space-y-1">
        <h4 className="font-semibold text-slate-900">{t("transparency.step6.title")}</h4>
        <p className="text-sm text-slate-600">{t("transparency.step6.text", step6Values)}</p>
      </section>

      <section className="space-y-2 bg-white p-3 rounded border border-slate-200">
        <p className="font-semibold text-slate-900">
          {t("transparency.result", {
            months: formatNumber(roundedDuration),
            yearsMonths: roundedYM,
          })}
        </p>
        <p className="text-xs text-slate-500">
          {t("transparency.delta.basis", {
            delta: formatSigned(deltaVsBasis, formatNumber),
          })}
        </p>
        {Number.isFinite(deltaVsOriginal) && deltaVsOriginal !== 0 && (
          <p className="text-xs text-slate-500">
            {t("transparency.delta.original", {
              delta: formatSigned(deltaVsOriginal, formatNumber),
            })}
          </p>
        )}
      </section>
    </div>
  );

  return renderShell(
    onClose,
    t,
    <div className="pb-4">
      {simpleView}

      <div className="mt-6 flex flex-col items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExpertMode(!showExpertMode)}
          aria-expanded={showExpertMode}
          aria-controls="expert-calculation-details"
        >
          {showExpertMode
            ? t("transparency.simple.actions.hideExpert")
            : t("transparency.simple.actions.showExpert")}
        </Button>
      </div>

      {showExpertMode && (
        <div id="expert-calculation-details">
          {expertView}
        </div>
      )}

      <div className="mt-8">
        {renderLegalHint(t)}
      </div>
    </div>
  );
}

function renderShell(onClose, t, body) {
  return (
    <Dialog
      title={t("transparency.simple.title")}
      isOpen
      onClose={onClose}
      maxWidth="max-w-2xl"
      bodyClassName="max-h-[85vh] overflow-y-auto px-6 py-6"
      closeLabel={t("transparency.simple.actions.close")}
    >
      {body}
    </Dialog>
  );
}

function renderLegalHint(t) {
  const legalUrl = t("transparency.legal.url");
  return (
    <NoticeBox
      title={t("transparency.legal.title")}
      href={legalUrl}
      linkLabel={t("transparency.legal.link")}
      variant="legal"
    >
      {t("transparency.legal.text")}
    </NoticeBox>
  );
}
