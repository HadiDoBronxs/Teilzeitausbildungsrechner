import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  PARTTIME_INPUT_NAME,
  PARTTIME_ERROR_ID,
  computeParttimeBounds,
  isParttimeHoursValid,
  PARTTIME_HELP_ID,
} from "./ParttimeHoursInput.helpers";

/**
 * React component that renders a numeric input for weekly
 * part-time hours and provides validation and contextual info.
 * 
 * Responsibilities:
 * - Compute valid min/max bounds from a given fulltime hours value
 *   (via computeParttimeBounds).
 * - Maintain an internal string state for the input value and notify the
 *   parent via onValueChange whenever it changes.
 * - Validate the value with isParttimeHoursValid and provide accessible
 *   error/help text and live region feedback.
 * - Display a percentage-of-fulltime indicator and an average daily hours
 *   readout (5 working days).
 * 
 * @param {object} props
 * @param {number} [props.fulltimeHours=40] - Full-time hours used to compute
 *   valid part-time bounds and percent factor. If 0 or negative, factor
 *   information is suppressed.
 * @param {(value: string) => void} [props.onValueChange] - Optional callback
 *   invoked whenever the text value changes (receives the raw string).
 * 
 * Notes:
 * - The internal input state is stored as a string to preserve partial user
 *   edits such as "" or "-" while typing.
 * - When fulltimeHours changes, the current value is clamped into the newly
 *   computed bounds (unless it's an empty string or non-numeric).
 */
export default function ParttimeHoursInput({
  fulltimeHours = 40,
  onValueChange,
}) {
  const { t } = useTranslation();

  // Compute min/max allowed hours from the provided fulltimeHours.
  // computeParttimeBounds should be a pure function returning {min, max}.
  const { min: computedMin, max: computedMax } = useMemo(
    () => computeParttimeBounds(fulltimeHours),
    [fulltimeHours]
  );

  /**
   * preferredDefault
   *
   * Compute a reasonable default string value for the input:
   * - Prefer 30 hours when within the computed range.
   * - Otherwise clamp to computedMin or computedMax.
   *
   * Stored as a string to be used as initial state for the input.
   */
  const preferredDefault = useMemo(() => {
    const defaultPref = 30;
    const val = Math.min(computedMax, Math.max(computedMin, defaultPref));
    return String(val);
  }, [computedMin, computedMax]);

  // Internal controlled input state (string).
  const [hours, setHours] = useState(() => preferredDefault);

  const fulltimeNumeric = Number(fulltimeHours);
  const isValid = isParttimeHoursValid(hours, fulltimeHours);
  const numericHours = Number(hours);

  // Show factor info only when value is numeric, valid and fulltime > 0.
  const showFactorInfo =
    isValid &&
    fulltimeNumeric > 0 &&
    hours !== "" &&
    !Number.isNaN(numericHours);
  const meetsMinFactor = showFactorInfo
    ? numericHours / fulltimeNumeric >= 0.5
    : true;


  // Calculate average daily working hours
  const avgDailyHours =
  numericHours && numericHours > 0 ? (numericHours / 5).toFixed(1) : null;


  // Notify parent when hours change
  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(hours);
    }
  }, [hours, onValueChange]);

  /**
   * Clamp current hours into newly computed min/max bounds when fulltime
   * (and therefore computedMin/computedMax) changes.
   *
   * Preserves empty or non-numeric inputs to avoid disrupting user typing.
   */
  useEffect(() => {
    setHours((prev) => {
      if (prev === "") return prev;
      const n = Number(prev);
      if (Number.isNaN(n)) return prev;
      const clamped = Math.min(computedMax, Math.max(computedMin, n));
      // Return unchanged string when no clamping needed to avoid extra
      // state updates and re-renders.
      return clamped === n ? prev : String(clamped);
    });
  }, [computedMin, computedMax]);

  const describedBy = [PARTTIME_HELP_ID, !isValid ? PARTTIME_ERROR_ID : null]
    .filter(Boolean).join(" ");

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
        aria-describedby={describedBy || undefined}
        className={`border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isValid ? "border-red-500" : "border-gray-300"
        }`}
      />

      <p id={PARTTIME_HELP_ID} className="text-sm text-slate-600">
        {t("parttimeHours.help")}
      </p>

      {!isValid && (
        <p
          id={PARTTIME_ERROR_ID}
          data-testid={`${PARTTIME_INPUT_NAME}-error`}
          className="text-red-700 text-sm font-semibold"
          role="alert"
        >
          {t("parttimeHours.error", {
            min: computedMin,
            max: computedMax,
          })}
        </p>
      )}

      {showFactorInfo && (
        <div
          role="status"
          aria-live="polite"
          className={`text-sm font-semibold ${
            meetsMinFactor ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {meetsMinFactor
            ? t("parttimeHours.factorText", {
                percent: ((numericHours / fulltimeNumeric) * 100).toFixed(0),
              })
            : t("parttimeHours.factorError")}
        </div>
      )}

    {/* 
      Display the calculated average daily working hours below the input field.
      The text updates automatically whenever the weekly part-time hours change.
      Shown only if a valid number is entered (avgDailyHours != null).
    */}
    {avgDailyHours && (
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-slate-800 font-medium mt-1"
      >
        {t("parttimeHours.avgDaily", { hours: avgDailyHours })}
      </p>
    )}

    </div>
  );
}
