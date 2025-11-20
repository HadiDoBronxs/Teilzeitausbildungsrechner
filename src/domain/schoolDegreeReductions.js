// Canonical list of degrees and the months the chambers typically accept.
export const SCHOOL_DEGREE_OPTIONS = [
  {
    id: "hs",
    months: 0,
    labelKey: "reductionOptions.hs",
  },
  {
    id: "mr",
    months: 6,
    labelKey: "reductionOptions.mr",
  },
  {
    id: "fhr",
    months: 12,
    labelKey: "reductionOptions.fhr",
  },
  {
    id: "abi",
    months: 12,
    labelKey: "reductionOptions.abi",
  },
];

// Handy lookup map so components/tests can grab a degree by id in O(1).
const SCHOOL_DEGREE_MAP = SCHOOL_DEGREE_OPTIONS.reduce(mapDegreeOption, {});

function mapDegreeOption(accumulator, option) {
  accumulator[option.id] = option;
  return accumulator;
}

export function getSchoolDegreeOption(id) {
  if (!id) {
    return undefined;
  }
  return SCHOOL_DEGREE_MAP[id];
}

export function getReductionMonthsForDegree(id) {
  const option = getSchoolDegreeOption(id);
  // If nothing matches we default to 0 so the calculator never subtracts undefined months.
  return option ? option.months : 0;
}

// Ensure we always work with whole, non-negative month values.
function normalizeReductionMonths(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.trunc(value));
}

export function buildReductionSummary({
  schoolDegreeId,
  manualReductionMonths,
  degreeReductionMonths,
  qualificationReductionMonths,
  labelKey,
  maxTotalMonths = 12,
} = {}) {
  // Read the configured option so we can fall back to its label and months.
  const option = getSchoolDegreeOption(schoolDegreeId ?? null);
  const resolvedLabelKey = labelKey ?? option?.labelKey ?? null;
  const degree = normalizeReductionMonths(
    degreeReductionMonths ?? option?.months ?? 0
  );
  const manual = normalizeReductionMonths(manualReductionMonths);
  const qualificationRaw = normalizeReductionMonths(
    qualificationReductionMonths
  );

  // Degree + manual reductions are applied first, remaining headroom is left for qualifications.
  const remainingAfterDegreeAndManual = Math.max(
    0,
    maxTotalMonths - Math.min(maxTotalMonths, degree + manual)
  );
  const qualificationApplied = Math.min(
    qualificationRaw,
    remainingAfterDegreeAndManual
  );
  const totalRaw = degree + manual + qualificationRaw;
  const total = Math.min(maxTotalMonths, totalRaw);
  const capExceeded = totalRaw > maxTotalMonths;

  return {
    // Total months are used for the main calculation.
    total,
    // Degree and manual parts let the UI show a clear breakdown.
    degree,
    manual,
    qualification: qualificationApplied,
    qualificationRaw,
    totalRaw,
    capExceeded,
    labelKey: resolvedLabelKey,
  };
}
