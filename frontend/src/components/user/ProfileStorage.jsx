import {
  getScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";
import { getAuthSession } from "../../utils/authStorage";
import { pickFirstMediaValue } from "../../utils/media";

export const defaultProfile = {
  photo: "",
  fullName: "",
  email: "",
};

export function readProfileFromStorage() {
  try {
    const saved = getScopedItem(USER_STORAGE_KEYS.dataDiri);
    const parsed = saved ? JSON.parse(saved) : {};
    const session = getAuthSession() || {};
    const sessionUser = session?.user || {};
    const rawUser = session?.raw?.user || session?.raw || {};

    return {
      photo: pickFirstMediaValue(
        parsed?.photo,
        sessionUser?.foto,
        sessionUser?.photo,
        sessionUser?.avatar,
        rawUser?.foto,
        rawUser?.photo,
        rawUser?.avatar,
      ),
      fullName:
        parsed?.fullName ||
        sessionUser?.nama ||
        sessionUser?.name ||
        sessionUser?.full_name ||
        rawUser?.nama ||
        rawUser?.name ||
        rawUser?.full_name ||
        "",
      email:
        parsed?.email ||
        sessionUser?.email ||
        rawUser?.email ||
        session?.identifier ||
        "",
    };
  } catch (error) {
    console.error("Gagal membaca data profil:", error);
    return defaultProfile;
  }
}

export function getShortEmail(email) {
  if (!email) return "";
  return email.length > 18 ? `${email.slice(0, 18)}...` : email;
}
