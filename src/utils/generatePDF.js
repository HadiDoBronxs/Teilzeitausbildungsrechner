import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { buildReductionSummary } from "../domain/schoolDegreeReductions.js";
import readFormAndCalc from "../features/calcDuration/readFormAndCalc.js";


const MAX_EXTENSION_MONTHS = 6;
const DURATION_CAP_MULTIPLIER = 1.5;

/**
 * Field configuration for PDF input fields.
 * Maps form field names to their PDF label translation keys and value formatters.
 * This configuration makes the PDF generation resilient to form field changes.
 * 
 * @typedef {Object} FieldConfig
 * @property {string} labelKey - Translation key for the field label
 * @property {number|string} value - The raw value to display
 * @property {string} formatType - Format type: "hours", "number", or "string"
 * @property {boolean} [required=false] - Whether this field is required (will show warning if missing)
 * @property {boolean} [conditional=false] - Whether this field should only be shown if value > 0
 */

/**
 * Formats a field value based on its format type.
 * 
 * @param {number|string} value - The raw value to format.
 * @param {string} formatType - The format type: "hours", "number", or "string".
 * @param {Intl.NumberFormat} numberFormatter - Number formatter instance.
 * @param {Function} translateFn - Translation function to get localized unit labels.
 * @returns {string} The formatted value string.
 */
function formatFieldValue(value, formatType, numberFormatter, translateFn) {
  const resolvedType =
    formatType ?? (typeof value === "number" ? "number" : "string");

  if (resolvedType === "hours") {
    const hoursLabel = translateFn("pdf.hoursPerWeek");
    return `${numberFormatter.format(value)} ${hoursLabel}`;
  }
  if (resolvedType === "number") {
    return numberFormatter.format(value);
  }
  return String(value);
}

/**
 * Builds the field configuration for PDF input fields.
 * This configuration is independent of the actual form structure and can be easily updated.
 * 
 * @param {Object} formValues - The form values object
 * @param {Object} reduction - The reduction summary object
 * @param {Function} safeT - Safe translation function
 * @param {Function} formatNumber - Localized number formatter
 * @returns {Array<FieldConfig>} Array of field configurations
 */
function buildInputFieldConfig(formValues, reduction, safeT, formatNumber) {
  const weeklyFull = toNumber(formValues?.weeklyFull);
  const weeklyPart = toNumber(formValues?.weeklyPart);
  const fulltimeMonths = toNumber(formValues?.fullDurationMonths);
  const schoolDegreeLabel = reduction.labelKey
    ? safeT(reduction.labelKey)
    : safeT("reduction.selectPlaceholder");

  // Hours labels are localized (pdf.hoursPerWeek) so English exports do not mix in German units.
  const configs = [
    {
      labelKey: "pdf.fulltimeHours",
      value: weeklyFull,
      formatType: "hours",
      required: true,
    },
    {
      labelKey: "pdf.parttimeHours",
      value: weeklyPart,
      formatType: "hours",
      required: true,
    },
    {
      labelKey: "pdf.regularDuration",
      value: fulltimeMonths,
      formatType: "number",
      required: true,
    },
    {
      labelKey: "pdf.schoolDegree",
      value: schoolDegreeLabel,
      formatType: "string",
      required: false,
    },
  ];

  // Add conditional reduction fields
  if (reduction.degree > 0) {
    configs.push({
      labelKey: "pdf.degreeReduction",
      value: reduction.degree,
      formatType: "number",
      conditional: true,
    });
  }

  if (reduction.manual > 0) {
    configs.push({
      labelKey: "pdf.manualReduction",
      value: reduction.manual,
      formatType: "number",
      conditional: true,
    });
  }

  if (reduction.qualification > 0) {
    configs.push({
      labelKey: "pdf.qualificationReduction",
      value: reduction.qualification,
      formatType: "number",
      conditional: true,
    });
  }

  if (reduction.total > 0) {
    configs.push({
      labelKey: "pdf.totalReduction",
      value: reduction.total,
      formatType: "number",
      conditional: true,
    });
  }

  if (reduction.capExceeded) {
    configs.push({
      // Separate label avoids duplicating the interpolated sentence.
      labelKey: "pdf.totalReductionWarningLabel",
      value: safeT("pdf.totalReductionWarning", {
        sum: formatNumber(reduction.totalRaw),
        max: formatNumber(formValues?.maxTotalReduction ?? 12),
      }),
      formatType: "string",
      conditional: true,
    });
  }

  return configs;
}

/**
 * Converts a value to a number, returning a fallback if the value is not finite.
 * 
 * @param {*} value - The value to convert to a number.
 * @param {number} [fallback=0] - The fallback value to return if conversion fails.
 * @returns {number} The parsed number or the fallback value.
 */
