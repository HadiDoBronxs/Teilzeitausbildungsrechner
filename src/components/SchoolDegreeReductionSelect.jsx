import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  SCHOOL_DEGREE_OPTIONS,
  getReductionMonthsForDegree,
  getSchoolDegreeOption,
} from "../domain/schoolDegreeReductions.js";
import SelectField from "./ui/SelectField";
import Tooltip from "./InfoTooltip";

const SELECT_ID = "school-degree-select";
const DESCRIPTION_ID = `${SELECT_ID}-description`;
const QUESTION_ID = `${SELECT_ID}-question`;

function buildOptions() {
  return SCHOOL_DEGREE_OPTIONS;
}

// Dropdown that lets the user pick their highest school degree and explains the automatic reduction.
export default function SchoolDegreeReductionSelect({ value, onChange }) {
  const { t } = useTranslation();
  // Options are static, memoising keeps referential equality between renders.
  const options = useMemo(buildOptions, []);

  // Bubble the selected id plus the mapped reduction months to the parent form.
  function handleSelectChange(event) {
    const nextId = event.target.value || null;
    const months = getReductionMonthsForDegree(nextId);
    if (typeof onChange === "function") {
      onChange(nextId, months);
    }
  }

  function renderOption(option) {
    return (
      <option key={option.id} value={option.id}>
        {t(option.labelKey)}
      </option>
    );
  }

  // Surface a short explanation below the select when a degree adds months.
  const selectedOption = getSchoolDegreeOption(value);

  return (
    <div className="flex w-full max-w-sm flex-col gap-2 p-2">
      <div className="flex items-center gap-2">
        <label
          htmlFor={SELECT_ID}
          className="text-lg font-semibold text-gray-900"
        >
          {t("reduction.title")}
        </label>
        <Tooltip contentKey="tooltip.schoolDegree" />
      </div>

      <label
        id={QUESTION_ID}
        htmlFor={SELECT_ID}
        className="text-lg font-semibold text-gray-900"
      >
        {t("reduction.question")}
      </label>

      <p id={DESCRIPTION_ID} className="sr-only">
        {t("reduction.dropdownDescription")}
      </p>

      <SelectField
        id={SELECT_ID}
        name={SELECT_ID}
        data-testid={SELECT_ID}
        value={value ?? ""}
        onChange={handleSelectChange}
        aria-describedby={`${QUESTION_ID} ${DESCRIPTION_ID}`}
      >
        <option value="">{t("reduction.selectPlaceholder")}</option>
        {options.map(renderOption)}
      </SelectField>

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
