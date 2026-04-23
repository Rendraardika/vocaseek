import {
  getScopedItem,
  USER_STORAGE_KEYS,
} from "./userScopedStorage";

// Dokumen yang wajib dilengkapi
const REQUIRED_DOC_IDS = [
  "cv",
  "portfolio",
  "rekomendasi",
  "ktp",
  "transkrip",
];

/**
 * Cek apakah data diri sudah lengkap
 * @param {Object} data - Data diri dari storage
 * @returns {boolean}
 */
export const isDataDiriComplete = (data) => {
  if (!data) return false;

  return Boolean(
    data.about?.trim() &&
      data.fullName?.trim() &&
      data.gender?.trim() &&
      data.birthDate?.trim() &&
      data.birthPlaceType?.trim() &&
      data.birthCity?.trim() &&
      data.email?.trim() &&
      data.phone?.trim() &&
      data.province?.trim() &&
      data.kabupaten?.trim() &&
      data.addressDetail?.trim()
  );
};

/**
 * Cek apakah data akademik sudah lengkap
 * @param {Object} data - Data akademik dari storage
 * @returns {boolean}
 */
export const isAkademikComplete = (data) => {
  if (!data) return false;

  const pendidikan = data?.pendidikan || {};

  return Boolean(
    pendidikan.institusi?.trim() &&
      pendidikan.jurusan?.trim()
  );
};

/**
 * Cek apakah semua dokumen sudah diunggah
 * @param {Array} docs - Array dokumen dari storage
 * @returns {boolean}
 */
export const isDokumenComplete = (docs) => {
  if (!Array.isArray(docs)) return false;

  return REQUIRED_DOC_IDS.every((requiredId) => {
    const found = docs.find((item) => item.id === requiredId);
    return found?.status === "uploaded";
  });
};

/**
 * Cek apakah profile (step 1) sudah lengkap
 * @returns {boolean}
 */
export const isStep1Complete = () => {
  try {
    const dataDiriRaw = getScopedItem(USER_STORAGE_KEYS.dataDiri);
    const akademikRaw = getScopedItem(USER_STORAGE_KEYS.akademik);
    const dokumenRaw = getScopedItem(USER_STORAGE_KEYS.dokumen);

    let dataDiri = null;
    let akademik = null;
    let dokumen = null;

    if (dataDiriRaw) {
      try {
        dataDiri = JSON.parse(dataDiriRaw);
      } catch (e) {
        console.warn("Failed to parse dataDiri:", e);
      }
    }

    if (akademikRaw) {
      try {
        akademik = JSON.parse(akademikRaw);
      } catch (e) {
        console.warn("Failed to parse akademik:", e);
      }
    }

    if (dokumenRaw) {
      try {
        dokumen = JSON.parse(dokumenRaw);
      } catch (e) {
        console.warn("Failed to parse dokumen:", e);
      }
    }

    return (
      isDataDiriComplete(dataDiri) &&
      isAkademikComplete(akademik) &&
      isDokumenComplete(dokumen)
    );
  } catch (error) {
    console.error("Error checking step 1 completion:", error);
    return false;
  }
};

/**
 * Cek apakah pre-test (step 2) sudah selesai
 * @returns {boolean}
 */
export const isStep2Complete = () => {
  return getScopedItem(USER_STORAGE_KEYS.pretestCompleted) === "true";
};

/**
 * Cek apakah sudah apply lowongan (step 3)
 * @returns {boolean}
 */
export const isStep3Complete = () => {
  return Boolean(getScopedItem(USER_STORAGE_KEYS.appliedJob));
};

/**
 * Trigger journey update events
 * Panggil fungsi ini setiap kali data profile diperbarui
 */
export const triggerJourneyUpdate = () => {
  window.dispatchEvent(new Event("profile-updated"));
  window.dispatchEvent(new Event("career-journey-updated"));
  window.dispatchEvent(new Event("akademik-updated"));
};
