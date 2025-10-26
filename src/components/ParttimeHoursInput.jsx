import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const PARTTIME_INPUT_NAME = "parttime-hours-input";
export const PARTTIME_ERROR_ID = `${PARTTIME_INPUT_NAME}-error`;
export const PARTTIME_MIN = 20;
export const PARTTIME_MAX = 30;

export const isParttimeHoursValid = (raw) => {
  if (raw === "") return false;
  const n = Number(raw);
  return !Number.isNaN(n) && n >= PARTTIME_MIN && n <= PARTTIME_MAX;
};

export default function ParttimeHoursInput({
  fulltimeHours = 40,
  onValueChange,
}) {
  const { t } = useTranslation();
  const [hours, setHours] = useState(30); // Default 30 hours
  const isValid = isParttimeHoursValid(hours);
  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(hours);
    }
  }, [hours, onValueChange]);

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      <label
        htmlFor={PARTTIME_INPUT_NAME}
        className="font-semibold text-gray-800"
      >
        {t("parttimeHours.label")}
      </label>

      <input
        id={PARTTIME_INPUT_NAME}
        name={PARTTIME_INPUT_NAME}
        data-testid={PARTTIME_INPUT_NAME}
        type="number"
        inputMode="numeric"
        min={PARTTIME_MIN}
        max={PARTTIME_MAX}
        step={0.5}
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        aria-invalid={!isValid}
        aria-describedby={PARTTIME_ERROR_ID}
        className={`border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isValid ? "border-red-500" : "border-gray-300"
        }`}
      />

      {!isValid && (
        <p
          id={PARTTIME_ERROR_ID}
          data-testid={`${PARTTIME_INPUT_NAME}-error`}
          className="text-red-600 text-sm"
          role="alert"
        >
          {t("parttimeHours.error", { min: PARTTIME_MIN, max: PARTTIME_MAX })}
        </p>
      )}

      {/* optional: Prozentanzeige bei gültiger Eingabe */}
      {isValid && (
        <p className="text-green-700 text-sm font-medium" aria-live="polite">
          {t("parttimeHours.factorText", {
            percent: ((Number(hours) / fulltimeHours) * 100).toFixed(0),
          })}
        </p>
      )}
    </div>
  );
}
