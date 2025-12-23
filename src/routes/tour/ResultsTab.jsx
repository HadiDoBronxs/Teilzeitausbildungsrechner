// ResultsTab.jsx – Final tab of the guided tour, displaying calculation results.
// Contains ResultCard, PDF export button, and transparency panel access.
import ResultCard from "../../features/calcDuration/ResultCard.jsx";
import Button from "../../components/ui/Button.jsx";
import { useTranslation } from "react-i18next";

/**
 * ResultsTab component - Final step of the guided tour.
 *
 * Displays calculation results, PDF export, and transparency panel access.
 *
 * @param {Object} props - Component props
 * @param {Object} props.formValues - Form values object for calculation
 * @param {Function} props.onBack - Callback when Back button is clicked
 * @param {Function} props.onSaveAsPDF - Callback when PDF export is clicked
 * @param {boolean} props.isGeneratingPDF - Whether PDF is currently being generated
 * @param {Function} props.onReset - Callback when Reset button is clicked
 */
export default function ResultsTab({
  formValues,
  onBack,
  onSaveAsPDF,
  isGeneratingPDF,
  onReset,
}) {
  const { t } = useTranslation();

  return (
    <div
      role="tabpanel"
      id="tabpanel-results"
      aria-labelledby="tab-mobile-results tab-results"
      className="space-y-6"
    >
      <div className="space-y-4">
        <div id="result-card" className="w-full">
          <ResultCard values={formValues} />
        </div>

        <Button
          onClick={onSaveAsPDF}
          disabled={isGeneratingPDF}
          variant="brand"
          size="lg"
          className="w-full rounded-xl"
        >
          {isGeneratingPDF ? "Generating PDF..." : t("pdf.saveButton")}
        </Button>
        {onReset && (
          <Button
            onClick={onReset}
            variant="ghost"
            size="md"
            className="w-full text-slate-500 dark:text-slate-400 justify-center"
            ariaLabel={t("app.reset_explained")}
          >
            {t("app.reset")}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-start pt-4">
        <Button onClick={onBack} variant="secondary" size="md">
          ← {t("tour.navigation.back")}
        </Button>
      </div>
    </div>
  );
}
