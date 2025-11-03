/**
 * Language configuration with RTL support metadata.
 * Add new languages here with their direction information.
 */
export const LANGUAGES = [
  {
    code: "de",
    nameKey: "app.languageNames.de",
    isRTL: false,
  },
  {
    code: "en",
    nameKey: "app.languageNames.en",
    isRTL: false,
  },
  // Example RTL language (not actually implemented):
  // {
  //   code: "ar",
  //   nameKey: "app.languageNames.ar",
  //   isRTL: true,
  // },
];

/**
 * Get language configuration by code
 */
export const getLanguageConfig = (code) => {
  return LANGUAGES.find((lang) => lang.code === code) || LANGUAGES[0];
};

/**
 * Check if a language code is RTL
 */
export const isRTL = (languageCode) => {
  const config = getLanguageConfig(languageCode);
  return config.isRTL === true;
};

/**
 * Get the text direction for a language code
 */
export const getTextDirection = (languageCode) => {
  return isRTL(languageCode) ? "rtl" : "ltr";
};