function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Resolves the minimum training duration in months.
 * If an override value is provided and valid, it is used; otherwise,
 * the default is half of the full-time duration (minimum 0).
 * 
 * @param {number} fulltimeMonths - The full-time training duration in months.
 * @param {number|string|undefined|null} override - Optional override value for minimum duration.
 * @returns {number} The resolved minimum duration in months (always >= 0).
 */
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

/**
 * Formats a duration in months as a human-readable string with years and months.
 * Uses the provided translation function to get localized labels.
 * 
 * @param {number} months - The duration in months to format.
 * @param {Function} translateFn - The translation function (i18next t function).
 * @returns {string} A formatted string like "2 Years 6 Months" or "1 Year 3 Months".
 */
function formatYearsMonths(months, translateFn) {
  const safeValue = Number.isFinite(months) ? months : 0;
  const rounded = Math.max(0, Math.round(safeValue));
  const years = Math.floor(rounded / 12);
  const remaining = rounded % 12;
  const yearLabel = years === 1 ? translateFn("format.year") : translateFn("format.years");
  const monthLabel = remaining === 1 ? translateFn("format.month") : translateFn("format.months");
  return `${years} ${yearLabel} ${remaining} ${monthLabel}`;
}

/**
 * Formats a number with a sign prefix (+ or -).
 * Zero values are formatted without a sign prefix.
 * 
 * @param {number} value - The number to format.
 * @param {Function} formatter - A function that formats a positive number (e.g., Intl.NumberFormat.format).
 * @returns {string} A formatted string with sign prefix (e.g., "+5", "-3", "0").
 */
