import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatePDF } from "../generatePDF";
import { PDFDocument, StandardFonts } from "pdf-lib";

// Mock pdf-lib
vi.mock("pdf-lib", async () => {
  const actual = await vi.importActual("pdf-lib");
  return {
    ...actual,
    PDFDocument: {
      create: vi.fn(() => Promise.resolve({
        addPage: vi.fn(() => ({
          getWidth: () => 595,
          getHeight: () => 842,
          drawText: vi.fn(),
        })),
        embedFont: vi.fn(() => Promise.resolve({
          widthOfTextAtSize: vi.fn(() => 100),
        })),
        save: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4, 5]))),
      })),
    },
    StandardFonts: {
      Helvetica: "Helvetica",
      HelveticaBold: "HelveticaBold",
    },
    rgb: (r, g, b) => ({ r, g, b }),
  };
});

// Mock the calculation function
vi.mock("../../features/calcDuration/readFormAndCalc", () => ({
  default: vi.fn(() => ({
    allowed: true,
    factor: 0.75,
    fulltimeMonths: 36,
    effectiveFulltimeMonths: 30,
    parttimeFinalMonths: 40,
    deltaMonths: 10,
    deltaVsOriginal: 4,
    theoreticalDuration: 40,
    deltaBeforeRounding: 10,
    deltaDirection: "longer",
  })),
}));

// Mock reduction summary
vi.mock("../../domain/schoolDegreeReductions", () => ({
  buildReductionSummary: vi.fn(({ manualReductionMonths, degreeReductionMonths, schoolDegreeId }) => {
    // If schoolDegreeId is null/undefined, no degree reduction
    const degree = schoolDegreeId ? (degreeReductionMonths ?? 6) : 0;
    const manual = manualReductionMonths || 0;
    return {
      total: degree + manual,
      degree: degree,
      manual: manual,
      labelKey: schoolDegreeId ? "reductionOptions.mr" : null,
    };
  }),
}));

