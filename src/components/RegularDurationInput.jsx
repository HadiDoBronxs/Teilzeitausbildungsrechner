import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export const REGULAR_DURATION_NAME = "regular-duration-input";
export const REGULAR_DURATION_ERROR_ID = `${REGULAR_DURATION_NAME}-error`;
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
  const isValid = isRegularDurationValid(months);

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
        onChange={(e) => setMonths(e.target.value)}
        aria-invalid={!isValid}
        aria-describedby={REGULAR_DURATION_ERROR_ID}
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

      {/* Anzeige in Jahren und Monaten bei gültiger Eingabe */}
      {isValid && (
        <p className="text-green-700 text-sm font-medium" aria-live="polite">
          {t("regularDuration.durationText", {
            months: months,
            years: Math.floor(months / 12),
            remainingMonths: months % 12
          })}
        </p>
      )}
    </div>
  );
}