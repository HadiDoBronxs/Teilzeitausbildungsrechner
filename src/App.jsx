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
import {
  getReductionMonthsForDegree,
  getSchoolDegreeOption,
} from "./domain/schoolDegreeReductions.js";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";

const isTransparencyPath =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/transparenz");

export default function App() {

  if (isTransparencyPath) {
    return <Transparenz />;
  }
  return <CalculatorApp />;
}

function CalculatorApp() {
  const { t } = useTranslation();
  const defaultDegreeId = "hs";
  const [schoolDegreeId, setSchoolDegreeId] = useState(defaultDegreeId);
  const [fulltimeHours, setFulltimeHours] = useState(40);
  const [parttimeHours, setParttimeHours] = useState(30);
  const [fullDurationMonths, setFullDurationMonths] = useState(36);
  const [manualReductionMonths, setManualReductionMonths] = useState();

  const degreeReductionMonths = useMemo(
    () => getReductionMonthsForDegree(schoolDegreeId),
    [schoolDegreeId]
  );

  const handleReductionChange = (raw) => {
    if (raw === "" || raw === null || raw === undefined) {
      setManualReductionMonths(undefined);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setManualReductionMonths(undefined);
      return;
    }
    setManualReductionMonths(Math.max(0, parsed));
  };

  const handleSchoolDegreeSelect = (nextId, months) => {
    const safeId = nextId ?? null;
    setSchoolDegreeId(safeId);
    if (
      safeId === null &&
      (months === undefined || Number.isNaN(months) || months === 0)
    ) {
      return;
    }
  };

  const formValues = useMemo(
    () => ({
      weeklyFull: fulltimeHours,
      weeklyPart: parttimeHours,
      fullDurationMonths,
      reductionMonths:
        (Number.isFinite(degreeReductionMonths)
          ? degreeReductionMonths
          : 0) +
        (Number.isFinite(manualReductionMonths)
          ? manualReductionMonths
          : 0),
      degreeReductionMonths: Number.isFinite(degreeReductionMonths)
        ? degreeReductionMonths
        : 0,
      manualReductionMonths: Number.isFinite(manualReductionMonths)
        ? manualReductionMonths
        : 0,
      schoolDegreeId,
      schoolDegreeLabelKey:
        getSchoolDegreeOption(schoolDegreeId)?.labelKey ?? null,
      rounding: "round",
    }),
    [
      fulltimeHours,
      parttimeHours,
      fullDurationMonths,
      degreeReductionMonths,
      manualReductionMonths,
      schoolDegreeId,
    ]
  );

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
        <FulltimeHoursInput
          onValueChange={(raw) => {
            // Guard empty string / null / undefined coming from the input
            if (raw === "" || raw === null || raw === undefined) {
              setFulltimeHours(40);
              return;
            }
            const n = Number(raw);
            setFulltimeHours(Number.isNaN(n) ? 40 : n);
          }}
        />
        <ParttimeHoursInput
          fulltimeHours={fulltimeHours}
          onValueChange={(raw) => {
            // Keep parttime in numeric form for the formValues object.
            if (raw === "" || raw === null || raw === undefined) {
              setParttimeHours(undefined);
              return;
            }
            const n = Number(raw);
            setParttimeHours(Number.isNaN(n) ? 30 : n);
          }}
        />
        <RegularDurationInput onValueChange={setFullDurationMonths} />
        <SchoolDegreeReductionSelect
          value={schoolDegreeId ?? ""}
          onChange={handleSchoolDegreeSelect}
        />
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
