// Tests for ResultSidebar component - desktop sidebar with simplified results
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import readFormAndCalc from "../../features/calcDuration/readFormAndCalc.js";
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
  if (key === "result.error.title") return "Calculation not possible";
  if (key === "result.error.generic") return "Please check your inputs.";
  if (key === "result.error.minFactor") return "Part-time must be at least 50% of full-time.";
  if (key === "result.error.invalidHours") return "Please enter valid hour values for full-time and part-time.";
  if (key === "result.navigation.scrollToTop") return "Scroll to top";
  if (key === "result.navigation.scrollToResults") return "Scroll to results";
  if (key === "result.navigation.comingSoon") return "Coming soon";
  return key;
};

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: mockT,
    i18n: {},
  })),
}));

// Mock readFormAndCalc - define mock function inline since vi.mock is hoisted
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
    // Reset mock to default implementation
    vi.mocked(readFormAndCalc).mockImplementation((values) => {
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
    });
  });

  it("renders error state when values are not provided", () => {
    render(<ResultSidebar values={null} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Calculation not possible")).toBeInTheDocument();
    expect(screen.getByText("Please check your inputs.")).toBeInTheDocument();
    // Navigation buttons should still be visible
    expect(screen.getByRole("button", { name: /Scroll to top/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Scroll to results/ })).toBeInTheDocument();
  });

  it("renders error state when calculation is invalid", () => {
    const invalidValues = {
      weeklyFull: null,
      weeklyPart: null,
      fullDurationMonths: 36,
    };
    render(<ResultSidebar values={invalidValues} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Calculation not possible")).toBeInTheDocument();
    expect(screen.getByText("Please check your inputs.")).toBeInTheDocument();
    // Navigation buttons should still be visible
    expect(screen.getByRole("button", { name: /Scroll to top/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Scroll to results/ })).toBeInTheDocument();
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

  it("displays zero delta correctly (formatDelta returns '0')", () => {
    const validValues = {
      weeklyFull: 40,
      weeklyPart: 40, // Same hours = no change
      fullDurationMonths: 36,
      reductionMonths: 0,
    };

    // Mock readFormAndCalc to return deltaMonths: 0
    vi.mocked(readFormAndCalc).mockReturnValueOnce({
      allowed: true,
      fulltimeMonths: 36,
      effectiveFulltimeMonths: 36,
      parttimeFinalMonths: 36,
      deltaMonths: 0, // No change
      formatted: { parttime: "36 months" },
    });

    render(<ResultSidebar values={validValues} />);

    // Should display "0 months" (not "+0 months")
    expect(screen.getByText("0 months")).toBeInTheDocument();
  });

  it("displays specific error message when errorCode is provided", () => {
    vi.mocked(readFormAndCalc).mockReturnValueOnce({
      allowed: false,
      errorCode: "minFactor",
    });

    const invalidValues = {
      weeklyFull: 40,
      weeklyPart: 15, // Below 50% threshold
      fullDurationMonths: 36,
    };

    render(<ResultSidebar values={invalidValues} />);
    expect(screen.getByText("Calculation not possible")).toBeInTheDocument();
    expect(screen.getByText("Part-time must be at least 50% of full-time.")).toBeInTheDocument();
  });

  it("displays navigation buttons in error state", () => {
    const invalidValues = {
      weeklyFull: null,
      weeklyPart: null,
      fullDurationMonths: 36,
    };
    render(<ResultSidebar values={invalidValues} />);

    const navigationButtons = screen.getAllByRole("button");
    expect(navigationButtons).toHaveLength(2);
    expect(navigationButtons[0]).toHaveTextContent("Scroll to top");
    expect(navigationButtons[1]).toHaveTextContent("Scroll to results");
    // Both buttons should be disabled (placeholders)
    expect(navigationButtons[0]).toBeDisabled();
    expect(navigationButtons[1]).toBeDisabled();
  });
});
