// OtherQualificationReductions.jsx – Component for selecting non-academic qualification reductions.
// Used in the Reductions tab of the guided tour, excludes the "academic" option.
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

// Filter out the "academic" option - it's handled separately in Education tab
const OTHER_QUALIFICATION_OPTIONS = QUALIFICATION_OPTIONS.filter(
  (opt) => opt.id !== "academic"
);

/**
 * OtherQualificationReductions component - Manages selection of non-academic qualification-based reductions.
 *
 * This component is similar to QualificationReductions but excludes the "academic" option,
 * which is handled separately in the Education tab of the guided tour.
 *
 * @param {Object} props - Component props
 * @param {string[]} [props.value=[]] - Array of selected qualification IDs (excluding "academic")
 * @param {Function} [props.onChange] - Callback called when selection changes, receives new array of IDs
 * @param {Function} [props.onTotalChange] - Callback called when total reduction changes, receives {rawTotal, cappedTotal, exceedsCap}
 */
export default function OtherQualificationReductions({
  value = [],
  onChange,
  onTotalChange,
}) {
  const { t } = useTranslation();

  // Calculate reduction totals from selected qualification IDs
  // Memoized to avoid recalculating on every render
  const { rawTotal, cappedTotal } = useMemo(
    () => summarizeQualificationSelection(value),
    [value]
  );
  const exceedsCap = rawTotal > MAX_QUALIFICATION_REDUCTION;

  // Notify parent component whenever reduction totals change
  useEffect(() => {
    onTotalChange?.({ rawTotal, cappedTotal, exceedsCap });
  }, [rawTotal, cappedTotal, exceedsCap, onTotalChange]);

  /**
   * Handles user selection/deselection of a qualification.
   *
   * @param {string} id - The qualification option ID to add or remove
   * @param {boolean} shouldApply - True to add the ID, false to remove it
   */
  const handleAnswer = (id, shouldApply) => {
    let next;
    if (shouldApply) {
      next = Array.from(new Set([...value, id]));
    } else {
      next = value.filter((item) => item !== id);
    }
    onChange?.(next);
  };

  return (
    <section className="w-full flex flex-col items-center gap-4">
      {/* Each qualification with its own tooltip */}
      {OTHER_QUALIFICATION_OPTIONS.map((option) => {
        const yesSelected = value.includes(option.id);
        const selectId = `qualification-select-${option.id}`;
        return (
          <div
            key={option.id}
            className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2"
          >
            {/* Tooltip for each qualification question */}
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
      {value.length > 0 && (
        <div className="w-full max-w-sm mx-auto p-2 space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            {t("qualifications.summary", {
              months: cappedTotal,
              max: MAX_QUALIFICATION_REDUCTION,
            })}
          </p>
        </div>
      )}
    </section>
  );
}
