import { describe, it, expect } from "vitest";
import { buildReductionSummary } from "../schoolDegreeReductions.js";

/**
 * Prüft wiederkehrende Inputs auf den Cap-Mechanismus von buildReductionSummary.
 */
function summarizeReduction({
  schoolDegreeId = null,
  manualReductionMonths = 0,
  qualificationReductionMonths = 0,
  maxTotalMonths = 12,
} = {}) {
  return buildReductionSummary({
    schoolDegreeId,
    manualReductionMonths,
    qualificationReductionMonths,
    maxTotalMonths,
  });
}

describe("buildReductionSummary", () => {
  it("deckt die Gesamtsumme bei 12 Monaten und markiert capExceeded", () => {
    const summary = summarizeReduction({
      schoolDegreeId: "abi", // 12 Monate durch Abschluss
      manualReductionMonths: 2,
      qualificationReductionMonths: 5,
    });

    expect(summary.degree).toBe(12);
    expect(summary.manual).toBe(2);
    expect(summary.qualification).toBe(0);
    expect(summary.total).toBe(12);
    expect(summary.totalRaw).toBe(19);
    expect(summary.capExceeded).toBe(true);
  });

  it("verteilt Qualifikationen auf den verbleibenden Rest unter der Cap", () => {
    const summary = summarizeReduction({
      schoolDegreeId: "mr", // 6 Monate
      manualReductionMonths: 3,
      qualificationReductionMonths: 10,
    });

    expect(summary.degree).toBe(6);
    expect(summary.manual).toBe(3);
    expect(summary.qualification).toBe(3); // nur 3 Monate übrig bis 12
    expect(summary.total).toBe(12);
    expect(summary.totalRaw).toBe(19);
    expect(summary.capExceeded).toBe(true);
  });

  it("lässt Qualifikationen voll zählen, wenn noch Platz unter der Cap ist", () => {
    const summary = summarizeReduction({
      schoolDegreeId: "hs", // 0 Monate
      manualReductionMonths: 2,
      qualificationReductionMonths: 5,
    });

    expect(summary.degree).toBe(0);
    expect(summary.manual).toBe(2);
    expect(summary.qualification).toBe(5);
    expect(summary.total).toBe(7);
    expect(summary.totalRaw).toBe(7);
    expect(summary.capExceeded).toBe(false);
  });
});
