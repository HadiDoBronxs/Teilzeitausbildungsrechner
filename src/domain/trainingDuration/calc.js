const MIN_FACTOR = 0.5;
const MAX_EXTENSION_MONTHS = 6;
const DURATION_CAP_MULTIPLIER = 1.5;

// -----------------------
// Rounding helper
// -----------------------
function round(n, decimals = 2) {
  return Number(Number(n).toFixed(decimals));
}

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

  // ---- FIX: Round factor ----
  const factor = round(parttimeHours / fulltimeHours, 4);

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

  // ---- FIX: Round theoretical result ----
  const theoreticalDuration = round(effectiveFulltimeMonths / factor, 2);
  const theoreticalDelta = round(
    theoreticalDuration - effectiveFulltimeMonths,
    2
  );

  let adjustedDuration = theoreticalDuration;
  if (theoreticalDelta <= MAX_EXTENSION_MONTHS) {
    adjustedDuration = effectiveFulltimeMonths;
  }

  const maxDuration = fulltimeMonths * DURATION_CAP_MULTIPLIER;
  if (adjustedDuration > maxDuration) {
    adjustedDuration = maxDuration;
  }

  const parttimeFinalMonths = roundingFn(adjustedDuration);

  // ---- FIX: Round deltas ----
  const deltaMonths = round(
    parttimeFinalMonths - effectiveFulltimeMonths,
    2
  );

  const deltaDirection =
    deltaMonths > 0 ? "longer" : deltaMonths < 0 ? "shorter" : "same";

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
    deltaVsOriginal: round(parttimeFinalMonths - fulltimeMonths, 2),
  };
}

export default calculateDuration;
