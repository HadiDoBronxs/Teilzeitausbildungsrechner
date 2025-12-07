import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NumberInput from "./ui/NumberInput";
import ReductionInfo from "./ui/ReductionInfo.jsx";

export const REDUCTION_INPUT_NAME = "reduction-months-input";
export const REDUCTION_ERROR_ID = `${REDUCTION_INPUT_NAME}-error`;
export const REDUCTION_HELP_ID = `${REDUCTION_INPUT_NAME}-help`;

/**
 * Validates that a value is a valid integer within the specified min/max range.
 *
 * Validation rules:
 * - Empty, undefined, or null values are considered valid (allows empty input)
 * - Value must be a valid integer (not a decimal or non-numeric string)
 * - Value must be >= min
 * - If max is provided, value must be <= max
 *
 * @param {string|number|undefined|null} value - The value to validate
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number|undefined} max - Optional maximum allowed value (inclusive)
 * @returns {boolean} True if value is valid, false otherwise
 */
const isValidInteger = (value, min, max) => {
  // Empty values are considered valid to allow users to clear the input
  if (value === "" || value === undefined || value === null) {
    return true;
  }

  // Convert to number for validation
  const numeric = Number(value);

  // Check if the value is a valid integer (not a decimal or NaN)
  if (!Number.isInteger(numeric)) {
    return false;
  }

  // Check if value is below minimum threshold
  if (numeric < min) {
    return false;
  }

  // Check if value exceeds maximum threshold (if max is provided)
  if (typeof max === "number" && numeric > max) {
    return false;
  }

  // All validation checks passed
  return true;
};

/**
 * ReductionMonthsInput component - Input field for entering manual reduction months.
 *
 * This component allows users to manually enter a number of months to reduce from their
 * training duration. It provides:
 * - Integer-only input validation (no decimals allowed)
 * - Min/max value constraints
 * - Real-time validation feedback with error messages
 * - Help text explaining valid input range
 * - Visual feedback showing the reduction that will be applied
 *
 * How it works:
 * 1. Accepts numeric value from parent (can be undefined/null for empty state)
 * 2. Converts value to string for input display (handles empty state gracefully)
 * 3. Validates input in real-time as user types
 * 4. Converts input back to number when notifying parent (empty string becomes empty value)
 * 5. Shows ReductionInfo component displaying the reduction months that will be applied
 *
 * State management:
 * - Uses focus state to show/hide placeholder text (better UX when user is typing)
 * - Maintains string representation for input (allows empty/partial input)
 * - Calculates numeric value for display in ReductionInfo component
 *
 * Accessibility:
 * - Uses aria-invalid for screen readers when validation fails
 * - Uses aria-describedby to link input with help text and error messages
 * - Error messages have role="alert" for immediate screen reader announcement
 *
 * @param {Object} props - Component props
 * @param {number|undefined|null} props.value - Current reduction months value (number or empty)
 * @param {Function} [props.onChange] - Callback called when value changes, receives number or empty string
 * @param {number} [props.min=0] - Minimum allowed value (default: 0, non-negative)
 * @param {number} [props.max] - Optional maximum allowed value
 * @returns {JSX.Element} ReductionMonthsInput component
 */
export default function ReductionMonthsInput({
  value,
  onChange,
  min = 0,
  max,
}) {
  const { t } = useTranslation();

  // Track focus state to show/hide placeholder dynamically
  // When focused, hide placeholder so user can see what they're typing
  const [isFocused, setIsFocused] = useState(false);

  // Convert numeric value to string for input display
  // Handles undefined/null gracefully by converting to empty string
  const stringValue =
    value === undefined || value === null ? "" : String(value);

  // Calculate numeric value for display in ReductionInfo component
  // Memoized to avoid recalculating on every render
  // Returns 0 for empty/invalid values to show "0 months" in ReductionInfo
  const numericValue = useMemo(() => {
    if (stringValue === "" || stringValue === undefined || stringValue === null) {
      return 0;
    }
    const num = Number(stringValue);
    return Number.isNaN(num) ? 0 : num;
  }, [stringValue]);

  // Validate input value against min/max constraints
  // Memoized to avoid re-validating on every render
  const isValid = useMemo(
    () => isValidInteger(stringValue, min, max),
    [stringValue, min, max]
  );

  // Build aria-describedby attribute for accessibility
  // Links input to both help text and error message (if invalid)
  // Filters out null values and joins with spaces
  const describedBy = [
    REDUCTION_HELP_ID,
    !isValid ? REDUCTION_ERROR_ID : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      {/* Input label */}
      <label htmlFor={REDUCTION_INPUT_NAME} className="font-semibold text-gray-800">
        {t("reduction.label")}
      </label>

      {/* Number input field */}
      <NumberInput
        id={REDUCTION_INPUT_NAME}
        name={REDUCTION_INPUT_NAME}
        data-testid={REDUCTION_INPUT_NAME}
        min={min}
        max={max}
        step={1}
        // Hide placeholder when focused to improve typing experience
        placeholder={isFocused ? "" : t("reduction.placeholder")}
        value={stringValue}
        onChange={(e) => {
          const newValue = e.target.value;
          // Convert empty string to empty value, otherwise convert to number
          // This allows parent to distinguish between "0" and "no value entered"
          onChange?.(newValue === "" ? "" : Number(newValue));
        }}
        // Track focus state for dynamic placeholder behavior
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        // Accessibility: Mark input as invalid when validation fails
        aria-invalid={!isValid}
        // Accessibility: Link input to help text and error message
        aria-describedby={describedBy || undefined}
      />

      {/* Help text explaining valid input range */}
      <p
        id={REDUCTION_HELP_ID}
        className="text-sm text-slate-600"
      >
        {t("reduction.help", { min })}
      </p>

      {/* Error message displayed when validation fails */}
      {!isValid && (
        <p
          id={REDUCTION_ERROR_ID}
          className="text-red-700 text-sm font-semibold"
          role="alert"
          data-testid={REDUCTION_ERROR_ID}
        >
          {t("reduction.error.nonNegative")}
        </p>
      )}

      {/* Visual feedback showing the reduction that will be applied */}
      {/* Always shown, even when value is 0, to provide consistent UI */}
      <ReductionInfo
        months={numericValue}
        translationKey="reduction.manualApplied"
      />
    </div>
  );
}
