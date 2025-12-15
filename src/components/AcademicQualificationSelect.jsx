// AcademicQualificationSelect.jsx – Component for selecting the academic qualification option.
// Used in the Education tab of the guided tour to handle academic achievements separately.
import { useTranslation } from "react-i18next";
import SelectField from "./ui/SelectField";
import Tooltip from "./InfoTooltip";
import ReductionInfo from "./ui/ReductionInfo.jsx";
import { QUALIFICATION_OPTIONS } from "./qualificationOptions.js";

const ACADEMIC_OPTION = QUALIFICATION_OPTIONS.find((opt) => opt.id === "academic");
const SELECT_ID = "academic-qualification-select";

/**
 * AcademicQualificationSelect component - Selector for academic qualification reduction.
 *
 * This component handles only the "academic" qualification option, which is used in the
 * Education tab of the guided tour. It allows users to select whether they have
 * academic/university achievements that qualify for reduction.
 *
 * @param {Object} props - Component props
 * @param {boolean} [props.value=false] - Whether academic qualification is selected
 * @param {Function} [props.onChange] - Callback called when selection changes, receives boolean
 */
export default function AcademicQualificationSelect({ value = false, onChange }) {
  const { t } = useTranslation();

  if (!ACADEMIC_OPTION) {
    return null;
  }

  function handleChange(event) {
    const selected = event.target.value === "yes";
    onChange?.(selected);
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={SELECT_ID}
          className="font-semibold text-gray-800 text-center flex-1"
        >
          {t(`${ACADEMIC_OPTION.labelKey}.question`)}
        </label>
        <Tooltip contentKey={`tooltip.qualification.${ACADEMIC_OPTION.id}`} />
      </div>

      <SelectField
        id={SELECT_ID}
        name={SELECT_ID}
        value={value ? "yes" : "no"}
        onChange={handleChange}
      >
        <option value="no">{t("qualifications.answers.no")}</option>
        <option value="yes">{t("qualifications.answers.yes")}</option>
      </SelectField>

      {value && (
        <ReductionInfo
          months={ACADEMIC_OPTION.maxMonths}
          translationKey="reduction.qualificationApplied"
        />
      )}
    </div>
  );
}
