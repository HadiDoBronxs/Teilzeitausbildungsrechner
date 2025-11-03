import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FULLTIME_INPUT_NAME,
  FULLTIME_ERROR_ID,
  FULLTIME_MIN,
  FULLTIME_MAX,
  isFulltimeHoursValid,
  FULLTIME_HELP_ID,
} from "./FulltimeHoursInput.constants";

export default function FulltimeHoursInput({ onValueChange }) {
  const { t } = useTranslation();
  const [hours, setHours] = useState(40); // Default 40 hours
  const isValid = isFulltimeHoursValid(hours);
  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(hours);
    }
  }, [hours, onValueChange]);

  const describedBy = [FULLTIME_HELP_ID, !isValid ? FULLTIME_ERROR_ID : null]
  .filter(Boolean).join(" ");

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
        aria-describedby={describedBy || undefined}
        className={`border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isValid ? "border-red-500" : "border-gray-300"
        }`}
      />

      <p id={FULLTIME_HELP_ID} className="text-sm text-slate-600">
        {t("fulltimeHours.help", { min: FULLTIME_MIN, max: FULLTIME_MAX })}
      </p>

      {!isValid && (
        <p
          id={FULLTIME_ERROR_ID}
          data-testid={`${FULLTIME_INPUT_NAME}-error`}
          className="text-red-700 text-sm font-semibold"
          role="alert"
        >
          {t("fulltimeHours.error", { min: FULLTIME_MIN, max: FULLTIME_MAX })}
        </p>
      )}
    </div>
  );
}
