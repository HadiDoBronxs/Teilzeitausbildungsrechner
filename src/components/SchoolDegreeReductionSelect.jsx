import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SCHOOL_DEGREE_OPTIONS,
  getReductionMonthsForDegree,
  getSchoolDegreeOption,
} from "../domain/schoolDegreeReductions.js";

const SELECT_ID = "school-degree-select";
const TOOLTIP_ID = `${SELECT_ID}-tooltip`;
const DESCRIPTION_ID = `${SELECT_ID}-description`;

const buildOptions = () => SCHOOL_DEGREE_OPTIONS;

export default function SchoolDegreeReductionSelect({ value, onChange }) {
  const { t } = useTranslation();
  const options = useMemo(buildOptions, []);
  const [isTooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isTooltipOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setTooltipOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (!tooltipRef.current) return;
      if (
        tooltipRef.current.contains(event.target) ||
        buttonRef.current?.contains(event.target)
      ) {
        return;
      }
      setTooltipOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isTooltipOpen]);

  const handleSelectChange = (event) => {
    const nextId = event.target.value || null;
    const months = getReductionMonthsForDegree(nextId);
    if (typeof onChange === "function") {
      onChange(nextId, months);
    }
  };

  const selectedOption = getSchoolDegreeOption(value);
  const describedByIds = [DESCRIPTION_ID];
  if (isTooltipOpen) {
    describedByIds.push(TOOLTIP_ID);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2 p-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={SELECT_ID}
          className="font-semibold text-gray-800"
        >
          {t("reduction.title")}
        </label>
        <button
          ref={buttonRef}
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          aria-haspopup="dialog"
          aria-expanded={isTooltipOpen}
          aria-controls={TOOLTIP_ID}
          onClick={() => setTooltipOpen((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setTooltipOpen(false);
            }
          }}
        >
          <span
            aria-hidden="true"
            className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[0.65rem] font-bold text-white"
          >
            ?
          </span>
          <span>{t("reduction.why")}</span>
        </button>
      </div>

      <p id={DESCRIPTION_ID} className="sr-only">
        {t("reduction.dropdownDescription")}
      </p>

      <select
        id={SELECT_ID}
        name={SELECT_ID}
        data-testid={SELECT_ID}
        className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value ?? ""}
        onChange={handleSelectChange}
        aria-describedby={describedByIds.join(" ")}
      >
        <option value="">{t("reduction.selectPlaceholder")}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>

      {isTooltipOpen && (
        <div
          ref={tooltipRef}
          id={TOOLTIP_ID}
          role="dialog"
          aria-modal="false"
          className="relative mt-1 w-full rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-slate-800 shadow focus:outline-none"
        >
          {t("reduction.whyText")}
        </div>
      )}

      {selectedOption && selectedOption.months > 0 ? (
        <p className="text-sm text-slate-600" aria-live="polite">
          {t("reduction.applied", {
            months: selectedOption.months,
            label: t(selectedOption.labelKey),
          })}
        </p>
      ) : null}
    </div>
  );
}
