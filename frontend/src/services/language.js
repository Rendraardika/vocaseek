import api from "../lib/api";

export function getLanguagePreference() {
  return api.get("/language");
}

export function updateLanguagePreference(locale) {
  return api.put("/language", { locale });
}

export function getPreferenceLanguage() {
  return api.get("/preferences/language");
}

export function updatePreferenceLanguage(locale) {
  return api.put("/preferences/language", { locale });
}
