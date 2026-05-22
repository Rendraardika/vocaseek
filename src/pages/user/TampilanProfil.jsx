import { useEffect, useMemo, useState } from "react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../../styles/TampilanProfil.css";
import { getInternProfile } from "../../services/intern";
import { getSavedLanguage } from "../../utils/languagePreference";
import {
  getScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";

const defaultProfile = {
  about: "",
  photo: "",
  fullName: "-",
  gender: "-",
  birthDate: "",
  birthPlaceType: "",
  birthCity: "-",
  email: "-",
  phone: "-",
  province: "-",
  kabupaten: "-",
  addressDetail: "-",
  linkedin: "",
  instagram: "",
};

const pickMeaningfulValue = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const normalized = String(value).trim();
    if (!normalized || normalized === "-") continue;
    return value;
  }

  return "";
};

export default function TampilanProfil() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(defaultProfile);
  const [language, setLanguage] = useState(() => getSavedLanguage());

  useEffect(() => {
    const loadProfile = () => {
      const saved = getScopedItem(USER_STORAGE_KEYS.dataDiri);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfile((prev) => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error("Gagal membaca data localStorage:", error);
        }
      }
    };

    loadProfile();

    window.addEventListener("storage", loadProfile);
    window.addEventListener("profile-updated", loadProfile);

    return () => {
      window.removeEventListener("storage", loadProfile);
      window.removeEventListener("profile-updated", loadProfile);
    };
  }, []);

  useEffect(() => {
    const syncLanguage = () => {
      setLanguage(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);

    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProfileFromBackend = async () => {
      try {
        const response = await getInternProfile();
        const payload = response?.data?.data || {};

        if (!isMounted) return;

        setProfile((prev) => ({
          ...prev,
          about: pickMeaningfulValue(payload?.tentang_saya, prev.about),
          photo: pickMeaningfulValue(payload?.foto, payload?.photo, prev.photo),
          fullName: pickMeaningfulValue(payload?.nama, prev.fullName),
          gender: pickMeaningfulValue(
            payload?.jenis_kelamin,
            payload?.profile?.jenis_kelamin,
            prev.gender,
          ),
          birthDate: pickMeaningfulValue(
            payload?.tanggal_lahir,
            payload?.profile?.tanggal_lahir,
            prev.birthDate,
          ),
          birthCity: pickMeaningfulValue(
            payload?.tempat_lahir,
            payload?.profile?.tempat_lahir,
            prev.birthCity,
          ),
          email: pickMeaningfulValue(payload?.email, prev.email),
          phone: pickMeaningfulValue(payload?.notelp, payload?.profile?.notelp, prev.phone),
          province: pickMeaningfulValue(payload?.provinsi, payload?.profile?.provinsi, prev.province),
          kabupaten: pickMeaningfulValue(payload?.kabupaten, payload?.profile?.kabupaten, prev.kabupaten),
          addressDetail: pickMeaningfulValue(
            payload?.detail_alamat,
            payload?.profile?.detail_alamat,
            prev.addressDetail,
          ),
          linkedin: pickMeaningfulValue(payload?.linkedin, payload?.profile?.linkedin, prev.linkedin),
          instagram: pickMeaningfulValue(payload?.instagram, payload?.profile?.instagram, prev.instagram),
        }));
      } catch (error) {
        console.error("Gagal memuat tampilan profil dari backend:", error);
      }
    };

    loadProfileFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  const formattedBirthDate = useMemo(() => {
    if (!profile.birthDate) return "-";

    const normalizedBirthDate = String(profile.birthDate).trim();
    if (!normalizedBirthDate || normalizedBirthDate === "-") return "-";

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthDate)) {
      const [year, month, day] = normalizedBirthDate.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }

    const date = new Date(normalizedBirthDate);
    if (Number.isNaN(date.getTime())) return normalizedBirthDate;

    return date.toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [language, profile.birthDate]);

  const fullAddress = useMemo(() => {
    const parts = [
      profile.addressDetail,
      profile.kabupaten,
      profile.province,
    ].filter((item) => item && item !== "-");

    return parts.length ? parts.join(", ") : "-";
  }, [profile.addressDetail, profile.kabupaten, profile.province]);

  const aboutText = profile.about || 'Belum ada deskripsi "Tentang Saya".';

  const handleEdit = () => {
    setScopedItem(USER_STORAGE_KEYS.dataDiriEditMode, "true");
    navigate("/profil", { replace: true });
  };

  return (
    <div className="tpWrap">
      <div className="tpHeader">
        <div>
          <h2 className="tpTitle">Data Pribadi</h2>
          <p className="tpSubtitle">
            Pastikan data pribadi benar untuk mempermudah proses pendaftaran
          </p>
        </div>

        <button
          className="tpEditBtn"
          type="button"
          aria-label="Edit"
          onClick={handleEdit}
        >
          ✎
        </button>
      </div>

      <div className="tpSection">
        <div className="tpSectionLabel">BIODATA</div>

        <div className="tpBlock">
          <div className="tpBlockTitle">Tentang Saya</div>

          <div className="tpAboutCard">
            <p className="tpAboutText">{aboutText}</p>
          </div>

          <div className="tpGrid">
            <div className="tpField">
              <div className="tpFieldLabel">NAMA LENGKAP</div>
              <div className="tpFieldValue">{profile.fullName || "-"}</div>
            </div>

            <div className="tpField">
              <div className="tpFieldLabel">JENIS KELAMIN</div>
              <div className="tpFieldValue">{profile.gender || "-"}</div>
            </div>

            <div className="tpField">
              <div className="tpFieldLabel">TEMPAT LAHIR</div>
              <div className="tpFieldValue">{profile.birthCity || "-"}</div>
            </div>

            <div className="tpField">
              <div className="tpFieldLabel">TANGGAL LAHIR</div>
              <div className="tpFieldValue">{formattedBirthDate}</div>
            </div>

            <div className="tpField">
              <div className="tpFieldLabel">EMAIL ADDRESS</div>
              <div className="tpFieldValue">{profile.email || "-"}</div>
            </div>

            <div className="tpField">
              <div className="tpFieldLabel">NO HANDPHONE</div>
              <div className="tpFieldValue">{profile.phone || "-"}</div>
            </div>

            <div className="tpField tpFieldFull">
              <div className="tpFieldLabel">ALAMAT TEMPAT TINGGAL</div>
              <div className="tpFieldValue">{fullAddress}</div>
            </div>
          </div>
        </div>

        <div className="tpDivider" />

        <div className="tpBlock">
          <div className="tpSectionLabel tpSectionLabelBottom">SOCIAL MEDIA</div>

          <div className="tpSocialRow">
            <button
              className="tpSocialBtn"
              type="button"
              onClick={() => profile.linkedin && window.open(profile.linkedin, "_blank")}
            >
              <FaLinkedinIn className="tpSocialIcon tpSocialIconLinkedin" aria-hidden="true" />
              <span>{profile.linkedin ? "LinkedIn" : "LinkedIn kosong"}</span>
            </button>

            <button
              className="tpSocialBtn"
              type="button"
              onClick={() => profile.instagram && window.open(profile.instagram, "_blank")}
            >
              <FaInstagram className="tpSocialIcon tpSocialIconInstagram" aria-hidden="true" />
              <span className="tpSocialIcon ig" aria-hidden="true">
                ⦿
              </span>
              <span>{profile.instagram ? "Instagram" : "Instagram kosong"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