function formatSigned(value, formatter) {
  if (!Number.isFinite(value) || value === 0) {
    return formatter(0);
  }
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}${formatter(Math.abs(value))}`;
}

/**
 * Formats a date using the specified locale.
 * 
 * @param {Date} date - The date to format.
 * @param {string} locale - The locale code (e.g., "en", "de").
 * @returns {string} A formatted date string (e.g., "January 15, 2024" or "15. Januar 2024").
 */
function formatDate(date, locale) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Sanitizes text by replacing Unicode characters that cannot be encoded in WinAnsi
 * (the default encoding used by pdf-lib) with ASCII-safe equivalents.
 * This prevents encoding errors when generating PDFs.
 * 
 * @param {string} text - The text to sanitize.
 * @returns {string} The sanitized text with Unicode characters replaced by ASCII equivalents.
 */
function sanitizeForPDF(text) {
  if (!text || typeof text !== "string") {
    return String(text || "");
  }

  // Replace special Unicode characters with ASCII equivalents
  // 
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

/**
 * Generates a PDF document containing training calculation inputs, results, and transparency details.
 * 
 * The PDF includes:
 * - Title and creation date
 * - All input values (hours, duration, school degree, reductions)
 * - Calculation results (factor, baseline, part-time duration, delta)
 * - Detailed calculation transparency (all 6 steps)
 * - Legal disclaimer
 * 
 * The document uses A4 page size and automatically handles page breaks when content exceeds page height.
 * All text is sanitized to ensure compatibility with WinAnsi encoding.
 * 
 * @async
 * @function generatePDF
 * @param {Object} formValues - The form values object containing:
 *   @param {number} formValues.weeklyFull - Full-time hours per week
 *   @param {number} formValues.weeklyPart - Part-time hours per week
 *   @param {number} formValues.fullDurationMonths - Regular training duration in months
 *   @param {number} formValues.reductionMonths - Total reduction months
 *   @param {number} formValues.degreeReductionMonths - Reduction months from school degree
 *   @param {number} formValues.manualReductionMonths - Additional manual reduction months
 *   @param {string|null} formValues.schoolDegreeId - School degree identifier
 *   @param {string} formValues.schoolDegreeLabelKey - Translation key for school degree label
 *   @param {string} [formValues.rounding="round"] - Rounding mode ("round", "ceil", "floor")
 * @param {Function} t - The i18next translation function.
 * @param {Object} i18n - The i18next instance with a `language` property.
 * @returns {Promise<Uint8Array>} A promise that resolves to the PDF document bytes.
 * @throws {Error} If formValues, t, or i18n are invalid, or if PDF generation fails.
 */
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

    /**
     * Ensures there is enough vertical space on the current page for content.
     * If insufficient space is available, creates a new page and resets the y-position.
     * 
     * @param {number} requiredSpace - The minimum vertical space required in points.
     * @returns {boolean} True if a new page was created, false otherwise.
     */
    function ensurePageSpace(requiredSpace) {
      if (yPosition < margin + requiredSpace) {
        page = doc.addPage([595, 842]);
        yPosition = pageHeight - margin;
        return true;
      }
      return false;
    }

    /**
     * Adds text to the PDF page with automatic word wrapping.
     * Text is sanitized to ensure WinAnsi encoding compatibility.
     * 
     * @param {string} text - The text to add (will be sanitized automatically).
     * @param {number} x - The x-coordinate for the text (left margin).
     * @param {number} y - The starting y-coordinate for the text (top of page).
     * @param {number} size - The font size in points.
     * @param {PDFFont} fontToUse - The PDF font object to use for rendering.
     * @param {rgb} [color=rgb(0, 0, 0)] - The text color (defaults to black).
     * @param {number} [maxWidth=contentWidth] - The maximum width for text wrapping in points.
     * @returns {number} The final y-coordinate after text has been drawn (for chaining).
     * @throws {Error} If the page reference is invalid.
     */
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

    // Extract reduction summary
    const reduction = buildReductionSummary({
      schoolDegreeId: formValues?.schoolDegreeId,
      degreeReductionMonths: formValues?.degreeReductionMonths,
      manualReductionMonths: formValues?.manualReductionMonths,
      qualificationReductionMonths: formValues?.qualificationReductionRawMonths,
      labelKey: formValues?.schoolDegreeLabelKey,
      maxTotalMonths: formValues?.maxTotalReduction ?? 12,
    });

    /**
     * Safely translates a translation key, falling back to the key itself if translation fails.
     * This prevents empty strings or errors from breaking PDF generation.
     * 
     * @param {string} key - The translation key to look up.
     * @param {Object} [options={}] - Optional interpolation options for the translation.
     * @returns {string} The translated string, or the key if translation fails or is missing.
     */
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

    const numberFormatter = new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const formatNumber = (value) => numberFormatter.format(value);

    // Extract inputs for use in calculations
    const weeklyFull = toNumber(formValues?.weeklyFull);
    const weeklyPart = toNumber(formValues?.weeklyPart);
    const fulltimeMonths = toNumber(formValues?.fullDurationMonths);

    // Get school degree label for use in transparency section
    const schoolDegreeLabel = reduction.labelKey
      ? safeT(reduction.labelKey)
      : safeT("reduction.selectPlaceholder");

    // Build input field configuration dynamically
    const inputFieldConfigs = buildInputFieldConfig(
      formValues,
      reduction,
      safeT,
      formatNumber
    );

    // Input Values Section
    yPosition = addText(
      safeT("pdf.inputs"),
      margin,
      yPosition,
      headingSize,
      boldFont
    );
    yPosition -= lineHeight;

    // Build inputs array dynamically from configuration
    const inputs = inputFieldConfigs.map(function mapConfigToInput(config) {
      try {
        const formattedValue = formatFieldValue(
          config.value,
          config.formatType,
          numberFormatter,
          safeT
        );
        return {
          label: safeT(config.labelKey),
          value: formattedValue,
        };
      } catch (error) {
        console.warn(`Failed to format value for field "${config.labelKey}":`, error);
        return {
          label: safeT(config.labelKey),
          value: config.required ? "N/A" : "",
        };
      }
    }).filter(function filterEmptyInputs(input) {
      // Filter out empty conditional fields
      return input.value !== "";
    });

    // Warn about missing required fields (but don't fail)
    const hoursLabel = safeT("pdf.hoursPerWeek");
    const zeroHoursPattern = `0 ${hoursLabel}`;
    const missingRequiredFields = inputFieldConfigs
      .filter(function filterRequired(config) {
        return config.required;
      })
      .filter(function checkMissingValue(config) {
        try {
          const formattedValue = formatFieldValue(
            config.value,
            config.formatType,
            numberFormatter,
            safeT
          );
          return !formattedValue || formattedValue === "0" || formattedValue === zeroHoursPattern;
        } catch {
          return true;
        }
      });

    if (missingRequiredFields.length > 0) {
      console.warn("PDF generation: Some required fields are missing or zero:",
        missingRequiredFields.map((f) => f.labelKey).join(", "));
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
        { label: safeT("pdf.factor"), value: `${formatNumber(factor * 100)}%` },
        { label: safeT("pdf.baselineMonths"), value: `${formatNumber(baselineMonths)}` },
        { label: safeT("pdf.parttimeMonths"), value: `${formatNumber(calculation.parttimeFinalMonths)}` },
        {
          label: safeT("pdf.deltaMonths"),
          value: `${formatSigned(calculation.deltaMonths, (v) => formatNumber(v))}`,
        },
      ];

      results.forEach((result) => {
        const text = `${result.label}: ${result.value}`;
        yPosition = addText(text, margin + 20, yPosition, normalSize, font);
        yPosition -= lineHeight;
      });

      yPosition -= sectionSpacing;
    }

    // Ensure we have space for disclaimer section
    ensurePageSpace(100);

    // Disclaimer Section (on first page, before transparency)
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

    // Force a new page for transparency section (always start on dedicated page)
    page = doc.addPage([595, 842]);
    yPosition = pageHeight - margin;

    // Transparency Section (on dedicated page)
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
      const roundedDuration = calculation.parttimeFinalMonths || Math.floor(durationAfterCap);

      const percent =
        weeklyFull > 0 && Number.isFinite(factor) ? Math.round(factor * 100) : 0;
      const basisYM = formatYearsMonths(basis, safeT);
      const roundedYM = formatYearsMonths(roundedDuration, safeT);

      // --- Diagram Section ---
      yPosition -= 10;

      // Config
      // contentWidth is already defined in outer scope
      const barHeight = 20;
      const barSpacing = 25; // Space between two bars
      const maxBarWidth = contentWidth;
      const fullTimeColor = rgb(0.9, 0.9, 0.9); // Slate-200 approx
      const partTimeBgColor = rgb(0.95, 0.95, 1.0); // Slate-100/Blue-50 approx
      const partTimeFillColor = rgb(0.15, 0.4, 0.9); // Blue-600 approx

      // 1. Draw Full-Time Bar
      // Label
      page.drawText(`${safeT("transparency.simple.chart.fullLabel")} - ${formatNumber(weeklyFull)} h`, {
        x: margin,
        y: yPosition + 4,
        size: 9,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });
      // Bar Background
      page.drawRectangle({
        x: margin,
        y: yPosition - barHeight,
        width: maxBarWidth,
        height: barHeight,
        color: fullTimeColor,
      });

      yPosition -= (barHeight + barSpacing);

      // 2. Draw Part-Time Bar
      // Label
      page.drawText(`${safeT("pdf.parttimeHours")} - ${formatNumber(weeklyPart)} h (${percent}%)`, {
        x: margin,
        y: yPosition + 4,
        size: 9,
        font: boldFont,
        color: partTimeFillColor
      });

      // Bar Background (Container)
      page.drawRectangle({
        x: margin,
        y: yPosition - barHeight,
        width: maxBarWidth,
        height: barHeight,
        color: partTimeBgColor,
      });

      // Bar Fill (Actual value)
      const fillWidth = (Math.max(0, Math.min(100, percent)) / 100) * maxBarWidth;
      if (fillWidth > 0) {
        page.drawRectangle({
          x: margin,
          y: yPosition - barHeight,
          width: fillWidth,
          height: barHeight,
          color: partTimeFillColor,
        });
      }

      yPosition -= (barHeight + sectionSpacing);
      // --- End Diagram Section ---

      // Helper to add simple step with values
      const addSimpleStep = (stepNum, valueText = "") => {
        yPosition = addText(
          safeT(`transparency.simple.step${stepNum}.title`),
          margin,
          yPosition,
          normalSize + 1,
          boldFont
        );
        yPosition -= lineHeight;

        let text = safeT(`transparency.simple.step${stepNum}.text`);
        if (valueText) {
          text += ` ${valueText}`;
        }

        yPosition = addText(
          text,
          margin + 20,
          yPosition,
          normalSize,
          font
        );
        yPosition -= sectionSpacing;
      };

      // Step 1
      const step1Status = percent >= 50
        ? `(${percent}% >= 50% - OK)`
        : `(${percent}% < 50% - Error)`;
      addSimpleStep(1, step1Status);

      // Step 2
      addSimpleStep(2, `(${formatNumber(weeklyPart)} / ${formatNumber(weeklyFull)} = ${formatNumber(factor)} -> ${percent}%)`);

      // Step 3
      const reductionLabel = reduction.total > 0 ? `-${formatNumber(reduction.total)}` : "0";
      addSimpleStep(3, `(${formatNumber(fulltimeMonths)} ${reductionLabel} -> ${formatNumber(basis)} Months)`);

      // Step 4
      addSimpleStep(4, `(${formatNumber(basis)} / ${formatNumber(factor)} = ${formatNumber(theoretical)} Months)`);

      // Step 5
      let protectionText = "";
      if (sixMonthRuleApplied) {
        protectionText = `(+${formatNumber(extension)} Months <= 6 Months -> Ignored)`;
      } else if (capApplied) {
        protectionText = `(> ${formatNumber(capLimit)} Months -> Capped)`;
      } else {
        protectionText = "(OK)";
      }
      addSimpleStep(5, protectionText);

      // Step 6
      addSimpleStep(6, `(${formatNumber(durationAfterCap)} -> ${formatNumber(roundedDuration)} Months)`);

      yPosition -= sectionSpacing;

    }

    // Add page numbers
    const pages = doc.getPages();
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      p.drawText(`${i + 1} / ${pages.length}`, {
        x: p.getWidth() / 2 - 10,
        y: 20,
        size: 10,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

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
