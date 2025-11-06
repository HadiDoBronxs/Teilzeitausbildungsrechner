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

const SCHOOL_DEGREE_MAP = SCHOOL_DEGREE_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option;
  return acc;
}, {});

export const getSchoolDegreeOption = (id) => {
  if (!id) return undefined;
  return SCHOOL_DEGREE_MAP[id];
};

export const getReductionMonthsForDegree = (id) => {
  const option = getSchoolDegreeOption(id);
  return option ? option.months : 0;
};
