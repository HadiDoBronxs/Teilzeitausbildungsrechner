import { useTranslation } from "react-i18next";
import LanguageToggle from "../components/LanguageToggle.jsx";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";
const PARAGRAPH_CLASS =
  "text-base md:text-lg leading-relaxed text-slate-800";

export default function LegalBasisPage() {
  const { t } = useTranslation();
  // Text is fully driven by i18n to keep DE/EN aligned.
  return (
    <>
      <a className="skip-link" href={`#${MAIN_ID}`}>
        {t("skipToMain")}
      </a>
      <main
        id={MAIN_ID}
        tabIndex="-1"
        aria-labelledby={MAIN_HEADING_ID}
        className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12 sm:py-16"
      >
        <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 sm:space-y-10">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 id={MAIN_HEADING_ID} className="text-3xl md:text-4xl font-bold">
              {t("legal.title")}
            </h2>
            <LanguageToggle />
          </div>

          {/* Sections expose their headings via aria-labelledby for screen reader navigation. */}
          <section
            className="space-y-3"
            aria-labelledby="legal-bbig7a-heading"
          >
            <h3
              id="legal-bbig7a-heading"
              className="text-xl md:text-2xl font-semibold text-slate-900"
            >
              {t("legal.bbig7a.heading")}
            </h3>
            <p className={PARAGRAPH_CLASS}>{t("legal.bbig7a.text1")}</p>
            <p className={PARAGRAPH_CLASS}>{t("legal.bbig7a.text2")}</p>
          </section>

          <section
            className="space-y-3"
            aria-labelledby="legal-hwo27b-heading"
          >
            <h3
              id="legal-hwo27b-heading"
              className="text-xl md:text-2xl font-semibold text-slate-900"
            >
              {t("legal.hwo27b.heading")}
            </h3>
            <p className={PARAGRAPH_CLASS}>{t("legal.hwo27b.text1")}</p>
            <p className={PARAGRAPH_CLASS}>{t("legal.hwo27b.text2")}</p>
          </section>

          <section
            className="space-y-3"
            aria-labelledby="legal-easy-heading"
          >
            {/* Simplified overview for easy language users. */}
            <h3
              id="legal-easy-heading"
              className="text-xl md:text-2xl font-semibold text-slate-900"
            >
              {t("legal.easy.heading")}
            </h3>
            <ul className="list-disc list-inside space-y-2 text-base md:text-lg leading-relaxed text-slate-800">
              <li>{t("legal.easy.point1")}</li>
              <li>{t("legal.easy.point2")}</li>
              <li>{t("legal.easy.point3")}</li>
              <li>{t("legal.easy.point4")}</li>
              <li>{t("legal.easy.point5")}</li>
            </ul>
          </section>

          <section
            className="space-y-4"
            aria-labelledby="legal-notice-heading"
          >
            {/* Legal notice block to clarify no legal advice and point to official sources. */}
            <h3
              id="legal-notice-heading"
              className="text-xl md:text-2xl font-semibold text-slate-900"
            >
              {t("legal.notice.heading")}
            </h3>
            <p className={PARAGRAPH_CLASS}>{t("legal.notice.text")}</p>
          </section>
        </div>
      </main>
    </>
  );
}
