export const REGULAR_DURATION_NAME = "regular-duration-input";
export const REGULAR_DURATION_ERROR_ID = `${REGULAR_DURATION_NAME}-error`;
export const DURATION_MIN = 12;
export const DURATION_MAX = 48;

export const isRegularDurationValid = (raw) => {
  if (raw === "") return false;
  const n = Number(raw);
  return !Number.isNaN(n) && n >= DURATION_MIN && n <= DURATION_MAX;
};
