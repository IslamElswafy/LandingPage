import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: en,
    },
    ar: {
      translation: ar,
    },
  },
  fallbackLng: "en", // Default language
  interpolation: {
    escapeValue: false, // React already does escaping
  },
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
  },
});

// Function to update the direction of the document
const updateDocumentDirection = (language: string) => {
  const dir = language === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", dir);
};

// Listen for language changes and update direction
i18n.on("languageChanged", (lng) => {
  updateDocumentDirection(lng);
});

// Set initial direction
updateDocumentDirection(i18n.language);

export default i18n;
