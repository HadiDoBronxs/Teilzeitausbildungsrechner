import { Suspense, lazy } from "react";
import "./App.css";
import FulltimeHoursInput from "./components/FulltimeHoursInput.jsx";
import ParttimeHoursInput from "./components/ParttimeHoursInput.jsx";
import RegularDurationInput from "./components/RegularDurationInput.jsx";
import SchoolDegreeReductionSelect from "./components/SchoolDegreeReductionSelect.jsx";
import QualificationReductions from "./components/QualificationReductions.jsx";
import LanguageToggle from "./components/LanguageToggle.jsx";
import ResultCard from "./features/calcDuration/ResultCard.jsx";
import PDFViewer from "./components/PDFViewer.jsx";
import Button from "./components/ui/Button.jsx";
import { useCalculator } from "./features/calcDuration/useCalculator.js";

// Lazy load the "satellite" pages to reduce the initial bundle size for the main calculator.
const LegalBasisPage = lazy(() => import("./routes/legal.jsx"));
const Transparenz = lazy(() => import("./routes/transparenz.jsx"));

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";

const isTransparencyPath =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/transparenz");
const isLegalPath =
  typeof window !== "undefined" && window.location.pathname.startsWith("/legal");

// Minimal loading fallback
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-slate-500 font-medium animate-pulse">Loading...</div>
  </div>
);

export default function App() {
  // Render the dedicated transparency route when accessed directly, otherwise fall back to the calculator.
  if (isTransparencyPath) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Transparenz />
      </Suspense>
    );
  }
  // Serve the legal basis placeholder on /legal so the link can ship ahead of the finalized content.
  if (isLegalPath) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LegalBasisPage />
      </Suspense>
    );
  }
  return <CalculatorApp />;
}

function CalculatorApp() {
  const {
    t,
    schoolDegreeId,
    fulltimeHours,
    // (parttimeHours is handled inside, but we need it if we wanted to show it ?)
    // actually ParttimeHoursInput needs onValueChange, not value usually, but let's check
    // Hook returns: handleParttimeHoursChange
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
        <div className="w-full max-w-2xl flex flex-col items-center gap-4">
          <h1 id={MAIN_HEADING_ID} className="text-2xl font-bold text-center">
            {t("app.title")}
          </h1>
          <LanguageToggle />
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
        <ResultCard values={formValues} />
        <Button
          onClick={handleSaveAsPDF}
          disabled={isGeneratingPDF}
          variant="brand"
          size="lg"
          className="w-full max-w-2xl rounded-xl"
        >
          {isGeneratingPDF ? "Generating PDF..." : t("pdf.saveButton")}
        </Button>
      </main>
      {pdfBytes && <PDFViewer pdfBytes={pdfBytes} onClose={handleClosePDF} />}
    </>
  );
}
