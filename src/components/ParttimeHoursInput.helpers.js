export const PARTTIME_INPUT_NAME = "parttime-hours-input";
export const PARTTIME_ERROR_ID = `${PARTTIME_INPUT_NAME}-error`;
export const PARTTIME_HELP_ID = `${PARTTIME_INPUT_NAME}-help`;
const CAPPED_MAX = 35;

export function computeParttimeBounds(fulltimeHours) {
  const ft = Number(fulltimeHours);
  if (Number.isNaN(ft) || ft <= 0) {
    return { min: 20, max: 30 };
  }
  const rawMin = ft * 0.5;
  const rawMax = ft * 0.8;
  const minRounded = Math.ceil(rawMin * 2) / 2;
  const maxRounded = Math.floor(rawMax * 2) / 2;
  const maxCapped = Math.min(maxRounded, CAPPED_MAX);
  const min = Math.min(minRounded, maxCapped);
  const max = Math.max(minRounded, maxCapped);
  return { min, max };
}

export function isParttimeHoursValid(raw, fulltimeHours) {
  if (raw === "") return false;
  const n = Number(raw);
  if (Number.isNaN(n)) return false;
  const { min, max } = computeParttimeBounds(fulltimeHours);
  return n >= min && n <= max;
}
