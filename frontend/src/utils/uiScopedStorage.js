import { getAuthSession } from "./authStorage";

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function normalizePart(value, fallback = "default") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

function getScope() {
  const session = getAuthSession();
  const user = session?.user || {};
  const raw = session?.raw || {};

  return {
    role: normalizePart(
      session?.role || user?.role || raw?.role || raw?.user?.role,
      "guest",
    ),
    identifier: normalizePart(
      user?.email ||
        raw?.email ||
        session?.identifier ||
        user?.user_id ||
        raw?.user_id,
      "anonymous",
    ),
  };
}

function getScopedUiKey(baseKey) {
  const scope = getScope();
  return `${baseKey}::${scope.role}_${scope.identifier}`;
}

export function getScopedUiItem(baseKey) {
  const storage = getBrowserStorage();
  if (!storage) return null;
  return storage.getItem(getScopedUiKey(baseKey));
}

export function setScopedUiItem(baseKey, value) {
  const storage = getBrowserStorage();
  if (!storage) return;
  storage.setItem(getScopedUiKey(baseKey), value);
}

export function removeScopedUiItem(baseKey) {
  const storage = getBrowserStorage();
  if (!storage) return;
  storage.removeItem(getScopedUiKey(baseKey));
}
