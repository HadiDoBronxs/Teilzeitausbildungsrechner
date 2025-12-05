import { useTranslation } from "react-i18next";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

const PARAGRAPH_CLASS = "text-base md:text-lg leading-relaxed text-slate-800";

/**
 * Reusable legal basis content for the calculator and modal.
 * Renders the BBiG/HwO explanations and the simplified overview.
 * All outbound links open in a new tab so users stay inside TZR.
 */
export default function LegalContent({ className = "" }) {
  const { t } = useTranslation();
  const wrapperClass = ["space-y-8 sm:space-y-10", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClass}>
      {/* BBiG anchor with plain-language explanation. */}
      <section className="space-y-3" aria-labelledby="legal-bbig7a-heading">
        <h3
          id="legal-bbig7a-heading"
          className="text-xl md:text-2xl font-semibold text-slate-900"
        >
          {t("legal.bbig7a.heading")}
        </h3>
        <p className={PARAGRAPH_CLASS}>{t("legal.bbig7a.text1")}</p>
        <p className={PARAGRAPH_CLASS}>{t("legal.bbig7a.text2")}</p>
        {/* Opens official §7a BBiG law text in new tab. */}
        <Button
          variant="text"
          size="sm"
          as="a"
          href="https://www.gesetze-im-internet.de/bbig_2005/__7a.html"
          target="_blank"
          rel="noreferrer"
        >
          {t("legal.openLaw")}
        </Button>
      </section>

      {/* HwO anchor text for crafts training. */}
      <section className="space-y-3" aria-labelledby="legal-hwo27b-heading">
        <h3
          id="legal-hwo27b-heading"
          className="text-xl md:text-2xl font-semibold text-slate-900"
        >
          {t("legal.hwo27b.heading")}
        </h3>
        <p className={PARAGRAPH_CLASS}>{t("legal.hwo27b.text1")}</p>
        <p className={PARAGRAPH_CLASS}>{t("legal.hwo27b.text2")}</p>
        {/* Opens official §27b HwO law text in new tab. */}
        <Button
          variant="text"
          size="sm"
          as="a"
          href="https://www.gesetze-im-internet.de/hwo/__27b.html"
          target="_blank"
          rel="noreferrer"
        >
          {t("legal.openLaw")}
        </Button>
      </section>

      {/* Simplified list for easy language users. */}
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

      {/* Neutral notice clarifying non-binding info. */}
      <section className="space-y-4" aria-labelledby="legal-notice-heading">
        <h3
          id="legal-notice-heading"
          className="text-xl md:text-2xl font-semibold text-slate-900"
        >
          {t("legal.notice.heading")}
        </h3>
        <p className={PARAGRAPH_CLASS}>{t("legal.notice.text")}</p>
      </section>

      {/* Additional official sources (only those provided) open in a new tab. */}
      <Card
        as="section"
        className="space-y-3 border-slate-200 bg-slate-50"
        padding="p-4 sm:p-5"
        aria-labelledby="legal-sources-heading"
      >
        <h3
          id="legal-sources-heading"
          className="text-xl md:text-2xl font-semibold text-slate-900"
        >
          {t("legal.sources.heading")}
        </h3>
        <ul className="space-y-2">
          <li>
            {/* Full BBiG overview page. */}
            <Button
              variant="text"
              size="sm"
              as="a"
              href="https://www.gesetze-im-internet.de/bbig_2005/"
              target="_blank"
              rel="noreferrer"
            >
              {t("legal.sources.bbig")}
            </Button>
          </li>
          <li>
            {/* Full HwO overview page. */}
            <Button
              variant="text"
              size="sm"
              as="a"
              href="https://www.gesetze-im-internet.de/hwo/"
              target="_blank"
              rel="noreferrer"
            >
              {t("legal.sources.hwo")}
            </Button>
          </li>
          <li>
            {/* Official BMBF PDF provided by the user. */}
            <Button
              variant="text"
              size="sm"
              as="a"
              href="https://www.bmbfsfj.bund.de/resource/blob/267912/41b921035a480044dee7ffb4c00683bf/berufsausbildung-in-teilzeit-data.pdf"
              target="_blank"
              rel="noreferrer"
            >
              {t("legal.sources.bmbf")}
            </Button>
          </li>
        </ul>
      </Card>
    </div>
  );
}
