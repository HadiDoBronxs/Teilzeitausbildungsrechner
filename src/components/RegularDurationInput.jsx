import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const REGULAR_DURATION_NAME = "regular-duration-input";
export const REGULAR_DURATION_ERROR_ID = `${REGULAR_DURATION_NAME}-error`;
export const REGULAR_DURATION_HINT_ID = `${REGULAR_DURATION_NAME}-hint`;
export const REGULAR_DURATION_TOOLTIP_ID = `${REGULAR_DURATION_NAME}-tooltip`;
export const DURATION_MIN = 12;
export const DURATION_MAX = 48;

export const isRegularDurationValid = (raw) => {
  if (raw === "") return false;
  const n = Number(raw);
  return !Number.isNaN(n) && n >= DURATION_MIN && n <= DURATION_MAX;
};

export default function RegularDurationInput() {
  const { t } = useTranslation();
  const [months, setMonths] = useState(36); // Default 36 months
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const isValid = isRegularDurationValid(months);

  React.useEffect(() => {
    function onDocClick(e) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDocClick);
    return () => document.removeEventListener("pointerdown", onDocClick);
  }, []);

const baseDescribedBy = [REGULAR_DURATION_HINT_ID];
  const ariaDescribedBy = [
    ...baseDescribedBy,
    !isValid ? REGULAR_DURATION_ERROR_ID : null,
  ]
    .filter(Boolean)
    .join(" ");


  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      <div
        ref={wrapperRef}
        className="relative inline-flex items-center font-semibold text-gray-800"
      >
        <label htmlFor={REGULAR_DURATION_NAME}>
          {t("regularDuration.label")}
        </label>

        <button
          type="button"
          className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded cursor-help"
          aria-label={t("regularDuration.minHint", { min: DURATION_MIN })}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={REGULAR_DURATION_HINT_ID}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={() => setOpen((v) => !v)}
        >
          &#9432;
        </button>

        {open && (
          <div
            id={REGULAR_DURATION_TOOLTIP_ID}
            role="tooltip"
            className="absolute bottom-full left-1/2 -translate-x-1/2 transform mb-2
                       bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow"
          >
            {t("regularDuration.minHint", { min: DURATION_MIN })}
          </div>
        )}
      </div>

      <p id={REGULAR_DURATION_HINT_ID} className="sr-only">
        {t("regularDuration.minHint", { min: DURATION_MIN })}
      </p>

      <input
        id={REGULAR_DURATION_NAME}
        name={REGULAR_DURATION_NAME}
        data-testid={REGULAR_DURATION_NAME}
        type="number"
        inputMode="numeric"
        min={DURATION_MIN}
        max={DURATION_MAX}
        step={1}
        value={months}
        onChange={(e) => {
          const v = e.target.value;
          setMonths(v === "" ? "" : Number(v));
        }}
        aria-invalid={!isValid}
        aria-describedby={ariaDescribedBy}
        className={`border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isValid ? "border-red-500" : "border-gray-300"
        }`}
      />

      {!isValid && (
        <p
          id={REGULAR_DURATION_ERROR_ID}
          data-testid={`${REGULAR_DURATION_NAME}-error`}
          className="text-red-600 text-sm"
          role="alert"
        >
          {t("regularDuration.error", { min: DURATION_MIN, max: DURATION_MAX })}
        </p>
      )}

      {isValid && (
        <p className="text-green-700 text-sm font-medium" aria-live="polite">
          {t("regularDuration.durationText", {
            months: Number(months),
            years: Math.floor(Number(months) / 12),
            remainingMonths: Number(months) % 12,
          })}
        </p>
      )}
    </div>
  );
}