const MIN_FACTOR = 0.5;
const MAX_EXTENSION_MONTHS = 6;
const DURATION_CAP_MULTIPLIER = 1.5;

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

const resolveMinDuration = (fulltimeMonths, override) => {
  if (override === undefined || override === null) {
    return Math.max(0, Math.floor(fulltimeMonths / 2));
  }
  const parsed = Number(override);
  if (Number.isNaN(parsed)) {
    return Math.max(0, Math.floor(fulltimeMonths / 2));
  }
  return Math.max(0, parsed);
};

const buildErrorResult = ({
  code,
  fulltimeMonths,
  effectiveFulltimeMonths,
  factor,
}) => {
  const safeFull = Math.max(0, fulltimeMonths);
  const safeEffective = Math.max(0, effectiveFulltimeMonths);
  return {
    allowed: false,
    errorCode: code,
    factor,
    fulltimeMonths: safeFull,
    effectiveFulltimeMonths: safeEffective,
    parttimeFinalMonths: safeEffective,
    deltaMonths: 0,
    deltaDirection: "same",
    deltaVsOriginal: safeEffective - safeFull,
    formatted: {
      originalFulltime: formatMonths(safeFull),
      effectiveFulltime: formatMonths(safeEffective),
      parttime: formatMonths(safeEffective),
    },
  };
};

export function calculateDuration({
  weeklyFull,
  weeklyPart,
  fullDurationMonths,
  reductionMonths = 0,
  rounding = "round",
  minDurationMonths,
}) {
  const fulltimeHours = Number(weeklyFull) || 0;
  const parttimeHours = Number(weeklyPart) || 0;
  const fulltimeMonths = Number(fullDurationMonths) || 0;
  const reduction = Math.max(0, Number(reductionMonths) || 0);

  const minDurationFloor = resolveMinDuration(fulltimeMonths, minDurationMonths);
  const baseAfterReduction = Math.max(0, fulltimeMonths - reduction);
  const effectiveFulltimeMonths = Math.max(baseAfterReduction, minDurationFloor);

  if (fulltimeHours <= 0 || parttimeHours <= 0) {
    return buildErrorResult({
      code: "invalidHours",
      fulltimeMonths,
      effectiveFulltimeMonths,
      factor: 0,
    });
  }

  const factor = parttimeHours / fulltimeHours;

  if (!Number.isFinite(factor) || factor <= 0) {
    return buildErrorResult({
      code: "invalidHours",
      fulltimeMonths,
      effectiveFulltimeMonths,
      factor: 0,
    });
  }

  if (factor < MIN_FACTOR) {
    return buildErrorResult({
      code: "minFactor",
      fulltimeMonths,
      effectiveFulltimeMonths,
      factor,
    });
  }

  const roundingFn = clampRoundingMode(rounding);

  const theoreticalDuration = effectiveFulltimeMonths / factor;
  const theoreticalDelta = theoreticalDuration - effectiveFulltimeMonths;

  let adjustedDuration = theoreticalDuration;
  if (theoreticalDelta <= MAX_EXTENSION_MONTHS) {
    adjustedDuration = effectiveFulltimeMonths;
  }

  const maxDuration = fulltimeMonths * DURATION_CAP_MULTIPLIER;
  if (adjustedDuration > maxDuration) {
    adjustedDuration = maxDuration;
  }

  const parttimeFinalMonths = roundingFn(adjustedDuration);
  const deltaMonths = parttimeFinalMonths - effectiveFulltimeMonths;
  const deltaDirection =
    deltaMonths > 0 ? "longer" : deltaMonths < 0 ? "shorter" : "same";

  const formatted = {
    originalFulltime: formatMonths(fulltimeMonths),
    effectiveFulltime: formatMonths(effectiveFulltimeMonths),
    parttime: formatMonths(parttimeFinalMonths),
  };

  return {
    allowed: true,
    factor,
    fulltimeMonths,
    effectiveFulltimeMonths,
    parttimeFinalMonths,
    theoreticalDuration,
    deltaBeforeRounding: theoreticalDelta,
    deltaMonths,
    deltaDirection,
    deltaVsOriginal: parttimeFinalMonths - fulltimeMonths,
    formatted,
  };
}

export default calculateDuration;
