import { saveLanguagePreference } from "./languagePreference";

export const AUTH_STORAGE_KEY = "vocaseek_auth";
const AUTH_FLAG_KEY = "isLoggedIn";
const LEGACY_TOKEN_KEY = "token";
const AUTH_SCOPE_KEYS = {
  intern: "intern",
  company: "company",
  staff: "staff",
  super: "super",
};

function getScopedStorageKey(baseKey, scope) {
  return `${baseKey}_${scope}`;
}

function normalizeAuthScope(value = "") {
  const normalizedValue = String(value || "").trim().toLowerCase();

  if (
    normalizedValue.includes("company") ||
    normalizedValue.includes("mitra")
  ) {
    return AUTH_SCOPE_KEYS.company;
  }

  if (normalizedValue.includes("staff")) {
    return AUTH_SCOPE_KEYS.staff;
  }

  if (normalizedValue.includes("super")) {
    return AUTH_SCOPE_KEYS.super;
  }

  return AUTH_SCOPE_KEYS.intern;
}

function getScopeFromPathname(pathname = "") {
  const normalizedPath = String(pathname || "").trim().toLowerCase();

  if (
    normalizedPath.startsWith("/admin/mitra") ||
    normalizedPath.startsWith("/login-company") ||
    normalizedPath.startsWith("/register-company")
  ) {
    return AUTH_SCOPE_KEYS.company;
  }

  if (normalizedPath.startsWith("/admin/staff")) {
    return AUTH_SCOPE_KEYS.staff;
  }

  if (normalizedPath.startsWith("/admin")) {
    return AUTH_SCOPE_KEYS.super;
  }

  return AUTH_SCOPE_KEYS.intern;
}

function getActiveAuthScope() {
  if (typeof window === "undefined") {
    return AUTH_SCOPE_KEYS.intern;
  }

  return getScopeFromPathname(window.location.pathname);
}

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

function clearScopedAuthStorage(scope) {
  if (typeof window === "undefined") {
    return;
  }

  const scopedAuthStorageKey = getScopedStorageKey(AUTH_STORAGE_KEY, scope);
  const scopedAuthFlagKey = getScopedStorageKey(AUTH_FLAG_KEY, scope);
  const scopedLegacyTokenKey = getScopedStorageKey(LEGACY_TOKEN_KEY, scope);

  window.sessionStorage.removeItem(scopedAuthStorageKey);
  window.sessionStorage.removeItem(scopedAuthFlagKey);
  window.sessionStorage.removeItem(scopedLegacyTokenKey);
  window.localStorage.removeItem(scopedAuthStorageKey);
  window.localStorage.removeItem(scopedAuthFlagKey);
  window.localStorage.removeItem(scopedLegacyTokenKey);
}

function clearAllAuthStorage() {
  Object.values(AUTH_SCOPE_KEYS).forEach(clearScopedAuthStorage);

  if (typeof window === "undefined") {
    return;
  }

  // Bersihkan key lama supaya sesi lintas-portal tidak saling menimpa lagi.
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
  const scope = normalizeAuthScope(options.scope || normalized?.role);
  const scopedAuthStorageKey = getScopedStorageKey(AUTH_STORAGE_KEY, scope);
  const scopedAuthFlagKey = getScopedStorageKey(AUTH_FLAG_KEY, scope);
  const scopedLegacyTokenKey = getScopedStorageKey(LEGACY_TOKEN_KEY, scope);
  const persistent =
    typeof options.persistent === "boolean"
      ? options.persistent
      : Boolean(normalized?.persistent);
  const payloadToStore = {
    ...normalized,
    persistent,
    scope,
  };
  const serialized = JSON.stringify(payloadToStore);

  sessionStorage?.setItem(scopedAuthStorageKey, serialized);
  sessionStorage?.setItem(scopedAuthFlagKey, "true");
  if (payloadToStore?.token) {
    sessionStorage?.setItem(scopedLegacyTokenKey, payloadToStore.token);
  }

  if (persistent) {
    localStorage?.setItem(scopedAuthStorageKey, serialized);
    localStorage?.setItem(scopedAuthFlagKey, "true");
    if (payloadToStore?.token) {
      localStorage?.setItem(scopedLegacyTokenKey, payloadToStore.token);
    }
  } else {
    localStorage?.removeItem(scopedAuthStorageKey);
    localStorage?.removeItem(scopedAuthFlagKey);
    localStorage?.removeItem(scopedLegacyTokenKey);
  }

  // Matikan penyimpanan auth global lama agar token antar-portal tidak saling menimpa.
  sessionStorage?.removeItem(AUTH_STORAGE_KEY);
  sessionStorage?.removeItem(AUTH_FLAG_KEY);
  sessionStorage?.removeItem(LEGACY_TOKEN_KEY);
  localStorage?.removeItem(AUTH_STORAGE_KEY);
  localStorage?.removeItem(AUTH_FLAG_KEY);
  localStorage?.removeItem(LEGACY_TOKEN_KEY);
}

