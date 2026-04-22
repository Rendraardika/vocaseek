import axios from "axios";
import { getAccessToken } from "../utils/authStorage";

const LANGUAGE_STORAGE_KEY = "vocaseek_language";
const DEFAULT_LANGUAGE = "id";

function normalizeConfiguredApiBaseUrl() {
  return String(import.meta.env.VITE_API_BASE_URL || "").trim();
}

export function resolveApiBaseUrl() {
  const configuredBaseUrl = normalizeConfiguredApiBaseUrl();

  if (typeof window === "undefined") {
    return configuredBaseUrl || "/api";
  }

  const fallbackBaseUrl = `${window.location.protocol}//${window.location.hostname}:8000/api`;

  if (!configuredBaseUrl) {
    return fallbackBaseUrl;
  }

  try {
    const configuredUrl = new URL(configuredBaseUrl, window.location.origin);
    const currentHostname = window.location.hostname;
    const configuredHostname = configuredUrl.hostname;
    const isLocalFrontend = ["localhost", "127.0.0.1"].includes(currentHostname);

    if (configuredUrl.origin === window.location.origin && configuredUrl.pathname === "/api") {
      if (window.location.port && window.location.port !== "8000") {
        return fallbackBaseUrl;
      }

      return configuredUrl.toString().replace(/\/+$/, "");
    }

    if (isLocalFrontend && !["localhost", "127.0.0.1"].includes(configuredHostname)) {
      return fallbackBaseUrl;
    }

    return configuredUrl.toString().replace(/\/+$/, "");
  } catch {
    return fallbackBaseUrl;
  }
}

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
  baseURL: resolveApiBaseUrl(),
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
