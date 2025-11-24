import { useTranslation } from "react-i18next";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";
const PARAGRAPH_CLASS = "text-lg leading-relaxed";

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
        className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12"
      >
        <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6 space-y-8">
          <h2 id={MAIN_HEADING_ID} className="text-3xl font-bold">
            {t("legal.title")}
          </h2>

          <section className="space-y-3">
            <h3 className="text-2xl font-semibold">
              {t("legal.bbig7a.heading")}
            </h3>
            <p className={PARAGRAPH_CLASS}>{t("legal.bbig7a.text1")}</p>
            <p className={PARAGRAPH_CLASS}>{t("legal.bbig7a.text2")}</p>
          </section>

          <section className="space-y-3">
            <h3 className="text-2xl font-semibold">
              {t("legal.hwo27b.heading")}
            </h3>
            <p className={PARAGRAPH_CLASS}>{t("legal.hwo27b.text1")}</p>
            <p className={PARAGRAPH_CLASS}>{t("legal.hwo27b.text2")}</p>
          </section>

          <section className="space-y-3">
            {/* Vereinfachter Überblick für leicht verständliche Sprache. */}
            <h3 className="text-2xl font-semibold">In einfacher Sprache</h3>
            <ul className="list-disc list-inside space-y-2 text-lg leading-relaxed">
              <li>Teilzeit-Ausbildung heißt: weniger Stunden pro Woche als normal.</li>
              <li>Die Gesamtzeit kann länger werden, weil weniger Stunden pro Woche gelernt wird.</li>
              <li>Betrieb und Auszubildende entscheiden zusammen, wie viel verkürzt wird.</li>
              <li>Die Kammer prüft und stimmt zu, damit alles offiziell passt.</li>
              <li>Alle wichtigen Lerninhalte bleiben trotzdem gleich.</li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
