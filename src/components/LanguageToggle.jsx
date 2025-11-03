import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../i18n/languages.js";

export default function LanguageToggle() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || "de";

  const handleLanguageToggle = () => {
    const currentIndex = LANGUAGES.findIndex(
      (lang) => lang.code === currentLanguage
    );
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    const nextLanguage = LANGUAGES[nextIndex];
    i18n.changeLanguage(nextLanguage.code);
  };

  const currentLanguageConfig = LANGUAGES.find(
    (lang) => lang.code === currentLanguage
  ) || LANGUAGES[0];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">
        {t("app.languages")}:
      </span>
      <button
        onClick={handleLanguageToggle}
        className="px-3 py-1 text-sm rounded-md transition-colors bg-blue-600 text-white font-semibold hover:bg-blue-700"
        aria-label={`Switch to next language, currently ${t(currentLanguageConfig.nameKey)}`}
      >
        {t(currentLanguageConfig.nameKey)}
      </button>
    </div>
  );
}

