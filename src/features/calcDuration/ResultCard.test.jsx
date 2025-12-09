// Tests the ResultCard interactions, including transparency panel and legal modal/link behavior.
// Focus: renders, reductions, dialog toggles, official links/targets.
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import ResultCard from "./ResultCard";

// Default form values fixture for most tests.
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
  // Core rendering without technical jargon.
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

  // Baseline uses effective months when reductions apply.
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

  // Zero delta is rendered without a sign.
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

  // Transparency dialog toggles on/off.
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

  // Official source links stay in-app and open new tab with correct URLs/targets.
  it("shows official source links that open in a new tab", async () => {
    const user = userEvent.setup();
    const result = buildResult();
    render(<ResultCard values={baseValues} result={result} />);

    await user.click(
      screen.getByRole("button", { name: "Gesetzesgrundlagen" })
    );

    const bbigLink = screen.getByRole("link", {
      name: "BBiG – Gesetzesübersicht",
    });
    const hwoLink = screen.getByRole("link", {
      name: "HwO – Gesetzesübersicht",
    });
    const bmbfLink = screen.getByRole("link", {
      name: "BMBF: Berufsausbildung in Teilzeit (PDF)",
    });

    expect(bbigLink).toHaveAttribute(
      "href",
      "https://www.gesetze-im-internet.de/bbig_2005/"
    );
    expect(hwoLink).toHaveAttribute(
      "href",
      "https://www.gesetze-im-internet.de/hwo/"
    );
    expect(bmbfLink).toHaveAttribute(
      "href",
      "https://www.bmbfsfj.bund.de/resource/blob/267912/41b921035a480044dee7ffb4c00683bf/berufsausbildung-in-teilzeit-data.pdf"
    );

    [bbigLink, hwoLink, bmbfLink].forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    });
  });

  // Legal modal contains the provided BBiG text and closes via button.
  it("opens the legal modal instead of navigating away", async () => {
    const user = userEvent.setup();
    const result = buildResult();
    render(<ResultCard values={baseValues} result={result} />);

    // Expect in-app dialog instead of location change when clicking the legal button.
    await user.click(
      screen.getByRole("button", { name: "Gesetzesgrundlagen" })
    );

    expect(
      screen.getByText("§7a BBiG – Teilzeitberufsausbildung")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Schließen" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // Ratio sentence appears when transparency dialog is open.
  it("shows the weekly ratio sentence inside the transparency panel", async () => {
    const user = userEvent.setup();
    const result = buildResult();
    render(<ResultCard values={baseValues} result={result} />);

    await user.click(
      screen.getByRole("button", { name: "Wie wird das berechnet?" })
    );

    // Toggle expert mode to see the detailed ratio text
    await user.click(
      screen.getByRole("button", { name: "Detaillierte Rechnung anzeigen" })
    );

    expect(
      screen.getByText("Ihre 30 Stunden pro Woche sind 75 % von 40 Stunden.")
    ).toBeInTheDocument();
  });

  // Error path when below 50% factor shows both high-level and step text.
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

  // Qualifikations-Badge appears when qualification months are present.
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

  // Warn user when reductions exceed cap.
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
