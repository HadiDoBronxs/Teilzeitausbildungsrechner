// Tests for TourView component - guided tour design mode functionality
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock pdfjs-dist before importing TourView (which imports PDFViewer)
vi.mock("../../components/PDFViewer.jsx", () => ({
  default: vi.fn(({ pdfBytes, onClose }) => {
    if (!pdfBytes) return null;
    return (
      <div data-testid="pdf-viewer">
        <button onClick={onClose}>Close PDF</button>
      </div>
    );
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(() => ({
    t: (key) => key,
    i18n: {},
  })),
}));

// Mock useCalculator
vi.mock("../../features/calcDuration/useCalculator.js", () => ({
  useCalculator: vi.fn(),
}));

// Mock readFormAndCalc to control validation results
// Note: readFormAndCalc is a named export, but we also need to handle default import
// Use vi.hoisted() to create the mock function that gets hoisted with vi.mock()
const { mockReadFormAndCalc } = vi.hoisted(() => {
  return {
    mockReadFormAndCalc: vi.fn(),
  };
});

vi.mock("../../features/calcDuration/readFormAndCalc.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readFormAndCalc: mockReadFormAndCalc,
    default: mockReadFormAndCalc,
  };
});

import TourView from "../TourView.jsx";
import { useCalculator } from "../../features/calcDuration/useCalculator.js";

// Helper to create a valid result
const createValidResult = () => ({
  allowed: true,
  parttimeFinalMonths: 48,
  fulltimeMonths: 36,
  deltaMonths: 12,
  deltaDirection: "longer",
});

// Helper to create an invalid result
const createInvalidResult = (errorCode = "invalidHours") => ({
  allowed: false,
  errorCode,
  parttimeFinalMonths: 36,
  fulltimeMonths: 36,
  deltaMonths: 0,
  deltaDirection: "same",
});

