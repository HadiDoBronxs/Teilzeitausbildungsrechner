import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import FulltimeHoursInput from "./components/FulltimeHoursInput.jsx";
import ParttimeHoursInput from "./components/ParttimeHoursInput.jsx";
import RegularDurationInput from "./components/RegularDurationInput.jsx";
import ReductionMonthsInput from "./components/ReductionMonthsInput.jsx";
import ResultCard from "./features/calcDuration/ResultCard.jsx";
import Transparenz from "./routes/transparenz.jsx";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";

const isTransparencyPath =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/transparenz");

export default function App() {
  const { t } = useTranslation();
  const [fulltimeHours, setFulltimeHours] = useState(40);
  const [parttimeHours, setParttimeHours] = useState(30);
  const [fullDurationMonths, setFullDurationMonths] = useState(36);
  const [reductionMonths, setReductionMonths] = useState();

  const handleReductionChange = (raw) => {
    if (raw === "" || raw === null || raw === undefined) {
      setReductionMonths(undefined);
      return;
    }
    const parsed = parseInt(raw, 10);
    setReductionMonths(Number.isNaN(parsed) ? undefined : parsed);
  };

  const formValues = useMemo(
    () => ({
      weeklyFull: fulltimeHours,
      weeklyPart: parttimeHours,
      fullDurationMonths,
      reductionMonths,
      rounding: "round",
    }),
    [fulltimeHours, parttimeHours, fullDurationMonths, reductionMonths]
  );

  if (isTransparencyPath) {
    return <Transparenz />;
  }

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
        <h1 id={MAIN_HEADING_ID} className="text-2xl font-bold text-center">
          Teilzeitausbildungsrechner
        </h1>
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
        <ReductionMonthsInput
          value={reductionMonths}
          onChange={handleReductionChange}
          min={0}
        />
        <ResultCard values={formValues} />
      </main>
    </>
  );
}
