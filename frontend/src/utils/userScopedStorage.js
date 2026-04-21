import { getAuthSession } from "./authStorage";

export const USER_STORAGE_KEYS = {
  dataDiri: "vocaseek_data_diri",
  dataDiriEditMode: "vocaseek_data_diri_edit_mode",
  akademik: "vocaseek_data_akademik",
  akademikDraft: "vocaseek_data_akademik_draft",
  akademikEditMode: "vocaseek_data_akademik_edit_mode",
  dokumen: "vocaseek_dokumen_data",
  pretestCompleted: "pretestCompleted",
  pretestAnswers: "pretestAnswers",
  pretestQuestions: "pretestQuestions",
  pretestStartedAt: "pretestStartedAt",
  applicationDraft: "vocaseek_application_draft",
  appliedJob: "vocaseek_applied_job",
  statusViewed: "vocaseek_status_viewed",
  publicPartnerDirectory: "vocaseek_public_partner_directory",
};

function normalizeScopePart(value, fallback) {
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || fallback;
}

export function getUserStorageScope() {
  const session = getAuthSession();
  const role = normalizeScopePart(session?.role, "guest");
  const identifier = normalizeScopePart(session?.identifier, "anonymous");
  return `${role}_${identifier}`;
}

export function getScopedStorageKey(baseKey) {
  return `${baseKey}::${getUserStorageScope()}`;
}

export function getScopedItem(baseKey) {
  return localStorage.getItem(getScopedStorageKey(baseKey));
}

export function setScopedItem(baseKey, value) {
  localStorage.setItem(getScopedStorageKey(baseKey), value);
}

export function removeScopedItem(baseKey) {
  localStorage.removeItem(getScopedStorageKey(baseKey));
}

export function readScopedJson(baseKey, fallbackValue) {
  try {
    const saved = getScopedItem(baseKey);
    return saved ? JSON.parse(saved) : fallbackValue;
  } catch (error) {
    console.error(`Gagal membaca ${baseKey} dari localStorage:`, error);
    return fallbackValue;
  }
}

export function writeScopedJson(baseKey, value) {
  setScopedItem(baseKey, JSON.stringify(value));
}
