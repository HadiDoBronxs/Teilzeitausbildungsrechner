import { useTranslation } from "react-i18next";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";

export default function LegalBasisPage() {
  const { t } = useTranslation();
  // All text now comes from i18n so DE/EN versions stay in sync.
  return (
    <>
      <a className="skip-link" href={`#${MAIN_ID}`}>
        {t("skipToMain")}
      </a>
      <main
        id={MAIN_ID}
        tabIndex="-1"
        aria-labelledby={MAIN_HEADING_ID}
        className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12"
      >
        <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6 space-y-8">
          <h2 id={MAIN_HEADING_ID} className="text-3xl font-bold">
            {t("legal.title")}
          </h2>

          <section className="space-y-3">
            {/* §7a BBiG: Regelt die Teilzeitberufsausbildung im Berufsbildungsgesetz. */}
            <h3 className="text-2xl font-semibold">
              {t("legal.bbig7a.heading")}
            </h3>
            <p className="text-lg leading-relaxed">
              {t("legal.bbig7a.text1")}
            </p>
            <p className="text-lg leading-relaxed">
              {t("legal.bbig7a.text2")}
            </p>
          </section>

          <section className="space-y-3">
            {/* §27b HwO: Regelt die Teilzeitberufsausbildung im Handwerk nach Handwerksordnung. */}
            <h3 className="text-2xl font-semibold">
              {t("legal.hwo27b.heading")}
            </h3>
            <p className="text-lg leading-relaxed">
              {t("legal.hwo27b.text1")}
            </p>
            <p className="text-lg leading-relaxed">
              {t("legal.hwo27b.text2")}
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
