// Tests for ResultBottomBar component - mobile bottom bar with part-time duration
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTranslation } from "react-i18next";
import ResultBottomBar from "../ResultBottomBar.jsx";
import readFormAndCalc from "../../features/calcDuration/readFormAndCalc.js";

// Mock react-i18next
const mockT = (key, opts = {}) => {
  if (key === "result.labels.part") return "Your part-time";
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
      parttimeFinalMonths: 48,
      formatted: { parttime: "48 months" },
    };
  }),
}));

// Mock getElementById and getBoundingClientRect
const mockGetBoundingClientRect = vi.fn(() => ({
  top: -100, // Element is above viewport
  left: 0,
  bottom: -50,
  right: 100,
  width: 100,
  height: 50,
}));

const mockGetElementById = vi.fn(() => ({
  getBoundingClientRect: mockGetBoundingClientRect,
}));

describe("ResultBottomBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBoundingClientRect.mockReturnValue({
      top: -100, // Element not visible
      left: 0,
      bottom: -50,
      right: 100,
      width: 100,
      height: 50,
    });
    document.getElementById = mockGetElementById;
    Object.defineProperty(window, "innerHeight", { value: 800, writable: true });
    Object.defineProperty(window, "innerWidth", { value: 1200, writable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when values are not provided", () => {
    const { container } = render(<ResultBottomBar values={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when calculation is invalid", () => {
    const invalidValues = {
      weeklyFull: null,
      weeklyPart: null,
      fullDurationMonths: 36,
    };
    const { container } = render(<ResultBottomBar values={invalidValues} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders bottom bar with part-time duration when ResultCard is not visible", async () => {
    const validValues = {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    };

    render(<ResultBottomBar values={validValues} resultCardId="result-card" />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("Your part-time:")).toBeInTheDocument();
      expect(screen.getByText("48 months")).toBeInTheDocument();
    });
  });

  it("does not render when ResultCard is visible in viewport", async () => {
    mockGetBoundingClientRect.mockReturnValue({
      top: 100, // Element is visible
      left: 0,
      bottom: 200,
      right: 100,
      width: 100,
      height: 100,
    });

    const validValues = {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    };

    const { container } = render(
      <ResultBottomBar values={validValues} resultCardId="result-card" />
    );

    await waitFor(() => {
      // Should not render when ResultCard is visible
      expect(container.firstChild).toBeNull();
    });
  });

  it("has proper accessibility attributes", async () => {
    const validValues = {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    };

    render(<ResultBottomBar values={validValues} resultCardId="result-card" />);

    await waitFor(() => {
      const statusBar = screen.getByRole("status");
      expect(statusBar).toHaveAttribute("aria-label", "Your part-time");
    });
  });

  it("is hidden on desktop via Tailwind classes", async () => {
    const validValues = {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    };

    const { container } = render(
      <ResultBottomBar values={validValues} resultCardId="result-card" />
    );

    await waitFor(() => {
      const bottomBar = container.querySelector('[role="status"]');
      if (bottomBar) {
        expect(bottomBar).toHaveClass("lg:hidden");
      }
    });
  });

  it("uses custom resultCardId when provided", async () => {
    const validValues = {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    };

    render(<ResultBottomBar values={validValues} resultCardId="custom-card-id" />);

    await waitFor(() => {
      expect(mockGetElementById).toHaveBeenCalledWith("custom-card-id");
    });
  });
});
