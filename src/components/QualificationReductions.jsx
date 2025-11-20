import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  QUALIFICATION_OPTIONS,
  MAX_QUALIFICATION_REDUCTION,
  summarizeQualificationSelection,
} from "./qualificationOptions.js";

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

  // Explicitly toggles a qualification to keep the selection deterministic.
  const handleAnswer = (id, shouldApply) => {
    const next = shouldApply
      ? Array.from(new Set([...value, id]))
      : value.filter((item) => item !== id);
    onChange?.(next);
  };

  return (
    <section className="w-full flex flex-col items-center gap-4">
      {/* Each qualification renders as a simple yes/no selector; we intentionally skip “up to X months” helper text to reduce clutter. */}
      {QUALIFICATION_OPTIONS.map((option) => {
        const yesSelected = value.includes(option.id);
        const selectId = `qualification-select-${option.id}`;
        return (
          <div
            key={option.id}
            className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2"
          >
            <label
              htmlFor={selectId}
              className="text-lg font-semibold text-gray-900 whitespace-nowrap"
            >
              {t(`${option.labelKey}.question`)}
            </label>
            <select
              id={selectId}
              name={selectId}
              className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={yesSelected ? "yes" : "no"}
              onChange={(event) =>
                handleAnswer(option.id, event.target.value === "yes")
              }
            >
              <option value="yes">{t("qualifications.answers.yes")}</option>
              <option value="no">{t("qualifications.answers.no")}</option>
            </select>
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
