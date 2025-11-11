import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { buildReductionSummary } from "../domain/schoolDegreeReductions.js";
import readFormAndCalc from "../features/calcDuration/readFormAndCalc.js";

const MAX_EXTENSION_MONTHS = 6;
const DURATION_CAP_MULTIPLIER = 1.5;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveMinDuration(fulltimeMonths, override) {
  const safeFull = Number.isFinite(fulltimeMonths) ? fulltimeMonths : 0;
  const fallback = Math.max(0, Math.floor(safeFull / 2));
  if (override === undefined || override === null || override === "") {
    return fallback;
  }
  const parsed = Number(override);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(0, parsed);
}

function formatYearsMonths(months, translateFn) {
  const safeValue = Number.isFinite(months) ? months : 0;
  const rounded = Math.max(0, Math.round(safeValue));
  const years = Math.floor(rounded / 12);
  const remaining = rounded % 12;
  const yearLabel = years === 1 ? translateFn("format.year") : translateFn("format.years");
  const monthLabel = remaining === 1 ? translateFn("format.month") : translateFn("format.months");
  return `${years} ${yearLabel} ${remaining} ${monthLabel}`;
}

function formatSigned(value, formatter) {
  if (!Number.isFinite(value) || value === 0) {
    return formatter(0);
  }
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatter(Math.abs(value))}`;
}

function formatDate(date, locale) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

// Sanitize text to replace Unicode characters that can't be encoded in WinAnsi
function sanitizeForPDF(text) {
  if (!text || typeof text !== "string") {
    return String(text || "");
  }
  
  // Replace special Unicode characters with ASCII equivalents
  return text
    .replace(/≥/g, ">=")      // Greater than or equal to
    .replace(/≤/g, "<=")      // Less than or equal to
    .replace(/−/g, "-")       // Minus sign (U+2212) -> regular hyphen
    .replace(/×/g, "x")       // Multiplication sign -> x
    .replace(/→/g, "->")      // Right arrow -> ->
    .replace(/⇒/g, "=>")      // Double right arrow -> =>
    .replace(/°/g, "deg")     // Degree sign -> deg (if needed)
    .replace(/±/g, "+/-")     // Plus-minus sign -> +/-
    .replace(/≠/g, "!=")      // Not equal -> !=
    .replace(/≈/g, "~")       // Approximately equal -> ~
    .replace(/…/g, "...")     // Ellipsis -> ...
    .replace(/–/g, "-")       // En dash -> hyphen
    .replace(/—/g, "-")       // Em dash -> hyphen
    .replace(/"/g, '"')       // Left double quotation mark -> "
    .replace(/"/g, '"')       // Right double quotation mark -> "
    .replace(/'/g, "'")       // Left single quotation mark -> '
    .replace(/'/g, "'");      // Right single quotation mark -> '
}

export async function generatePDF(formValues, t, i18n) {
  try {
    // Validate inputs
    if (!formValues) {
      throw new Error("formValues is required");
    }
    if (!t || typeof t !== "function") {
      throw new Error("Translation function is required");
    }
    if (!i18n || !i18n.language) {
      throw new Error("i18n object with language property is required");
    }

    const doc = await PDFDocument.create();
    let page = doc.addPage([595, 842]); // A4 size in points
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  
  const margin = 50;
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = pageHeight - margin;
  const lineHeight = 14;
  const sectionSpacing = 20;
  const titleSize = 18;
  const headingSize = 14;
  const normalSize = 10;

  // Helper function to check if we need a new page and create one if needed
  function ensurePageSpace(requiredSpace) {
    if (yPosition < margin + requiredSpace) {
      page = doc.addPage([595, 842]);
      yPosition = pageHeight - margin;
      return true;
    }
    return false;
  }

  // Helper function to add text with word wrapping
  function addText(text, x, y, size, fontToUse, color = rgb(0, 0, 0), maxWidth = contentWidth) {
    if (!text || text === null || text === undefined) {
      text = String(text || "");
    }
    text = String(text);
    
    // Sanitize text to remove Unicode characters that can't be encoded in WinAnsi
    text = sanitizeForPDF(text);
    
    const words = text.split(" ");
    let line = "";
    let currentY = y;
    
    // Ensure we have a valid page reference
    if (!page) {
      throw new Error("Page reference is invalid");
    }
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line ? " " : "") + words[i];
      const width = fontToUse.widthOfTextAtSize(testLine, size);
      
      if (width > maxWidth && line) {
        page.drawText(line, { x, y: currentY, size, font: fontToUse, color });
        line = words[i];
        currentY -= size + 2;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      page.drawText(line, { x, y: currentY, size, font: fontToUse, color });
      currentY -= size + 2;
    }
    
    return currentY;
  }

  // Title
  yPosition = addText(
    safeTranslate("pdf.title"),
    margin,
    yPosition,
    titleSize,
    boldFont
  );
  yPosition -= sectionSpacing;

  // Date
  const currentDate = formatDate(new Date(), i18n.language);
  yPosition = addText(
    `${safeTranslate("pdf.date")}: ${currentDate}`,
    margin,
    yPosition,
    normalSize,
    font,
    rgb(0.4, 0.4, 0.4)
  );
  yPosition -= sectionSpacing * 1.5;

  // Extract calculation result
  const calculation = readFormAndCalc(formValues);
  
  // Extract inputs
  const weeklyFull = toNumber(formValues?.weeklyFull);
  const weeklyPart = toNumber(formValues?.weeklyPart);
  const fulltimeMonths = toNumber(formValues?.fullDurationMonths);
  const reduction = buildReductionSummary({
    schoolDegreeId: formValues?.schoolDegreeId,
    degreeReductionMonths: formValues?.degreeReductionMonths,
    manualReductionMonths: formValues?.manualReductionMonths,
    labelKey: formValues?.schoolDegreeLabelKey,
  });
  
  // Safe translation helper - use this for all translations
  function safeTranslate(key, options = {}) {
    try {
      const result = t(key, options);
      // i18next returns the key if translation is missing, so check if it's different
      if (result && result !== key) {
        return result;
      }
      return result || key;
    } catch (error) {
      console.warn(`Translation key "${key}" failed:`, error);
      return key;
    }
  }
  
  // Replace t with safeTranslate for the rest of the function
  const safeT = safeTranslate;

  const schoolDegreeLabel = reduction.labelKey 
    ? safeTranslate(reduction.labelKey) 
    : safeTranslate("reduction.selectPlaceholder");
  const formatter = new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // Input Values Section
  yPosition = addText(
    safeT("pdf.inputs"),
    margin,
    yPosition,
    headingSize,
    boldFont
  );
  yPosition -= lineHeight;

  const inputs = [
    { label: safeT("pdf.fulltimeHours"), value: `${formatter.format(weeklyFull)} h/week` },
    { label: safeT("pdf.parttimeHours"), value: `${formatter.format(weeklyPart)} h/week` },
    { label: safeT("pdf.regularDuration"), value: `${formatter.format(fulltimeMonths)}` },
    { label: safeT("pdf.schoolDegree"), value: schoolDegreeLabel },
  ];

  if (reduction.degree > 0) {
    inputs.push({
      label: safeT("pdf.degreeReduction"),
      value: `${formatter.format(reduction.degree)}`,
    });
  }

  if (reduction.manual > 0) {
    inputs.push({
      label: safeT("pdf.manualReduction"),
      value: `${formatter.format(reduction.manual)}`,
    });
  }

  if (reduction.total > 0) {
    inputs.push({
      label: safeT("pdf.totalReduction"),
      value: `${formatter.format(reduction.total)}`,
    });
  }

  inputs.forEach((input) => {
    const text = `${input.label}: ${input.value}`;
    yPosition = addText(text, margin + 20, yPosition, normalSize, font);
    yPosition -= lineHeight;
  });

  yPosition -= sectionSpacing;

  // Ensure we have space for results section
  ensurePageSpace(200);

  // Results Section
  if (calculation && calculation.allowed) {
    yPosition = addText(
      safeT("pdf.results"),
      margin,
      yPosition,
      headingSize,
      boldFont
    );
    yPosition -= lineHeight;

    const factor = calculation.factor || (weeklyFull > 0 ? weeklyPart / weeklyFull : 0);
    const baselineMonths = reduction.total > 0
      ? calculation.effectiveFulltimeMonths
      : calculation.fulltimeMonths;

    const results = [
      { label: safeT("pdf.factor"), value: `${formatter.format(factor * 100)}%` },
      { label: safeT("pdf.baselineMonths"), value: `${formatter.format(baselineMonths)}` },
      { label: safeT("pdf.parttimeMonths"), value: `${formatter.format(calculation.parttimeFinalMonths)}` },
      { label: safeT("pdf.deltaMonths"), value: `${formatSigned(calculation.deltaMonths, (v) => formatter.format(v))}` },
    ];

    results.forEach((result) => {
      const text = `${result.label}: ${result.value}`;
      yPosition = addText(text, margin + 20, yPosition, normalSize, font);
      yPosition -= lineHeight;
    });

    yPosition -= sectionSpacing;
  }

  // Ensure we have space for transparency section (start on new page)
  ensurePageSpace(300);

  // Transparency Section (on new page)
  if (calculation && calculation.allowed) {
    yPosition = addText(
      safeT("pdf.transparency"),
      margin,
      yPosition,
      headingSize,
      boldFont
    );
    yPosition -= sectionSpacing;

    const minDurationMonths = resolveMinDuration(
      fulltimeMonths,
      formValues?.minDurationMonths
    );
    const totalReductionMonths = reduction.total;
    const rawBase = Math.max(0, fulltimeMonths - totalReductionMonths);
    const basis = calculation.effectiveFulltimeMonths || Math.max(rawBase, minDurationMonths);
    const factor = calculation.factor || (weeklyFull > 0 ? weeklyPart / weeklyFull : 0);
    const theoretical = calculation.theoreticalDuration || (factor > 0 ? basis / factor : basis);
    const extension = theoretical - basis;
    const sixMonthRuleApplied =
      Number.isFinite(extension) &&
      extension <= MAX_EXTENSION_MONTHS &&
      extension > 0;
    const durationAfterSixMonths = sixMonthRuleApplied ? basis : theoretical;
    const capLimit = fulltimeMonths * DURATION_CAP_MULTIPLIER;
    const capApplied =
      Number.isFinite(durationAfterSixMonths) &&
      Number.isFinite(capLimit) &&
      durationAfterSixMonths > capLimit &&
      capLimit > 0;
    const durationAfterCap = capApplied ? capLimit : durationAfterSixMonths;
    const roundingMode = formValues?.rounding ?? "round";
    const roundedDuration = calculation.parttimeFinalMonths || Math.floor(durationAfterCap);
    const deltaVsBasis = calculation.deltaMonths || (roundedDuration - basis);
    const deltaVsOriginal = calculation.deltaVsOriginal || null;

    const percent = weeklyFull > 0 && Number.isFinite(factor) ? Math.round(factor * 100) : 0;
    const basisYM = formatYearsMonths(basis, safeT);
    const roundedYM = formatYearsMonths(roundedDuration, safeT);

    // Step 1
    yPosition = addText(
      safeT("transparency.step1.title"),
      margin,
      yPosition,
      normalSize + 1,
      boldFont
    );
    yPosition -= lineHeight;
    yPosition = addText(
      safeT("transparency.step1.text", {
        part: formatter.format(weeklyPart),
        full: formatter.format(weeklyFull),
        pct: formatter.format(percent),
      }),
      margin + 20,
      yPosition,
      normalSize,
      font
    );
    yPosition -= lineHeight;
    yPosition = addText(
      safeT(percent >= 50 ? "transparency.step1.ok" : "transparency.step1.fail"),
      margin + 20,
      yPosition,
      normalSize,
      font,
      percent >= 50 ? rgb(0, 0, 0) : rgb(0.8, 0, 0)
    );
    yPosition -= sectionSpacing;

    // Step 2
    yPosition = addText(
      safeT("transparency.step2.title"),
      margin,
      yPosition,
      normalSize + 1,
      boldFont
    );
    yPosition -= lineHeight;
    yPosition = addText(
      safeT("transparency.step2.text", {
        part: formatter.format(weeklyPart),
        full: formatter.format(weeklyFull),
        factor: formatter.format(factor),
      }),
      margin + 20,
      yPosition,
      normalSize,
      font
    );
    yPosition -= sectionSpacing;

    // Step 3
    const breakdownParts = [];
    if (reduction.degree > 0 && reduction.labelKey) {
      breakdownParts.push(
        safeT("reduction.breakdown.degree", {
          months: formatter.format(reduction.degree),
          label: schoolDegreeLabel,
        })
      );
    }
    if (reduction.manual > 0) {
      breakdownParts.push(
        safeT("reduction.breakdown.manual", {
          months: formatter.format(reduction.manual),
        })
      );
    }
    const formattedReduction = formatter.format(totalReductionMonths);
    const reductionDisplay =
      breakdownParts.length > 0
        ? `${formattedReduction} (${breakdownParts.join(" + ")})`
        : formattedReduction;

    yPosition = addText(
      safeT("transparency.step3.title"),
      margin,
      yPosition,
      normalSize + 1,
      boldFont
    );
    yPosition -= lineHeight;
    yPosition = addText(
      safeT("transparency.step3.text", {
        fullM: formatter.format(fulltimeMonths),
        redM: formattedReduction,
        reductionText: reductionDisplay,
        rawBase: formatter.format(rawBase),
        minM: formatter.format(minDurationMonths),
        basis: formatter.format(basis),
        basisYM,
      }),
      margin + 20,
      yPosition,
      normalSize,
      font
    );
    yPosition -= sectionSpacing;

    // Step 4
    yPosition = addText(
      safeT("transparency.step4.title"),
      margin,
      yPosition,
      normalSize + 1,
      boldFont
    );
    yPosition -= lineHeight;
    yPosition = addText(
      safeT("transparency.step4.text", {
        basis: formatter.format(basis),
        factor: formatter.format(factor),
        dtheo: formatter.format(theoretical),
      }),
      margin + 20,
      yPosition,
      normalSize,
      font
    );
    yPosition -= sectionSpacing;

    // Step 5
    yPosition = addText(
      safeT("transparency.step5.title"),
      margin,
      yPosition,
      normalSize + 1,
      boldFont
    );
    yPosition -= lineHeight;
    yPosition = addText(
      safeT("transparency.step5.six.text", {
        ext: formatSigned(extension, (v) => formatter.format(v)),
        applied: safeT(
          sixMonthRuleApplied
            ? "transparency.step5.six.applied"
            : "transparency.step5.six.notApplied"
        ),
      }),
      margin + 20,
      yPosition,
      normalSize,
      font
    );
    yPosition -= lineHeight;
    yPosition = addText(
      safeT("transparency.step5.cap.text", {
        cap: formatter.format(capLimit),
        applied: safeT(
          capApplied
            ? "transparency.step5.cap.applied"
            : "transparency.step5.cap.notApplied"
        ),
      }),
      margin + 20,
      yPosition,
      normalSize,
      font
    );
    yPosition -= sectionSpacing;

    // Step 6
    const roundingFnLabel =
      roundingMode === "ceil"
        ? "ceil"
        : roundingMode === "round"
        ? "round"
        : "floor";
    yPosition = addText(
      safeT("transparency.step6.title"),
      margin,
      yPosition,
      normalSize + 1,
      boldFont
    );
    yPosition -= lineHeight;
    yPosition = addText(
      safeT("transparency.step6.text", {
        roundingFn: roundingFnLabel,
        value: formatter.format(durationAfterCap),
        rounded: formatter.format(roundedDuration),
        roundedYM,
      }),
      margin + 20,
      yPosition,
      normalSize,
      font
    );
    yPosition -= sectionSpacing;

    // Final Result
    yPosition = addText(
      safeT("transparency.result", {
        finalM: formatter.format(roundedDuration),
        finalYM: roundedYM,
      }),
      margin,
      yPosition,
      normalSize + 1,
      boldFont
    );
    yPosition -= lineHeight;
    yPosition = addText(
      safeT("transparency.delta.basis", {
        delta: formatSigned(deltaVsBasis, (v) => formatter.format(v)),
      }),
      margin + 20,
      yPosition,
      normalSize,
      font
    );
    yPosition -= lineHeight;
    if (Number.isFinite(deltaVsOriginal) && deltaVsOriginal !== 0) {
      yPosition = addText(
        safeT("transparency.delta.original", {
          delta: formatSigned(deltaVsOriginal, (v) => formatter.format(v)),
        }),
        margin + 20,
        yPosition,
        normalSize,
        font
      );
      yPosition -= lineHeight;
    }
  }

  // Ensure we have space for disclaimer
  ensurePageSpace(100);

  // Disclaimer Section
  yPosition -= sectionSpacing;
  yPosition = addText(
    safeT("pdf.disclaimer"),
    margin,
    yPosition,
    headingSize,
    boldFont
  );
  yPosition -= lineHeight;
  yPosition = addText(
    safeT("pdf.disclaimerText"),
    margin + 20,
    yPosition,
    normalSize - 1,
    font,
    rgb(0.4, 0.4, 0.4)
  );

    const pdfBytes = await doc.save();
    return pdfBytes;
  } catch (error) {
    console.error("PDF generation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      formValues: formValues,
    });
    throw new Error(`PDF generation failed: ${error.message || "Unknown error"}`);
  }
}

