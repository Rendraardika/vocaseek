import axios from "axios";
import { getAccessToken } from "../utils/authStorage";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const LANGUAGE_STORAGE_KEY = "vocaseek_language";
const DEFAULT_LANGUAGE = "id";

function getActiveLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return ["id", "en"].includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
}

function isPublicAuthEndpoint(url = "") {
  const normalized = String(url || "").toLowerCase();

  return [
    "/login",
    "/register",
    "/email/verification-notification",
    "/forgot-password",
    "/forgot-password/validate-token",
    "/reset-password",
    "/auth/google/token",
  ].some((endpoint) => normalized.endsWith(endpoint));
}

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const activeLanguage = getActiveLanguage();
  config.headers["X-Locale"] = activeLanguage;
  config.headers["Accept-Language"] = activeLanguage;

  if (isPublicAuthEndpoint(config.url)) {
    config.withCredentials = false;
    if (config.headers) {
      delete config.headers["X-XSRF-TOKEN"];
      delete config.headers["X-CSRF-TOKEN"];
    }
  }

  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
