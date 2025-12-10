import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildReductionSummary } from "../../domain/schoolDegreeReductions.js";
import { generatePDF } from "../../utils/generatePDF.js";
import { QUALIFICATION_OPTIONS } from "../../components/qualificationOptions.js";

// Default values keep the calculator stable on the initial render.
const DEFAULT_DEGREE_ID = null; // null means "select school leaving certificate" placeholder
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

    // Tour-specific state (null means not in tour mode, "no"/"yes"/"i-dont-know" means in tour mode)
    const [wantsReduction, setWantsReduction] = useState(null);
    const [manualReductionMonths, setManualReductionMonths] = useState(0);
    const [academicQualification, setAcademicQualification] = useState(false);
    const [otherQualificationSelection, setOtherQualificationSelection] = useState([]);
    const [attendedUniversity, setAttendedUniversity] = useState(null); // null/"yes"/"no"
    const [hasEcts, setHasEcts] = useState(null); // null/"yes"/"no"

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

    // Tour-specific handlers
    function handleWantsReductionChange(value) {
        setWantsReduction(value);
        // When switching to "no", clear all reduction-related state
        // Note: schoolDegreeId is kept (it's still valid education info), but its reduction is ignored in calculation
        if (value === "no") {
            setAcademicQualification(false);
            setOtherQualificationSelection([]);
            setManualReductionMonths(0);
            setAttendedUniversity(null);
            setHasEcts(null);
        }
    }

    function handleManualReductionChange(value) {
        // Convert empty string to 0, otherwise use the number
        setManualReductionMonths(value === "" ? 0 : Number(value) || 0);
    }

    function handleAcademicQualificationChange(selected) {
        setAcademicQualification(selected);
    }

    function handleOtherQualificationChange(selection) {
        setOtherQualificationSelection(selection);
    }

    function handleAttendedUniversityChange(value) {
        setAttendedUniversity(value);
        // If changing to "no", also clear ECTS
        if (value === "no") {
            setHasEcts(null);
        }
    }

    function handleHasEctsChange(value) {
        setHasEcts(value);
    }

    // -- Calculations --

    // Determine if we're in tour mode (wantsReduction is explicitly set, not null)
    const isTourMode = wantsReduction !== null && wantsReduction !== undefined;

    // Calculate qualification totals from both academic and other qualifications (tour mode)
    // Only include if wantsReduction is not "no"
    const tourQualificationTotals = useMemo(() => {
        if (!isTourMode || !wantsReduction || wantsReduction === "no") {
            return { rawTotal: 0, cappedTotal: 0, exceedsCap: false };
        }

        // Combine academic and other qualifications
        const academicMonths = academicQualification ? 12 : 0;
        const otherMonths = otherQualificationSelection.reduce((sum, id) => {
            const option = QUALIFICATION_OPTIONS.find(
                (item) => item.id === id && item.id !== "academic"
            );
            return sum + (option?.maxMonths || 0);
        }, 0);

        const rawTotal = academicMonths + otherMonths;
        const cappedTotal = Math.min(rawTotal, MAX_TOTAL_REDUCTION);
        const exceedsCap = rawTotal > MAX_TOTAL_REDUCTION;

        return { rawTotal, cappedTotal, exceedsCap };
    }, [isTourMode, wantsReduction, academicQualification, otherQualificationSelection]);

    // Use tour-specific totals if in tour mode, otherwise use compact mode totals
    const activeQualificationTotals = isTourMode
        ? tourQualificationTotals
        : qualificationTotals;

    // Use tour-specific manual reduction if in tour mode, otherwise 0
    const activeManualReduction = isTourMode
        ? (wantsReduction === "no" ? 0 : manualReductionMonths)
        : 0;

    const reductionSummary = useMemo(
        () => {
            // In tour mode, if wantsReduction is "no", ignore all reductions including school degree
            const effectiveSchoolDegreeId = isTourMode && wantsReduction === "no" ? null : schoolDegreeId;
            return buildReductionSummary({
                schoolDegreeId: effectiveSchoolDegreeId,
                manualReductionMonths: activeManualReduction,
                qualificationReductionMonths: activeQualificationTotals.rawTotal,
                maxTotalMonths: MAX_TOTAL_REDUCTION,
            });
        },
        [isTourMode, wantsReduction, schoolDegreeId, activeManualReduction, activeQualificationTotals.rawTotal]
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

        // Tour-specific state
        wantsReduction,
        manualReductionMonths,
        academicQualification,
        otherQualificationSelection,
        attendedUniversity,
        hasEcts,

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

        // Tour-specific handlers
        handleWantsReductionChange,
        handleManualReductionChange,
        handleAcademicQualificationChange,
        handleOtherQualificationChange,
        handleAttendedUniversityChange,
        handleHasEctsChange,

        // i18n prop needed if called outside (but we used hook inside so t is available)
        t,
    };
}
