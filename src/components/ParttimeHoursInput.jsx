import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const PARTTIME_INPUT_NAME = "parttime-hours-input";
export const PARTTIME_ERROR_ID = `${PARTTIME_INPUT_NAME}-error`;

/**
 * Compute part-time bounds as 50% .. 80% of fulltimeHours.
 * We round the bounds to the nearest 0.5 step:
 *  - min is ceil(rawMin * 2) / 2 to ensure it's >= 50%
 *  - max is floor(rawMax * 2) / 2 to ensure it's <= 80%
 */
export function computeParttimeBounds(fulltimeHours) {
  const ft = Number(fulltimeHours);
  if (Number.isNaN(ft) || ft <= 0) {
    // Fallback
    return { min: 20, max: 30 };
  }
  const rawMin = ft * 0.5;
  const rawMax = ft * 0.8;

  // Round to nearest 0.5 step but ensure min >= rawMin and max <= rawMax
  const minRounded = Math.ceil(rawMin * 2) / 2;
  const maxRounded = Math.floor(rawMax * 2) / 2;

  // Cap the maximum at 35 hours as a reasonable upper limit for parttime
  const CAPPED_MAX = 35;
  const maxCapped = Math.min(maxRounded, CAPPED_MAX);

  // Ensure min <= max (edge cases for very small fulltime)
  const min = Math.min(minRounded, maxCapped);
  const max = Math.max(minRounded, maxCapped);

  return { min, max };
}

/**
 * Validation that considers the fulltimeHours bounds.
 * raw may be a string or number. Returns boolean.
 */
export function isParttimeHoursValid(raw, fulltimeHours) {
  if (raw === "") return false;
  const n = Number(raw);
  if (Number.isNaN(n)) return false;
  const { min, max } = computeParttimeBounds(fulltimeHours);
  return n >= min && n <= max;
}

export default function ParttimeHoursInput({
  fulltimeHours = 40,
  onValueChange,
}) {
  const { t } = useTranslation();

  const { min: computedMin, max: computedMax } =
    computeParttimeBounds(fulltimeHours);

  // Default preference: 30 if possible, otherwise clamp into computed range.
  const initialHours = (() => {
    const defaultPref = 30;
    const val = Math.min(computedMax, Math.max(computedMin, defaultPref));
    return String(val);
  })();

  const [hours, setHours] = useState(initialHours);

  const isValid = isParttimeHoursValid(hours, fulltimeHours);
  const numericHours = Number(hours);
  const showFactorInfo =
    isValid &&
    Number(fulltimeHours) > 0 &&
    hours !== "" &&
    !Number.isNaN(numericHours);
  const meetsMinFactor = showFactorInfo
    ? numericHours / Number(fulltimeHours) >= 0.5
    : true;

  // Notify parent when hours change
  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(hours);
    }
  }, [hours, onValueChange]);

  // If fulltimeHours changes, clamp the current hours into the new range.
  useEffect(() => {
    if (hours === "") return;
    const n = Number(hours);
    if (Number.isNaN(n)) return;
    const clamped = Math.min(computedMax, Math.max(computedMin, n));
    if (clamped !== n) {
      setHours(String(clamped));
    }
  }, [computedMin, computedMax]); // run when bounds change

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
        min={computedMin}
        max={computedMax}
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
          {t("parttimeHours.error", {
            min: computedMin,
            max: computedMax,
          })}
        </p>
      )}

      {showFactorInfo && (
        <p
          className={`text-sm font-medium ${
            meetsMinFactor ? "text-green-700" : "text-red-600"
          }`}
          aria-live="polite"
        >
          {meetsMinFactor
            ? t("parttimeHours.factorText", {
                percent: ((numericHours / Number(fulltimeHours)) * 100).toFixed(
                  0
                ),
              })
            : t("parttimeHours.factorError")}
        </p>
      )}
    </div>
  );
}