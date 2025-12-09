// Tests for ReductionsTab component - third tab of guided tour
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key) => key,
    i18n: {},
  })),
}));

vi.mock("../../components/OtherQualificationReductions.jsx", () => ({
  default: vi.fn(({ value, onChange }) => (
    <div data-testid="other-qualification-reductions">
      <button
        data-testid="toggle-qualification"
        onClick={() => onChange(value.includes("familyCare") ? [] : ["familyCare"])}
      >
        Toggle Qualification
      </button>
    </div>
  )),
}));

const mockSummarizeQualificationSelection = vi.fn();
vi.mock("../../components/qualificationOptions.js", () => ({
  summarizeQualificationSelection: (...args) => mockSummarizeQualificationSelection(...args),
}));

import ReductionsTab from "../tour/ReductionsTab.jsx";

describe("ReductionsTab", () => {
  const defaultProps = {
    otherQualificationSelection: [],
    onOtherQualificationChange: vi.fn(),
    onBack: vi.fn(),
    onNext: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 0,
      cappedTotal: 0,
    });
  });

  it("should render the tab panel with correct ARIA attributes", () => {
    render(<ReductionsTab {...defaultProps} />);

    const tabPanel = screen.getByRole("tabpanel");
    expect(tabPanel).toHaveAttribute("id", "tabpanel-reductions");
    expect(tabPanel).toHaveAttribute("aria-labelledby", "tab-reductions");
  });

  it("should render OtherQualificationReductions component", () => {
    render(<ReductionsTab {...defaultProps} />);

    expect(screen.getByTestId("other-qualification-reductions")).toBeInTheDocument();
  });

  it("should pass correct props to OtherQualificationReductions", () => {
    const selection = ["familyCare", "ageOver21"];
    render(<ReductionsTab {...defaultProps} otherQualificationSelection={selection} />);

    const component = screen.getByTestId("other-qualification-reductions");
    expect(component).toBeInTheDocument();
  });

  it("should not show notification when qualification total is 6 or less", () => {
    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 6,
      cappedTotal: 6,
    });

    render(<ReductionsTab {...defaultProps} otherQualificationSelection={["familyCare"]} />);

    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("should show notification when qualification total exceeds 6 months", () => {
    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 12,
      cappedTotal: 12,
    });

    render(<ReductionsTab {...defaultProps} otherQualificationSelection={["familyCare", "ageOver21"]} />);

    const notification = screen.getByRole("note");
    expect(notification).toBeInTheDocument();
    expect(notification).toHaveTextContent("qualifications.legalHint");
    expect(notification).toHaveClass("text-xs", "text-amber-700");
  });

  it("should call onBack when Back button is clicked", () => {
    const onBack = vi.fn();
    render(<ReductionsTab {...defaultProps} onBack={onBack} />);

    const backButton = screen.getByRole("button", { name: /← tour.navigation.back/i });
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should call onNext when Next button is clicked", () => {
    const onNext = vi.fn();
    render(<ReductionsTab {...defaultProps} onNext={onNext} />);

    const nextButton = screen.getByRole("button", { name: /tour.navigation.next →/i });
    fireEvent.click(nextButton);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("should call onOtherQualificationChange when qualification changes", () => {
    const onOtherQualificationChange = vi.fn();
    render(<ReductionsTab {...defaultProps} onOtherQualificationChange={onOtherQualificationChange} />);

    const toggleButton = screen.getByTestId("toggle-qualification");
    fireEvent.click(toggleButton);

    expect(onOtherQualificationChange).toHaveBeenCalled();
  });

  it("should handle empty otherQualificationSelection prop", () => {
    render(<ReductionsTab {...defaultProps} otherQualificationSelection={[]} />);

    expect(screen.getByTestId("other-qualification-reductions")).toBeInTheDocument();
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("should handle undefined otherQualificationSelection prop", () => {
    render(<ReductionsTab {...defaultProps} otherQualificationSelection={undefined} />);

    expect(screen.getByTestId("other-qualification-reductions")).toBeInTheDocument();
  });

  it("should update notification visibility when selection changes", () => {
    const { rerender } = render(<ReductionsTab {...defaultProps} otherQualificationSelection={[]} />);

    expect(screen.queryByRole("note")).not.toBeInTheDocument();

    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 12,
      cappedTotal: 12,
    });

    rerender(<ReductionsTab {...defaultProps} otherQualificationSelection={["familyCare", "ageOver21"]} />);

    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("should call summarizeQualificationSelection with correct selection", () => {
    const selection = ["familyCare", "ageOver21"];
    render(<ReductionsTab {...defaultProps} otherQualificationSelection={selection} />);

    expect(mockSummarizeQualificationSelection).toHaveBeenCalledWith(selection);
  });
});
