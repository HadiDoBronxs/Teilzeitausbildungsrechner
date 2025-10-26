import { calculateDuration } from "../../domain/trainingDuration/calc";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const readFormAndCalc = ({
  weeklyFull,
  weeklyPart,
  fullDurationMonths,
  reductionMonths = 0,
  rounding = "round",
  minDurationMonths,
}) =>
  calculateDuration({
    weeklyFull: toNumber(weeklyFull),
    weeklyPart: toNumber(weeklyPart),
    fullDurationMonths: toNumber(fullDurationMonths),
    reductionMonths: toNumber(reductionMonths ?? 0),
    rounding,
    minDurationMonths:
      minDurationMonths === undefined || minDurationMonths === ""
        ? undefined
        : toNumber(minDurationMonths),
  });

export default readFormAndCalc;
