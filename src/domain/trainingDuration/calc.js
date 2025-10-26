const clampRoundingMode = (mode) => {
  switch (mode) {
    case "ceil":
      return Math.ceil;
    case "floor":
      return Math.floor;
    default:
      return Math.round;
  }
};

const formatMonths = (months) => {
  const safeMonths = Math.max(0, Number.isFinite(months) ? months : 0);
  const years = Math.floor(safeMonths / 12);
  const remaining = safeMonths % 12;
  return `${years} ${years === 1 ? "Jahr" : "Jahre"} ${remaining} ${
    remaining === 1 ? "Monat" : "Monate"
  }`;
};

export function calculateDuration({
  weeklyFull,
  weeklyPart,
  fullDurationMonths,
  reductionMonths = 0,
  rounding = "round",
}) {
  const fulltimeHours = Number(weeklyFull) || 0;
  const parttimeHours = Number(weeklyPart) || 0;
  const fulltimeMonths = Number(fullDurationMonths) || 0;
  const reduction = Math.max(0, Number(reductionMonths) || 0);

  const factor = fulltimeHours > 0 ? parttimeHours / fulltimeHours : 0;

  const effectiveFulltimeMonths = Math.max(0, fulltimeMonths - reduction);
  const roundingFn = clampRoundingMode(rounding);
  const rawParttimeMonths =
    factor > 0 ? effectiveFulltimeMonths / factor : effectiveFulltimeMonths;
  const parttimeFinalMonths = roundingFn(rawParttimeMonths);

  const deltaMonths = parttimeFinalMonths - effectiveFulltimeMonths;
  const deltaDirection =
    deltaMonths > 0 ? "longer" : deltaMonths < 0 ? "shorter" : "same";

  const formatted = {
    originalFulltime: formatMonths(fulltimeMonths),
    effectiveFulltime: formatMonths(effectiveFulltimeMonths),
    parttime: formatMonths(parttimeFinalMonths),
  };

  return {
    factor,
    fulltimeMonths,
    effectiveFulltimeMonths,
    parttimeFinalMonths,
    deltaMonths,
    deltaDirection,
    deltaVsOriginal: parttimeFinalMonths - fulltimeMonths,
    formatted,
  };
}

export default calculateDuration;
