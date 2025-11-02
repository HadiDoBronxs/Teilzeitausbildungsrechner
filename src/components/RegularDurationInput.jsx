import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const REGULAR_DURATION_NAME = "regular-duration-input";
export const REGULAR_DURATION_ERROR_ID = `${REGULAR_DURATION_NAME}-error`;
export const REGULAR_DURATION_HINT_ID = `${REGULAR_DURATION_NAME}-hint`;
export const DURATION_MIN = 12; //  https://www.gesetze-im-internet.de/bbig_2005/__5.html Stimmt nicht mit Gesetz überein
export const DURATION_MAX = 48;

export const isRegularDurationValid = (raw) => {
  if (raw === "") return false;
  const n = Number(raw);
  return !Number.isNaN(n) && n >= DURATION_MIN && n <= DURATION_MAX;
};

export default function RegularDurationInput({ onValueChange }) {
  const { t } = useTranslation();
  const [months, setMonths] = useState(36); // Default 36 months
  const isValid = isRegularDurationValid(months);

  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(months);
    }
  }, [months, onValueChange]);

  const describedBy = [REGULAR_DURATION_HINT_ID];
  if (!isValid) {
    describedBy.push(REGULAR_DURATION_ERROR_ID);
  }

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
        aria-describedby={describedBy.join(" ")}
        className={`border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isValid ? "border-red-500" : "border-gray-300"
        }`}
      />

      <p
        id={REGULAR_DURATION_HINT_ID}
        className="text-sm font-medium text-slate-700"
      >
        Hinweis: {t("regularDuration.minHint", { min: DURATION_MIN })}
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
          Ergebnis:{" "}
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
