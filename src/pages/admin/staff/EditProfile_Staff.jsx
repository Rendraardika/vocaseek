import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/SidebarStaff";
import "../../../styles/EditProfile.css";
import {
  ArrowLeft,
  Camera,
  UserRound,
  Mail,
  Phone,
  Save,
  User,
  CircleHelp,
  Trash2,
} from "lucide-react";
import { getApiErrorMessage } from "../../../services/auth";
import { getAdminProfile, updateAdminProfile } from "../../../services/admin";
import { updateAuthSession } from "../../../utils/authStorage";
import { pickFirstMediaValue } from "../../../utils/media";
import {
  getStoredAdminProfile,
  setStoredAdminProfile,
} from "../../../utils/profileStorage";
import { translatePhrase } from "../../../i18n/phrases";
import { getSavedLanguage } from "../../../utils/languagePreference";

function getStoredStaffProfile() {
  return getStoredAdminProfile("staff_admin");
}

function normalizeAdminProfile(payload) {
  const source = payload?.data?.data || payload?.data || payload || {};

  return {
    profileImage: pickFirstMediaValue(
      source?.foto,
      source?.photo,
      source?.avatar,
      source?.profile_photo,
      source?.photo_url,
      source?.avatar_url,
    ),
    fullName: source?.nama || source?.name || "",
    email: source?.email || "",
    phone: source?.notelp || source?.phone || "",
    role: "STAFF ADMIN",
  };
}

function syncAdminProfileStorage(profile) {
  setStoredAdminProfile(
    {
      ...profile,
      role: "STAFF ADMIN",
    },
    "staff_admin",
  );
  window.dispatchEvent(new Event("profileUpdated"));
}

