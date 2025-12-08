import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  REGULAR_DURATION_NAME,
  REGULAR_DURATION_ERROR_ID,
  DURATION_MIN,
  DURATION_MAX,
  isRegularDurationValid,
} from "./RegularDurationInput.constants";
import NumberInput from "./ui/NumberInput";
import Tooltip from "./InfoTooltip";

export default function RegularDurationInput({ onValueChange }) {
  const { t } = useTranslation();
  const [months, setMonths] = useState(36); // Default 36 months
  const isValid = isRegularDurationValid(months);

  useEffect(() => {
    if (typeof onValueChange === "function") {
      onValueChange(months);
    }
  }, [months, onValueChange]);

  const ariaDescribedBy =
    (!isValid ? REGULAR_DURATION_ERROR_ID : null) || undefined;

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      {/* Tooltip zum Label */}
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={REGULAR_DURATION_NAME}
          className="font-semibold text-gray-800"
        >
          {t("regularDuration.label")}
        </label>
        <Tooltip contentKey="tooltip.regularDuration" />
      </div>

      <NumberInput
        id={REGULAR_DURATION_NAME}
        name={REGULAR_DURATION_NAME}
        data-testid={REGULAR_DURATION_NAME}
        min={DURATION_MIN}
        max={DURATION_MAX}
        step={1}
        value={months}
        onChange={(e) => {
        let v = e.target.value;

        // Support comma input (German users)
        v = v.replace(",", ".");

        // Prevent more than one dot
        const parts = v.split(".");
        if (parts.length > 2) {
          v = parts[0] + "." + parts.slice(1).join("");
        }

        // No decimals allowed → strip everything after the dot
        if (parts[1]) {
          v = parts[0];
        }


        // Allow empty value
        if (v === "") {
          setMonths("");
          return;
        }

        // Convert sanitized string to number
        const numeric = Number(v);
        if (!Number.isNaN(numeric)) {
          setMonths(numeric);
        }
      }}

        aria-invalid={!isValid}
        aria-describedby={ariaDescribedBy}
      />

      {!isValid && (
        <p
          id={REGULAR_DURATION_ERROR_ID}
          data-testid={`${REGULAR_DURATION_NAME}-error`}
          className="text-red-700 text-sm font-semibold"
          role="alert"
        >
          {t("regularDuration.error", { min: DURATION_MIN, max: DURATION_MAX })}
        </p>
      )}

    </div>
  );
}
