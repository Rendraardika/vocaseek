import { getAuthSession } from "./authStorage";

const LEGACY_ADMIN_PROFILE_KEY = "adminProfile";
const LEGACY_COMPANY_PROFILE_KEY = "companyProfile";

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function normalizeStoragePart(value, fallback = "default") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
}

function getSessionIdentity() {
  const session = getAuthSession();
  const user = session?.user || {};
  const raw = session?.raw || {};

  return {
    role:
      session?.role ||
      user?.role ||
      raw?.role ||
      raw?.user?.role ||
      "",
    identifier:
      user?.email ||
      raw?.email ||
      session?.identifier ||
      user?.user_id ||
      raw?.user_id ||
      "",
  };
}

function resolveAdminStorageKey(roleHint = "") {
  const identity = getSessionIdentity();
  const role = normalizeStoragePart(roleHint || identity.role || "admin");
  const identifier = normalizeStoragePart(identity.identifier || "anonymous");
  return `vocaseek_profile_admin_${role}_${identifier}`;
}

function resolveCompanyStorageKey() {
  const identity = getSessionIdentity();
  const identifier = normalizeStoragePart(identity.identifier || "company");
  return `vocaseek_profile_company_${identifier}`;
}

function readJson(storage, key) {
  if (!storage) {
    return null;
  }

  try {
    const value = storage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Gagal membaca storage key ${key}:`, error);
    return null;
  }
}

function writeJson(storage, key, value) {
  if (!storage) {
    return;
  }

  storage.setItem(key, JSON.stringify(value || {}));
}

function matchesStaffRole(profile) {
  return String(profile?.role || "").toLowerCase().includes("staff");
}

function matchesMasterRole(profile) {
  const role = String(profile?.role || "").toLowerCase();
  return role.includes("super") || role.includes("master");
}

export function getStoredAdminProfile(roleHint = "") {
  const storage = getBrowserStorage();
  const scopedProfile = readJson(storage, resolveAdminStorageKey(roleHint));

  if (scopedProfile && Object.keys(scopedProfile).length > 0) {
    return scopedProfile;
  }

  const legacyProfile = readJson(storage, LEGACY_ADMIN_PROFILE_KEY) || {};
  if (!Object.keys(legacyProfile).length) {
    return {};
  }

  if (String(roleHint || "").toLowerCase().includes("staff")) {
    return matchesStaffRole(legacyProfile) ? legacyProfile : {};
  }

  if (roleHint) {
    return matchesMasterRole(legacyProfile) ? legacyProfile : {};
  }

  return legacyProfile;
}

export function setStoredAdminProfile(profile, roleHint = "") {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  const role = roleHint || profile?.role || getSessionIdentity().role || "admin";
  writeJson(storage, resolveAdminStorageKey(role), profile);
  storage.removeItem(LEGACY_ADMIN_PROFILE_KEY);
}

export function clearStoredAdminProfile(roleHint = "") {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(resolveAdminStorageKey(roleHint));
  storage.removeItem(LEGACY_ADMIN_PROFILE_KEY);
}

export function getStoredCompanyProfile() {
  const storage = getBrowserStorage();
  const scopedProfile = readJson(storage, resolveCompanyStorageKey());

  if (scopedProfile && Object.keys(scopedProfile).length > 0) {
    return scopedProfile;
  }

  return readJson(storage, LEGACY_COMPANY_PROFILE_KEY) || {};
}

export function setStoredCompanyProfile(profile) {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  writeJson(storage, resolveCompanyStorageKey(), profile);
  storage.removeItem(LEGACY_COMPANY_PROFILE_KEY);
}

export function clearStoredCompanyProfile() {
  const storage = getBrowserStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(resolveCompanyStorageKey());
  storage.removeItem(LEGACY_COMPANY_PROFILE_KEY);
}
