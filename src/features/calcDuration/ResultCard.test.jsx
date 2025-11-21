import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import ResultCard from "./ResultCard";

const baseValues = {
  weeklyFull: 40,
  weeklyPart: 30,
  fullDurationMonths: 36,
  reductionMonths: 0,
  degreeReductionMonths: 0,
  manualReductionMonths: 0,
  schoolDegreeId: "hs",
  schoolDegreeLabelKey: "reductionOptions.hs",
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
        values={{
          ...baseValues,
          reductionMonths: 6,
          degreeReductionMonths: 6,
          schoolDegreeId: "mr",
          schoolDegreeLabelKey: "reductionOptions.mr",
        }}
        result={result}
      />
    );

    expect(screen.getByText("Vollzeit")).toBeInTheDocument();
    expect(screen.getByText("30 Monate")).toBeInTheDocument();
    expect(screen.getByText("Verkürzung gesamt: −6 Monate")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Verkürzung: −6 Monate (Fachoberschulreife / Mittlere Reife)"
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Zusätzliche Gründe: −6 Monate")
    ).not.toBeInTheDocument();
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

  it("opens and closes the transparency panel on demand", async () => {
    const user = userEvent.setup();
    const result = buildResult();
    render(<ResultCard values={baseValues} result={result} />);

    await user.click(
      screen.getByRole("button", { name: "Wie wird das berechnet?" })
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Schließen" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the weekly ratio sentence inside the transparency panel", async () => {
    const user = userEvent.setup();
    const result = buildResult();
    render(<ResultCard values={baseValues} result={result} />);

    await user.click(
      screen.getByRole("button", { name: "Wie wird das berechnet?" })
    );

    expect(
      screen.getByText("Ihre 30 Stunden pro Woche sind 75 % von 40 Stunden.")
    ).toBeInTheDocument();
  });

  it("explains the error path when the ratio is below fifty percent", async () => {
    const user = userEvent.setup();
    const values = {
      ...baseValues,
      weeklyPart: 10,
    };
    const result = buildResult({ allowed: false, errorCode: "minFactor" });
    render(<ResultCard values={values} result={result} />);

    await user.click(
      screen.getByRole("button", { name: "Wie wird das berechnet?" })
    );

    expect(
      screen.getByText(
        "Die gewünschte Wochenarbeitszeit liegt unter 50 % der regulären Arbeitszeit. Bitte Eingaben prüfen."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Das liegt unter 50 %. Bitte passen Sie die Stunden an oder sprechen Sie mit Ihrer Kammer."
      )
    ).toBeInTheDocument();
  });

  it("zeigt die Qualifikations-Badge, wenn entsprechende Monate vorhanden sind", () => {
    const result = buildResult({
      effectiveFulltimeMonths: 32,
      fulltimeMonths: 36,
    });
    render(
      <ResultCard
        values={{
          ...baseValues,
          reductionMonths: 4,
          degreeReductionMonths: 0,
          manualReductionMonths: 0,
          qualificationReductionRawMonths: 4,
          maxTotalReduction: 12,
        }}
        result={result}
      />
    );

    expect(screen.getByText("Qualifikationen: −4 Monate")).toBeInTheDocument();
  });

  it("zeigt eine Warnung, wenn die Summe über der Kappungsgrenze liegt", () => {
    const result = buildResult({
      effectiveFulltimeMonths: 24,
      fulltimeMonths: 36,
    });
    render(
      <ResultCard
        values={{
          ...baseValues,
          reductionMonths: 12,
          degreeReductionMonths: 12,
          manualReductionMonths: 2,
          qualificationReductionRawMonths: 6,
          maxTotalReduction: 12,
        }}
        result={result}
      />
    );

    expect(
      screen.getByText(
        "Deine Auswahl ergibt 20 Monate. Berücksichtigt werden höchstens 12 Monate."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "§ 8 Abs. 3 BBiG: Bei einer Unterschreitung um mehr als 6 Monate sind zusätzliche Nachweise notwendig."
      )
    ).not.toBeInTheDocument();
  });
});
