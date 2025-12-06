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

/**
 * QualificationReductions component - Manages selection of qualification-based reductions.
 *
 * This component allows users to select multiple qualifications (e.g., family care, age over 21,
 * completed training, etc.) that may reduce their training duration. Each qualification can be
 * selected (yes) or deselected (no), and the component tracks the total reduction months.
 *
 * The component maintains a list of selected qualification IDs and calculates:
 * - Raw total: Sum of all selected qualification reduction months
 * - Capped total: Raw total capped at MAX_QUALIFICATION_REDUCTION (12 months)
 * - Cap exceeded flag: Whether the raw total exceeds the maximum allowed
 *
 * @param {Object} props - Component props
 * @param {string[]} [props.value=[]] - Array of selected qualification IDs (e.g., ["familyCare", "ageOver21"])
 * @param {Function} [props.onChange] - Callback called when selection changes, receives new array of IDs
 * @param {Function} [props.onTotalChange] - Callback called when total reduction changes, receives {rawTotal, cappedTotal, exceedsCap}
 */
export default function QualificationReductions({
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
  // This allows parent to update form state with the calculated reduction values
  useEffect(() => {
    onTotalChange?.({ rawTotal, cappedTotal, exceedsCap });
  }, [rawTotal, cappedTotal, exceedsCap, onTotalChange]);

  /**
   * Handles user selection/deselection of a qualification.
   *
   * When a user selects "yes" for a qualification:
   * - Adds the qualification ID to the selected IDs array
   * - Uses Set to ensure no duplicates (idempotent operation)
   *
   * When a user selects "no" for a qualification:
   * - Removes the qualification ID from the selected IDs array
   *
   * After updating the array, notifies parent component via onChange callback.
   *
   * Example:
   * - Current value: ["familyCare"]
   * - User selects "yes" for "ageOver21"
   * - Result: ["familyCare", "ageOver21"]
   *
   * - Current value: ["familyCare", "ageOver21"]
   * - User selects "no" for "familyCare"
   * - Result: ["ageOver21"]
   *
   * @param {string} id - The qualification option ID to add or remove (e.g., "familyCare", "ageOver21")
   * @param {boolean} shouldApply - True to add the ID, false to remove it
   */
  const handleAnswer = (id, shouldApply) => {
    let next;
    if (shouldApply) {
      // Add qualification ID to selection
      // Use Set to remove duplicates in case ID is already present (idempotent)
      // Spread existing array, add new ID, convert Set back to array
      next = Array.from(new Set([...value, id]));
    } else {
      // Remove qualification ID from selection
      // Filter out the ID that matches the one being deselected
      next = value.filter((item) => item !== id);
    }
    // Notify parent component of the updated selection
    // Uses optional chaining to safely handle undefined onChange prop
    onChange?.(next);
  };

  return (
    <section className="w-full flex flex-col items-center gap-4">
      {/* Each qualification with its own tooltip */}
      {QUALIFICATION_OPTIONS.map((option) => {
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
