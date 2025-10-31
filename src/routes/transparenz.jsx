import { useTranslation } from "react-i18next";

const MAIN_ID = "main";
const MAIN_HEADING_ID = "main-heading";
const steps = ["step1", "step2", "step3", "step4"];

export default function Transparenz() {
  const { t } = useTranslation();
  return (
    <>
      <a className="skip-link" href={`#${MAIN_ID}`}>
        Zum Inhalt springen
      </a>
      <main
        id={MAIN_ID}
        tabIndex="-1"
        aria-labelledby={MAIN_HEADING_ID}
        className="min-h-screen bg-slate-50 text-slate-900 px-4 py-12"
      >
        <article className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6 space-y-4">
          <h1 id={MAIN_HEADING_ID} className="text-3xl font-bold">
            {t("transparency.title")}
          </h1>
          <section id="berechnung" className="space-y-6">
            <p className="text-lg text-slate-700">
              {t("transparency.subtitle")}
            </p>
            <ol className="space-y-4 list-decimal list-inside text-lg">
              {steps.map((step) => (
                <li key={step} className="space-y-1">
                  <p className="font-semibold">
                    {t(`transparency.steps.${step}.title`)}
                  </p>
                  <p>{t(`transparency.steps.${step}.text`)}</p>
                  <p className="text-slate-500">
                    {t(`transparency.steps.${step}.example`)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </article>
      </main>
    </>
  );
}
