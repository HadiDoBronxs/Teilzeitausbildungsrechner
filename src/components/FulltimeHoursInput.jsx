import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const FULLTIME_INPUT_NAME = "fulltime-hours-input";
export const FULLTIME_ERROR_ID = `${FULLTIME_INPUT_NAME}-error`;
export const FULLTIME_MIN = 35;
export const FULLTIME_MAX = 45;

export const isFulltimeHoursValid = (raw) => {
  if (raw === "") return false;
  const n = Number(raw);
  return !Number.isNaN(n) && n >= FULLTIME_MIN && n <= FULLTIME_MAX;
};

export default function FulltimeHoursInput({ onValueChange }) {
  const { t } = useTranslation();
  const [hours, setHours] = useState(40); // Default 40 hours
  const isValid = isFulltimeHoursValid(hours);
  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(hours);
    }
  }, [hours, onValueChange]);

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      <label
        htmlFor={FULLTIME_INPUT_NAME}
        className="font-semibold text-gray-800"
      >
        {t("fulltimeHours.label")}
      </label>

      <input
        id={FULLTIME_INPUT_NAME}
        name={FULLTIME_INPUT_NAME}
        data-testid={FULLTIME_INPUT_NAME}
        type="number"
        inputMode="numeric"
        min={FULLTIME_MIN}
        max={FULLTIME_MAX}
        step={0.5}
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        aria-invalid={!isValid}
        aria-describedby={FULLTIME_ERROR_ID}
        className={`border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isValid ? "border-red-500" : "border-gray-300"
        }`}
      />

      {!isValid && (
        <p
          id={FULLTIME_ERROR_ID}
          data-testid={`${FULLTIME_INPUT_NAME}-error`}
          className="text-red-600 text-sm"
          role="alert"
        >
          {t("fulltimeHours.error", { min: FULLTIME_MIN, max: FULLTIME_MAX })}
        </p>
      )}
    </div>
  );
}
