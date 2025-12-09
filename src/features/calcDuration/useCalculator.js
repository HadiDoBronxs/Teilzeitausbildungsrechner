import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildReductionSummary } from "../../domain/schoolDegreeReductions.js";
import { generatePDF } from "../../utils/generatePDF.js";

// Default values keep the calculator stable on the initial render.
const DEFAULT_DEGREE_ID = "hs";
const DEFAULT_FULLTIME_HOURS = 40;
const DEFAULT_PARTTIME_HOURS = 30;
const DEFAULT_DURATION_MONTHS = 36;
// Statutory cap for total reduction (spec says max 12 months).
const MAX_TOTAL_REDUCTION = 12;
// §8 BBiG threshold: show the legal note only when reductions exceed 6 months.
const LEGAL_HINT_THRESHOLD = 6;

// Treat empty strings, null, and undefined the same to simplify input handling.
function isEmptyValue(value) {
    return value === "" || value === null || value === undefined;
}

/**
 * Custom hook to manage the state and logic for the TZR calculator.
 * Encapsulates form state, calculation logic, and PDF generation.
 */
export function useCalculator() {
    const { t, i18n } = useTranslation();

    // -- State Definitions --
    const [schoolDegreeId, setSchoolDegreeId] = useState(DEFAULT_DEGREE_ID);
    const [fulltimeHours, setFulltimeHours] = useState(DEFAULT_FULLTIME_HOURS);
    const [parttimeHours, setParttimeHours] = useState(DEFAULT_PARTTIME_HOURS);
    const [fullDurationMonths, setFullDurationMonths] = useState(DEFAULT_DURATION_MONTHS);
    const [qualificationSelection, setQualificationSelection] = useState([]);
    const [qualificationTotals, setQualificationTotals] = useState({
        rawTotal: 0,
        cappedTotal: 0,
        exceedsCap: false,
    });

    // PDF State
    const [pdfBytes, setPdfBytes] = useState(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Reset State
    const [resetCount, setResetCount] = useState(0);

    // -- Handlers --

    // Persist selected degree ID (or null/undefined)
    function handleSchoolDegreeSelect(nextId) {
        setSchoolDegreeId(nextId ?? null);
    }

    function handleFulltimeHoursChange(raw) {
        if (isEmptyValue(raw)) {
            setFulltimeHours(DEFAULT_FULLTIME_HOURS);
            return;
        }
        const parsed = Number(raw);
        setFulltimeHours(Number.isNaN(parsed) ? DEFAULT_FULLTIME_HOURS : parsed);
    }

    function handleParttimeHoursChange(raw) {
        if (isEmptyValue(raw)) {
            setParttimeHours(undefined);
            return;
        }
        const parsed = Number(raw);
        setParttimeHours(Number.isNaN(parsed) ? DEFAULT_PARTTIME_HOURS : parsed);
    }

    function handleClosePDF() {
        setPdfBytes(null);
    }

    // -- Calculations --

    const reductionSummary = useMemo(
        () =>
            buildReductionSummary({
                schoolDegreeId,
                manualReductionMonths: 0,
                qualificationReductionMonths: qualificationTotals.rawTotal,
                maxTotalMonths: MAX_TOTAL_REDUCTION,
            }),
        [schoolDegreeId, qualificationTotals.rawTotal]
    );

    // Aggregate all downstream calculation inputs
    const formValues = useMemo(
        () => ({
            weeklyFull: fulltimeHours,
            weeklyPart: parttimeHours,
            fullDurationMonths,
            reductionMonths: reductionSummary.total,
            degreeReductionMonths: reductionSummary.degree,
            manualReductionMonths: reductionSummary.manual,
            qualificationReductionMonths: reductionSummary.qualification,
            qualificationReductionRawMonths: reductionSummary.qualificationRaw,
            reductionCapExceeded: reductionSummary.capExceeded,
            schoolDegreeId,
            schoolDegreeLabelKey: reductionSummary.labelKey,
            maxTotalReduction: MAX_TOTAL_REDUCTION,
            rounding: "round",
        }),
        [
            fulltimeHours,
            parttimeHours,
            fullDurationMonths,
            reductionSummary,
            schoolDegreeId,
        ]
    );

    const showLegalHint = (reductionSummary?.total ?? 0) > LEGAL_HINT_THRESHOLD;

    // -- Actions --

    async function handleSaveAsPDF() {
        try {
            setIsGeneratingPDF(true);
            const bytes = await generatePDF(formValues, t, i18n);
            setPdfBytes(bytes);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Failed to generate PDF: ${error.message || "Unknown error"}.`);
        } finally {
            setIsGeneratingPDF(false);
        }
    }

    function handleReset() {
        setSchoolDegreeId(DEFAULT_DEGREE_ID);
        setFulltimeHours(DEFAULT_FULLTIME_HOURS);
        setParttimeHours(DEFAULT_PARTTIME_HOURS);
        setFullDurationMonths(DEFAULT_DURATION_MONTHS);
        setQualificationSelection([]);
        setQualificationTotals({
            rawTotal: 0,
            cappedTotal: 0,
            exceedsCap: false,
        });
        setPdfBytes(null);
        setIsGeneratingPDF(false);
        setResetCount((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return {
        // State
        schoolDegreeId,
        fulltimeHours,
        parttimeHours,
        // (fullDurationMonths isn't directly needed by the view usually, but setters are)
        qualificationSelection,
        qualificationTotals,
        resetCount,

        // Computed / Results
        formValues,
        showLegalHint,

        // PDF State
        pdfBytes,
        isGeneratingPDF,

        // Handlers / Setters
        handleSchoolDegreeSelect,
        handleFulltimeHoursChange,
        handleParttimeHoursChange,
        setFullDurationMonths,
        setQualificationSelection,
        setQualificationTotals,
        handleSaveAsPDF,
        handleClosePDF,
        handleReset,

        // i18n prop needed if called outside (but we used hook inside so t is available)
        t,
    };
}
