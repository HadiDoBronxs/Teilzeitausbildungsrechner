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
    <div className="flex flex-col w-full gap-4 px-4 py-3 mx-auto sm:max-w-sm sm:px-0">
      {/* Tooltip zum Label */}
      <div className="flex items-center gap-2">
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