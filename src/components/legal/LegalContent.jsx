import { useTranslation } from "react-i18next";

const PARAGRAPH_CLASS = "text-base md:text-lg leading-relaxed text-slate-800";

/**
 * Reusable legal basis content for the calculator and modal.
 * Renders the BBiG/HwO explanations and the simplified overview.
 */
export default function LegalContent({ className = "" }) {
  const { t } = useTranslation();
  const wrapperClass = ["space-y-8 sm:space-y-10", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass}>
      <section className="space-y-3" aria-labelledby="legal-bbig7a-heading">
        <h3
          id="legal-bbig7a-heading"
          className="text-xl md:text-2xl font-semibold text-slate-900"
        >
          {t("legal.bbig7a.heading")}
        </h3>
        <p className={PARAGRAPH_CLASS}>{t("legal.bbig7a.text1")}</p>
        <p className={PARAGRAPH_CLASS}>{t("legal.bbig7a.text2")}</p>
      </section>

      <section className="space-y-3" aria-labelledby="legal-hwo27b-heading">
        <h3
          id="legal-hwo27b-heading"
          className="text-xl md:text-2xl font-semibold text-slate-900"
        >
          {t("legal.hwo27b.heading")}
        </h3>
        <p className={PARAGRAPH_CLASS}>{t("legal.hwo27b.text1")}</p>
        <p className={PARAGRAPH_CLASS}>{t("legal.hwo27b.text2")}</p>
      </section>

      <section className="space-y-3" aria-labelledby="legal-easy-heading">
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

      <section className="space-y-4" aria-labelledby="legal-notice-heading">
        <h3
          id="legal-notice-heading"
          className="text-xl md:text-2xl font-semibold text-slate-900"
        >
          {t("legal.notice.heading")}
        </h3>
        <p className={PARAGRAPH_CLASS}>{t("legal.notice.text")}</p>
      </section>
    </div>
  );
}
