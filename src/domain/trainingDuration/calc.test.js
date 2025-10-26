import { describe, it, expect } from "vitest";
import { calculateDuration } from "./calc";

describe("calculateDuration", () => {
  it("applies reduction, factor, and returns longer duration when needed", () => {
    const res = calculateDuration({
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 6,
    });

    expect(res.allowed).toBe(true);
    expect(res.effectiveFulltimeMonths).toBe(30);
    expect(res.parttimeFinalMonths).toBe(40);
    expect(res.deltaMonths).toBe(10);
    expect(res.deltaDirection).toBe("longer");
  });

  it("keeps basis when extension would be <= 6 months", () => {
    const res = calculateDuration({
      weeklyFull: 40,
      weeklyPart: 38,
      fullDurationMonths: 36,
    });

    expect(res.allowed).toBe(true);
    expect(res.parttimeFinalMonths).toBe(36);
    expect(res.deltaMonths).toBe(0);
    expect(res.deltaDirection).toBe("same");
  });

  it("caps the result at 1.5x the original duration", () => {
    const res = calculateDuration({
      weeklyFull: 40,
      weeklyPart: 20,
      fullDurationMonths: 24,
    });

    expect(res.allowed).toBe(true);
    expect(res.parttimeFinalMonths).toBe(36);
    expect(res.deltaMonths).toBe(12);
  });

  it("enforces the minimum duration floor", () => {
    const res = calculateDuration({
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 30,
    });

    expect(res.allowed).toBe(true);
    expect(res.effectiveFulltimeMonths).toBe(18);
    expect(res.parttimeFinalMonths).toBe(18);
  });

  it("rejects values that violate the 50% rule", () => {
    const res = calculateDuration({
      weeklyFull: 40,
      weeklyPart: 15,
      fullDurationMonths: 36,
    });

    expect(res.allowed).toBe(false);
    expect(res.errorCode).toBe("minFactor");
  });
});
