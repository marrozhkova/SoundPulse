import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../data/locales/en.json";
import de from "../data/locales/de.json";
import fr from "../data/locales/fr.json";
import es from "../data/locales/es.json";
import zh from "../data/locales/zh.json";
import ar from "../data/locales/ar.json";

export const languageResources = {
  en: { translation: en },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  zh: { translation: zh },
  ar: { translation: ar },
};

i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "en",
  fallbackLng: "en",
  resources: languageResources,
});

export default i18next;
