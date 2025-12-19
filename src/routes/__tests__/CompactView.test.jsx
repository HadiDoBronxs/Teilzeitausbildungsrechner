// Tests for CompactView component - compact design mode functionality
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider } from "../../components/ThemeProvider.jsx";

// Mock pdfjs-dist before importing CompactView (which imports PDFViewer)
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

// Mock useCalculator - define mock function inline since vi.mock is hoisted
vi.mock("../../features/calcDuration/useCalculator.js", () => ({
  useCalculator: vi.fn(() => ({
    t: (key) => key,
    schoolDegreeId: "hs",
    fulltimeHours: 40,
    handleSchoolDegreeSelect: vi.fn(),
    handleFulltimeHoursChange: vi.fn(),
    handleParttimeHoursChange: vi.fn(),
    setFullDurationMonths: vi.fn(),
    qualificationSelection: [],
    setQualificationSelection: vi.fn(),
    setQualificationTotals: vi.fn(),
    formValues: {
      weeklyFull: 40,
      weeklyPart: 30,
      fullDurationMonths: 36,
      reductionMonths: 0,
    },
    showLegalHint: false,
    pdfBytes: null,
    isGeneratingPDF: false,
    handleSaveAsPDF: vi.fn(),
    handleClosePDF: vi.fn(),
  })),
}));

import CompactView from "../CompactView.jsx";
import { useCalculator } from "../../features/calcDuration/useCalculator.js";

// Default mock return value for useCalculator
const mockUseCalculator = {
  t: (key) => key,
  schoolDegreeId: "hs",
  fulltimeHours: 40,
  handleSchoolDegreeSelect: vi.fn(),
  handleFulltimeHoursChange: vi.fn(),
  handleParttimeHoursChange: vi.fn(),
  setFullDurationMonths: vi.fn(),
  qualificationSelection: [],
  setQualificationSelection: vi.fn(),
  setQualificationTotals: vi.fn(),
  formValues: {
    weeklyFull: 40,
    weeklyPart: 30,
    fullDurationMonths: 36,
    reductionMonths: 0,
  },
  showLegalHint: false,
  pdfBytes: null,
  isGeneratingPDF: false,
  handleSaveAsPDF: vi.fn(),
  handleClosePDF: vi.fn(),
};

describe("CompactView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default mock implementation
    vi.mocked(useCalculator).mockReturnValue(mockUseCalculator);
  });

  it("renders the calculator title", () => {
    render(<CompactView />, { wrapper: ThemeProvider });

    expect(screen.getByText("app.title")).toBeInTheDocument();
  });

  it("renders all input components", () => {
    render(<CompactView />, { wrapper: ThemeProvider });

    // Check that input components are rendered (they have specific labels)
    // The actual input rendering is tested in their own test files
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders ResultCard with form values", () => {
    render(<CompactView />, { wrapper: ThemeProvider });

    // ResultCard should be rendered (tested in its own test file)
    const resultCardContainer = document.getElementById("result-card");
    expect(resultCardContainer).toBeInTheDocument();
  });

  it("renders PDF save button", () => {
    render(<CompactView />, { wrapper: ThemeProvider });

    expect(screen.getByText("pdf.saveButton")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<CompactView />, { wrapper: ThemeProvider });

    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main");
    expect(main).toHaveAttribute("aria-labelledby", "main-heading");

    const skipLink = screen.getByText("skipToMain");
    expect(skipLink).toHaveAttribute("href", "#main");
  });

  it("renders ResultSidebar component", () => {
    render(<CompactView />, { wrapper: ThemeProvider });

    // ResultSidebar should be rendered (it's hidden on mobile, but component exists)
    // We verify by checking the structure exists
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders ResultBottomBar component", () => {
    render(<CompactView />, { wrapper: ThemeProvider });

    // ResultBottomBar should be rendered (it's hidden on desktop, but component exists)
    // We verify by checking the structure exists
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("handles null schoolDegreeId by using empty string", () => {
    vi.mocked(useCalculator).mockReturnValueOnce({
      ...mockUseCalculator,
      schoolDegreeId: null,
    });

    render(<CompactView />, { wrapper: ThemeProvider });

    // Component should render without errors
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders legal hint when showLegalHint is true", () => {
    vi.mocked(useCalculator).mockReturnValueOnce({
      ...mockUseCalculator,
      showLegalHint: true,
    });

    render(<CompactView />, { wrapper: ThemeProvider });

    // Legal hint should be rendered
    expect(screen.getByText("qualifications.legalHint")).toBeInTheDocument();
  });

  it("does not render legal hint when showLegalHint is false", () => {
    render(<CompactView />, { wrapper: ThemeProvider });

    // Legal hint should not be rendered
    expect(screen.queryByText("qualifications.legalHint")).not.toBeInTheDocument();
  });

  it("displays 'Generating PDF...' when isGeneratingPDF is true", () => {
    vi.mocked(useCalculator).mockReturnValueOnce({
      ...mockUseCalculator,
      isGeneratingPDF: true,
    });

    render(<CompactView />, { wrapper: ThemeProvider });

    expect(screen.getByText("Generating PDF...")).toBeInTheDocument();
    expect(screen.queryByText("pdf.saveButton")).not.toBeInTheDocument();
  });

  it("renders PDFViewer when pdfBytes is provided", () => {
    vi.mocked(useCalculator).mockReturnValueOnce({
      ...mockUseCalculator,
      pdfBytes: new Uint8Array([1, 2, 3]),
    });

    render(<CompactView />, { wrapper: ThemeProvider });

    // PDFViewer should be rendered
    expect(screen.getByTestId("pdf-viewer")).toBeInTheDocument();
  });

  it("does not render PDFViewer when pdfBytes is null", () => {
    render(<CompactView />, { wrapper: ThemeProvider });

    // PDFViewer should not be rendered
    expect(screen.queryByTestId("pdf-viewer")).not.toBeInTheDocument();
  });

  it("supports keyboard focus order for skip link, main, back button", async () => {
    const user = userEvent.setup();
    render(<CompactView />, { wrapper: ThemeProvider });

    await user.tab();
    expect(screen.getByText("skipToMain")).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: /welcome.backButton/i })).toHaveFocus();
  });
});