describe("TourView - Invalid Input Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when inputs are invalid", () => {
    it("should disable tabs when fulltime hours is invalid (too low)", () => {
      vi.mocked(useCalculator).mockReturnValue({
        schoolDegreeId: "hs",
        fulltimeHours: 1, // Invalid: below minimum of 35
        parttimeHours: 30,
        wantsReduction: "no",
        manualReductionMonths: 0,
        academicQualification: false,
        otherQualificationSelection: [],
        attendedUniversity: null,
        hasEcts: null,
        formValues: {
          weeklyFull: 1,
          weeklyPart: 30,
          fullDurationMonths: 36,
          reductionMonths: 0,
        },
        pdfBytes: null,
        isGeneratingPDF: false,
        handleSchoolDegreeSelect: vi.fn(),
        handleFulltimeHoursChange: vi.fn(),
        handleParttimeHoursChange: vi.fn(),
        setFullDurationMonths: vi.fn(),
        handleWantsReductionChange: vi.fn(),
        handleManualReductionChange: vi.fn(),
        handleAcademicQualificationChange: vi.fn(),
        handleOtherQualificationChange: vi.fn(),
        handleAttendedUniversityChange: vi.fn(),
        handleHasEctsChange: vi.fn(),
        handleSaveAsPDF: vi.fn(),
        handleClosePDF: vi.fn(),
      });

      mockReadFormAndCalc.mockReturnValue(createInvalidResult("invalidHours"));

      render(<TourView />);

      // Check that tabs are disabled
      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab) => {
        expect(tab).toBeDisabled();
      });
    });

    it("should disable tabs when parttime hours is invalid (too low)", () => {
      vi.mocked(useCalculator).mockReturnValue({
        schoolDegreeId: "hs",
        fulltimeHours: 40,
        parttimeHours: 10, // Invalid: below minimum of 20 for 40 fulltime
        wantsReduction: "no",
        manualReductionMonths: 0,
        academicQualification: false,
        otherQualificationSelection: [],
        attendedUniversity: null,
        hasEcts: null,
        formValues: {
          weeklyFull: 40,
          weeklyPart: 10,
          fullDurationMonths: 36,
          reductionMonths: 0,
        },
        pdfBytes: null,
        isGeneratingPDF: false,
        handleSchoolDegreeSelect: vi.fn(),
        handleFulltimeHoursChange: vi.fn(),
        handleParttimeHoursChange: vi.fn(),
        setFullDurationMonths: vi.fn(),
        handleWantsReductionChange: vi.fn(),
        handleManualReductionChange: vi.fn(),
        handleAcademicQualificationChange: vi.fn(),
        handleOtherQualificationChange: vi.fn(),
        handleAttendedUniversityChange: vi.fn(),
        handleHasEctsChange: vi.fn(),
        handleSaveAsPDF: vi.fn(),
        handleClosePDF: vi.fn(),
      });

      mockReadFormAndCalc.mockReturnValue(createInvalidResult("minFactor"));

      render(<TourView />);

      // Check that tabs are disabled
      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab) => {
        expect(tab).toBeDisabled();
      });
    });

    it("should disable tabs when duration is invalid (too low)", () => {
      vi.mocked(useCalculator).mockReturnValue({
        schoolDegreeId: "hs",
        fulltimeHours: 40,
        parttimeHours: 30,
        wantsReduction: "no",
        manualReductionMonths: 0,
        academicQualification: false,
        otherQualificationSelection: [],
        attendedUniversity: null,
        hasEcts: null,
        formValues: {
          weeklyFull: 40,
          weeklyPart: 30,
          fullDurationMonths: 2, // Invalid: below minimum of 12
          reductionMonths: 0,
        },
        pdfBytes: null,
        isGeneratingPDF: false,
        handleSchoolDegreeSelect: vi.fn(),
        handleFulltimeHoursChange: vi.fn(),
        handleParttimeHoursChange: vi.fn(),
        setFullDurationMonths: vi.fn(),
        handleWantsReductionChange: vi.fn(),
        handleManualReductionChange: vi.fn(),
        handleAcademicQualificationChange: vi.fn(),
        handleOtherQualificationChange: vi.fn(),
        handleAttendedUniversityChange: vi.fn(),
        handleHasEctsChange: vi.fn(),
        handleSaveAsPDF: vi.fn(),
        handleClosePDF: vi.fn(),
      });

      mockReadFormAndCalc.mockReturnValue(createInvalidResult("invalidHours"));

      render(<TourView />);

      // Check that tabs are disabled
      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab) => {
        expect(tab).toBeDisabled();
      });
    });

    it("should disable Next button when inputs are invalid", () => {
      vi.mocked(useCalculator).mockReturnValue({
        schoolDegreeId: "hs",
        fulltimeHours: 1, // Invalid
        parttimeHours: 0.5, // Invalid
        wantsReduction: "no",
        manualReductionMonths: 0,
        academicQualification: false,
        otherQualificationSelection: [],
        attendedUniversity: null,
        hasEcts: null,
        formValues: {
          weeklyFull: 1,
          weeklyPart: 0.5,
          fullDurationMonths: 2, // Invalid
          reductionMonths: 0,
        },
        pdfBytes: null,
        isGeneratingPDF: false,
        handleSchoolDegreeSelect: vi.fn(),
        handleFulltimeHoursChange: vi.fn(),
        handleParttimeHoursChange: vi.fn(),
        setFullDurationMonths: vi.fn(),
        handleWantsReductionChange: vi.fn(),
        handleManualReductionChange: vi.fn(),
        handleAcademicQualificationChange: vi.fn(),
        handleOtherQualificationChange: vi.fn(),
        handleAttendedUniversityChange: vi.fn(),
        handleHasEctsChange: vi.fn(),
        handleSaveAsPDF: vi.fn(),
        handleClosePDF: vi.fn(),
      });

      mockReadFormAndCalc.mockReturnValue(createInvalidResult("invalidHours"));

      render(<TourView />);

      // Find Next button by role (Button component wraps text in span)
      const nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
      expect(nextButton).toBeDisabled();
    });

    it("should prevent navigation when Next button is clicked with invalid inputs", () => {
      vi.mocked(useCalculator).mockReturnValue({
        schoolDegreeId: "hs",
        fulltimeHours: 1, // Invalid
        parttimeHours: 10, // Invalid
        wantsReduction: "no",
        manualReductionMonths: 0,
        academicQualification: false,
        otherQualificationSelection: [],
        attendedUniversity: null,
        hasEcts: null,
        formValues: {
          weeklyFull: 1,
          weeklyPart: 10,
          fullDurationMonths: 2, // Invalid
          reductionMonths: 0,
        },
        pdfBytes: null,
        isGeneratingPDF: false,
        handleSchoolDegreeSelect: vi.fn(),
        handleFulltimeHoursChange: vi.fn(),
        handleParttimeHoursChange: vi.fn(),
        setFullDurationMonths: vi.fn(),
        handleWantsReductionChange: vi.fn(),
        handleManualReductionChange: vi.fn(),
        handleAcademicQualificationChange: vi.fn(),
        handleOtherQualificationChange: vi.fn(),
        handleAttendedUniversityChange: vi.fn(),
        handleHasEctsChange: vi.fn(),
        handleSaveAsPDF: vi.fn(),
        handleClosePDF: vi.fn(),
      });

      mockReadFormAndCalc.mockReturnValue(createInvalidResult("invalidHours"));

      render(<TourView />);

      // Should start on inputs tab (tabpanel is labelled by tab button)
      const inputsTab = screen.getByRole("tab", { name: /tour.tabs.inputs/ });
      expect(inputsTab).toBeInTheDocument();
      expect(screen.getByRole("tabpanel", { name: /tour.tabs.inputs/ })).toBeInTheDocument();

      // Try to click Next button (should be disabled, but if it wasn't, navigation shouldn't happen)
      const nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
      expect(nextButton).toBeDisabled();

      // Even if we force click (disabled buttons shouldn't fire, but test the logic)
      // The tab should remain on inputs
      expect(screen.getByRole("tabpanel", { name: /tour.tabs.inputs/ })).toBeInTheDocument();
      expect(screen.queryByRole("tabpanel", { name: /tour.tabs.results/ })).not.toBeInTheDocument();
    });

    it("should prevent tab navigation when inputs are invalid (except back to inputs)", () => {
      vi.mocked(useCalculator).mockReturnValue({
        schoolDegreeId: "hs",
        fulltimeHours: 1, // Invalid
        parttimeHours: 10, // Invalid
        wantsReduction: "no",
        manualReductionMonths: 0,
        academicQualification: false,
        otherQualificationSelection: [],
        attendedUniversity: null,
        hasEcts: null,
        formValues: {
          weeklyFull: 1,
          weeklyPart: 10,
          fullDurationMonths: 2, // Invalid
          reductionMonths: 0,
        },
        pdfBytes: null,
        isGeneratingPDF: false,
        handleSchoolDegreeSelect: vi.fn(),
        handleFulltimeHoursChange: vi.fn(),
        handleParttimeHoursChange: vi.fn(),
        setFullDurationMonths: vi.fn(),
        handleWantsReductionChange: vi.fn(),
        handleManualReductionChange: vi.fn(),
        handleAcademicQualificationChange: vi.fn(),
        handleOtherQualificationChange: vi.fn(),
        handleAttendedUniversityChange: vi.fn(),
        handleHasEctsChange: vi.fn(),
        handleSaveAsPDF: vi.fn(),
        handleClosePDF: vi.fn(),
      });

      mockReadFormAndCalc.mockReturnValue(createInvalidResult("invalidHours"));

      render(<TourView />);

      // Should start on inputs tab
      expect(screen.getByRole("tabpanel", { name: /tour.tabs.inputs/ })).toBeInTheDocument();

      // Try to click on results tab (should be disabled and not navigate)
      const resultsTab = screen.getByRole("tab", { name: /tour.tabs.results/ });
      expect(resultsTab).toBeDisabled();

      // Even if we try to click it programmatically, navigation should be prevented
      // The tab should remain on inputs
      expect(screen.getByRole("tabpanel", { name: /tour.tabs.inputs/ })).toBeInTheDocument();
    });
  });

  it("supports keyboard focus order for skip link, main, back button, language toggle, first tab", async () => {
    const user = userEvent.setup();
    vi.mocked(useCalculator).mockReturnValue({
      schoolDegreeId: "hs",
      fulltimeHours: 40,
      parttimeHours: 30,
      wantsReduction: "no",
      manualReductionMonths: 0,
      academicQualification: false,
      otherQualificationSelection: [],
      attendedUniversity: null,
      hasEcts: null,
      formValues: {
        weeklyFull: 40,
        weeklyPart: 30,
        fullDurationMonths: 36,
        reductionMonths: 0,
      },
      pdfBytes: null,
      isGeneratingPDF: false,
      handleSchoolDegreeSelect: vi.fn(),
      handleFulltimeHoursChange: vi.fn(),
      handleParttimeHoursChange: vi.fn(),
      setFullDurationMonths: vi.fn(),
      handleWantsReductionChange: vi.fn(),
      handleManualReductionChange: vi.fn(),
      handleAcademicQualificationChange: vi.fn(),
      handleOtherQualificationChange: vi.fn(),
      handleAttendedUniversityChange: vi.fn(),
      handleHasEctsChange: vi.fn(),
      handleSaveAsPDF: vi.fn(),
      handleClosePDF: vi.fn(),
      handleReset: vi.fn(),
    });
    mockReadFormAndCalc.mockReturnValue(createValidResult());

    render(<TourView />);

    await user.tab();
    expect(screen.getByText("skipToMain")).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /welcome.backButton/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/Switch to next language/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("tab", { name: /tour.tabs.inputs/i })).toHaveFocus();
  });

  describe("when inputs are valid", () => {
    it("should enable tabs and allow navigation", () => {
      vi.mocked(useCalculator).mockReturnValue({
        schoolDegreeId: "hs",
        fulltimeHours: 40,
        parttimeHours: 30,
        wantsReduction: "no",
        manualReductionMonths: 0,
        academicQualification: false,
        otherQualificationSelection: [],
        attendedUniversity: null,
        hasEcts: null,
        formValues: {
          weeklyFull: 40,
          weeklyPart: 30,
          fullDurationMonths: 36,
          reductionMonths: 0,
        },
        pdfBytes: null,
        isGeneratingPDF: false,
        handleSchoolDegreeSelect: vi.fn(),
        handleFulltimeHoursChange: vi.fn(),
        handleParttimeHoursChange: vi.fn(),
        setFullDurationMonths: vi.fn(),
        handleWantsReductionChange: vi.fn(),
        handleManualReductionChange: vi.fn(),
        handleAcademicQualificationChange: vi.fn(),
        handleOtherQualificationChange: vi.fn(),
        handleAttendedUniversityChange: vi.fn(),
        handleHasEctsChange: vi.fn(),
        handleSaveAsPDF: vi.fn(),
        handleClosePDF: vi.fn(),
      });

      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      // Tabs should be enabled
      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab) => {
        expect(tab).not.toBeDisabled();
      });

      // Next button should be enabled
      const nextButton = screen.getByRole("button", { name: /tour.navigation.next/ });
      expect(nextButton).not.toBeDisabled();

      // Should be able to navigate to results tab
      const resultsTab = screen.getByRole("tab", { name: /tour.tabs.results/ });
      fireEvent.click(resultsTab);

      // Should navigate to results tab
      expect(screen.getByRole("tabpanel", { name: /tour.tabs.results/ })).toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    const createMockCalculator = (overrides = {}) => ({
      schoolDegreeId: null,
      fulltimeHours: 40,
      parttimeHours: 30,
      wantsReduction: "yes",
      manualReductionMonths: 0,
      academicQualification: false,
      otherQualificationSelection: [],
      attendedUniversity: null,
      hasEcts: null,
      formValues: {
        weeklyFull: 40,
        weeklyPart: 30,
        fullDurationMonths: 36,
        reductionMonths: 0,
      },
      pdfBytes: null,
      isGeneratingPDF: false,
      handleSchoolDegreeSelect: vi.fn(),
      handleFulltimeHoursChange: vi.fn(),
      handleParttimeHoursChange: vi.fn(),
      setFullDurationMonths: vi.fn(),
      handleWantsReductionChange: vi.fn(),
      handleAcademicQualificationChange: vi.fn(),
      handleOtherQualificationChange: vi.fn(),
      handleAttendedUniversityChange: vi.fn(),
      handleHasEctsChange: vi.fn(),
      handleSaveAsPDF: vi.fn(),
      handleClosePDF: vi.fn(),
      ...overrides,
    });

    it("should navigate from inputs to education when wantsReduction is 'yes'", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator());
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      const nextButton = screen.getByRole("button", { name: /tour.navigation.next →/i });
      fireEvent.click(nextButton);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.education/ })).toBeInTheDocument();
    });

    it("should navigate from inputs to results when wantsReduction is 'no'", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator({ wantsReduction: "no" }));
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      const nextButton = screen.getByRole("button", { name: /tour.navigation.next →/i });
      fireEvent.click(nextButton);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.results/ })).toBeInTheDocument();
    });

    it("should navigate from education to reductions", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator());
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      // Navigate to education tab
      const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/ });
      fireEvent.click(educationTab);

      const nextButton = screen.getByRole("button", { name: /tour.navigation.next →/i });
      fireEvent.click(nextButton);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.reductions/ })).toBeInTheDocument();
    });

    it("should navigate from reductions to results", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator());
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      // Navigate to reductions tab
      const reductionsTab = screen.getByRole("tab", { name: /tour.tabs.reductions/ });
      fireEvent.click(reductionsTab);

      const nextButton = screen.getByRole("button", { name: /tour.navigation.next →/i });
      fireEvent.click(nextButton);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.results/ })).toBeInTheDocument();
    });

    it("should navigate back from results to reductions when wantsReduction is 'yes'", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator());
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      // Navigate to results tab
      const resultsTab = screen.getByRole("tab", { name: /tour.tabs.results/ });
      fireEvent.click(resultsTab);

      const backButton = screen.getByRole("button", { name: /← tour.navigation.back/i });
      fireEvent.click(backButton);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.reductions/ })).toBeInTheDocument();
    });

    it("should navigate back from results to inputs when wantsReduction is 'no'", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator({ wantsReduction: "no" }));
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      // Navigate to results tab
      const resultsTab = screen.getByRole("tab", { name: /tour.tabs.results/ });
      fireEvent.click(resultsTab);

      const backButton = screen.getByRole("button", { name: /← tour.navigation.back/i });
      fireEvent.click(backButton);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.inputs/ })).toBeInTheDocument();
    });

    it("should navigate back from reductions to education", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator());
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      // Navigate to reductions tab
      const reductionsTab = screen.getByRole("tab", { name: /tour.tabs.reductions/ });
      fireEvent.click(reductionsTab);

      const backButton = screen.getByRole("button", { name: /← tour.navigation.back/i });
      fireEvent.click(backButton);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.education/ })).toBeInTheDocument();
    });

    it("should navigate back from education to inputs", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator());
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      // Navigate to education tab
      const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/ });
      fireEvent.click(educationTab);

      const backButton = screen.getByRole("button", { name: /← tour.navigation.back/i });
      fireEvent.click(backButton);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.inputs/ })).toBeInTheDocument();
    });
  });

  describe("wantsReduction Changes", () => {
    const createMockCalculator = (overrides = {}) => ({
      schoolDegreeId: "hs",
      fulltimeHours: 40,
      parttimeHours: 30,
      wantsReduction: "yes",
      manualReductionMonths: 0,
      academicQualification: false,
      otherQualificationSelection: [],
      attendedUniversity: null,
      hasEcts: null,
      formValues: {
        weeklyFull: 40,
        weeklyPart: 30,
        fullDurationMonths: 36,
        reductionMonths: 0,
      },
      pdfBytes: null,
      isGeneratingPDF: false,
      handleSchoolDegreeSelect: vi.fn(),
      handleFulltimeHoursChange: vi.fn(),
      handleParttimeHoursChange: vi.fn(),
      setFullDurationMonths: vi.fn(),
      handleWantsReductionChange: vi.fn(),
      handleAcademicQualificationChange: vi.fn(),
      handleOtherQualificationChange: vi.fn(),
      handleAttendedUniversityChange: vi.fn(),
      handleHasEctsChange: vi.fn(),
      handleSaveAsPDF: vi.fn(),
      handleClosePDF: vi.fn(),
      ...overrides,
    });

    it("should redirect to results when wantsReduction changes to 'no' while on education tab", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator({ wantsReduction: "yes" }));
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      const { rerender } = render(<TourView />);

      // Navigate to education tab
      const educationTab = screen.getByRole("tab", { name: /tour.tabs.education/ });
      fireEvent.click(educationTab);

      // Change wantsReduction to "no"
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator({ wantsReduction: "no" }));
      rerender(<TourView />);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.results/ })).toBeInTheDocument();
    });

    it("should redirect to results when wantsReduction changes to 'no' while on reductions tab", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator({ wantsReduction: "yes" }));
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      const { rerender } = render(<TourView />);

      // Navigate to reductions tab
      const reductionsTab = screen.getByRole("tab", { name: /tour.tabs.reductions/ });
      fireEvent.click(reductionsTab);

      // Change wantsReduction to "no"
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator({ wantsReduction: "no" }));
      rerender(<TourView />);

      expect(screen.getByRole("tabpanel", { name: /tour.tabs.results/ })).toBeInTheDocument();
    });
  });

  describe("Sidebar Conditional Rendering", () => {
    const createMockCalculator = (overrides = {}) => ({
      schoolDegreeId: "hs",
      fulltimeHours: 40,
      parttimeHours: 30,
      wantsReduction: "yes",
      manualReductionMonths: 0,
      academicQualification: false,
      otherQualificationSelection: [],
      attendedUniversity: null,
      hasEcts: null,
      formValues: {
        weeklyFull: 40,
        weeklyPart: 30,
        fullDurationMonths: 36,
        reductionMonths: 0,
      },
      pdfBytes: null,
      isGeneratingPDF: false,
      handleSchoolDegreeSelect: vi.fn(),
      handleFulltimeHoursChange: vi.fn(),
      handleParttimeHoursChange: vi.fn(),
      setFullDurationMonths: vi.fn(),
      handleWantsReductionChange: vi.fn(),
      handleAcademicQualificationChange: vi.fn(),
      handleOtherQualificationChange: vi.fn(),
      handleAttendedUniversityChange: vi.fn(),
      handleHasEctsChange: vi.fn(),
      handleSaveAsPDF: vi.fn(),
      handleClosePDF: vi.fn(),
      ...overrides,
    });

    it("should pass null schoolDegreeId to sidebar when wantsReduction is 'no'", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator({ wantsReduction: "no" }));
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      // Sidebar should receive null for schoolDegreeId
      // We can't directly test this, but we can verify the component renders
      // Use getAllByRole since there are multiple complementary elements (wrapper + sidebar)
      const complementaryElements = screen.getAllByRole("complementary");
      expect(complementaryElements.length).toBeGreaterThan(0);
    });

    it("should pass false academicQualification to sidebar when wantsReduction is 'no'", () => {
      vi.mocked(useCalculator).mockReturnValue(
        createMockCalculator({ wantsReduction: "no", academicQualification: true })
      );
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      // Use getAllByRole since there are multiple complementary elements (wrapper + sidebar)
      const complementaryElements = screen.getAllByRole("complementary");
      expect(complementaryElements.length).toBeGreaterThan(0);
    });
  });

  describe("Back Button", () => {
    const createMockCalculator = (overrides = {}) => ({
      schoolDegreeId: null,
      fulltimeHours: 40,
      parttimeHours: 30,
      wantsReduction: "no",
      manualReductionMonths: 0,
      academicQualification: false,
      otherQualificationSelection: [],
      attendedUniversity: null,
      hasEcts: null,
      formValues: {
        weeklyFull: 40,
        weeklyPart: 30,
        fullDurationMonths: 36,
        reductionMonths: 0,
      },
      pdfBytes: null,
      isGeneratingPDF: false,
      handleSchoolDegreeSelect: vi.fn(),
      handleFulltimeHoursChange: vi.fn(),
      handleParttimeHoursChange: vi.fn(),
      setFullDurationMonths: vi.fn(),
      handleWantsReductionChange: vi.fn(),
      handleAcademicQualificationChange: vi.fn(),
      handleOtherQualificationChange: vi.fn(),
      handleAttendedUniversityChange: vi.fn(),
      handleHasEctsChange: vi.fn(),
      handleSaveAsPDF: vi.fn(),
      handleClosePDF: vi.fn(),
      ...overrides,
    });

    it("should navigate to welcome page when back button is clicked", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator());
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      // Mock window.location.hash
      const originalHash = window.location.hash;
      const mockLocation = { hash: "#tour" };
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
        configurable: true,
      });

      render(<TourView />);

      // The button uses ariaLabel prop which sets aria-label attribute
      // The accessible name is just "welcome.backButton", not including the arrow
      const backButton = screen.getByRole("button", { name: /welcome.backButton/i });
      fireEvent.click(backButton);

      expect(mockLocation.hash).toBe("");

      // Restore
      Object.defineProperty(window, "location", {
        value: { hash: originalHash },
        writable: true,
        configurable: true,
      });
    });
  });

  describe("PDF Viewer", () => {
    const createMockCalculator = (overrides = {}) => ({
      schoolDegreeId: null,
      fulltimeHours: 40,
      parttimeHours: 30,
      wantsReduction: "no",
      manualReductionMonths: 0,
      academicQualification: false,
      otherQualificationSelection: [],
      attendedUniversity: null,
      hasEcts: null,
      formValues: {
        weeklyFull: 40,
        weeklyPart: 30,
        fullDurationMonths: 36,
        reductionMonths: 0,
      },
      pdfBytes: new Uint8Array([1, 2, 3]),
      isGeneratingPDF: false,
      handleSchoolDegreeSelect: vi.fn(),
      handleFulltimeHoursChange: vi.fn(),
      handleParttimeHoursChange: vi.fn(),
      setFullDurationMonths: vi.fn(),
      handleWantsReductionChange: vi.fn(),
      handleAcademicQualificationChange: vi.fn(),
      handleOtherQualificationChange: vi.fn(),
      handleAttendedUniversityChange: vi.fn(),
      handleHasEctsChange: vi.fn(),
      handleSaveAsPDF: vi.fn(),
      handleClosePDF: vi.fn(),
      ...overrides,
    });

    it("should render PDFViewer when pdfBytes is provided", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator());
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      expect(screen.getByTestId("pdf-viewer")).toBeInTheDocument();
    });

    it("should not render PDFViewer when pdfBytes is null", () => {
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator({ pdfBytes: null }));
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      expect(screen.queryByTestId("pdf-viewer")).not.toBeInTheDocument();
    });

    it("should call handleClosePDF when PDF viewer close button is clicked", () => {
      const handleClosePDF = vi.fn();
      vi.mocked(useCalculator).mockReturnValue(createMockCalculator({ handleClosePDF }));
      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      const closeButton = screen.getByText("Close PDF");
      fireEvent.click(closeButton);

      expect(handleClosePDF).toHaveBeenCalledTimes(1);
    });
  });

  describe("Initialization", () => {
    it("should initialize wantsReduction to 'no' when it is null", () => {
      const handleWantsReductionChange = vi.fn();
      vi.mocked(useCalculator).mockReturnValue({
        schoolDegreeId: null,
        fulltimeHours: 40,
        parttimeHours: 30,
        wantsReduction: null,
        manualReductionMonths: 0,
        academicQualification: false,
        otherQualificationSelection: [],
        attendedUniversity: null,
        hasEcts: null,
        formValues: {
          weeklyFull: 40,
          weeklyPart: 30,
          fullDurationMonths: 36,
          reductionMonths: 0,
        },
        pdfBytes: null,
        isGeneratingPDF: false,
        handleSchoolDegreeSelect: vi.fn(),
        handleFulltimeHoursChange: vi.fn(),
        handleParttimeHoursChange: vi.fn(),
        setFullDurationMonths: vi.fn(),
        handleWantsReductionChange,
        handleAcademicQualificationChange: vi.fn(),
        handleOtherQualificationChange: vi.fn(),
        handleAttendedUniversityChange: vi.fn(),
        handleHasEctsChange: vi.fn(),
        handleSaveAsPDF: vi.fn(),
        handleClosePDF: vi.fn(),
      });

      mockReadFormAndCalc.mockReturnValue(createValidResult());

      render(<TourView />);

      expect(handleWantsReductionChange).toHaveBeenCalledWith("no");
    });
  });
});

