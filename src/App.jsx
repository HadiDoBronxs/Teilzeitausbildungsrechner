import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import FulltimeHoursInput from "./components/FulltimeHoursInput.jsx";
import ParttimeHoursInput from "./components/ParttimeHoursInput.jsx";
import RegularDurationInput from "./components/RegularDurationInput.jsx";
import ReductionMonthsInput from "./components/ReductionMonthsInput.jsx";
import SchoolDegreeReductionSelect from "./components/SchoolDegreeReductionSelect.jsx";
import LanguageToggle from "./components/LanguageToggle.jsx";
import ResultCard from "./features/calcDuration/ResultCard.jsx";
import Transparenz from "./routes/transparenz.jsx";
import { buildReductionSummary } from "./domain/schoolDegreeReductions.js";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";
// Default values keep the calculator stable on the initial render.
const DEFAULT_DEGREE_ID = "hs";
const DEFAULT_FULLTIME_HOURS = 40;
const DEFAULT_PARTTIME_HOURS = 30;
const DEFAULT_DURATION_MONTHS = 36;

const isTransparencyPath =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/transparenz");

// Treat empty strings, null, and undefined the same to simplify input handling.
function isEmptyValue(value) {
  return value === "" || value === null || value === undefined;
}

// Convert the manual reduction input into a safe, non-negative integer.
function sanitizeManualReduction(raw) {
  if (isEmptyValue(raw)) {
    return undefined;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return Math.max(0, parsed);
}

export default function App() {
  // Render the dedicated transparency route when accessed directly, otherwise fall back to the calculator.
  if (isTransparencyPath) {
    return <Transparenz />;
  }
  return <CalculatorApp />;
}

function CalculatorApp() {
  const { t } = useTranslation();
  const [schoolDegreeId, setSchoolDegreeId] = useState(DEFAULT_DEGREE_ID);
  const [fulltimeHours, setFulltimeHours] = useState(DEFAULT_FULLTIME_HOURS);
  const [parttimeHours, setParttimeHours] = useState(DEFAULT_PARTTIME_HOURS);
  const [fullDurationMonths, setFullDurationMonths] =
    useState(DEFAULT_DURATION_MONTHS);
  const [manualReductionMonths, setManualReductionMonths] = useState();

  // Keep the manual reduction state clean whenever the user types: no NaN, no negatives.
  function handleReductionChange(raw) {
    setManualReductionMonths(sanitizeManualReduction(raw));
  }

  // Persist the selected degree ID (or null when the placeholder is chosen) so the downstream calculation can reference it.
  function handleSchoolDegreeSelect(nextId) {
    setSchoolDegreeId(nextId ?? null);
  }

  function handleFulltimeHoursChange(raw) {
    if (isEmptyValue(raw)) {
      // Reset to the default full-time hours when the field is cleared.
      setFulltimeHours(DEFAULT_FULLTIME_HOURS);
      return;
    }
    const parsed = Number(raw);
    setFulltimeHours(Number.isNaN(parsed) ? DEFAULT_FULLTIME_HOURS : parsed);
  }

  function handleParttimeHoursChange(raw) {
    if (isEmptyValue(raw)) {
      // An empty input means “no value yet”, so we clear the state.
      setParttimeHours(undefined);
      return;
    }
    const parsed = Number(raw);
    setParttimeHours(Number.isNaN(parsed) ? DEFAULT_PARTTIME_HOURS : parsed);
  }

  function buildFormValues() {
    // Assemble all pieces that the calculation feature needs in one place.
    const reductionSummary = buildReductionSummary({
      schoolDegreeId,
      manualReductionMonths,
    });

    return {
      // These keys are consumed by readFormAndCalc. Changing them would break the calculator.
      weeklyFull: fulltimeHours,
      weeklyPart: parttimeHours,
      fullDurationMonths,
      reductionMonths: reductionSummary.total,
      degreeReductionMonths: reductionSummary.degree,
      manualReductionMonths: reductionSummary.manual,
      schoolDegreeId,
      schoolDegreeLabelKey: reductionSummary.labelKey,
      rounding: "round",
    };
  }

  const formValues = useMemo(buildFormValues, [
    fulltimeHours,
    parttimeHours,
    fullDurationMonths,
    manualReductionMonths,
    schoolDegreeId,
  ]);

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
        {/* Manual reduction captures any additional reasons (e.g. Berufsschule performance). */}
        <ReductionMonthsInput
          value={manualReductionMonths}
          onChange={handleReductionChange}
          min={0}
        />
        <ResultCard values={formValues} />
      </main>
    </>
  );
}