function SaveProfileModal({ open, onClose, onConfirm, isSaving, locale }) {
  if (!open) return null;

  return (
    <div className="ep-modal-overlay" onClick={onClose}>
      <div className="ep-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ep-modal-icon-wrap">
          <div className="ep-modal-icon-ring">
            <CircleHelp size={28} />
          </div>
        </div>

        <h3 className="ep-modal-title">
          {translatePhrase("Simpan Perubahan?", locale) || "Simpan Perubahan?"}
        </h3>
        <p className="ep-modal-text">
          {translatePhrase(
            "Apakah Anda yakin ingin menyimpan perubahan profil ini?",
            locale,
          ) || "Apakah Anda yakin ingin menyimpan perubahan profil ini?"}
        </p>

        <div className="ep-modal-actions">
          <button type="button" className="ep-modal-cancel" onClick={onClose}>
            {translatePhrase("Batal", locale) || "Batal"}
          </button>
          <button
            type="button"
            className="ep-modal-confirm"
            onClick={onConfirm}
            disabled={isSaving}
          >
            {isSaving
              ? translatePhrase("Menyimpan...", locale) || "Menyimpan..."
              : translatePhrase("Simpan", locale) || "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditProfileStaff() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fallbackProfile = getStoredStaffProfile();
  const [locale, setLocale] = React.useState(getSavedLanguage());

  const [profileImage, setProfileImage] = React.useState(fallbackProfile.profileImage || "");
  const [profileImageFile, setProfileImageFile] = React.useState(null);
  const [removeProfileImage, setRemoveProfileImage] = React.useState(false);
  const [fullName, setFullName] = React.useState(fallbackProfile.fullName || "");
  const [email, setEmail] = React.useState(fallbackProfile.email || "");
  const [phone, setPhone] = React.useState(fallbackProfile.phone || "");
  const [openSaveModal, setOpenSaveModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const syncLanguage = () => {
      setLocale(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);
    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getAdminProfile();
        const normalizedProfile = normalizeAdminProfile(response);
        setProfileImage(normalizedProfile.profileImage);
        setProfileImageFile(null);
        setRemoveProfileImage(false);
        setFullName(normalizedProfile.fullName);
        setEmail(normalizedProfile.email);
        setPhone(normalizedProfile.phone);
        syncAdminProfileStorage(normalizedProfile);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "Gagal memuat profil staff admin."));
      }
    };

    loadProfile();
  }, []);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        translatePhrase("File harus berupa gambar.", locale) ||
          "File harus berupa gambar.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      setProfileImageFile(file);
      setRemoveProfileImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfileImage = () => {
    setProfileImage("");
    setProfileImageFile(null);
    setRemoveProfileImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const payload = new FormData();
      payload.append("nama", fullName.trim());
      payload.append("notelp", phone.trim());

      if (profileImageFile instanceof File) {
        payload.append("foto", profileImageFile);
        payload.append("photo", profileImageFile);
        payload.append("avatar", profileImageFile);
        payload.append("image", profileImageFile);
        payload.append("profile_image", profileImageFile);
      }

      if (removeProfileImage && !profileImageFile) {
        payload.append("remove_foto", "1");
        payload.append("remove_photo", "1");
        payload.append("hapus_foto", "1");
      }

      const response = await updateAdminProfile(payload);
      const normalizedProfile = normalizeAdminProfile(response);
      const nextProfile = {
        profileImage: normalizedProfile.profileImage || (removeProfileImage ? "" : profileImage),
        fullName: normalizedProfile.fullName || fullName.trim(),
        email: normalizedProfile.email || email,
        phone: normalizedProfile.phone || phone.trim(),
        role: "STAFF ADMIN",
      };

      syncAdminProfileStorage(nextProfile);
      updateAuthSession((current) => ({
        ...current,
        user: {
          ...(current?.user || {}),
          nama: nextProfile.fullName,
          name: nextProfile.fullName,
          email: nextProfile.email,
          notelp: nextProfile.phone,
          phone: nextProfile.phone,
          foto: nextProfile.profileImage,
          photo: nextProfile.profileImage,
        },
        raw: {
          ...(current?.raw || {}),
          nama: nextProfile.fullName,
          name: nextProfile.fullName,
          email: nextProfile.email,
          notelp: nextProfile.phone,
          phone: nextProfile.phone,
          foto: nextProfile.profileImage,
          photo: nextProfile.profileImage,
        },
      }));

      setOpenSaveModal(false);
      navigate("/admin/staff/profil");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Gagal menyimpan profil staff admin."));
      setOpenSaveModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ep-layout">
      <Sidebar />

      <main className="ep-main">
        <section className="ep-content">
          <div className="ep-breadcrumb">
            <span>{translatePhrase("Admin", locale) || "Admin"} &gt; </span>
            <span>{translatePhrase("Profil", locale) || "Profil"} &gt;  </span>
            <span className="active">
              {translatePhrase("Edit Profile", locale) || "Edit Profile"}
            </span>
          </div>

          <h1 className="ep-page-title">
            <ArrowLeft
              size={20}
              className="ep-back-icon"
              onClick={() => navigate(-1)}
            />
            {translatePhrase("Edit Profile", locale) || "Edit Profile"}
          </h1>

          {errorMessage && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 14px",
                borderRadius: 12,
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                color: "#be123c",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {translatePhrase(errorMessage, locale) || errorMessage}
            </div>
          )}

          <div className="ep-card">
            <div className="ep-hero" />

            <div className="ep-body">
              <div className="ep-avatar-section">
                <div className="ep-avatar-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="ep-file-input"
                    onChange={handleProfileImageChange}
                  />

                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="ep-avatar" />
                  ) : (
                    <div className="ep-avatar ep-avatar-placeholder">
                      <User size={46} />
                    </div>
                  )}

                  <button
                    type="button"
                    className="ep-camera-btn"
                    onClick={handleOpenFilePicker}
                  >
                    <Camera size={16} />
                  </button>
                </div>

                <div className="ep-avatar-info">
                  <h2>{fullName || "Staff Admin Vocaseek"}</h2>
                  <p>
                    {translatePhrase(
                      "Ubah informasi akun utama staff admin.",
                      locale
                    ) || "Ubah informasi akun utama staff admin."}
                  </p>

                  {profileImage && (
                    <button
                      type="button"
                      className="ep-remove-photo-btn"
                      onClick={handleRemoveProfileImage}
                    >
                      <Trash2 size={15} />
                      <span>{translatePhrase("Hapus Foto", locale) || "Hapus Foto"}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="ep-section-title">
                <UserRound size={20} />
                <h3>{translatePhrase("Informasi Profil", locale) || "Informasi Profil"}</h3>
              </div>

              <div className="ep-form-grid">
                <div className="ep-input-group">
                  <label>{translatePhrase("Nama Lengkap", locale) || "Nama Lengkap"}</label>
                  <div className="ep-input-wrap">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="ep-input-group">
                  <label>{translatePhrase("Email Utama", locale) || "Email Utama"}</label>
                  <div className="ep-input-wrap">
                    <Mail size={16} />
                    <input type="email" value={email} readOnly />
                  </div>
                </div>

                <div className="ep-input-group">
                  <label>{translatePhrase("Nomor Telepon", locale) || "Nomor Telepon"}</label>
                  <div className="ep-input-wrap">
                    <Phone size={16} />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="ep-footer">
              <button
                type="button"
                className="ep-cancel-btn"
                onClick={() => navigate(-1)}
              >
                {translatePhrase("Batal", locale) || "Batal"}
              </button>

              <button
                type="button"
                className="ep-save-btn"
                onClick={() => setOpenSaveModal(true)}
                disabled={isSaving}
              >
                <Save size={16} />
                <span>
                  {isSaving
                    ? translatePhrase("Menyimpan...", locale) || "Menyimpan..."
                    : translatePhrase("Simpan Profile", locale) || "Simpan Profile"}
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <SaveProfileModal
        open={openSaveModal}
        onClose={() => setOpenSaveModal(false)}
        onConfirm={handleConfirmSave}
        isSaving={isSaving}
        locale={locale}
      />
    </div>
  );
}
