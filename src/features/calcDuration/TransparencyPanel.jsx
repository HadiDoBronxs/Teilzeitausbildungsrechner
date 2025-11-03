import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import readFormAndCalc from "./readFormAndCalc";

const MAX_EXTENSION_MONTHS = 6;
const DURATION_CAP_MULTIPLIER = 1.5;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveMinDuration = (fulltimeMonths, override) => {
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
};

const formatYearsMonths = (months, t) => {
  const safeValue = Number.isFinite(months) ? months : 0;
  const rounded = Math.max(0, Math.round(safeValue));
  const years = Math.floor(rounded / 12);
  const remaining = rounded % 12;
  const yearLabel = years === 1 ? t("format.year") : t("format.years");
  const monthLabel = remaining === 1 ? t("format.month") : t("format.months");
  return `${years} ${yearLabel} ${remaining} ${monthLabel}`;
};

const formatSigned = (value, formatter) => {
  if (!Number.isFinite(value) || value === 0) {
    return formatter(0);
  }
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatter(Math.abs(value))}`;
};

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, details summary, [tabindex]:not([tabindex="-1"])';
const DIALOG_TITLE_ID = "dialog-title";

export default function TransparencyPanel({ formValues, onClose }) {
  const { t, i18n } = useTranslation();
  const calculation = useMemo(() => readFormAndCalc(formValues), [formValues]);
  const dialogRef = useRef(null);
  const lastFocusedElement = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (
      !lastFocusedElement.current &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
    ) {
      lastFocusedElement.current = document.activeElement;
    }

    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.tabIndex !== -1 &&
          (element.offsetParent !== null ||
            getComputedStyle(element).position === "fixed")
      );

    const focusInitialElement = () => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialog.focus();
      }
    };

    focusInitialElement();

    const handleKeyDown = (event) => {
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
    };

    const handlePointerDown = (event) => {
      if (!dialog.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
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
  const reductionMonths = Math.max(0, toNumber(formValues?.reductionMonths, 0));
  const minDurationMonths = resolveMinDuration(
    fulltimeMonths,
    formValues?.minDurationMonths
  );
  const rawBase = Math.max(0, fulltimeMonths - reductionMonths);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [i18n.language]
  );

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

  const extension = theoretical - basis;
  const sixMonthRuleApplied =
    Number.isFinite(extension) &&
    extension <= MAX_EXTENSION_MONTHS &&
    extension > 0;

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

  const step1Values = {
    part: formatter.format(weeklyPart),
    full: formatter.format(weeklyFull),
    pct: formatter.format(percent),
  };

  const theoreticalValues = {
    basis: formatter.format(basis),
    factor: formatter.format(factor),
    dtheo: formatter.format(theoretical),
  };

  const roundingFnLabel =
    roundingMode === "ceil"
      ? "ceil"
      : roundingMode === "round"
      ? "round"
      : "floor";

  if (!calculation?.allowed && (percent < 50 || calculation?.errorCode === "minFactor")) {
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
            <h2
              id={DIALOG_TITLE_ID}
              className="text-xl font-semibold text-slate-900"
            >
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
          <div className="space-y-4 px-6 py-5">
            <p className="text-slate-800">{t("error.below50")}</p>
            <p className="text-sm text-slate-700">
              {t("transparency.step1.text", step1Values)}
            </p>
            <p className="text-sm font-semibold text-red-700">
              {t("transparency.step1.fail")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!calculation?.allowed) {
    const errorKey = calculation?.errorCode
      ? `result.error.${calculation.errorCode}`
      : "result.error.generic";
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
            <h2
              id={DIALOG_TITLE_ID}
              className="text-xl font-semibold text-slate-900"
            >
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
          <div className="space-y-4 px-6 py-5">
            <h3 className="text-base font-semibold text-slate-900">
              {t("result.error.title")}
            </h3>
            <p className="text-slate-800">{t(errorKey)}</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h2
            id={DIALOG_TITLE_ID}
            className="text-xl font-semibold text-slate-900"
          >
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
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-6">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("transparency.step1.title")}
            </h3>
            <p className="text-sm text-slate-700">
              {t("transparency.step1.text", step1Values)}
            </p>
            <p
              className={`text-sm font-semibold ${
                percent >= 50 ? "text-slate-900" : "text-red-700"
              }`}
            >
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
              {t("transparency.step2.text", {
                part: formatter.format(weeklyPart),
                full: formatter.format(weeklyFull),
                factor: formatter.format(factor),
              })}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("transparency.step3.title")}
            </h3>
            <p className="text-sm text-slate-700">
              {t("transparency.step3.text", {
                fullM: formatter.format(fulltimeMonths),
                redM: formatter.format(reductionMonths),
                rawBase: formatter.format(rawBase),
                minM: formatter.format(minDurationMonths),
                basis: formatter.format(basis),
                basisYM,
              })}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("transparency.step4.title")}
            </h3>
            <p className="text-sm text-slate-700">
              {t("transparency.step4.text", theoreticalValues)}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("transparency.step5.title")}
            </h3>
            <p className="text-sm text-slate-700">
              {t("transparency.step5.six.text", {
                ext: formatSigned(extension, (value) => formatter.format(value)),
                applied: t(
                  sixMonthRuleApplied
                    ? "transparency.step5.six.applied"
                    : "transparency.step5.six.notApplied"
                ),
              })}
            </p>
            <p className="text-sm text-slate-700">
              {t("transparency.step5.cap.text", {
                cap: formatter.format(capLimit),
                applied: t(
                  capApplied
                    ? "transparency.step5.cap.applied"
                    : "transparency.step5.cap.notApplied"
                ),
              })}
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("transparency.step6.title")}
            </h3>
            <p className="text-sm text-slate-700">
              {t("transparency.step6.text", {
                roundingFn: roundingFnLabel,
                value: formatter.format(durationAfterCap),
                rounded: formatter.format(roundedDuration),
                roundedYM,
              })}
            </p>
          </section>

          <section className="space-y-2">
            <p className="text-base font-semibold text-slate-900">
              {t("transparency.result", {
                finalM: formatter.format(roundedDuration),
                finalYM: roundedYM,
              })}
            </p>
            <p className="text-sm text-slate-700">
              {t("transparency.delta.basis", {
                delta: formatSigned(deltaVsBasis, (value) =>
                  formatter.format(value)
                ),
              })}
            </p>
            {Number.isFinite(deltaVsOriginal) && deltaVsOriginal !== 0 && (
              <p className="text-sm text-slate-700">
                {t("transparency.delta.original", {
                  delta: formatSigned(deltaVsOriginal, (value) =>
                    formatter.format(value)
                  ),
                })}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
