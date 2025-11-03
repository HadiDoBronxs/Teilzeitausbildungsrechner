import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "./locales/de/translation.json";
import en from "./locales/en/translation.json";
import { getTextDirection } from "./i18n/languages.js";

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
  },
  lng: "de",
  fallbackLng: "de",
  interpolation: {
    escapeValue: false
  }
});

/**
 * Update document direction and language attributes based on current i18n language
 */
const updateDocumentDirection = () => {
  if (typeof document === "undefined") return;
  
  const currentLanguage = i18n.language || i18n.options.fallbackLng || "de";
  const direction = getTextDirection(currentLanguage);
  
  // Update HTML element attributes
  document.documentElement.setAttribute("dir", direction);
  document.documentElement.setAttribute("lang", currentLanguage);
};

// Update direction on initial load
updateDocumentDirection();

// Update direction whenever language changes
i18n.on("languageChanged", () => {
  updateDocumentDirection();
});

export default i18n;