function getLegacyToken(scope = getActiveAuthScope()) {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.sessionStorage.getItem(getScopedStorageKey(LEGACY_TOKEN_KEY, scope)) ||
    window.localStorage.getItem(getScopedStorageKey(LEGACY_TOKEN_KEY, scope)) ||
    ""
  );
}

function getLegacyScopedSession(scope) {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();
  const legacySession =
    sessionStorage?.getItem(AUTH_STORAGE_KEY) ||
    localStorage?.getItem(AUTH_STORAGE_KEY) ||
    "";

  if (!legacySession) {
    return null;
  }

  try {
    const parsed = JSON.parse(legacySession);
    const legacyScope = normalizeAuthScope(
      parsed?.scope || parsed?.role || parsed?.user?.role || parsed?.raw?.role,
    );

    if (legacyScope !== scope) {
      return null;
    }

    return {
      ...parsed,
      scope,
    };
  } catch {
    return null;
  }
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
    scope: normalizeAuthScope(
      payload?.role ||
        payload?.data?.role ||
        payloadUser?.role ||
        rawPayload?.role ||
        meta.scope,
    ),
  };

  if (!getSessionStorage() && !getLocalStorage()) {
    return normalized;
  }

  persistAuthSession(normalized, {
    persistent: normalized.persistent,
    scope: normalized.scope,
  });
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
    scope: nextValue?.scope ?? current.scope ?? getActiveAuthScope(),
  };

  syncLocaleFromPayload(normalized.raw);

  persistAuthSession(normalized, {
    persistent: normalized.persistent,
    scope: normalized.scope,
  });
  window.dispatchEvent(new Event("auth-changed"));

  return normalized;
}

export function getAuthSession() {
  try {
    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();
    const scope = getActiveAuthScope();
    const scopedAuthStorageKey = getScopedStorageKey(AUTH_STORAGE_KEY, scope);
    if (!sessionStorage && !localStorage) return null;

    const sessionSaved = sessionStorage?.getItem(scopedAuthStorageKey);
    if (sessionSaved) {
      const parsed = JSON.parse(sessionSaved);
      return parsed;
    }

    const localSaved = localStorage?.getItem(scopedAuthStorageKey);
    if (!localSaved) {
      const legacyScopedSession = getLegacyScopedSession(scope);
      if (legacyScopedSession) {
        persistAuthSession(legacyScopedSession, {
          persistent: Boolean(legacyScopedSession?.persistent),
          scope,
        });
        return legacyScopedSession;
      }

      const legacyToken = getLegacyToken(scope);

      return legacyToken
        ? {
            token: legacyToken,
            user: null,
            role: "",
            identifier: "",
            raw: null,
            scope,
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
        { persistent: true, scope },
      );
    }

    return {
      ...parsed,
      persistent: true,
      scope,
    };
  } catch (error) {
    console.error("Gagal membaca sesi auth:", error);
    const scope = getActiveAuthScope();
    const legacyToken = getLegacyToken(scope);

    if (legacyToken) {
      return {
        token: legacyToken,
        user: null,
        role: "",
        identifier: "",
        raw: null,
        scope,
      };
    }

    return null;
  }
}

export function getAccessToken() {
  const scope = getActiveAuthScope();
  return getAuthSession()?.token || getLegacyToken(scope) || "";
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
  clearScopedAuthStorage(getActiveAuthScope());
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
