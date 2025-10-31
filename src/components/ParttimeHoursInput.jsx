import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PARTTIME_INPUT_NAME,
  PARTTIME_ERROR_ID,
  computeParttimeBounds,
  isParttimeHoursValid,
} from "./ParttimeHoursInput.helpers";

export default function ParttimeHoursInput({
  fulltimeHours = 40,
  onValueChange,
}) {
  const { t } = useTranslation();

  const { min: computedMin, max: computedMax } = useMemo(
    () => computeParttimeBounds(fulltimeHours),
    [fulltimeHours]
  );

  // Default preference: 30 if possible, otherwise clamp into computed range.
  const preferredDefault = useMemo(() => {
    const defaultPref = 30;
    const val = Math.min(computedMax, Math.max(computedMin, defaultPref));
    return String(val);
  }, [computedMin, computedMax]);

  const [hours, setHours] = useState(() => preferredDefault);

  const fulltimeNumeric = Number(fulltimeHours);
  const isValid = isParttimeHoursValid(hours, fulltimeHours);
  const numericHours = Number(hours);
  const showFactorInfo =
    isValid &&
    fulltimeNumeric > 0 &&
    hours !== "" &&
    !Number.isNaN(numericHours);
  const meetsMinFactor = showFactorInfo
    ? numericHours / fulltimeNumeric >= 0.5
    : true;

  // Notify parent when hours change
  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(hours);
    }
  }, [hours, onValueChange]);

  // If fulltimeHours changes, clamp the current hours into the new range.
  useEffect(() => {
    setHours((prev) => {
      if (prev === "") return prev;
      const n = Number(prev);
      if (Number.isNaN(n)) return prev;
      const clamped = Math.min(computedMax, Math.max(computedMin, n));
      return clamped === n ? prev : String(clamped);
    });
  }, [computedMin, computedMax]);

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
                percent: ((numericHours / fulltimeNumeric) * 100).toFixed(0),
              })
            : t("parttimeHours.factorError")}
        </p>
      )}
    </div>
  );
}
