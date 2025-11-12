import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { buildReductionSummary } from "../../domain/schoolDegreeReductions.js";
import readFormAndCalc from "./readFormAndCalc";

const MAX_EXTENSION_MONTHS = 6;
const DURATION_CAP_MULTIPLIER = 1.5;
const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, details summary, [tabindex]:not([tabindex="-1"])';
const DIALOG_TITLE_ID = "dialog-title";

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
  const dialogRef = useRef(null);
  const lastFocusedElement = useRef(null);
  const calculation = useMemo(() => readFormAndCalc(formValues), [formValues]);

  useEffect(function setupDialogFocusManagement() {
    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    if (
      !lastFocusedElement.current &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
    ) {
      lastFocusedElement.current = document.activeElement;
    }

    function getFocusableElements() {
      return Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.tabIndex !== -1 &&
          (element.offsetParent !== null ||
            getComputedStyle(element).position === "fixed")
      );
    }
    function focusInitialElement() {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialog.focus();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handlePointerDown(event) {
      if (!dialog.contains(event.target)) {
        onClose?.();
      }
    }

    focusInitialElement();
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return function cleanupFocusTrap() {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      if (
        lastFocusedElement.current &&
        typeof lastFocusedElement.current.focus === "function"
      ) {
        lastFocusedElement.current.focus();
      }
      lastFocusedElement.current = null;
    };
  }, [onClose]);

  const weeklyFull = toNumber(formValues?.weeklyFull);
  const weeklyPart = toNumber(formValues?.weeklyPart);
  const fulltimeMonths = toNumber(formValues?.fullDurationMonths);
  const reduction = buildReductionSummary({
    schoolDegreeId: formValues?.schoolDegreeId,
    degreeReductionMonths: formValues?.degreeReductionMonths,
    manualReductionMonths: formValues?.manualReductionMonths,
    labelKey: formValues?.schoolDegreeLabelKey,
  });
  const degreeReductionMonths = reduction.degree;
  const manualReductionMonths = reduction.manual;
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

  // Factor describes the ratio between part-time and full-time weekly hours (either provided by calc or recomputed here).
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
  const step3Values = {
    fullM: formatNumber(fulltimeMonths),
    degreeM: formatNumber(degreeReductionMonths),
    manualM: formatNumber(manualReductionMonths),
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
    !calculation?.allowed && (percent < 50 || calculation?.errorCode === "minFactor");

  if (showBelowFiftyError) {
    return renderShell(
      dialogRef,
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
      dialogRef,
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

  // Steps mirror docs in src/domain/calculationRulesOverview.js
  const content = (
    <div className="space-y-6">
      <p className="text-sm text-slate-700">{t("transparency.intro")}</p>
      <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-900">
        {t("transparency.ratio", ratioValues)}
      </div>
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("transparency.step1.title")}
        </h3>
        <p className="text-sm text-slate-700">
          {t(
            percent >= 50
              ? "transparency.step1.ok"
              : "transparency.step1.fail"
          )}
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("transparency.step2.title")}
        </h3>
        <p className="text-sm text-slate-700">
          {t("transparency.step2.text", step2Values)}
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("transparency.step3.title")}
        </h3>
        <p className="text-sm text-slate-700">
          {t("transparency.step3.text", step3Values)}
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("transparency.step4.title")}
        </h3>
        <p className="text-sm text-slate-700">
          {t("transparency.step4.text", step4Values)}
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("transparency.step5.title")}
        </h3>
        <p className="text-sm text-slate-700">
          {t(
            sixMonthRuleApplied
              ? "transparency.step5.sixApplied"
              : "transparency.step5.sixSkipped",
            protectionValues
          )}
        </p>
        <p className="text-sm text-slate-700">
          {t(
            capApplied
              ? "transparency.step5.capApplied"
              : "transparency.step5.capSkipped",
            protectionValues
          )}
        </p>
      </section>
      <section className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("transparency.step6.title")}
        </h3>
        <p className="text-sm text-slate-700">
          {t("transparency.step6.text", step6Values)}
        </p>
      </section>
      <section className="space-y-2">
        <p className="text-base font-semibold text-slate-900">
          {t("transparency.result", {
            months: formatNumber(roundedDuration),
            yearsMonths: roundedYM,
          })}
        </p>
        <p className="text-sm text-slate-700">
          {t("transparency.delta.basis", {
            delta: formatSigned(deltaVsBasis, formatNumber),
          })}
        </p>
        {Number.isFinite(deltaVsOriginal) && deltaVsOriginal !== 0 && (
          <p className="text-sm text-slate-700">
            {t("transparency.delta.original", {
              delta: formatSigned(deltaVsOriginal, formatNumber),
            })}
          </p>
        )}
      </section>
      {renderLegalHint(t)}
    </div>
  );

  return renderShell(dialogRef, onClose, t, content);
}

function renderShell(dialogRef, onClose, t, body) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={DIALOG_TITLE_ID}
        tabIndex={-1}
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id={DIALOG_TITLE_ID} className="text-xl font-semibold text-slate-900">
            {t("transparency.title")}
          </h2>
          <button
            type="button"
            className="text-slate-600 font-semibold transition hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            onClick={onClose}
          >
            {t("transparency.close")}
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{body}</div>
      </div>
    </div>
  );
}

function renderLegalHint(t) {
  const legalUrl = t("transparency.legal.url");
  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 space-y-2">
      <h3 className="text-sm font-semibold text-slate-900">
        {t("transparency.legal.title")}
      </h3>
      <p className="text-sm text-slate-700">{t("transparency.legal.text")}</p>
      <a
        className="text-sm font-semibold text-blue-700 underline"
        href={legalUrl}
        target="_blank"
        rel="noreferrer"
      >
        {t("transparency.legal.link")}
      </a>
    </section>
  );
}
