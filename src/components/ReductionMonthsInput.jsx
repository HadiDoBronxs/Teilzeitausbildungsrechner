import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export const REDUCTION_INPUT_NAME = "reduction-months-input";
export const REDUCTION_ERROR_ID = `${REDUCTION_INPUT_NAME}-error`;

const isValidInteger = (value, min, max) => {
  if (value === "" || value === undefined || value === null) return true;
  const numeric = Number(value);
  if (!Number.isInteger(numeric)) return false;
  if (numeric < min) return false;
  if (typeof max === "number" && numeric > max) return false;
  return true;
};

export default function ReductionMonthsInput({
  value,
  onChange,
  min = 0,
  max,
}) {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  const stringValue =
    value === undefined || value === null ? "" : String(value);

  const isValid = useMemo(
    () => isValidInteger(stringValue, min, max),
    [stringValue, min, max]
  );

  const describedBy = !isValid ? REDUCTION_ERROR_ID : undefined;

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      <label htmlFor={REDUCTION_INPUT_NAME} className="font-semibold text-gray-800">
        {t("reduction.label")}
      </label>
      <input
        id={REDUCTION_INPUT_NAME}
        name={REDUCTION_INPUT_NAME}
        data-testid={REDUCTION_INPUT_NAME}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        placeholder={isFocused ? "" : t("reduction.placeholder")}
        value={stringValue}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-invalid={!isValid}
        aria-describedby={describedBy}
        className={`border rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          !isValid ? "border-red-500" : "border-gray-300"
        }`}
      />
      {!isValid && (
        <p
          id={REDUCTION_ERROR_ID}
          className="text-red-600 text-sm"
          role="alert"
          data-testid={REDUCTION_ERROR_ID}
        >
          {t("reduction.error.nonNegative")}
        </p>
      )}
    </div>
  );
}
