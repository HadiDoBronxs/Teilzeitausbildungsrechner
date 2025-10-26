import { useMemo, useState } from "react";
import "./App.css";
import FulltimeHoursInput from "./components/FulltimeHoursInput.jsx";
import ParttimeHoursInput from "./components/ParttimeHoursInput.jsx";
import RegularDurationInput from "./components/RegularDurationInput.jsx";
import ReductionMonthsInput from "./components/ReductionMonthsInput.jsx";
import ResultCard from "./features/calcDuration/ResultCard.jsx";
import Transparenz from "./routes/transparenz.jsx";

const isTransparencyPath =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/transparenz");

export default function App() {
  if (isTransparencyPath) {
    return <Transparenz />;
  }

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

  return (
    <main className="min-h-screen flex flex-col items-center gap-6 bg-gray-50 py-8 px-4">
      <h1 className="text-2xl font-bold text-center">
        Teilzeitausbildungsrechner
      </h1>
      <FulltimeHoursInput onValueChange={setFulltimeHours} />
      <ParttimeHoursInput
        fulltimeHours={fulltimeHours}
        onValueChange={setParttimeHours}
      />
      <RegularDurationInput onValueChange={setFullDurationMonths} />
      <ReductionMonthsInput
        value={reductionMonths}
        onChange={handleReductionChange}
        min={0}
      />
      <ResultCard values={formValues} />
    </main>
  );
}
