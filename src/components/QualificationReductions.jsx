import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  QUALIFICATION_OPTIONS,
  MAX_QUALIFICATION_REDUCTION,
  summarizeQualificationSelection,
} from "./qualificationOptions.js";
import Tooltip from "./InfoTooltip";
import SelectField from "./ui/SelectField";
import ReductionInfo from "./ui/ReductionInfo.jsx";

export default function QualificationReductions({
  value = [],
  onChange,
  onTotalChange,
}) {
  const { t } = useTranslation();
  const { rawTotal, cappedTotal } = useMemo(
    () => summarizeQualificationSelection(value),
    [value]
  );
  const exceedsCap = rawTotal > MAX_QUALIFICATION_REDUCTION;

  useEffect(() => {
    onTotalChange?.({ rawTotal, cappedTotal, exceedsCap });
  }, [rawTotal, cappedTotal, exceedsCap, onTotalChange]);

  const handleAnswer = (id, shouldApply) => {
    const next = shouldApply
      ? Array.from(new Set([...value, id]))
      : value.filter((item) => item !== id);
    onChange?.(next);
  };

  return (
    <section className="w-full flex flex-col items-center gap-4">
      {/* Jede Qualifikation mit eigenem Tooltip */}
      {QUALIFICATION_OPTIONS.map((option) => {
        const yesSelected = value.includes(option.id);
        const selectId = `qualification-select-${option.id}`;
        return (
          <div
            key={option.id}
            className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2"
          >
            {/* Tooltip zu jeder Qualifikationsfrage */}
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor={selectId}
                className="font-semibold text-gray-800 text-center flex-1"
              >
                {t(`${option.labelKey}.question`)}
              </label>
              <Tooltip contentKey={`tooltip.qualification.${option.id}`} />
            </div>

            <SelectField
              id={selectId}
              name={selectId}
              value={yesSelected ? "yes" : "no"}
              onChange={(event) =>
                handleAnswer(option.id, event.target.value === "yes")
              }
            >
              <option value="yes">{t("qualifications.answers.yes")}</option>
              <option value="no">{t("qualifications.answers.no")}</option>
            </SelectField>
            {yesSelected && (
              <ReductionInfo
                months={option.maxMonths}
                translationKey="reduction.qualificationApplied"
              />
            )}
          </div>
        );
      })}
      <div className="w-full max-w-sm mx-auto p-2 space-y-2">
        <p className="text-sm font-semibold text-slate-900">
          {t("qualifications.summary", {
            months: cappedTotal,
            max: MAX_QUALIFICATION_REDUCTION,
          })}
        </p>
      </div>
    </section>
  );
}
