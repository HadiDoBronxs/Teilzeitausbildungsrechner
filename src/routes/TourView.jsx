// TourView.jsx – Guided tour design mode with tabbed navigation.
// Organizes calculator inputs into step-by-step tabs with explanations.
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../components/ThemeToggle.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import TourTabs from "../components/TourTabs.jsx";
import TourSidebar from "../components/TourSidebar.jsx";
import PDFViewer from "../components/PDFViewer.jsx";
import FAQSection from "../components/faq/FAQSection.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import InputsTab from "./tour/InputsTab.jsx";
import EducationTab from "./tour/EducationTab.jsx";
import ReductionsTab from "./tour/ReductionsTab.jsx";
import ResultsTab from "./tour/ResultsTab.jsx";
import { useCalculator } from "../features/calcDuration/useCalculator.js";
import { useUnsavedChangesWarning } from "../features/calcDuration/useUnsavedChangesWarning.js";
import { readFormAndCalc } from "../features/calcDuration/readFormAndCalc.js";
import { isFulltimeHoursValid } from "../components/FulltimeHoursInput.constants.js";
import { isParttimeHoursValid } from "../components/ParttimeHoursInput.helpers.js";
import { isRegularDurationValid } from "../components/RegularDurationInput.constants.js";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";

/**
 * TourView component - Guided tour design mode for the calculator.
 * Displays inputs organized into tabs with step-by-step guidance.
 * Uses the shared useCalculator hook and input components (no logic duplication).
 * Responsive layout:
 * - Desktop: Main content + sidebar with current inputs summary
 * - Mobile: Main content only (sidebar hidden)
 */
