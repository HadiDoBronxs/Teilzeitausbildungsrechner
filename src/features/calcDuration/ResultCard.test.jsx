import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ResultCard from "./ResultCard";

const baseValues = {
  weeklyFull: 40,
  weeklyPart: 30,
  fullDurationMonths: 36,
  reductionMonths: 0,
};

const buildResult = (overrides = {}) => ({
  allowed: true,
  formatted: { parttime: "3 Jahre 2 Monate" },
  fulltimeMonths: 36,
  effectiveFulltimeMonths: 36,
  parttimeFinalMonths: 42,
  deltaMonths: 6,
  factor: 0.75,
  ...overrides,
});

describe("ResultCard", () => {
  it("renders the headline and metrics without technical jargon", () => {
    const result = buildResult();
    render(<ResultCard values={baseValues} result={result} />);

    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
    expect(
      screen.getByText("Ihre Ausbildung dauert 3 Jahre 2 Monate")
    ).toBeInTheDocument();
    expect(screen.getByText("Vollzeit")).toBeInTheDocument();
    expect(screen.getByText("36 Monate")).toBeInTheDocument();
    expect(screen.getByText("Ihre Teilzeit")).toBeInTheDocument();
    expect(screen.getByText("42 Monate")).toBeInTheDocument();
    expect(screen.getByText("Änderung")).toBeInTheDocument();
    expect(screen.getByText("+6 Monate")).toBeInTheDocument();
    expect(statusRegion.textContent).not.toMatch(/Faktor|D_theo|\\/i);
  });

  it("uses the effective full-time months when a reduction is applied", () => {
    const result = buildResult({
      effectiveFulltimeMonths: 30,
      fulltimeMonths: 36,
    });
    render(
      <ResultCard
        values={{ ...baseValues, reductionMonths: 6 }}
        result={result}
      />
    );

    expect(screen.getByText("Vollzeit")).toBeInTheDocument();
    expect(screen.getByText("30 Monate")).toBeInTheDocument();
  });

  it("displays zero change correctly", () => {
    const result = buildResult({
      formatted: { parttime: "2 Jahre 6 Monate" },
      parttimeFinalMonths: 30,
      deltaMonths: 0,
    });
    render(<ResultCard values={baseValues} result={result} />);

    expect(
      screen.getByText("Ihre Ausbildung dauert 2 Jahre 6 Monate")
    ).toBeInTheDocument();
    expect(screen.getByText("Änderung")).toBeInTheDocument();
    expect(screen.getByText("0 Monate")).toBeInTheDocument();
  });
});
