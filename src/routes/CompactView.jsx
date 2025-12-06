// CompactView.jsx – Compact design mode showing all inputs in a single view.
// Uses the same useCalculator hook and input components as the original calculator.
// Desktop: Shows results in a sidebar. Mobile: Shows results in a bottom bar when ResultCard is not visible.
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
import { useCalculator } from "../features/calcDuration/useCalculator.js";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";
const RESULT_CARD_ID = "result-card";

/**
 * CompactView component - compact design mode for the calculator.
 * Displays all input fields in a single view, similar to the original calculator.
 * Uses the shared useCalculator hook and input components (no logic duplication).
 * Responsive layout:
 * - Desktop: Main content + sidebar with simplified results
 * - Mobile: Main content + bottom bar (when ResultCard not visible)
 */
export default function CompactView() {
  const {
    t,
    schoolDegreeId,
    fulltimeHours,
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
  } = useCalculator();

  return (
    <>
      <a className="skip-link" href={`#${MAIN_ID}`}>
        {t("skipToMain")}
      </a>
      <main
        id={MAIN_ID}
        tabIndex="-1"
        aria-labelledby={MAIN_HEADING_ID}
        className="min-h-screen flex flex-col items-center gap-6 bg-gray-50 py-8 px-4"
      >
        {/* Desktop layout: grid with centered calculator and sticky sidebar */}
        {/* Sidebar columns use minmax to allow shrinking on smaller screens, calculator column is constrained to prevent layout shift */}
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[minmax(200px,280px)_minmax(0,672px)_minmax(200px,280px)] xl:grid-cols-[minmax(280px,320px)_minmax(0,672px)_minmax(280px,320px)] lg:gap-4 xl:gap-6 2xl:gap-8">
          {/* Left spacer column (empty on desktop, matches sidebar width) */}
          <div className="hidden lg:block" />

          {/* Main content area - centered calculator */}
          {/* Fixed max-width to prevent layout shift when switching languages */}
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
                <LanguageToggle />
              </div>
              <h1 
                id={MAIN_HEADING_ID} 
                className="text-2xl font-bold text-center min-h-[4.5rem] max-w-sm mx-auto line-clamp-3"
                style={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  hyphens: 'auto'
                }}
              >
                {t("app.title")}
              </h1>
            </div>
            <FulltimeHoursInput onValueChange={handleFulltimeHoursChange} />
            <ParttimeHoursInput
              fulltimeHours={fulltimeHours}
              onValueChange={handleParttimeHoursChange}
            />
            <RegularDurationInput onValueChange={setFullDurationMonths} />
            {/* Degree select provides the automatic IHK/HWK reduction months. */}
            <SchoolDegreeReductionSelect
              value={schoolDegreeId ?? ""}
              onChange={handleSchoolDegreeSelect}
            />
            <QualificationReductions
              value={qualificationSelection}
              onChange={setQualificationSelection}
              onTotalChange={setQualificationTotals}
            />
            {showLegalHint && (
              <p className="text-xs text-amber-700" role="note">
                {t("qualifications.legalHint")}
              </p>
            )}
            <div id={RESULT_CARD_ID} className="w-full">
              <ResultCard values={formValues} />
            </div>
            <Button
              onClick={handleSaveAsPDF}
              disabled={isGeneratingPDF}
              variant="brand"
              size="lg"
              className="w-full rounded-xl"
            >
              {isGeneratingPDF ? "Generating PDF..." : t("pdf.saveButton")}
            </Button>
          </div>

          {/* Desktop sidebar with simplified results - sticky */}
          <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start lg:h-fit">
            <ResultSidebar values={formValues} />
          </div>
        </div>

        {/* Mobile bottom bar (only shows when ResultCard is not visible) */}
        <ResultBottomBar values={formValues} resultCardId={RESULT_CARD_ID} />
      </main>
      {pdfBytes && <PDFViewer pdfBytes={pdfBytes} onClose={handleClosePDF} />}
    </>
  );
}

