// InputsTab.jsx – First tab of the guided tour, collecting basic input values.
// Contains fulltime hours, parttime hours, regular duration, and the "reduce training" question.
import FulltimeHoursInput from "../../components/FulltimeHoursInput.jsx";
import ParttimeHoursInput from "../../components/ParttimeHoursInput.jsx";
import RegularDurationInput from "../../components/RegularDurationInput.jsx";
import SelectField from "../../components/ui/SelectField.jsx";
import Button from "../../components/ui/Button.jsx";
import { useTranslation } from "react-i18next";

const REDUCE_TRAINING_SELECT_ID = "reduce-training-select";

/**
 * InputsTab component - First step of the guided tour.
 *
 * Collects basic input values and asks if user wants to reduce training time.
 * The answer determines whether Education and Reductions tabs are shown.
 *
 * @param {Object} props - Component props
 * @param {number} props.fulltimeHours - Current full-time hours value
 * @param {number} props.parttimeHours - Current part-time hours value
 * @param {Function} props.onFulltimeChange - Callback for fulltime hours change
 * @param {Function} props.onParttimeChange - Callback for parttime hours change
 * @param {Function} props.onDurationChange - Callback for duration change
 * @param {string} props.wantsReduction - Current reduction preference ("no", "yes", "i-dont-know")
 * @param {Function} props.onWantsReductionChange - Callback for reduction preference change
 * @param {Function} props.onNext - Callback when Next button is clicked
 * @param {boolean} props.isDisabled - Whether the Next button should be disabled (based on calculation validation)
 */
export default function InputsTab({
  fulltimeHours,
  parttimeHours: _parttimeHours,
  onFulltimeChange,
  onParttimeChange,
  onDurationChange,
  wantsReduction = "no",
  onWantsReductionChange,
  onNext,
  isDisabled = false,
}) {
  const { t } = useTranslation();

  return (
    <div
      role="tabpanel"
      id="tabpanel-inputs"
      aria-labelledby="tab-mobile-inputs tab-inputs"
      className="space-y-6"
    >
      <div className="space-y-4">
        <FulltimeHoursInput onValueChange={onFulltimeChange} />
        <ParttimeHoursInput
          fulltimeHours={fulltimeHours}
          onValueChange={onParttimeChange}
        />
        <RegularDurationInput onValueChange={onDurationChange} />

        {/* Reduce training question */}
        <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
          <label
            htmlFor={REDUCE_TRAINING_SELECT_ID}
            className="font-semibold text-gray-800 dark:text-gray-200"
          >
            {t("tour.reduceTraining.question")}
          </label>
          <SelectField
            id={REDUCE_TRAINING_SELECT_ID}
            name={REDUCE_TRAINING_SELECT_ID}
            value={wantsReduction}
            onChange={(e) => onWantsReductionChange?.(e.target.value)}
          >
            <option value="no">{t("tour.reduceTraining.no")}</option>
            <option value="yes">{t("tour.reduceTraining.yes")}</option>
            <option value="i-dont-know">
              {t("tour.reduceTraining.iDontKnow")}
            </option>
          </SelectField>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={isDisabled}
          variant="primary"
          size="md"
        >
          {t("tour.navigation.next")} →
        </Button>
      </div>
    </div>
  );
}
