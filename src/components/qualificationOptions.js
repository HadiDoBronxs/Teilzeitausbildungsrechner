// Contains all recognized qualification reasons together with their maximum reduction.
export const QUALIFICATION_OPTIONS = [
  { id: "familyCare", maxMonths: 12, labelKey: "qualifications.familyCare" },
  { id: "ageOver21", maxMonths: 12, labelKey: "qualifications.ageOver21" },
  { id: "completedTraining", maxMonths: 12, labelKey: "qualifications.completedTraining" },
  { id: "vocationalExperience", maxMonths: 12, labelKey: "qualifications.vocationalExperience" },
  { id: "academic", maxMonths: 12, labelKey: "qualifications.academic" },
  { id: "foreignRecognition", maxMonths: 12, labelKey: "qualifications.foreignRecognition" }
];

// Absolute cap for all qualification-based reductions (specified as 12 months).
export const MAX_QUALIFICATION_REDUCTION = 12;

/**
 * Sums up the selected qualifications and returns both the raw and capped totals.
 * Keeping this in one place prevents divergent calculations across the UI.
 */
export function summarizeQualificationSelection(selectedIds = []) {
  const rawTotal = selectedIds.reduce((sum, id) => {
    const option = QUALIFICATION_OPTIONS.find((item) => item.id === id);
    return sum + (option?.maxMonths || 0);
  }, 0);
  const cappedTotal = Math.min(rawTotal, MAX_QUALIFICATION_REDUCTION);
  return { rawTotal, cappedTotal };
}
