import { saveLanguagePreference } from "./languagePreference";

export const AUTH_STORAGE_KEY = "vocaseek_auth";
const AUTH_FLAG_KEY = "isLoggedIn";
const LEGACY_TOKEN_KEY = "token";

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function clearAllAuthStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_FLAG_KEY);
  window.sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_FLAG_KEY);
  window.localStorage.removeItem(LEGACY_TOKEN_KEY);
}

function persistAuthSession(normalized, options = {}) {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();
  const persistent =
    typeof options.persistent === "boolean"
      ? options.persistent
      : Boolean(normalized?.persistent);
  const payloadToStore = {
    ...normalized,
    persistent,
  };
  const serialized = JSON.stringify(payloadToStore);

  sessionStorage?.setItem(AUTH_STORAGE_KEY, serialized);
  sessionStorage?.setItem(AUTH_FLAG_KEY, "true");
  if (payloadToStore?.token) {
    sessionStorage?.setItem(LEGACY_TOKEN_KEY, payloadToStore.token);
  }

  if (persistent) {
    localStorage?.setItem(AUTH_STORAGE_KEY, serialized);
    localStorage?.setItem(AUTH_FLAG_KEY, "true");
    if (payloadToStore?.token) {
      localStorage?.setItem(LEGACY_TOKEN_KEY, payloadToStore.token);
    }
  } else {
    localStorage?.removeItem(AUTH_STORAGE_KEY);
    localStorage?.removeItem(AUTH_FLAG_KEY);
    localStorage?.removeItem(LEGACY_TOKEN_KEY);
  }
}

function getLegacyToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.sessionStorage.getItem(LEGACY_TOKEN_KEY) ||
    window.localStorage.getItem(LEGACY_TOKEN_KEY) ||
    ""
  );
}

function syncLocaleFromPayload(payload) {
  const locale =
    payload?.locale ||
    payload?.data?.locale ||
    payload?.user_data?.locale ||
    payload?.data?.user_data?.locale ||
    "";

  if (locale === "id" || locale === "en") {
    saveLanguagePreference(locale);
  }
}

export function saveAuthSession(payload, meta = {}) {
  syncLocaleFromPayload(payload);

  const payloadUser =
    payload?.user_data ||
    payload?.data?.user_data ||
    payload?.user ||
    payload?.data?.user ||
    null;
  const sessionUser =
    payloadUser && typeof payloadUser === "object" ? payloadUser : null;
  const rawPayload = payload?.data || payload || null;

  const normalized = {
    token:
      payload?.token ||
      payload?.access_token ||
      payload?.data?.token ||
      payload?.data?.access_token ||
      "",
    user: sessionUser,
    role:
      payload?.role ||
      payload?.data?.role ||
      sessionUser?.role ||
      rawPayload?.role ||
      "",
    identifier:
      payload?.identifier ||
      payload?.data?.identifier ||
      sessionUser?.user_id ||
      sessionUser?.id ||
      rawPayload?.user_data?.user_id ||
      rawPayload?.user_data?.id ||
      rawPayload?.user_id ||
      rawPayload?.id ||
      sessionUser?.email ||
      rawPayload?.user_data?.email ||
      rawPayload?.email ||
      meta.email ||
      "",
    persistent: Boolean(meta.remember),
    raw: payload,
  };

  if (!getSessionStorage() && !getLocalStorage()) {
    return normalized;
  }

  persistAuthSession(normalized, { persistent: normalized.persistent });
  window.dispatchEvent(new Event("auth-changed"));

  return normalized;
}

export function updateAuthSession(updater) {
  if (!getSessionStorage() && !getLocalStorage()) return null;

  const current = getAuthSession() || {
    token: "",
    user: null,
    role: "",
    identifier: "",
    raw: null,
  };

  const nextValue =
    typeof updater === "function" ? updater(current) : { ...current, ...updater };

  const normalized = {
    ...current,
    ...nextValue,
    token: nextValue?.token ?? current.token ?? "",
    user: nextValue?.user ?? current.user ?? null,
    role: nextValue?.role ?? current.role ?? "",
    identifier: nextValue?.identifier ?? current.identifier ?? "",
    persistent: nextValue?.persistent ?? current.persistent ?? false,
    raw: nextValue?.raw ?? current.raw ?? null,
  };

  syncLocaleFromPayload(normalized.raw);

  persistAuthSession(normalized, { persistent: normalized.persistent });
  window.dispatchEvent(new Event("auth-changed"));

  return normalized;
}

export function getAuthSession() {
  try {
    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();
    if (!sessionStorage && !localStorage) return null;

    const sessionSaved = sessionStorage?.getItem(AUTH_STORAGE_KEY);
    if (sessionSaved) {
      const parsed = JSON.parse(sessionSaved);
      return parsed;
    }

    const localSaved = localStorage?.getItem(AUTH_STORAGE_KEY);
    if (!localSaved) {
      const legacyToken = getLegacyToken();

      return legacyToken
        ? {
            token: legacyToken,
            user: null,
            role: "",
            identifier: "",
            raw: null,
          }
        : null;
    }

    const parsed = JSON.parse(localSaved);

    // Pulihkan sessionStorage untuk tab aktif tanpa mengubah mode persistensi.
    if (parsed && sessionStorage) {
      persistAuthSession(
        {
          ...parsed,
          persistent: true,
        },
        { persistent: true },
      );
    }

    return {
      ...parsed,
      persistent: true,
    };
  } catch (error) {
    console.error("Gagal membaca sesi auth:", error);
    const legacyToken = getLegacyToken();

    if (legacyToken) {
      return {
        token: legacyToken,
        user: null,
        role: "",
        identifier: "",
        raw: null,
      };
    }

    return null;
  }
}

export function getAccessToken() {
  return getAuthSession()?.token || getLegacyToken() || "";
}

export function getUserRole() {
  const session = getAuthSession();

  return (
    session?.role ||
    session?.user?.role ||
    session?.raw?.role ||
    session?.raw?.user?.role ||
    ""
  );
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function resolveUserHomeRoute(roleValue) {
  const role = typeof roleValue === "string" ? roleValue : getUserRole();
  const normalizedRole = String(role).toLowerCase();

  if (normalizedRole.includes("intern") || normalizedRole.includes("pelamar")) {
    return "/home";
  }

  return resolveAdminRoute(role);
}

export function clearAuthSession() {
  clearAllAuthStorage();
  window.dispatchEvent(new Event("auth-changed"));
}

export function resolveAdminRoute(user) {
  const role = typeof user === "string"
    ? user
    : user?.role ||
      user?.user_role ||
      user?.type ||
      user?.level ||
      user?.position ||
      "";

  const normalizedRole = String(role).toLowerCase();

  if (normalizedRole.includes("super")) {
    return "/admin/dashboard";
  }

  if (normalizedRole.includes("staff")) {
    return "/admin/staff/dashboard";
  }

  if (normalizedRole.includes("company") || normalizedRole.includes("mitra")) {
    return "/admin/mitra/dashboard";
  }

  return "/admin/mitra/dashboard";
}
