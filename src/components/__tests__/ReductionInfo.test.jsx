// Tests for ReductionInfo component - displays reduction information text
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReductionInfo from "../ui/ReductionInfo.jsx";

// Mock react-i18next
const mockT = vi.fn((key, params = {}) => {
  if (key === "reduction.applied") {
    return `Reduction: up to ${params.months} months (${params.label})`;
  }
  if (key === "reduction.qualificationApplied") {
    return `Reduction: up to ${params.months} months`;
  }
  if (key === "reduction.manualApplied") {
    return `Additional reasons: up to ${params.months} months`;
  }
  return key;
});

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: mockT,
    i18n: {},
  })),
}));

describe("ReductionInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders reduction info with valid months and translation key", () => {
    render(
      <ReductionInfo months={12} translationKey="reduction.qualificationApplied" />
    );

    expect(mockT).toHaveBeenCalledWith("reduction.qualificationApplied", {
      months: 12,
    });
    expect(screen.getByText("Reduction: up to 12 months")).toBeInTheDocument();
  });

  it("renders with label when provided", () => {
    render(
      <ReductionInfo
        months={6}
        translationKey="reduction.applied"
        label="Fachoberschulreife"
      />
    );

    expect(mockT).toHaveBeenCalledWith("reduction.applied", {
      months: 6,
      label: "Fachoberschulreife",
    });
    expect(
      screen.getByText("Reduction: up to 6 months (Fachoberschulreife)")
    ).toBeInTheDocument();
  });

  it("has correct CSS classes and aria-live attribute", () => {
    const { container } = render(
      <ReductionInfo months={12} translationKey="reduction.qualificationApplied" />
    );

    const paragraph = container.querySelector("p");
    expect(paragraph).toHaveClass("text-sm", "text-slate-600");
    expect(paragraph).toHaveAttribute("aria-live", "polite");
  });

  it("returns null when months is 0", () => {
    const { container } = render(
      <ReductionInfo months={0} translationKey="reduction.qualificationApplied" />
    );

    expect(container.firstChild).toBeNull();
    expect(mockT).not.toHaveBeenCalled();
  });

  it("returns null when months is negative", () => {
    const { container } = render(
      <ReductionInfo
        months={-5}
        translationKey="reduction.qualificationApplied"
      />
    );

    expect(container.firstChild).toBeNull();
    expect(mockT).not.toHaveBeenCalled();
  });

  it("returns null when months is null", () => {
    const { container } = render(
      <ReductionInfo months={null} translationKey="reduction.qualificationApplied" />
    );

    expect(container.firstChild).toBeNull();
    expect(mockT).not.toHaveBeenCalled();
  });

  it("returns null when months is undefined", () => {
    const { container } = render(
      <ReductionInfo
        months={undefined}
        translationKey="reduction.qualificationApplied"
      />
    );

    expect(container.firstChild).toBeNull();
    expect(mockT).not.toHaveBeenCalled();
  });

  it("returns null when months is NaN", () => {
    const { container } = render(
      <ReductionInfo
        months={NaN}
        translationKey="reduction.qualificationApplied"
      />
    );

    expect(container.firstChild).toBeNull();
    expect(mockT).not.toHaveBeenCalled();
  });

  it("converts string months to number", () => {
    render(
      <ReductionInfo
        months="12"
        translationKey="reduction.qualificationApplied"
      />
    );

    expect(mockT).toHaveBeenCalledWith("reduction.qualificationApplied", {
      months: 12,
    });
    expect(screen.getByText("Reduction: up to 12 months")).toBeInTheDocument();
  });

  it("returns null when months is invalid string", () => {
    const { container } = render(
      <ReductionInfo
        months="invalid"
        translationKey="reduction.qualificationApplied"
      />
    );

    expect(container.firstChild).toBeNull();
    expect(mockT).not.toHaveBeenCalled();
  });

  it("returns null when months is empty string", () => {
    const { container } = render(
      <ReductionInfo months="" translationKey="reduction.qualificationApplied" />
    );

    expect(container.firstChild).toBeNull();
    expect(mockT).not.toHaveBeenCalled();
  });

  it("handles different translation keys correctly", () => {
    const { rerender } = render(
      <ReductionInfo months={6} translationKey="reduction.manualApplied" />
    );

    expect(mockT).toHaveBeenCalledWith("reduction.manualApplied", {
      months: 6,
    });
    expect(
      screen.getByText("Additional reasons: up to 6 months")
    ).toBeInTheDocument();

    rerender(
      <ReductionInfo months={12} translationKey="reduction.applied" label="Test" />
    );

    expect(mockT).toHaveBeenCalledWith("reduction.applied", {
      months: 12,
      label: "Test",
    });
  });

  it("handles decimal months correctly", () => {
    render(
      <ReductionInfo months={6.5} translationKey="reduction.qualificationApplied" />
    );

    expect(mockT).toHaveBeenCalledWith("reduction.qualificationApplied", {
      months: 6.5,
    });
    expect(screen.getByText("Reduction: up to 6.5 months")).toBeInTheDocument();
  });

  it("handles very large numbers", () => {
    render(
      <ReductionInfo
        months={999}
        translationKey="reduction.qualificationApplied"
      />
    );

    expect(mockT).toHaveBeenCalledWith("reduction.qualificationApplied", {
      months: 999,
    });
    expect(screen.getByText("Reduction: up to 999 months")).toBeInTheDocument();
  });
});
