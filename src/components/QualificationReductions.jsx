import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  QUALIFICATION_OPTIONS,
  MAX_QUALIFICATION_REDUCTION,
} from "./qualificationOptions.js";

/**
 * Summiert alle ausgewählten Qualifikationsgründe und wendet direkt die Deckelung an.
 * So bleibt die Berechnungslogik zentral und konsistent.
 */
function summarizeQualifications(selectedIds) {
  const rawTotal = selectedIds.reduce((sum, id) => {
    const option = QUALIFICATION_OPTIONS.find((item) => item.id === id);
    return sum + (option?.maxMonths || 0);
  }, 0);
  const cappedTotal = Math.min(rawTotal, MAX_QUALIFICATION_REDUCTION);
  return { rawTotal, cappedTotal };
}

export default function QualificationReductions({ value = [], onChange }) {
  const { t } = useTranslation();
  const { rawTotal, cappedTotal } = useMemo(
    () => summarizeQualifications(value),
    [value]
  );
  const exceedsCap = rawTotal > MAX_QUALIFICATION_REDUCTION;

  /**
   * Handhabt das Aus- und Anwählen einer Checkbox und gibt die neue Auswahl nach oben.
   */
  const handleToggle = (id) => {
    const next = value.includes(id)
      ? value.filter((item) => item !== id)
      : [...value, id];
    onChange?.(next);
  };

  return (
    <fieldset className="w-full max-w-sm mx-auto p-2 border border-slate-200 rounded-lg space-y-3">
      <legend className="font-semibold text-gray-800">
        {t("qualifications.title")}
      </legend>
      <p className="text-sm text-slate-600">{t("qualifications.description")}</p>
      <div className="flex flex-col gap-2" role="group">
        {QUALIFICATION_OPTIONS.map((option) => (
          <label
            key={option.id}
            className="flex items-start gap-2 text-sm text-slate-800"
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={value.includes(option.id)}
              onChange={() => handleToggle(option.id)}
            />
            <span>
              {t(option.labelKey, { months: option.maxMonths })}
            </span>
          </label>
        ))}
      </div>
      <p className="text-sm font-semibold text-slate-900">
        {t("qualifications.summary", {
          months: cappedTotal,
          max: MAX_QUALIFICATION_REDUCTION,
        })}
      </p>
      {exceedsCap && (
        <p
          role="alert"
          className="text-sm font-semibold text-amber-700"
        >
          {t("qualifications.warning", {
            raw: rawTotal,
            max: MAX_QUALIFICATION_REDUCTION,
          })}
        </p>
      )}
      <p className="text-xs text-slate-600">
        {t("qualifications.legalHint")}
      </p>
    </fieldset>
  );
}