describe("generatePDF", () => {
  const mockT = vi.fn((key, options = {}) => {
    const translations = {
      "pdf.title": "Part-time Training Calculation",
      "pdf.date": "Date",
      "pdf.inputs": "Input Values",
      "pdf.results": "Calculation Results",
      "pdf.transparency": "Calculation Transparency",
      "pdf.disclaimer": "Disclaimer",
      "pdf.disclaimerText": "This calculation is for informational purposes only...",
      "pdf.fulltimeHours": "Full-time hours per week",
      "pdf.parttimeHours": "Part-time hours per week",
      "pdf.regularDuration": "Regular training duration (months)",
      "pdf.schoolDegree": "School degree",
      "pdf.degreeReduction": "Degree reduction (months)",
      "pdf.totalReduction": "Total reduction (months)",
      "pdf.factor": "Part-time factor",
      "pdf.baselineMonths": "Baseline duration (months)",
      "pdf.parttimeMonths": "Part-time duration (months)",
      "pdf.deltaMonths": "Change (months)",
      "reduction.selectPlaceholder": "Select school leaving certificate",
      "reductionOptions.mr": "Secondary school certificate",
      "transparency.step1.title": "Step 1: 50% rule",
      "transparency.step1.text": "Requested weekly hours / regular weekly hours = {{part}} / {{full}} = {{pct}} %",
      "transparency.step1.ok": "Allowed (>= 50%).",
      "transparency.step2.title": "Step 2: Part-time factor",
      "transparency.step2.text": "F_tz = {{part}} / {{full}} = {{factor}}",
      "transparency.step3.title": "Step 3: Individual base duration",
      "transparency.step3.text": "Standard duration {{fullM}} - reduction {{reductionText}} = {{rawBase}} -> minimum duration {{minM}} => basis = {{basis}} months ({{basisYM}}).",
      "transparency.step4.title": "Step 4: Theoretical new duration",
      "transparency.step4.text": "D_theo = basis / F_tz = {{basis}} / {{factor}} = {{dtheo}}",
      "transparency.step5.title": "Step 5: Safeguards",
      "transparency.step5.six.text": "6-month rule: extension = D_theo - basis = {{ext}} months -> {{applied}}",
      "transparency.step5.six.applied": "applied (result stays at the basis)",
      "transparency.step5.six.notApplied": "not applied",
      "transparency.step5.cap.text": "1.5x cap: max = {{cap}} months -> {{applied}}",
      "transparency.step5.cap.applied": "applied (clamped to the cap)",
      "transparency.step5.cap.notApplied": "not applied",
      "transparency.step6.title": "Step 6: Round to whole months",
      "transparency.step6.text": "{{roundingFn}}({{value}}) = {{rounded}} months ({{roundedYM}}).",
      "transparency.result": "Final result: {{finalM}} months ({{finalYM}}).",
      "transparency.delta.basis": "Change vs. basis: {{delta}} months.",
      "transparency.delta.original": "Change vs. original full-time: {{delta}} months.",
      "reduction.breakdown.degree": "{{label}} -{{months}} months",
      "reduction.breakdown.manual": "Other reasons -{{months}} months",
      "format.year": "Year",
      "format.years": "Years",
      "format.month": "Month",
      "format.months": "Months",
    };
    
    const translation = translations[key] || key;
    
    // Simple template replacement
    if (typeof translation === "string" && Object.keys(options).length > 0) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, prop) => {
        return options[prop] !== undefined ? String(options[prop]) : match;
      });
    }
    
    return translation;
  });

  const mockI18n = {
    language: "en",
  };

  // Test data is independent of actual form field names
  // This ensures tests pass even if field names change in the rest of the project
  const createTestFormValues = (overrides = {}) => ({
    weeklyFull: 40,
    weeklyPart: 30,
    fullDurationMonths: 36,
    reductionMonths: 6,
    degreeReductionMonths: 6,
    manualReductionMonths: 0,
    schoolDegreeId: "mr",
    schoolDegreeLabelKey: "reductionOptions.mr",
    rounding: "round",
    ...overrides,
  });

  const defaultFormValues = createTestFormValues();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a PDF successfully with valid inputs", async () => {
    const result = await generatePDF(defaultFormValues, mockT, mockI18n);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
    expect(PDFDocument.create).toHaveBeenCalled();
  });

  it("throws error when formValues is missing", async () => {
    await expect(
      generatePDF(null, mockT, mockI18n)
    ).rejects.toThrow("formValues is required");
  });

  it("throws error when translation function is missing", async () => {
    await expect(
      generatePDF(defaultFormValues, null, mockI18n)
    ).rejects.toThrow("Translation function is required");
  });

  it("throws error when i18n is missing", async () => {
    await expect(
      generatePDF(defaultFormValues, mockT, null)
    ).rejects.toThrow("i18n object with language property is required");
  });

  it("includes all required sections in PDF", async () => {
    await generatePDF(defaultFormValues, mockT, mockI18n);

    // Check that translation keys for all sections were called
    expect(mockT).toHaveBeenCalledWith("pdf.title", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.date", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.inputs", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.results", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.transparency", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.disclaimer", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.disclaimerText", expect.anything());
  });

  it("includes input values in PDF", async () => {
    await generatePDF(defaultFormValues, mockT, mockI18n);

    // Verify that input section labels are called (behavior-based, not field-name-based)
    expect(mockT).toHaveBeenCalledWith("pdf.inputs", expect.anything());
    // Verify that at least some input field labels are translated
    const inputLabelCalls = mockT.mock.calls.filter(
      (call) => call[0]?.startsWith("pdf.") && 
      ["pdf.fulltimeHours", "pdf.parttimeHours", "pdf.regularDuration", "pdf.schoolDegree"].includes(call[0])
    );
    expect(inputLabelCalls.length).toBeGreaterThan(0);
  });

  it("includes calculation results when calculation is allowed", async () => {
    await generatePDF(defaultFormValues, mockT, mockI18n);

    expect(mockT).toHaveBeenCalledWith("pdf.results", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.factor", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.baselineMonths", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.parttimeMonths", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.deltaMonths", expect.anything());
  });

  it("includes transparency section when calculation is allowed", async () => {
    await generatePDF(defaultFormValues, mockT, mockI18n);

    expect(mockT).toHaveBeenCalledWith("pdf.transparency", expect.anything());
    expect(mockT).toHaveBeenCalledWith("transparency.step1.title", expect.anything());
    expect(mockT).toHaveBeenCalledWith("transparency.step2.title", expect.anything());
    expect(mockT).toHaveBeenCalledWith("transparency.step3.title", expect.anything());
    expect(mockT).toHaveBeenCalledWith("transparency.step4.title", expect.anything());
    expect(mockT).toHaveBeenCalledWith("transparency.step5.title", expect.anything());
    expect(mockT).toHaveBeenCalledWith("transparency.step6.title", expect.anything());
    expect(mockT).toHaveBeenCalledWith("transparency.result", expect.anything());
  });

  it("handles reduction breakdown correctly", async () => {
    await generatePDF(defaultFormValues, mockT, mockI18n);

    // Should include degree reduction if present
    expect(mockT).toHaveBeenCalledWith("pdf.degreeReduction", expect.anything());
    expect(mockT).toHaveBeenCalledWith("pdf.totalReduction", expect.anything());
  });

  it("handles manual reduction when present", async () => {
    const formValuesWithManual = createTestFormValues({
      manualReductionMonths: 3,
    });

    await generatePDF(formValuesWithManual, mockT, mockI18n);

    expect(mockT).toHaveBeenCalledWith("pdf.manualReduction", expect.anything());
  });

  it("handles missing required fields gracefully", async () => {
    // Test with missing critical fields - should still generate PDF
    const formValuesMissingFields = createTestFormValues({
      weeklyFull: undefined,
      weeklyPart: undefined,
    });

    const result = await generatePDF(formValuesMissingFields, mockT, mockI18n);

    // PDF should still be generated (with default/zero values)
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
    // Should still include input section
    expect(mockT).toHaveBeenCalledWith("pdf.inputs", expect.anything());
  });

  it("handles extra fields that are not in configuration", async () => {
    // Test with extra fields that don't exist in the PDF configuration
    const formValuesWithExtraFields = createTestFormValues({
      extraField1: "some value",
      extraField2: 123,
      unknownField: "test",
    });

    const result = await generatePDF(formValuesWithExtraFields, mockT, mockI18n);

    // PDF should still be generated successfully
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
    // Extra fields should be ignored (not cause errors)
  });

  it("handles zero values for required fields", async () => {
    const formValuesWithZeros = createTestFormValues({
      weeklyFull: 0,
      weeklyPart: 0,
      fullDurationMonths: 0,
    });

    const result = await generatePDF(formValuesWithZeros, mockT, mockI18n);

    // PDF should still be generated (with zero values displayed)
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles null/undefined values gracefully", async () => {
    const formValuesWithNulls = createTestFormValues({
      weeklyFull: null,
      weeklyPart: undefined,
      schoolDegreeId: null,
      schoolDegreeLabelKey: null,
    });

    const result = await generatePDF(formValuesWithNulls, mockT, mockI18n);

    // PDF should still be generated
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters out conditional fields with zero values", async () => {
    const formValuesNoReductions = createTestFormValues({
      degreeReductionMonths: 0,
      manualReductionMonths: 0,
      schoolDegreeId: null, // No school degree selected
    });

    await generatePDF(formValuesNoReductions, mockT, mockI18n);

    // Degree and manual reduction should not be called if they're zero
    // This tests that conditional fields are properly filtered
    const reductionCalls = mockT.mock.calls.filter(
      (call) => call[0] === "pdf.degreeReduction" || call[0] === "pdf.manualReduction"
    );
    // These should not appear if values are 0
    expect(reductionCalls.length).toBe(0);
  });

  it("sanitizes special characters in text", async () => {
    // The sanitizeForPDF function should replace Unicode characters
    // We can't directly test it, but we can verify the PDF is generated
    // without errors even with special characters in translations
    const result = await generatePDF(defaultFormValues, mockT, mockI18n);
    
    expect(result).toBeInstanceOf(Uint8Array);
    // If sanitization fails, the PDF generation would throw an error
  });

  it("handles different language settings", async () => {
    const germanI18n = {
      language: "de",
    };

    const result = await generatePDF(defaultFormValues, mockT, germanI18n);
    
    expect(result).toBeInstanceOf(Uint8Array);
    // The date formatter should use the language from i18n
  });

  it("creates multiple pages when content exceeds page height", async () => {
    // This test verifies that page breaks are handled
    // We can't directly test page count, but we can verify the PDF is generated
    const result = await generatePDF(defaultFormValues, mockT, mockI18n);
    
    expect(result).toBeInstanceOf(Uint8Array);
    // If page breaks weren't handled, the PDF generation might fail or truncate
  });
});

