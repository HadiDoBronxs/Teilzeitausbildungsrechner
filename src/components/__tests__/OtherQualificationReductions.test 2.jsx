// Tests for OtherQualificationReductions component - non-academic qualification reductions
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key, options) => {
      if (options) {
        return `${key} ${JSON.stringify(options)}`;
      }
      return key;
    },
    i18n: {},
  })),
}));

const mockSummarizeQualificationSelection = vi.fn();
vi.mock("../qualificationOptions.js", () => ({
  QUALIFICATION_OPTIONS: [
    { id: "familyCare", maxMonths: 12, labelKey: "qualifications.familyCare" },
    { id: "ageOver21", maxMonths: 12, labelKey: "qualifications.ageOver21" },
    { id: "completedTraining", maxMonths: 12, labelKey: "qualifications.completedTraining" },
    { id: "academic", maxMonths: 12, labelKey: "qualifications.academic" },
  ],
  MAX_QUALIFICATION_REDUCTION: 12,
  summarizeQualificationSelection: (...args) => mockSummarizeQualificationSelection(...args),
}));

vi.mock("../InfoTooltip", () => ({
  default: vi.fn(({ contentKey }) => (
    <div data-testid={`tooltip-${contentKey}`}>Tooltip: {contentKey}</div>
  )),
}));

vi.mock("../ui/SelectField", () => ({
  default: vi.fn(({ id, name, value, onChange, children }) => (
    <select data-testid={id} id={id} name={name} value={value} onChange={onChange}>
      {children}
    </select>
  )),
}));

vi.mock("../ui/ReductionInfo.jsx", () => ({
  default: vi.fn(({ months, translationKey }) => (
    <div data-testid={`reduction-info-${months}`}>
      {translationKey}: {months} months
    </div>
  )),
}));

import OtherQualificationReductions from "../OtherQualificationReductions.jsx";

