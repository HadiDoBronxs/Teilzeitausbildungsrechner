import { useState } from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../ui/Dialog.jsx";
import Card from "../ui/Card.jsx";
import LegalContent from "../legal/LegalContent.jsx";
import TransparencyPanel from "../../features/calcDuration/TransparencyPanel.jsx";

// DOM ID for the FAQ section (useful for skip links or programmatic scrolling)
const FAQ_SECTION_ID = "faq";
// Sample values to render the transparency dialog without needing live form inputs.
// This allows users to see a full calculation explanation without filling in the form.
const FAQ_SAMPLE_FORM = {
  weeklyFull: 40,
  weeklyPart: 30,
  fullDurationMonths: 36,
  reductionMonths: 6,
  degreeReductionMonths: 6,
  manualReductionMonths: 0,
  qualificationReductionRawMonths: 0,
  schoolDegreeLabelKey: "reductionOptions.abi",
  maxTotalReduction: 12,
  minDurationMonths: 18,
  rounding: "round",
};

// FAQ category definitions.
// Each category contains item keys which map to translation entries.
// This keeps the FAQ fully translation-driven and easy to maintain.
const FAQ_CATEGORIES = [
  {
    key: "calculation",
    items: ["calcHow", "rule50", "adjustHours", "invalid"],
  },
  {
    key: "rules",
    items: ["below50", "capReduction"],
  },
  {
    key: "practice",
    items: ["shiftPlan", "hoursChange"],
  },
  {
    key: "technical",
    items: ["saveData", "pdfIssue"],
  },
  {
    key: "legal",
    items: ["binding", "whoDecides"],
  },
];

export default function FAQSection() {
  const { t } = useTranslation();

  // Tracks which FAQ items are expanded (accordion state)
  const [openIds, setOpenIds] = useState([]);

  // Controls visibility of the legal and transparency dialogs
  const [showLegal, setShowLegal] = useState(false);
  const [showTransparency, setShowTransparency] = useState(false);

  // Toggles a single FAQ accordion item
  function toggle(id) {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // Allow keyboard users to toggle with Enter/Space explicitly (in addition to native button behavior)
  function handleKeyToggle(event, id) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle(id);
    }
  }

  return (
    <Card
      id={FAQ_SECTION_ID}
      as="section"
      aria-labelledby="faq-heading"
      className="space-y-6"
      padding="p-6 sm:p-8"
    >
      <div className="text-center space-y-2 sm:max-w-3xl mx-auto">
        <h2
          id="faq-heading"
          className="text-2xl font-semibold text-slate-900 leading-tight"
        >
          {t("welcome.faqTitle")}
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          {t("welcome.faqIntro")}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            className="text-sm font-medium text-blue-700 underline underline-offset-4 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            onClick={() => setShowLegal(true)}
          >
            {t("welcome.faqLinkLegal")}
          </button>
          <button
            type="button"
            className="text-sm font-medium text-blue-700 underline underline-offset-4 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            onClick={() => setShowTransparency(true)}
          >
            {t("welcome.faqLinkTransparency")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {FAQ_CATEGORIES.map((category) => (
          <section
            key={category.key}
            aria-labelledby={`faq-cat-${category.key}`}
            className="space-y-3"
          >
            <h3
              id={`faq-cat-${category.key}`}
              className="text-lg font-semibold text-slate-900"
            >
              {t(`faq.categories.${category.key}`)}
            </h3>
            <ul className="space-y-3">
              {category.items.map((item) => {
                const isOpen = openIds.includes(item);
                return (
                  <li
                    key={item}
                    className="rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${item}`}
                      id={`faq-trigger-${item}`}
                      onClick={() => toggle(item)}
                      onKeyDown={(event) => handleKeyToggle(event, item)}
                      // Dark button for strong contrast; icon indicates state.
                      className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left rounded-xl bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 transition shadow-sm"
                    >
                      <span className="font-medium">
                        {t(`faq.items.${item}.question`)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-xl text-slate-100"
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    <div
                      id={`faq-panel-${item}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${item}`}
                      className={`border-t border-slate-200 px-4 py-3 space-y-2 bg-slate-50 ${
                        isOpen ? "block" : "hidden"
                      }`}
                    >
                      <p className="text-sm leading-relaxed text-slate-800">
                        {t(`faq.items.${item}.answer`)}
                      </p>
                      <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        {t(`faq.items.${item}.easy`)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {showLegal ? <LegalDialog onClose={() => setShowLegal(false)} /> : null}
      {showTransparency ? (
        <TransparencyDialog onClose={() => setShowTransparency(false)} />
      ) : null}
    </Card>
  );
}

function LegalDialog({ onClose }) {
  const { t } = useTranslation();
  return (
    <Dialog
      title={t("legal.title")}
      isOpen
      onClose={onClose}
      maxWidth="max-w-4xl"
      bodyClassName="max-h-[70vh] overflow-y-auto px-6 py-5"
      closeLabel={t("transparency.close")}
    >
      <LegalContent />
    </Dialog>
  );
}

function TransparencyDialog({ onClose }) {
  // Reuse the transparency panel from the calculator with fixed sample data,
  // so FAQ users can see the full explanation without leaving the page.
  return <TransparencyPanel formValues={FAQ_SAMPLE_FORM} onClose={onClose} />;
}
