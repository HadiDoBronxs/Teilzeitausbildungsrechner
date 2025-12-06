// Tests for ResultSidebar component - desktop sidebar with simplified results
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ResultSidebar from "../ResultSidebar.jsx";

// Mock react-i18next
const mockT = (key, opts = {}) => {
  if (key === "result.headline") {
    return `Your training takes ${opts.value}.`;
  }
  if (key === "result.labels.full") return "Full-time";
  if (key === "result.labels.part") return "Your part-time";
  if (key === "result.labels.change") return "Change";
  if (key === "result.months") {
    return `${opts.value} months`;
  }
  return key;
};

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: mockT,
    i18n: {},
  })),
}));

// Mock readFormAndCalc
vi.mock("../../features/calcDuration/readFormAndCalc.js", () => ({
  default: vi.fn((values) => {
    if (!values || !values.weeklyFull || !values.weeklyPart) {
      return { allowed: false };
    }
    return {
      allowed: true,
      fulltimeMonths: 36,
      effectiveFulltimeMonths: 36,
      parttimeFinalMonths: 48,
      deltaMonths: 12,
      formatted: { parttime: "48 months" },
    };
  }),
}));

describe("ResultSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when values are not provided", () => {
    const { container } = render(<ResultSidebar values={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when calculation is invalid", () => {
    const invalidValues = {
      weeklyFull: null,
      weeklyPart: null,
      fullDurationMonths: 36,
    };
    const { container } = render(<ResultSidebar values={invalidValues} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders sidebar with results when values are valid", () => {
    const validValues = {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    };
    render(<ResultSidebar values={validValues} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Your training takes/)).toBeInTheDocument();
    expect(screen.getByText("Full-time")).toBeInTheDocument();
    expect(screen.getByText("Your part-time")).toBeInTheDocument();
    expect(screen.getByText("Change")).toBeInTheDocument();
  });

  it("displays correct metrics", () => {
    const validValues = {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    };
    render(<ResultSidebar values={validValues} />);

    expect(screen.getByText("36 months")).toBeInTheDocument();
    expect(screen.getByText("48 months")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const validValues = {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    };
    const { container } = render(<ResultSidebar values={validValues} />);

    const aside = container.querySelector("aside");
    expect(aside).toHaveAttribute("aria-label");
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders sidebar component (visibility controlled by parent)", () => {
    const validValues = {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    };
    const { container } = render(<ResultSidebar values={validValues} />);
    const aside = container.querySelector("aside");
    // ResultSidebar itself doesn't control visibility - that's handled by the wrapper in CompactView
    // We just verify the component renders correctly
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveClass("w-full", "min-w-0");
  });
});