export default function TourView() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("inputs");

  const {
    // State
    schoolDegreeId,
    fulltimeHours,
    parttimeHours,
    wantsReduction: currentWantsReduction,
    manualReductionMonths,
    academicQualification,
    otherQualificationSelection,
    attendedUniversity,
    hasEcts,

    // Computed / Results
    formValues,

    // PDF State
    pdfBytes,
    isGeneratingPDF,

    // Handlers / Setters
    handleSchoolDegreeSelect,
    handleFulltimeHoursChange,
    handleParttimeHoursChange,
    setFullDurationMonths,
    handleWantsReductionChange,
    handleAcademicQualificationChange,
    handleOtherQualificationChange,
    handleAttendedUniversityChange,
    handleHasEctsChange,
    handleSaveAsPDF,
    handleClosePDF,
    handleReset,
  } = useCalculator();

  // Initialize wantsReduction to "no" when component mounts (if not already set)
  // This ensures tour mode is active
  useEffect(() => {
    if (currentWantsReduction === null) {
      handleWantsReductionChange("no");
    }
  }, [currentWantsReduction, handleWantsReductionChange]);

  const wantsReduction = currentWantsReduction ?? "no";

  // Set up browser warning when user tries to close tab with unsaved changes
  useUnsavedChangesWarning({
    fulltimeHours,
    parttimeHours,
    fullDurationMonths: formValues.fullDurationMonths,
    schoolDegreeId,
    wantsReduction,
    manualReductionMonths,
    academicQualification,
    otherQualificationSelection,
    attendedUniversity,
    hasEcts,
  });

  // Validate inputs using the same validation functions as the input components
  // This ensures tabs/buttons are disabled when inputs are out of valid ranges
  const areInputsValid = useMemo(() => {
    // Check fulltime hours: must be between 35-48
    const fulltimeValid = fulltimeHours != null &&
      !Number.isNaN(Number(fulltimeHours)) &&
      isFulltimeHoursValid(String(fulltimeHours));

    // Check parttime hours: must be within valid range based on fulltime hours
    const parttimeValid = parttimeHours != null &&
      !Number.isNaN(Number(parttimeHours)) &&
      isParttimeHoursValid(String(parttimeHours), fulltimeHours);

    // Check duration: must be between 12-48 months
    const durationValid = formValues.fullDurationMonths != null &&
      !Number.isNaN(Number(formValues.fullDurationMonths)) &&
      isRegularDurationValid(String(formValues.fullDurationMonths));

    return fulltimeValid && parttimeValid && durationValid;
  }, [fulltimeHours, parttimeHours, formValues.fullDurationMonths]);



  // Compute result to check if inputs are valid (tabs should be disabled if result.allowed === false)
  const result = useMemo(
    () => readFormAndCalc(formValues),
    [formValues]
  );

  // Tabs should be disabled if inputs are invalid (either validation fails OR result.allowed === false)
  const areTabsDisabled = !areInputsValid || !result || result.allowed === false;



  // Determine next tab based on current tab and wantsReduction preference
  // Prevent navigation if inputs are invalid
  function handleNext() {
    // Don't allow navigation if inputs are invalid
    if (areTabsDisabled) {
      return;
    }

    if (activeTab === "inputs") {
      // If reduction is "no", skip to results, otherwise go to education
      setActiveTab(wantsReduction === "no" ? "results" : "education");
    } else if (activeTab === "education") {
      setActiveTab("reductions");
    } else if (activeTab === "reductions") {
      setActiveTab("results");
    }
  }

  function handleBack() {
    // Back navigation is always allowed (user can go back to fix inputs)
    if (activeTab === "results") {
      // If reduction is "no", go back to inputs, otherwise go to reductions
      setActiveTab(wantsReduction === "no" ? "inputs" : "reductions");
    } else if (activeTab === "reductions") {
      setActiveTab("education");
    } else if (activeTab === "education") {
      setActiveTab("inputs");
    }
  }

  function handleTabChange(tabId) {
    // Don't allow tab changes if inputs are invalid
    // Exception: allow going back to inputs tab to fix invalid inputs
    if (areTabsDisabled && tabId !== "inputs") {
      return;
    }
    setActiveTab(tabId);
  }

  // When wantsReduction changes, adjust active tab if needed
  // If switching to "no" and we're on education/reductions, go to results
  useEffect(() => {
    if (wantsReduction === "no" && (activeTab === "education" || activeTab === "reductions")) {
      setActiveTab("results");
    }
  }, [wantsReduction, activeTab]);

  return (
    <>
      {/* Skip link for screen readers and keyboard users to jump to content. */}
      <a className="skip-link" href={`#${MAIN_ID}`}>
        {t("skipToMain")}
      </a>
      <main
        id={MAIN_ID}
        tabIndex="-1"
        aria-labelledby={MAIN_HEADING_ID}
        className="min-h-screen bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-50 px-4 py-12 sm:py-16"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with title, back button, and language toggle */}
          {/* Mobile: back button and language above title */}
          {/* Desktop: back button + title on left, language on right */}
          <div className="mb-4 sm:mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            {/* Mobile: back button and language toggle row */}
            {/* Desktop: back button + title row */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
              <div className="w-full flex items-center justify-between lg:w-auto lg:justify-start">
                <Button
                  onClick={() => {
                    window.location.hash = "";
                  }}
                  variant="secondary"
                  size="sm"
                  ariaLabel={t("welcome.backButton")}
                  className="self-start lg:self-auto"
                >
                  ← {t("welcome.backButton")}
                </Button>
                <div className="lg:hidden flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>
              </div>
              <h1
                id={MAIN_HEADING_ID}
                className="text-xl sm:text-2xl md:text-3xl font-bold lg:whitespace-nowrap"
              >
                <span className="lg:hidden">{t("app.titleMobile")}</span>
                <span className="hidden lg:inline">{t("app.title")}</span>
              </h1>
            </div>
            {/* Desktop: language toggle on right */}
            <div className="hidden lg:flex lg:flex-shrink-0 lg:items-center lg:gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>

          {/* Responsive layout: grid with main content and sidebar (sidebar hidden on mobile) */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] gap-4 sm:gap-6 lg:gap-6 xl:gap-8">
            {/* Main content area */}
            <div className="w-full min-w-0">
              <Card className="space-y-4 sm:space-y-6" padding="p-4 sm:p-6 lg:p-8">
                {/* Tab navigation */}
                <TourTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  wantsReduction={wantsReduction}
                  disabled={areTabsDisabled}
                />

                {/* Tab content */}
                <div className="pt-6">
                  {activeTab === "inputs" && (
                    <InputsTab
                      fulltimeHours={fulltimeHours}
                      parttimeHours={parttimeHours}
                      onFulltimeChange={handleFulltimeHoursChange}
                      onParttimeChange={handleParttimeHoursChange}
                      onDurationChange={setFullDurationMonths}
                      wantsReduction={wantsReduction || "no"}
                      onWantsReductionChange={handleWantsReductionChange}
                      onNext={handleNext}
                      isDisabled={areTabsDisabled}
                    />
                  )}

                  {activeTab === "education" && (
                    <EducationTab
                      schoolDegreeId={schoolDegreeId}
                      onSchoolDegreeChange={handleSchoolDegreeSelect}
                      attendedUniversity={attendedUniversity}
                      onAttendedUniversityChange={handleAttendedUniversityChange}
                      hasEcts={hasEcts}
                      onHasEctsChange={handleHasEctsChange}
                      onAcademicQualificationChange={handleAcademicQualificationChange}
                      onBack={handleBack}
                      onNext={handleNext}
                    />
                  )}

                  {activeTab === "reductions" && (
                    <ReductionsTab
                      otherQualificationSelection={otherQualificationSelection}
                      onOtherQualificationChange={handleOtherQualificationChange}
                      onBack={handleBack}
                      onNext={handleNext}
                    />
                  )}

                  {activeTab === "results" && (
                    <ResultsTab
                      formValues={formValues}
                      onBack={handleBack}
                      onSaveAsPDF={handleSaveAsPDF}
                      isGeneratingPDF={isGeneratingPDF}
                      onReset={() => {
                        handleReset();
                        setActiveTab("inputs");
                      }}
                    />
                  )}
                </div>
              </Card>

              {/* FAQ Section - only shown on results tab */}
              {activeTab === "results" && (
                <div className="mt-6">
                  <FAQSection />
                </div>
              )}
            </div>

            {/* Desktop sidebar with current inputs summary - hidden on mobile, sticky on desktop */}
            <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start lg:h-fit">
              <TourSidebar
                fulltimeHours={fulltimeHours}
                parttimeHours={parttimeHours}
                fullDurationMonths={formValues.fullDurationMonths || 0}
                schoolDegreeId={wantsReduction === "no" ? null : schoolDegreeId}
                academicQualification={wantsReduction === "no" ? false : academicQualification}
                otherQualificationSelection={otherQualificationSelection}
                manualReductionMonths={manualReductionMonths}
              />
            </aside>
          </div>
        </div>
      </main>
      {pdfBytes && (
        <PDFViewer pdfBytes={pdfBytes} onClose={handleClosePDF} />
      )}
    </>
  );
}
