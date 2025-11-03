export const FULLTIME_INPUT_NAME = "fulltime-hours-input";
export const FULLTIME_ERROR_ID = `${FULLTIME_INPUT_NAME}-error`;
export const FULLTIME_MIN = 35;
export const FULLTIME_MAX = 48;
export const FULLTIME_HELP_ID = `${FULLTIME_INPUT_NAME}-help`;

export const isFulltimeHoursValid = (raw) => {
  if (raw === "") return false;
  const n = Number(raw);
  return !Number.isNaN(n) && n >= FULLTIME_MIN && n <= FULLTIME_MAX;
};
