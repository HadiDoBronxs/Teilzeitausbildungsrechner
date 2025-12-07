// WelcomePage.jsx – Initial landing page that lets users choose between compact and guided (tour) design modes.
import { useTranslation } from "react-i18next";
import LanguageToggle from "../components/LanguageToggle.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";

/**
 * WelcomePage component displays the initial landing page with design selection.
 * Users can choose between compact design (fully functional) and guided design (coming soon).
 * Includes legal disclaimer and placeholder for future FAQ area.
 */
export default function WelcomePage() {
  const { t } = useTranslation();

  function handleCompactClick() {
    window.location.hash = "#compact";
  }

  function handleTourClick() {
    // Tour is not yet implemented, so this is intentionally disabled
    // Future: window.location.hash = "#tour";
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
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
          {/* Header with title and language toggle */}
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 
              id={MAIN_HEADING_ID} 
              className="text-3xl md:text-4xl font-bold text-center sm:text-left min-h-[4.5rem] md:min-h-[5.5rem] max-w-xs sm:max-w-none mx-auto sm:mx-0 line-clamp-3"
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word',
                hyphens: 'auto'
              }}
            >
              {t("welcome.title")}
            </h1>
            <LanguageToggle />
          </div>

          {/* Information text */}
          <Card className="space-y-4" padding="p-6 sm:p-8">
            <p className="text-base md:text-lg leading-relaxed text-slate-700">
              {t("welcome.intro")}
            </p>
          </Card>

          {/* Design selection question */}
          <Card className="space-y-6" padding="p-6 sm:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6 sm:mb-8">
              {t("welcome.question")}
            </h2>

            {/* Design selection cards */}
            {/* Note: Using custom button elements instead of Button component because:
                - These need a card-like appearance with vertical layout (icon above text)
                - The Button component is designed for horizontal layouts (text/icon side-by-side)
                - These selection cards require specific styling (borders, hover states, disabled states)
                  that differ from standard button variants
                - The visual design calls for large clickable cards, not traditional buttons */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Compact Design Card */}
              {/* Design: Dark blue-grey background with white icon and text to indicate active/selectable state */}
              <button
                type="button"
                onClick={handleCompactClick}
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl bg-slate-950 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
                aria-label={`${t("welcome.designs.compact")} - ${t("welcome.intro")}`}
              >
                <span className="text-4xl text-white" aria-hidden="true">
                  ☰
                </span>
                <span className="text-lg font-semibold text-white">
                  {t("welcome.designs.compact")}
                </span>
              </button>

              {/* Guided Design Card (disabled) */}
              <button
                type="button"
                onClick={handleTourClick}
                disabled
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl border-2 border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed"
                aria-label={`${t("welcome.designs.tour")} - ${t("tour.comingSoon")}`}
                aria-disabled="true"
              >
                <span className="text-4xl" aria-hidden="true">
                  📖
                </span>
                <span className="text-lg font-semibold text-slate-600">
                  {t("welcome.designs.tour")}
                </span>
              </button>
            </div>
          </Card>

          {/* Legal disclaimer */}
          <Card variant="info" className="space-y-2" padding="p-6 sm:p-8">
            <p className="text-sm md:text-base text-slate-700">
              {t("welcome.legalDisclaimer")}
            </p>
          </Card>

          {/* FAQ placeholder area */}
          <section
            aria-label="FAQ"
            className="min-h-[200px] p-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
          >
            <p className="text-sm text-slate-500 text-center">
              {t("welcome.faqPlaceholder")}
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

