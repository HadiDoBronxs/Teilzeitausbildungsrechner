import { useTranslation } from "react-i18next";
import LanguageToggle from "../components/LanguageToggle.jsx";
import Card from "../components/ui/Card.jsx";
import LegalContent from "../components/legal/LegalContent.jsx";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";

export default function LegalBasisPage() {
  const { t } = useTranslation();

  // Standalone page rendering the same legal sections as the in-app modal,
  // wrapped with layout and language switcher. Text is fully driven by i18n.
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
        className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 px-4 py-12 sm:py-16"
      >
        <Card
          className="max-w-3xl mx-auto space-y-8 sm:space-y-10"
          padding="p-6 sm:p-8"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id={MAIN_HEADING_ID}
              className="text-3xl md:text-4xl font-bold"
            >
              {t("legal.title")}
            </h2>
            <LanguageToggle />
          </div>

          {/* Reuse the shared legal content so text stays in sync with the modal. */}
          <LegalContent />
        </Card>
      </main>
    </>
  );
}