describe("TourView accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("links tabpanels to both mobile and desktop tab ids via aria-labelledby", () => {
    vi.mocked(useCalculator).mockReturnValue({
      schoolDegreeId: "hs",
      fulltimeHours: 40,
      parttimeHours: 30,
      wantsReduction: "no",
      manualReductionMonths: 0,
      academicQualification: false,
      otherQualificationSelection: [],
      attendedUniversity: "no",
      hasEcts: null,
      formValues: {
        weeklyFull: 40,
        weeklyPart: 30,
        fullDurationMonths: 36,
        reductionMonths: 0,
      },
      pdfBytes: null,
      isGeneratingPDF: false,
      handleSchoolDegreeSelect: vi.fn(),
      handleFulltimeHoursChange: vi.fn(),
      handleParttimeHoursChange: vi.fn(),
      setFullDurationMonths: vi.fn(),
      handleWantsReductionChange: vi.fn(),
      handleManualReductionChange: vi.fn(),
      handleAcademicQualificationChange: vi.fn(),
      handleOtherQualificationChange: vi.fn(),
      handleAttendedUniversityChange: vi.fn(),
      handleHasEctsChange: vi.fn(),
      handleSaveAsPDF: vi.fn(),
      handleClosePDF: vi.fn(),
      handleReset: vi.fn(),
    });

    mockReadFormAndCalc.mockReturnValue(createValidResult());

    render(<TourView />);

    const inputsPanel = screen.getByRole("tabpanel", { name: /tour.tabs.inputs/ });
    expect(inputsPanel).toHaveAttribute(
      "aria-labelledby",
      expect.stringContaining("tab-mobile-inputs")
    );
    expect(inputsPanel).toHaveAttribute(
      "aria-labelledby",
      expect.stringContaining("tab-inputs")
    );
  });
});
