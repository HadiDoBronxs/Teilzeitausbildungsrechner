// Tests for EducationTab component - second tab of guided tour
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key) => key,
    i18n: {},
  })),
}));

vi.mock("../../components/SchoolDegreeReductionSelect.jsx", () => ({
  default: vi.fn(({ value, onChange }) => (
    <select
      data-testid="school-degree-select"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">Select</option>
      <option value="hs">Hauptschulabschluss</option>
      <option value="fhr">Fachhochschulreife</option>
      <option value="abi">Abitur</option>
    </select>
  )),
}));

vi.mock("../../components/ui/SelectField.jsx", () => ({
  default: vi.fn(({ id, name, value, onChange, children }) => (
    <select
      data-testid={id}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  )),
}));

vi.mock("../../components/InfoTooltip.jsx", () => ({
  default: vi.fn(({ contentKey }) => (
    <div data-testid={`tooltip-${contentKey}`}>Tooltip: {contentKey}</div>
  )),
}));

import EducationTab from "../tour/EducationTab.jsx";

describe("EducationTab", () => {
  const defaultProps = {
    schoolDegreeId: null,
    onSchoolDegreeChange: vi.fn(),
    attendedUniversity: null,
    onAttendedUniversityChange: vi.fn(),
    hasEcts: null,
    onHasEctsChange: vi.fn(),
    onAcademicQualificationChange: vi.fn(),
    onBack: vi.fn(),
    onNext: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the tab panel with correct ARIA attributes", () => {
    render(<EducationTab {...defaultProps} />);

    const tabPanel = screen.getByRole("tabpanel");
    expect(tabPanel).toHaveAttribute("id", "tabpanel-education");
    expect(tabPanel).toHaveAttribute("aria-labelledby", "tab-education");
  });

  it("should render school degree select", () => {
    render(<EducationTab {...defaultProps} />);

    expect(screen.getByTestId("school-degree-select")).toBeInTheDocument();
  });

  it("should not show university question for non-FHSR/HSR degrees", () => {
    render(<EducationTab {...defaultProps} schoolDegreeId="hs" />);

    expect(screen.queryByTestId("university-select")).not.toBeInTheDocument();
  });

  it("should show university question for FHSR degree", () => {
    render(<EducationTab {...defaultProps} schoolDegreeId="fhr" />);

    expect(screen.getByTestId("university-select")).toBeInTheDocument();
  });

  it("should show university question for HSR degree", () => {
    render(<EducationTab {...defaultProps} schoolDegreeId="abi" />);

    expect(screen.getByTestId("university-select")).toBeInTheDocument();
  });

  it("should not show ECTS question when university is not 'yes'", () => {
    render(
      <EducationTab
        {...defaultProps}
        schoolDegreeId="fhr"
        attendedUniversity="no"
      />
    );

    expect(screen.queryByTestId("ects-select")).not.toBeInTheDocument();
  });

  it("should show ECTS question when university is 'yes' and degree is FHSR", () => {
    render(
      <EducationTab
        {...defaultProps}
        schoolDegreeId="fhr"
        attendedUniversity="yes"
      />
    );

    expect(screen.getByTestId("ects-select")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-tooltip.qualification.academic")).toBeInTheDocument();
  });

  it("should show ECTS question when university is 'yes' and degree is HSR", () => {
    render(
      <EducationTab
        {...defaultProps}
        schoolDegreeId="abi"
        attendedUniversity="yes"
      />
    );

    expect(screen.getByTestId("ects-select")).toBeInTheDocument();
  });

  it("should call onSchoolDegreeChange when school degree changes", () => {
    const onSchoolDegreeChange = vi.fn();
    render(<EducationTab {...defaultProps} onSchoolDegreeChange={onSchoolDegreeChange} />);

    const select = screen.getByTestId("school-degree-select");
    fireEvent.change(select, { target: { value: "fhr" } });

    expect(onSchoolDegreeChange).toHaveBeenCalledWith("fhr");
  });

  it("should call onAttendedUniversityChange when university selection changes", () => {
    const onAttendedUniversityChange = vi.fn();
    render(
      <EducationTab
        {...defaultProps}
        schoolDegreeId="fhr"
        onAttendedUniversityChange={onAttendedUniversityChange}
      />
    );

    const select = screen.getByTestId("university-select");
    fireEvent.change(select, { target: { value: "yes" } });

    expect(onAttendedUniversityChange).toHaveBeenCalled();
  });

  it("should call onHasEctsChange and onAcademicQualificationChange when ECTS changes to 'yes'", () => {
    const onHasEctsChange = vi.fn();
    const onAcademicQualificationChange = vi.fn();
    render(
      <EducationTab
        {...defaultProps}
        schoolDegreeId="fhr"
        attendedUniversity="yes"
        onHasEctsChange={onHasEctsChange}
        onAcademicQualificationChange={onAcademicQualificationChange}
      />
    );

    const select = screen.getByTestId("ects-select");
    fireEvent.change(select, { target: { value: "yes" } });

    expect(onHasEctsChange).toHaveBeenCalledWith("yes");
    expect(onAcademicQualificationChange).toHaveBeenCalledWith(true);
  });

  it("should call onHasEctsChange and onAcademicQualificationChange when ECTS changes to 'no'", () => {
    const onHasEctsChange = vi.fn();
    const onAcademicQualificationChange = vi.fn();
    render(
      <EducationTab
        {...defaultProps}
        schoolDegreeId="fhr"
        attendedUniversity="yes"
        onHasEctsChange={onHasEctsChange}
        onAcademicQualificationChange={onAcademicQualificationChange}
      />
    );

    const select = screen.getByTestId("ects-select");
    fireEvent.change(select, { target: { value: "no" } });

    expect(onHasEctsChange).toHaveBeenCalledWith("no");
    expect(onAcademicQualificationChange).toHaveBeenCalledWith(false);
  });

  it("should call onBack when Back button is clicked", () => {
    const onBack = vi.fn();
    render(<EducationTab {...defaultProps} onBack={onBack} />);

    const backButton = screen.getByRole("button", { name: /← tour.navigation.back/i });
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("should call onNext when Next button is clicked", () => {
    const onNext = vi.fn();
    render(<EducationTab {...defaultProps} onNext={onNext} />);

    const nextButton = screen.getByRole("button", { name: /tour.navigation.next →/i });
    fireEvent.click(nextButton);

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("should handle null schoolDegreeId", () => {
    render(<EducationTab {...defaultProps} schoolDegreeId={null} />);

    expect(screen.getByTestId("school-degree-select")).toHaveValue("");
  });

  it("should handle empty string schoolDegreeId", () => {
    render(<EducationTab {...defaultProps} schoolDegreeId="" />);

    expect(screen.getByTestId("school-degree-select")).toHaveValue("");
  });

  it("should hide ECTS question when university changes from 'yes' to 'no'", () => {
    const { rerender } = render(
      <EducationTab
        {...defaultProps}
        schoolDegreeId="fhr"
        attendedUniversity="yes"
      />
    );

    expect(screen.getByTestId("ects-select")).toBeInTheDocument();

    rerender(
      <EducationTab
        {...defaultProps}
        schoolDegreeId="fhr"
        attendedUniversity="no"
      />
    );

    expect(screen.queryByTestId("ects-select")).not.toBeInTheDocument();
  });

  it("should hide university question when degree changes from FHSR to non-FHSR", () => {
    const { rerender } = render(
      <EducationTab {...defaultProps} schoolDegreeId="fhr" />
    );

    expect(screen.getByTestId("university-select")).toBeInTheDocument();

    rerender(<EducationTab {...defaultProps} schoolDegreeId="hs" />);

    expect(screen.queryByTestId("university-select")).not.toBeInTheDocument();
  });

  it("should handle ECTS change with empty string value", () => {
    const onHasEctsChange = vi.fn();
    const onAcademicQualificationChange = vi.fn();
    render(
      <EducationTab
        {...defaultProps}
        schoolDegreeId="fhr"
        attendedUniversity="yes"
        onHasEctsChange={onHasEctsChange}
        onAcademicQualificationChange={onAcademicQualificationChange}
      />
    );

    const select = screen.getByTestId("ects-select");
    fireEvent.change(select, { target: { value: "" } });

    expect(onHasEctsChange).toHaveBeenCalledWith("");
    expect(onAcademicQualificationChange).toHaveBeenCalledWith(false);
  });
});
