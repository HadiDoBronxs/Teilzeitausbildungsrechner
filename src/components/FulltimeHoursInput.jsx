import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FULLTIME_INPUT_NAME,
  FULLTIME_ERROR_ID,
  FULLTIME_MIN,
  FULLTIME_MAX,
  isFulltimeHoursValid,
} from "./FulltimeHoursInput.constants";

import NumberInput from "./ui/NumberInput";
import Tooltip from "./InfoTooltip";

/**
 * FulltimeHoursInput component - Input field for entering fulltime working hours per week.
 *
 * This component provides:
 * - Number input with validation (min/max constraints)
 * - Real-time validation feedback with error messages
 * - Tooltip with additional information
 * - Automatic notification to parent component when value changes
 *
 * The component maintains its own internal state and notifies the parent via the
 * onValueChange callback whenever the value changes. This pattern allows the parent
 * to react to changes without tightly coupling to the input's internal implementation.
 *
 * @param {Object} props - Component props
 * @param {Function} [props.onValueChange] - Optional callback function called when hours value changes
 * @returns {JSX.Element} FulltimeHoursInput component
 */
export default function FulltimeHoursInput({ onValueChange }) {
  const { t } = useTranslation();
  const [hours, setHours] = useState(40); // Default 40 hours
  const isValid = isFulltimeHoursValid(hours);

  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(hours);
    }
  }, [hours, onValueChange]);

  const describedBy = (!isValid ? FULLTIME_ERROR_ID : null) || undefined;

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      {/* Tooltip for the fulltime hours label */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={FULLTIME_INPUT_NAME}
          className="font-semibold text-gray-800"
        >
          {t("fulltimeHours.label")}
        </label>

        <Tooltip contentKey="tooltip.fulltimeHours" />
      </div>

      <NumberInput
        id={FULLTIME_INPUT_NAME}
        name={FULLTIME_INPUT_NAME}
        data-testid={FULLTIME_INPUT_NAME}
        min={FULLTIME_MIN}
        max={FULLTIME_MAX}
        step={0.5}
        value={hours}
        onChange={(e) => {
        let v = e.target.value;

        // Convert comma to dot so "4,3" works
        v = v.replace(",", ".");

        // If more than one dot → clean it
        const parts = v.split(".");
        if (parts.length > 2) {
          v = parts[0] + "." + parts.slice(1).join("");
        }

        // Limit decimal digits to max 1
        if (parts[1] && parts[1].length > 1) {
          v = `${parts[0]}.${parts[1].slice(0, 1)}`;
        }


        // Allow empty field
        if (v === "") {
          setHours("");
          return;
        }

        // Convert to number and update state
        const numeric = Number(v);
        if (!Number.isNaN(numeric)) {
          setHours(numeric);
        }
      }}
        aria-invalid={!isValid}
        aria-describedby={describedBy}
      />

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