describe("OtherQualificationReductions", () => {
  const defaultProps = {
    value: [],
    onChange: vi.fn(),
    onTotalChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 0,
      cappedTotal: 0,
    });
  });

  it("should render section element", () => {
    render(<OtherQualificationReductions {...defaultProps} />);

    // Section element doesn't have role="region" by default, query by element type instead
    const section = document.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass("w-full", "flex", "flex-col", "items-center", "gap-4");
  });

  it("should render all non-academic qualification options", () => {
    render(<OtherQualificationReductions {...defaultProps} />);

    expect(screen.getByTestId("qualification-select-familyCare")).toBeInTheDocument();
    expect(screen.getByTestId("qualification-select-ageOver21")).toBeInTheDocument();
    expect(screen.getByTestId("qualification-select-completedTraining")).toBeInTheDocument();
    expect(screen.queryByTestId("qualification-select-academic")).not.toBeInTheDocument();
  });

  it("should render tooltip for each qualification", () => {
    render(<OtherQualificationReductions {...defaultProps} />);

    expect(screen.getByTestId("tooltip-tooltip.qualification.familyCare")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-tooltip.qualification.ageOver21")).toBeInTheDocument();
  });

  it("should call onChange when qualification is selected", () => {
    const onChange = vi.fn();
    render(<OtherQualificationReductions {...defaultProps} onChange={onChange} />);

    const select = screen.getByTestId("qualification-select-familyCare");
    fireEvent.change(select, { target: { value: "yes" } });

    expect(onChange).toHaveBeenCalledWith(["familyCare"]);
  });

  it("should call onChange when qualification is deselected", () => {
    const onChange = vi.fn();
    render(
      <OtherQualificationReductions {...defaultProps} value={["familyCare"]} onChange={onChange} />
    );

    const select = screen.getByTestId("qualification-select-familyCare");
    fireEvent.change(select, { target: { value: "no" } });

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("should add qualification to existing selection", () => {
    const onChange = vi.fn();
    render(
      <OtherQualificationReductions
        {...defaultProps}
        value={["familyCare"]}
        onChange={onChange}
      />
    );

    const select = screen.getByTestId("qualification-select-ageOver21");
    fireEvent.change(select, { target: { value: "yes" } });

    expect(onChange).toHaveBeenCalledWith(["familyCare", "ageOver21"]);
  });

  it("should not add duplicate qualifications", () => {
    const onChange = vi.fn();
    render(
      <OtherQualificationReductions
        {...defaultProps}
        value={["familyCare"]}
        onChange={onChange}
      />
    );

    const select = screen.getByTestId("qualification-select-familyCare");
    fireEvent.change(select, { target: { value: "yes" } });

    expect(onChange).toHaveBeenCalledWith(["familyCare"]);
  });

  it("should display ReductionInfo when qualification is selected", () => {
    render(<OtherQualificationReductions {...defaultProps} value={["familyCare"]} />);

    expect(screen.getByTestId("reduction-info-12")).toBeInTheDocument();
  });

  it("should not display ReductionInfo when qualification is not selected", () => {
    render(<OtherQualificationReductions {...defaultProps} value={[]} />);

    expect(screen.queryByTestId("reduction-info-12")).not.toBeInTheDocument();
  });

  it("should call summarizeQualificationSelection with current value", () => {
    render(<OtherQualificationReductions {...defaultProps} value={["familyCare"]} />);

    expect(mockSummarizeQualificationSelection).toHaveBeenCalledWith(["familyCare"]);
  });

  it("should call onTotalChange when totals change", () => {
    const onTotalChange = vi.fn();
    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 12,
      cappedTotal: 12,
    });

    render(<OtherQualificationReductions {...defaultProps} onTotalChange={onTotalChange} value={["familyCare"]} />);

    expect(onTotalChange).toHaveBeenCalledWith({
      rawTotal: 12,
      cappedTotal: 12,
      exceedsCap: false,
    });
  });

  it("should set exceedsCap to true when rawTotal exceeds MAX_QUALIFICATION_REDUCTION", () => {
    const onTotalChange = vi.fn();
    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 24,
      cappedTotal: 12,
    });

    render(
      <OtherQualificationReductions
        {...defaultProps}
        onTotalChange={onTotalChange}
        value={["familyCare", "ageOver21"]}
      />
    );

    expect(onTotalChange).toHaveBeenCalledWith({
      rawTotal: 24,
      cappedTotal: 12,
      exceedsCap: true,
    });
  });

  it("should display summary when value has items", () => {
    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 12,
      cappedTotal: 12,
    });

    render(<OtherQualificationReductions {...defaultProps} value={["familyCare"]} />);

    expect(screen.getByText(/qualifications.summary/i)).toBeInTheDocument();
  });

  it("should not display summary when value is empty", () => {
    render(<OtherQualificationReductions {...defaultProps} value={[]} />);

    expect(screen.queryByText(/qualifications.summary/i)).not.toBeInTheDocument();
  });

  it("should handle undefined value prop", () => {
    render(<OtherQualificationReductions onChange={vi.fn()} value={undefined} />);

    expect(screen.getByTestId("qualification-select-familyCare")).toBeInTheDocument();
  });

  it("should handle undefined onChange prop", () => {
    render(<OtherQualificationReductions {...defaultProps} onChange={undefined} />);

    const select = screen.getByTestId("qualification-select-familyCare");
    fireEvent.change(select, { target: { value: "yes" } });

    // Should not throw error
    expect(select).toBeInTheDocument();
  });

  it("should handle undefined onTotalChange prop", () => {
    render(<OtherQualificationReductions {...defaultProps} onTotalChange={undefined} />);

    // Should not throw error
    expect(screen.getByTestId("qualification-select-familyCare")).toBeInTheDocument();
  });

  it("should update onTotalChange when value changes", () => {
    const onTotalChange = vi.fn();
    const { rerender } = render(
      <OtherQualificationReductions {...defaultProps} value={[]} onTotalChange={onTotalChange} />
    );

    mockSummarizeQualificationSelection.mockReturnValue({
      rawTotal: 12,
      cappedTotal: 12,
    });

    rerender(
      <OtherQualificationReductions {...defaultProps} value={["familyCare"]} onTotalChange={onTotalChange} />
    );

    expect(onTotalChange).toHaveBeenCalled();
  });
});
