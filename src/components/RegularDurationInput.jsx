import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  REGULAR_DURATION_NAME,
  REGULAR_DURATION_ERROR_ID,
  REGULAR_DURATION_HINT_ID,
  REGULAR_DURATION_TOOLTIP_ID,
  DURATION_MIN,
  DURATION_MAX,
  isRegularDurationValid,
} from "./RegularDurationInput.constants";

export default function RegularDurationInput({ onValueChange }) {
  const { t } = useTranslation();
  const [months, setMonths] = useState(36); // Default 36 months
  const isValid = isRegularDurationValid(months);

  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(months);
    }
  }, [months, onValueChange]);

  const baseDescribedBy = [REGULAR_DURATION_HINT_ID];
  const ariaDescribedBy = [
    ...baseDescribedBy,
    !isValid ? REGULAR_DURATION_ERROR_ID : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      <label
        htmlFor={REGULAR_DURATION_NAME}
        className="font-semibold text-gray-800"
      >
        {t("regularDuration.label")}
      </label>

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

      <p
        id={REGULAR_DURATION_HINT_ID}
        className="text-sm font-medium text-slate-700"
      >
        {t("regularDuration.hintPrefix")} {t("regularDuration.minHint", { min: DURATION_MIN })}
      </p>

      {!isValid && (
        <p
          id={REGULAR_DURATION_ERROR_ID}
          data-testid={`${REGULAR_DURATION_NAME}-error`}
          className="text-red-700 text-sm font-semibold"
          role="alert"
        >
          {t("regularDuration.error", { min: DURATION_MIN, max: DURATION_MAX })}
        </p>
      )}

      {isValid && (
        <p
          className="text-sm font-semibold text-slate-900 bg-slate-100 border border-slate-300 rounded-md px-3 py-2"
          aria-live="polite"
        >
          {t("regularDuration.resultPrefix")}{" "}
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
