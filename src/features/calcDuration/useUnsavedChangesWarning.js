// useUnsavedChangesWarning.js – Custom hook to warn users when closing tab with unsaved form changes.
// Used in CompactView and TourView to prevent accidental data loss.
// Uses the browser's beforeunload event to show a warning dialog when form values differ from defaults.
import { useEffect, useMemo } from "react";

// Default values match those in useCalculator.js
const DEFAULT_FULLTIME_HOURS = 40;
const DEFAULT_PARTTIME_HOURS = 30;
const DEFAULT_DURATION_MONTHS = 36;
const DEFAULT_DEGREE_ID = null;
const DEFAULT_WANTS_REDUCTION = "no";
const DEFAULT_MANUAL_REDUCTION = 0;
const DEFAULT_ACADEMIC_QUALIFICATION = false;
const DEFAULT_OTHER_QUALIFICATION = [];
const DEFAULT_ATTENDED_UNIVERSITY = null;
const DEFAULT_HAS_ECTS = null;

/**
 * Custom hook to warn users when they try to close the tab with unsaved changes.
 * Uses the browser's beforeunload event to show a warning dialog.
 * 
 * @param {Object} formState - Current form state values
 * @param {number} [formState.fulltimeHours] - Current fulltime hours value
 * @param {number|undefined} [formState.parttimeHours] - Current parttime hours value
 * @param {number} [formState.fullDurationMonths] - Current duration in months
 * @param {string|null} [formState.schoolDegreeId] - Current school degree ID
 * @param {string} [formState.wantsReduction] - Current wants reduction value (tour mode)
 * @param {number} [formState.manualReductionMonths] - Current manual reduction months (tour mode)
 * @param {boolean} [formState.academicQualification] - Current academic qualification (tour mode)
 * @param {string[]} [formState.otherQualificationSelection] - Current other qualification selection (tour mode)
 * @param {string|null} [formState.attendedUniversity] - Current attended university value (tour mode)
 * @param {string|null} [formState.hasEcts] - Current has ECTS value (tour mode)
 * @param {string[]} [formState.qualificationSelection] - Current qualification selection (compact mode)
 */
export function useUnsavedChangesWarning(formState = {}) {
  const {
    fulltimeHours,
    parttimeHours,
    fullDurationMonths,
    schoolDegreeId,
    wantsReduction,
    manualReductionMonths,
    academicQualification,
    otherQualificationSelection,
    attendedUniversity,
    hasEcts,
    qualificationSelection,
  } = formState;

  // Check if form has unsaved changes by comparing current state to defaults
  // Supports both compact mode (qualificationSelection) and tour mode (tour-specific fields)
  // Note: parttimeHours can be undefined when cleared, which is different from the default (30)
  const hasUnsavedChanges = useMemo(() => {
    // Helper to check if a field was provided in formState (exists as a key)
    const wasProvided = (key) => key in formState;

    // Compact mode: check basic fields + qualificationSelection
    // Check if values differ from defaults
    // For parttimeHours: if provided and undefined, that's a change from default (30)
    const compactModeChanged =
      (wasProvided("fulltimeHours") && fulltimeHours !== DEFAULT_FULLTIME_HOURS) ||
      (wasProvided("parttimeHours") && parttimeHours !== DEFAULT_PARTTIME_HOURS) ||
      (wasProvided("fullDurationMonths") && fullDurationMonths !== DEFAULT_DURATION_MONTHS) ||
      (wasProvided("schoolDegreeId") && schoolDegreeId !== DEFAULT_DEGREE_ID) ||
      (wasProvided("qualificationSelection") &&
        JSON.stringify(qualificationSelection) !== JSON.stringify([]));

    // Tour mode: check tour-specific fields
    const tourModeChanged =
      (wasProvided("wantsReduction") && wantsReduction !== DEFAULT_WANTS_REDUCTION) ||
      (wasProvided("manualReductionMonths") && manualReductionMonths !== DEFAULT_MANUAL_REDUCTION) ||
      (wasProvided("academicQualification") && academicQualification !== DEFAULT_ACADEMIC_QUALIFICATION) ||
      (wasProvided("otherQualificationSelection") &&
        JSON.stringify(otherQualificationSelection) !== JSON.stringify(DEFAULT_OTHER_QUALIFICATION)) ||
      (wasProvided("attendedUniversity") && attendedUniversity !== DEFAULT_ATTENDED_UNIVERSITY) ||
      (wasProvided("hasEcts") && hasEcts !== DEFAULT_HAS_ECTS);

    return compactModeChanged || tourModeChanged;
  }, [
    formState,
    fulltimeHours,
    parttimeHours,
    fullDurationMonths,
    schoolDegreeId,
    wantsReduction,
    manualReductionMonths,
    academicQualification,
    otherQualificationSelection,
    attendedUniversity,
    hasEcts,
    qualificationSelection,
  ]);

  // Set up browser warning when user tries to close tab with unsaved changes
  // This uses the beforeunload event which browsers use to show a warning dialog
  useEffect(() => {
    // Only show warning if there are unsaved changes
    if (!hasUnsavedChanges) {
      return;
    }

    function handleBeforeUnload(event) {
      // Modern browsers require preventDefault() to show the warning dialog
      // The return value is ignored by modern browsers, but kept for older browser support
      event.preventDefault();
      // Modern browsers ignore custom messages and show their own generic warning
      // (e.g., "Changes you made may not be saved")
      event.returnValue = ""; // Required for Chrome
      return ""; // Required for some older browsers
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup: remove event listener when component unmounts or when there are no unsaved changes
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}
