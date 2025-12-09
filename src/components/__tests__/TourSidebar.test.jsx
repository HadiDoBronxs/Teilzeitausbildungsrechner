// Tests for TourSidebar component - desktop sidebar for guided tour
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key) => key,
    i18n: {},
  })),
}));

const mockGetSchoolDegreeOption = vi.fn();
vi.mock("../../domain/schoolDegreeReductions.js", () => ({
  getSchoolDegreeOption: (...args) => mockGetSchoolDegreeOption(...args),
}));

// Use vi.hoisted() to ensure mockQualificationOptions is available when vi.mock() is hoisted
const { mockQualificationOptions } = vi.hoisted(() => ({
  mockQualificationOptions: [
    { id: "familyCare", labelKey: "qualifications.familyCare" },
    { id: "ageOver21", labelKey: "qualifications.ageOver21" },
  ],
}));

vi.mock("../qualificationOptions.js", () => ({
  QUALIFICATION_OPTIONS: mockQualificationOptions,
}));

import TourSidebar from "../TourSidebar.jsx";

describe("TourSidebar", () => {
  const defaultProps = {
    fulltimeHours: 40,
    parttimeHours: 30,
    fullDurationMonths: 36,
    schoolDegreeId: null,
    academicQualification: false,
    otherQualificationSelection: [],
    manualReductionMonths: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSchoolDegreeOption.mockReturnValue(null);
  });

  it("should render sidebar with correct ARIA attributes", () => {
    render(<TourSidebar {...defaultProps} />);

    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toHaveAttribute("aria-label", "tour.sidebar.title");
  });

  it("should display fulltime hours when provided", () => {
    render(<TourSidebar {...defaultProps} fulltimeHours={40} />);

    expect(screen.getByText(/tour.sidebar.fulltime:/i)).toBeInTheDocument();
    expect(screen.getByText("40h")).toBeInTheDocument();
  });

  it("should display parttime hours when provided", () => {
    render(<TourSidebar {...defaultProps} parttimeHours={30} />);

    expect(screen.getByText(/tour.sidebar.parttime:/i)).toBeInTheDocument();
    expect(screen.getByText("30h")).toBeInTheDocument();
  });

  it("should display duration when provided", () => {
    render(<TourSidebar {...defaultProps} fullDurationMonths={36} />);

    expect(screen.getByText(/tour.sidebar.duration:/i)).toBeInTheDocument();
    expect(screen.getByText("36M")).toBeInTheDocument();
  });

  it("should not display fulltime hours when not provided", () => {
    render(<TourSidebar {...defaultProps} fulltimeHours={null} />);

    expect(screen.queryByText(/tour.sidebar.fulltime:/i)).not.toBeInTheDocument();
  });

  it("should not display parttime hours when not provided", () => {
    render(<TourSidebar {...defaultProps} parttimeHours={null} />);

    expect(screen.queryByText(/tour.sidebar.parttime:/i)).not.toBeInTheDocument();
  });

  it("should not display duration when not provided", () => {
    render(<TourSidebar {...defaultProps} fullDurationMonths={null} />);

    expect(screen.queryByText(/tour.sidebar.duration:/i)).not.toBeInTheDocument();
  });

  it("should display school degree in education section when schoolDegreeId is provided", () => {
    mockGetSchoolDegreeOption.mockReturnValue({
      id: "hs",
      labelKey: "reductionOptions.hs",
    });

    render(<TourSidebar {...defaultProps} schoolDegreeId="hs" />);

    expect(screen.getByText(/tour.sidebar.education/i)).toBeInTheDocument();
    expect(screen.getByText("reductionOptions.hs")).toBeInTheDocument();
  });

  it("should not display education section when schoolDegreeId is null", () => {
    render(<TourSidebar {...defaultProps} schoolDegreeId={null} />);

    expect(screen.queryByText(/tour.sidebar.education/i)).not.toBeInTheDocument();
  });

  it("should display academic qualification in reductions section when selected", () => {
    render(<TourSidebar {...defaultProps} academicQualification={true} />);

    expect(screen.getByText(/tour.sidebar.reductions/i)).toBeInTheDocument();
    expect(screen.getByText("tour.sidebar.qualifications.academic")).toBeInTheDocument();
  });

  it("should display other qualifications in reductions section", () => {
    render(
      <TourSidebar
        {...defaultProps}
        otherQualificationSelection={["familyCare", "ageOver21"]}
      />
    );

    expect(screen.getByText(/tour.sidebar.reductions/i)).toBeInTheDocument();
    expect(screen.getByText("tour.sidebar.qualifications.familyCare")).toBeInTheDocument();
    expect(screen.getByText("tour.sidebar.qualifications.ageOver21")).toBeInTheDocument();
  });

  it("should display manual reduction months in reductions section", () => {
    render(<TourSidebar {...defaultProps} manualReductionMonths={6} />);

    expect(screen.getByText(/tour.sidebar.reductions/i)).toBeInTheDocument();
    expect(screen.getByText(/reduction.label: 6 format.months/i)).toBeInTheDocument();
  });

  it("should not display reductions section when no reductions are selected", () => {
    render(<TourSidebar {...defaultProps} />);

    expect(screen.queryByText(/tour.sidebar.reductions/i)).not.toBeInTheDocument();
  });

  it("should display both academic and other qualifications in reductions section", () => {
    render(
      <TourSidebar
        {...defaultProps}
        academicQualification={true}
        otherQualificationSelection={["familyCare"]}
      />
    );

    expect(screen.getByText("tour.sidebar.qualifications.academic")).toBeInTheDocument();
    expect(screen.getByText("tour.sidebar.qualifications.familyCare")).toBeInTheDocument();
  });

  it("should handle invalid schoolDegreeId gracefully", () => {
    mockGetSchoolDegreeOption.mockReturnValue(null);

    render(<TourSidebar {...defaultProps} schoolDegreeId="invalid" />);

    expect(screen.queryByText(/tour.sidebar.education/i)).not.toBeInTheDocument();
  });

  it("should handle empty otherQualificationSelection array", () => {
    render(<TourSidebar {...defaultProps} otherQualificationSelection={[]} />);

    expect(screen.queryByText(/tour.sidebar.reductions/i)).not.toBeInTheDocument();
  });

  it("should handle undefined otherQualificationSelection", () => {
    render(<TourSidebar {...defaultProps} otherQualificationSelection={undefined} />);

    expect(screen.queryByText(/tour.sidebar.reductions/i)).not.toBeInTheDocument();
  });

  it("should display manual reduction even when no qualifications are selected", () => {
    render(<TourSidebar {...defaultProps} manualReductionMonths={3} />);

    expect(screen.getByText(/tour.sidebar.reductions/i)).toBeInTheDocument();
    expect(screen.getByText(/reduction.label: 3 format.months/i)).toBeInTheDocument();
  });

  it("should not display manual reduction when it is 0", () => {
    render(<TourSidebar {...defaultProps} manualReductionMonths={0} />);

    const reductionsSection = screen.queryByText(/tour.sidebar.reductions/i);
    if (reductionsSection) {
      expect(screen.queryByText(/reduction.label: 0/i)).not.toBeInTheDocument();
    }
  });

  it("should filter out invalid qualification IDs", () => {
    render(
      <TourSidebar
        {...defaultProps}
        otherQualificationSelection={["familyCare", "invalidId", "ageOver21"]}
      />
    );

    expect(screen.getByText("tour.sidebar.qualifications.familyCare")).toBeInTheDocument();
    expect(screen.getByText("tour.sidebar.qualifications.ageOver21")).toBeInTheDocument();
    expect(screen.queryByText("tour.sidebar.qualifications.invalidId")).not.toBeInTheDocument();
  });
});
