// TourSidebar.jsx – Desktop sidebar component displaying current inputs and qualifications in the guided tour.
// Shows a summary of values entered so far, updating dynamically as user progresses through tabs.
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getSchoolDegreeOption } from "../domain/schoolDegreeReductions.js";
import { QUALIFICATION_OPTIONS } from "./qualificationOptions.js";
import Card from "./ui/Card.jsx";

/**
 * TourSidebar component displays current inputs and qualifications in a desktop sidebar.
 * Only renders on desktop (hidden on mobile/tablet via Tailwind classes).
 * Updates dynamically as user progresses through tabs.
 *
 * Props:
 * - fulltimeHours: Current full-time hours value
 * - parttimeHours: Current part-time hours value
 * - fullDurationMonths: Current regular duration in months
 * - schoolDegreeId: Selected school degree ID
 * - academicQualification: Whether academic qualification is selected
 * - otherQualificationSelection: Array of other qualification IDs selected
 * - manualReductionMonths: Manual reduction months entered
 */
export default function TourSidebar({
  fulltimeHours,
  parttimeHours,
  fullDurationMonths,
  schoolDegreeId,
  academicQualification,
  otherQualificationSelection = [],
  manualReductionMonths = 0,
}) {
  const { t } = useTranslation();

  // Get school degree label if selected
  const schoolDegree = useMemo(() => {
    if (!schoolDegreeId) return null;
    const option = getSchoolDegreeOption(schoolDegreeId);
    return option ? t(option.labelKey) : null;
  }, [schoolDegreeId, t]);

  // Get qualification labels (using short sidebar labels instead of full questions)
  const qualificationLabels = useMemo(() => {
    const labels = [];
    
    // Add academic qualification if selected (moved to reductions section)
    if (academicQualification) {
      labels.push(t("tour.sidebar.qualifications.academic"));
    }
    
    // Add other qualifications
    otherQualificationSelection.forEach((id) => {
      const option = QUALIFICATION_OPTIONS.find((opt) => opt.id === id);
      if (option) {
        labels.push(t(`tour.sidebar.qualifications.${id}`));
      }
    });
    
    return labels;
  }, [academicQualification, otherQualificationSelection, t]);

  return (
    <aside className="w-full min-w-0" aria-label={t("tour.sidebar.title")}>
      <Card className="space-y-4 xl:space-y-6" padding="p-4 xl:p-6" role="status">
        <header className="space-y-2">
          <h2 className="text-lg xl:text-xl 2xl:text-2xl font-bold text-slate-900 break-words">
            {t("tour.sidebar.title")}
          </h2>
        </header>

        <div className="space-y-3">
          {/* Basic inputs */}
          {fulltimeHours && (
            <div className="text-sm">
              <span className="font-medium text-slate-600">
                {t("tour.sidebar.fulltime")}:
              </span>{" "}
              <span className="text-slate-900">{fulltimeHours}h</span>
            </div>
          )}
          {parttimeHours && (
            <div className="text-sm">
              <span className="font-medium text-slate-600">
                {t("tour.sidebar.parttime")}:
              </span>{" "}
              <span className="text-slate-900">{parttimeHours}h</span>
            </div>
          )}
          {fullDurationMonths && (
            <div className="text-sm">
              <span className="font-medium text-slate-600">
                {t("tour.sidebar.duration")}:
              </span>{" "}
              <span className="text-slate-900">{fullDurationMonths}M</span>
            </div>
          )}

          {/* Education section - only school degree, academic moved to reductions */}
          {schoolDegree && (
            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                {t("tour.sidebar.education")}
              </div>
              <div className="text-sm text-slate-700">{schoolDegree}</div>
            </div>
          )}

          {/* Reductions section - includes academic qualification and other qualifications */}
          {(qualificationLabels.length > 0 || manualReductionMonths > 0) && (
            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                {t("tour.sidebar.reductions")}
              </div>
              {qualificationLabels.map((label, index) => (
                <div key={index} className="text-sm text-slate-700">
                  {label}
                </div>
              ))}
              {manualReductionMonths > 0 && (
                <div className="text-sm text-slate-700">
                  {t("reduction.label")}: {manualReductionMonths}{" "}
                  {t("format.months")}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </aside>
  );
}
