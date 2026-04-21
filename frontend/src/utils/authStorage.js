import { saveLanguagePreference } from "./languagePreference";

export const AUTH_STORAGE_KEY = "vocaseek_auth";
const AUTH_FLAG_KEY = "isLoggedIn";

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function removeLegacyLocalAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_FLAG_KEY);
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
      sessionUser?.email ||
      rawPayload?.user_data?.email ||
      rawPayload?.email ||
      meta.email ||
      "",
    raw: payload,
  };

  const storage = getBrowserStorage();
  if (!storage) {
    return normalized;
  }

  removeLegacyLocalAuth();
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
  storage.setItem(AUTH_FLAG_KEY, "true");
  window.dispatchEvent(new Event("auth-changed"));

  return normalized;
}

export function updateAuthSession(updater) {
  const storage = getBrowserStorage();
  if (!storage) return null;

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
    raw: nextValue?.raw ?? current.raw ?? null,
  };

  syncLocaleFromPayload(normalized.raw);

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
  storage.setItem(AUTH_FLAG_KEY, "true");
  window.dispatchEvent(new Event("auth-changed"));

  return normalized;
}

export function getAuthSession() {
  try {
    const storage = getBrowserStorage();
    if (!storage) return null;

    const saved = storage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Gagal membaca sesi auth:", error);
    return null;
  }
}

export function getAccessToken() {
  return getAuthSession()?.token || "";
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
  const storage = getBrowserStorage();
  if (storage) {
    storage.removeItem(AUTH_STORAGE_KEY);
    storage.removeItem(AUTH_FLAG_KEY);
  }

  removeLegacyLocalAuth();
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
