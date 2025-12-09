// EducationTab.jsx – Second tab of the guided tour, handling education-related inputs.
// Contains school degree selection, conditional university/ECTS questions.
// Note: Academic achievements question is NEVER shown in tour mode - ECTS question replaces it.
import SchoolDegreeReductionSelect from "../../components/SchoolDegreeReductionSelect.jsx";
import SelectField from "../../components/ui/SelectField.jsx";
import Tooltip from "../../components/InfoTooltip.jsx";
import Button from "../../components/ui/Button.jsx";
import { useTranslation } from "react-i18next";

const UNIVERSITY_SELECT_ID = "university-select";
const ECTS_SELECT_ID = "ects-select";

// Degrees that trigger university questions: FHSR (fhr) and HSR (abi)
const DEGREES_WITH_UNIVERSITY_QUESTIONS = ["fhr", "abi"];

/**
 * EducationTab component - Second step of the guided tour.
 *
 * Handles school degree selection, conditional university/ECTS questions,
 * and academic qualification selection.
 *
 * @param {Object} props - Component props
 * @param {string|null} props.schoolDegreeId - Selected school degree ID
 * @param {Function} props.onSchoolDegreeChange - Callback for school degree change
 * @param {string|null} props.attendedUniversity - Whether user attended university ("yes", "no", or null)
 * @param {Function} props.onAttendedUniversityChange - Callback for university attendance change
 * @param {string|null} props.hasEcts - Whether user has ECTS ("yes", "no", or null)
 * @param {Function} props.onHasEctsChange - Callback for ECTS change
 * @param {Function} props.onAcademicQualificationChange - Callback to update academic qualification based on ECTS
 * @param {Function} props.onBack - Callback when Back button is clicked
 * @param {Function} props.onNext - Callback when Next button is clicked
 */
export default function EducationTab({
  schoolDegreeId,
  onSchoolDegreeChange,
  attendedUniversity,
  onAttendedUniversityChange,
  hasEcts,
  onHasEctsChange,
  onAcademicQualificationChange,
  onBack,
  onNext,
}) {
  const { t } = useTranslation();

  // Check if university questions should be shown (only for FHSR/HSR)
  const showUniversityQuestions =
    schoolDegreeId && DEGREES_WITH_UNIVERSITY_QUESTIONS.includes(schoolDegreeId);

  // Check if ECTS question should be shown (only if university is "yes")
  // ECTS question replaces academic achievements input in tour mode
  const showEctsQuestion =
    showUniversityQuestions && attendedUniversity === "yes";

  return (
    <div
      role="tabpanel"
      id="tabpanel-education"
      aria-labelledby="tab-education"
      className="space-y-6"
    >
      <div className="space-y-4 flex flex-col items-center">
        <div className="w-full max-w-sm mx-auto">
          <SchoolDegreeReductionSelect
            value={schoolDegreeId ?? ""}
            onChange={(id) => onSchoolDegreeChange?.(id)}
          />
        </div>

        {/* Conditional university question - only for FHSR/HSR */}
        {showUniversityQuestions && (
          <div className="flex flex-col gap-2 w-full max-w-sm p-2">
            <label
              htmlFor={UNIVERSITY_SELECT_ID}
              className="font-semibold text-gray-800"
            >
              {t("tour.university.question")}
            </label>
            <SelectField
              id={UNIVERSITY_SELECT_ID}
              name={UNIVERSITY_SELECT_ID}
              value={attendedUniversity ?? "no"}
              onChange={(e) => onAttendedUniversityChange?.(e.target.value)}
            >
              <option value="no">{t("tour.university.no")}</option>
              <option value="yes">{t("tour.university.yes")}</option>
            </SelectField>
          </div>
        )}

        {/* Conditional ECTS question - replaces academic achievements input in tour mode */}
        {showEctsQuestion && (
          <div className="flex flex-col gap-2 w-full max-w-sm mx-auto p-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor={ECTS_SELECT_ID}
                className="font-semibold text-gray-800 text-center flex-1"
              >
                {t("tour.ects.question")}
              </label>
              {/* Info tooltip from academic qualification question */}
              <Tooltip contentKey="tooltip.qualification.academic" />
            </div>
            <SelectField
              id={ECTS_SELECT_ID}
              name={ECTS_SELECT_ID}
              value={hasEcts ?? "no"}
              onChange={(e) => {
                const value = e.target.value;
                onHasEctsChange?.(value);
                // ECTS "yes" means academic qualification applies
                onAcademicQualificationChange?.(value === "yes");
              }}
            >
              <option value="no">{t("tour.ects.no")}</option>
              <option value="yes">{t("tour.ects.yes")}</option>
            </SelectField>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="secondary" size="md">
          ← {t("tour.navigation.back")}
        </Button>
        <Button onClick={onNext} variant="primary" size="md">
          {t("tour.navigation.next")} →
        </Button>
      </div>
    </div>
  );
}
