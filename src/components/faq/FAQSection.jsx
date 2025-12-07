import { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../ui/Card.jsx";

const FAQ_SECTION_ID = "faq";

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
    key: "legal",
    items: ["binding", "whoDecides"],
  },
];

export default function FAQSection() {
  const { t } = useTranslation();
  const [openIds, setOpenIds] = useState([]);

  function toggle(id) {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
                      className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left rounded-xl bg-slate-900 text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transition shadow-sm"
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
    </Card>
  );
}
