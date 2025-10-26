import { describe, it, expect } from "vitest";
import { calculateDuration } from "./calc";

describe("calculateDuration", () => {
  it("handles reduction first, then factor", () => {
    const res = calculateDuration({
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 6,
    });

    expect(res.effectiveFulltimeMonths).toBe(30);
    expect(res.parttimeFinalMonths).toBe(40);
    expect(res.deltaMonths).toBe(10);
    expect(res.deltaDirection).toBe("longer");
  });

  it("returns same duration when factor is 1 and no reduction", () => {
    const res = calculateDuration({
      weeklyFull: 35,
      weeklyPart: 35,
      fullDurationMonths: 24,
    });

    expect(res.parttimeFinalMonths).toBe(24);
    expect(res.deltaDirection).toBe("same");
    expect(res.deltaMonths).toBe(0);
  });

  it("respects rounding mode ceil and floor", () => {
    const ceilRes = calculateDuration({
      weeklyFull: 40,
      weeklyPart: 27,
      fullDurationMonths: 30,
      rounding: "ceil",
    });
    expect(ceilRes.parttimeFinalMonths).toBe(Math.ceil(30 / (27 / 40)));

    const floorRes = calculateDuration({
      weeklyFull: 40,
      weeklyPart: 27,
      fullDurationMonths: 30,
      rounding: "floor",
    });
    expect(floorRes.parttimeFinalMonths).toBe(Math.floor(30 / (27 / 40)));
  });
});
