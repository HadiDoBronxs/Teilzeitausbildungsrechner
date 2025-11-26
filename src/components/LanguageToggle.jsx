import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../i18n/languages.js";
import Button from "./ui/Button";

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
      <Button
        onClick={handleLanguageToggle}
        variant="pill"
        size="sm"
        ariaLabel={`Switch to next language, currently ${t(currentLanguageConfig.nameKey)}`}
      >
        {t(currentLanguageConfig.nameKey)}
      </Button>
    </div>
  );
}
