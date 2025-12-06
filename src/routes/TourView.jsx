// TourView.jsx – Placeholder for the guided tour design mode (coming soon).
// Future implementation will use the same useCalculator hook and input components as CompactView,
// but organize them into tabs with step-by-step guidance.
import { useTranslation } from "react-i18next";
import LanguageToggle from "../components/LanguageToggle.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";

/**
 * TourView component - placeholder for future guided tour implementation.
 * When implemented, this will use the same useCalculator hook and input components
 * as CompactView, but organize them into tabs with explanations.
 */
export default function TourView() {
  const { t } = useTranslation();

  function handleBackToWelcome() {
    window.location.hash = "";
  }

  return (
    <>
      {/* Skip link for screen readers and keyboard users to jump to content. */}
      <a className="skip-link" href={`#${MAIN_ID}`}>
        {t("skipToMain")}
      </a>
      <main
        id={MAIN_ID}
        tabIndex="-1"
        aria-labelledby={MAIN_HEADING_ID}
        className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12 sm:py-16"
      >
        <Card className="max-w-3xl mx-auto space-y-6" padding="p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 id={MAIN_HEADING_ID} className="text-3xl md:text-4xl font-bold">
              {t("welcome.designs.tour")}
            </h1>
            <LanguageToggle />
          </div>

          <div className="space-y-4">
            <p className="text-lg text-slate-700">{t("tour.comingSoon")}</p>
            <Button onClick={handleBackToWelcome} variant="primary">
              {t("welcome.title")}
            </Button>
          </div>
        </Card>
      </main>
    </>
  );
}

