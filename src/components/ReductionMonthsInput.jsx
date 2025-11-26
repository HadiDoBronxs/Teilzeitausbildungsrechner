import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NumberInput from "./ui/NumberInput";

export const REDUCTION_INPUT_NAME = "reduction-months-input";
export const REDUCTION_ERROR_ID = `${REDUCTION_INPUT_NAME}-error`;
export const REDUCTION_HELP_ID = `${REDUCTION_INPUT_NAME}-help`;

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

  const describedBy = [
    REDUCTION_HELP_ID,
    !isValid ? REDUCTION_ERROR_ID : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      <label htmlFor={REDUCTION_INPUT_NAME} className="font-semibold text-gray-800">
        {t("reduction.label")}
      </label>
      <NumberInput
        id={REDUCTION_INPUT_NAME}
        name={REDUCTION_INPUT_NAME}
        data-testid={REDUCTION_INPUT_NAME}
        min={min}
        max={max}
        step={1}
        placeholder={isFocused ? "" : t("reduction.placeholder")}
        value={stringValue}
        onChange={(e) => {
          const newValue = e.target.value;
          onChange?.(newValue === "" ? "" : Number(newValue));
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-invalid={!isValid}
        aria-describedby={describedBy || undefined}
      />
      <p
        id={REDUCTION_HELP_ID}
        className="text-sm text-slate-600"
      >
        {t("reduction.help", { min })}
      </p>
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
    </div>
  );
}
