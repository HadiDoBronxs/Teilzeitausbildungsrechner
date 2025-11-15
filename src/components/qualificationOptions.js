// Enthält alle anerkannten Qualifikationsgründe samt maximaler Verkürzung.
export const QUALIFICATION_OPTIONS = [
  { id: "familyCare", maxMonths: 12, labelKey: "qualifications.familyCare" },
  { id: "ageOver21", maxMonths: 12, labelKey: "qualifications.ageOver21" },
  { id: "completedTraining", maxMonths: 12, labelKey: "qualifications.completedTraining" },
  { id: "vocationalFoundation", maxMonths: 12, labelKey: "qualifications.vocationalFoundation" },
  { id: "vocationalExperience", maxMonths: 12, labelKey: "qualifications.vocationalExperience" },
  { id: "academic", maxMonths: 12, labelKey: "qualifications.academic" },
  { id: "foreignRecognition", maxMonths: 12, labelKey: "qualifications.foreignRecognition" }
];

// Absolute Deckelung der Summe aus Qualifikationsgründen (laut Vorgabe 12 Monate).
export const MAX_QUALIFICATION_REDUCTION = 12;

/**
 * Summiert die ausgewählten Qualifikationen und liefert sowohl die Rohsumme als
 * auch den gedeckelten Wert zurück. So steht die Logik zentral zur Verfügung.
 */
export function summarizeQualificationSelection(selectedIds = []) {
  const rawTotal = selectedIds.reduce((sum, id) => {
    const option = QUALIFICATION_OPTIONS.find((item) => item.id === id);
    return sum + (option?.maxMonths || 0);
  }, 0);
  const cappedTotal = Math.min(rawTotal, MAX_QUALIFICATION_REDUCTION);
  return { rawTotal, cappedTotal };
}
