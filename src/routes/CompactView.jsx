// CompactView.jsx – Compact design mode showing all inputs in a single view.
// Desktop: Shows results in a sidebar. Mobile: Shows results in a bottom bar plus a floating "scroll to top" button.

import FulltimeHoursInput from "../components/FulltimeHoursInput.jsx";
import ParttimeHoursInput from "../components/ParttimeHoursInput.jsx";
import RegularDurationInput from "../components/RegularDurationInput.jsx";
import SchoolDegreeReductionSelect from "../components/SchoolDegreeReductionSelect.jsx";
import QualificationReductions from "../components/QualificationReductions.jsx";
import LanguageToggle from "../components/LanguageToggle.jsx";
import ResultCard from "../features/calcDuration/ResultCard.jsx";
import ResultSidebar from "../components/ResultSidebar.jsx";
import ResultBottomBar from "../components/ResultBottomBar.jsx";
import PDFViewer from "../components/PDFViewer.jsx";
import Button from "../components/ui/Button.jsx";
import ThemeToggle from "../components/ThemeToggle.jsx";
import Card from "../components/ui/Card.jsx";
import { useCalculator } from "../features/calcDuration/useCalculator.js";
import { useUnsavedChangesWarning } from "../features/calcDuration/useUnsavedChangesWarning.js";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";
const RESULT_CARD_ID = "result-card";

/**
 * CompactView – full calculator in one page layout.
 * Responsive behavior:
 * - Desktop: full layout + sticky sidebar
 * - Mobile: main content + bottom bar + floating scroll-to-top button
 */

const ArrowDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

export default function CompactView() {
  const {
    t,
    schoolDegreeId,
    fulltimeHours,
    parttimeHours,
    handleSchoolDegreeSelect,
    handleFulltimeHoursChange,
    handleParttimeHoursChange,
    setFullDurationMonths,
    qualificationSelection,
    setQualificationSelection,
    setQualificationTotals,
    formValues,
    showLegalHint,
    pdfBytes,
    isGeneratingPDF,
    handleSaveAsPDF,
    handleClosePDF,
    resetCount,
    handleReset,
  } = useCalculator();

  // Set up browser warning when user tries to close tab with unsaved changes
  useUnsavedChangesWarning({
    fulltimeHours,
    parttimeHours,
    fullDurationMonths: formValues.fullDurationMonths,
    schoolDegreeId,
    qualificationSelection,
  });

  return (
    <>
      {/* Accessibility skip link */}
      <a className="skip-link" href={`#${MAIN_ID}`}>
        {t("skipToMain")}
      </a>

      <main
        id={MAIN_ID}
        tabIndex="-1"
        aria-labelledby={MAIN_HEADING_ID}
        className="min-h-screen flex flex-col items-center gap-6 bg-gray-50 dark:bg-[#0B0E14] dark:text-slate-50 py-8 px-4"
      >
        {/* Desktop grid layout */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(0,672px)_minmax(200px,280px)] xl:grid-cols-[minmax(280px,320px)_minmax(0,672px)_minmax(280px,320px)] lg:gap-4 xl:gap-6 2xl:gap-8">
          {/* Desktop spacer column */}
          <div className="hidden lg:block" />

          {/* Main content column */}
          <div className="w-full max-w-2xl flex flex-col items-center gap-4 mx-auto">
            <div className="w-full flex flex-col items-center gap-4">
              {/* Back button above title */}
              <div className="w-full flex items-center justify-between">
                <Button
                  onClick={() => {
                    window.location.hash = "";
                  }}
                  variant="secondary"
                  size="sm"
                  ariaLabel={t("welcome.backButton")}
                  className="self-start"
                >
                  ← {t("welcome.backButton")}
                </Button>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>
              </div>

              {/* Page headline */}
              <h1
                id={MAIN_HEADING_ID}
                className="text-2xl font-bold text-center min-h-[4.5rem] max-w-sm mx-auto line-clamp-3"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {t("app.titleMobile")}
              </h1>
            </div>

            {/* All input fields */}
            <FulltimeHoursInput
              key={`ft-${resetCount}`}
              onValueChange={handleFulltimeHoursChange}
            />
            <ParttimeHoursInput
              key={`pt-${resetCount}`}
              fulltimeHours={fulltimeHours}
              onValueChange={handleParttimeHoursChange}
            />
            <RegularDurationInput
              key={`rd-${resetCount}`}
              onValueChange={setFullDurationMonths}
            />
            {/* Degree select provides the automatic reduction months. */}
            <SchoolDegreeReductionSelect
              value={schoolDegreeId ?? ""}
              onChange={handleSchoolDegreeSelect}
            />
            <QualificationReductions
              value={qualificationSelection}
              onChange={setQualificationSelection}
              onTotalChange={setQualificationTotals}
            />

            {/* Legal notice if applicable */}
            {showLegalHint && (
              <Card
                variant="default"
                padding="p-4"
                role="note"
                className="bg-amber-50 border-amber-200"
              >
                <p className="text-xs text-amber-700">
                  {t("qualifications.legalHint")}
                </p>
              </Card>
            )}

            {/* Scroll to Results Button */}
            <Button
              onClick={() => {
                document.getElementById(RESULT_CARD_ID)?.scrollIntoView({ behavior: "smooth" });
              }}
              variant="secondary"
              size="lg"
              className="w-full my-4 shadow-sm"
              icon={<ArrowDownIcon />}
            >
              {t("result.navigation.scrollToResults")}
            </Button>

            {/* Result card */}
            <div id={RESULT_CARD_ID} className="w-full">
              <ResultCard values={formValues} />
            </div>

            {/* Save as PDF button */}
            <Button
              onClick={handleSaveAsPDF}
              disabled={isGeneratingPDF}
              variant="brand"
              size="lg"
              className="w-full rounded-xl"
            >
              {isGeneratingPDF ? "Generating PDF..." : t("pdf.saveButton")}
            </Button>

            {/* Reset button */}
            <Button
              onClick={handleReset}
              variant="ghost"
              size="md"
              className="w-full text-slate-500 justify-center"
              ariaLabel={t("app.reset_explained")}
            >
              {t("app.reset")}
            </Button>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start lg:h-fit">
            <ResultSidebar values={formValues} />
          </div>
        </div>

        {/* MOBILE: Floating Scroll-To-Top Button */}
        <div className="lg:hidden fixed right-4 bottom-[10%] z-50">
          <Button
            variant="pill"
            size="sm"
            ariaLabel={t("result.navigation.scrollToTop")}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑ {t("result.navigation.scrollToTop")}
          </Button>
        </div>

        {/* Mobile bottom bar */}
        <ResultBottomBar values={formValues} resultCardId={RESULT_CARD_ID} />
      </main>

      {/* PDF viewer modal */}
      {pdfBytes && <PDFViewer pdfBytes={pdfBytes} onClose={handleClosePDF} />}
    </>
  );
}
