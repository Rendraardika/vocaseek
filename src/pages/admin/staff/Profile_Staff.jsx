import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/SidebarStaff";
import "../../../styles/Profile.css";
import {
  BriefcaseBusiness,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  SquarePen,
  User,
} from "lucide-react";
import { getApiErrorMessage } from "../../../services/auth";
import { changeAdminPassword, getAdminProfile } from "../../../services/admin";
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
    fullName: source?.nama || source?.name || "",
    email: source?.email || "",
    phone: source?.notelp || source?.phone || "",
    profileImage: pickFirstMediaValue(
      source?.foto,
      source?.photo,
      source?.avatar,
      source?.profile_photo,
      source?.photo_url,
      source?.avatar_url,
    ),
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

function ChangePasswordModal({
  open,
  values,
  error,
  isSaving,
  locale,
  showCurrent,
  setShowCurrent,
  showNew,
  setShowNew,
  showConfirm,
  setShowConfirm,
  onChange,
  onClose,
  onSave,
}) {
  if (!open) return null;

  return (
    <div className="pf-modal-overlay" onClick={onClose}>
      <div className="pf-password-modal" onClick={(event) => event.stopPropagation()}>
        <div className="pf-password-header">
          <h3>{translatePhrase("Ubah Kata Sandi", locale) || "Ubah Kata Sandi"}</h3>
          <button type="button" className="pf-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="pf-password-body">
          <div className="pf-field">
            <label>
              {translatePhrase("Kata Sandi Saat Ini", locale) || "Kata Sandi Saat Ini"}
            </label>
            <div className="pf-password-input-wrap">
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                placeholder={
                  translatePhrase("Masukkan kata sandi lama", locale) ||
                  "Masukkan kata sandi lama"
                }
                value={values.currentPassword}
                onChange={onChange}
              />
              <button
                type="button"
                className="pf-eye-btn"
                onClick={() => setShowCurrent((prev) => !prev)}
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pf-field">
            <label>{translatePhrase("Kata Sandi Baru", locale) || "Kata Sandi Baru"}</label>
            <div className="pf-password-input-wrap">
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                placeholder={
                  translatePhrase("Masukkan kata sandi baru", locale) ||
                  "Masukkan kata sandi baru"
                }
                value={values.newPassword}
                onChange={onChange}
              />
              <button
                type="button"
                className="pf-eye-btn"
                onClick={() => setShowNew((prev) => !prev)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pf-field">
            <label>
              {translatePhrase("Konfirmasi Kata Sandi Baru", locale) ||
                "Konfirmasi Kata Sandi Baru"}
            </label>
            <div className="pf-password-input-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder={
                  translatePhrase("Ulangi kata sandi baru", locale) ||
                  "Ulangi kata sandi baru"
                }
                value={values.confirmPassword}
                onChange={onChange}
              />
              <button
                type="button"
                className="pf-eye-btn"
                onClick={() => setShowConfirm((prev) => !prev)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="pf-password-hint">
              {translatePhrase(
                "Kata sandi harus minimal 8 karakter dan berisi kombinasi huruf serta angka.",
                locale,
              ) ||
                "Kata sandi harus minimal 8 karakter dan berisi kombinasi huruf serta angka."}
            </p>
            {error ? (
              <p className="pf-password-hint" style={{ color: "#dc2626" }}>
                {translatePhrase(error, locale) || error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="pf-password-footer">
          <button type="button" className="pf-cancel-btn" onClick={onClose}>
            {translatePhrase("Batal", locale) || "Batal"}
          </button>
          <button
            type="button"
            className="pf-save-yellow-btn"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving
              ? translatePhrase("Menyimpan...", locale) || "Menyimpan..."
              : translatePhrase("Simpan Perubahan", locale) || "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordSuccessModal({ open, onDone, locale }) {
  if (!open) return null;

  return (
    <div className="pf-modal-overlay" onClick={onDone}>
      <div className="pf-success-modal" onClick={(event) => event.stopPropagation()}>
        <div className="pf-success-icon-wrap">
          <div className="pf-success-icon-circle">
            <CheckCircle2 size={36} />
          </div>
        </div>

        <h3>
          {translatePhrase("Kata Sandi Berhasil Diubah!", locale) ||
            "Kata Sandi Berhasil Diubah!"}
        </h3>
        <p>
          {translatePhrase(
            "Kata sandi akun Anda telah diperbarui. Silakan gunakan kata sandi baru untuk login berikutnya.",
            locale,
          ) ||
            "Kata sandi akun Anda telah diperbarui. Silakan gunakan kata sandi baru untuk login berikutnya."}
        </p>

        <button type="button" className="pf-success-btn" onClick={onDone}>
          {translatePhrase("Selesai", locale) || "Selesai"}
        </button>
      </div>
    </div>
  );
}

export default function ProfileStaff() {
  const navigate = useNavigate();
  const [locale, setLocale] = React.useState(getSavedLanguage());
  const [savedProfile, setSavedProfile] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  const [passwordModalOpen, setPasswordModalOpen] = React.useState(false);
  const [successModalOpen, setSuccessModalOpen] = React.useState(false);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await getAdminProfile();
        const normalizedProfile = normalizeAdminProfile(response);
        setSavedProfile(normalizedProfile);
        syncAdminProfileStorage(normalizedProfile);
      } catch (error) {
        const fallbackProfile = getStoredStaffProfile();
        setSavedProfile(fallbackProfile);
        setErrorMessage(
          getApiErrorMessage(error, "Gagal memuat profil staff admin."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setPasswordError("");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const savePasswordChange = async () => {
    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Semua kolom kata sandi wajib diisi.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi baru belum sama.");
      return;
    }

    setIsSavingPassword(true);
    setPasswordError("");

    try {
      await changeAdminPassword({
        current_password: currentPassword,
        old_password: currentPassword,
        password: newPassword,
        new_password: newPassword,
        password_confirmation: confirmPassword,
        new_password_confirmation: confirmPassword,
      });

      closePasswordModal();
      setSuccessModalOpen(true);
    } catch (error) {
      setPasswordError(getApiErrorMessage(error, "Gagal mengubah kata sandi."));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="pf-layout">
      <Sidebar />

      <main className="pf-main">
        <section className="pf-content">
          <div className="pf-breadcrumb">
            <span>{translatePhrase("ADMIN", locale) || "ADMIN"} &gt;</span>
            <span className="active">
              {translatePhrase("PROFIL", locale) || "PROFIL"}
            </span>
          </div>

          <h1 className="pf-page-title">
            {translatePhrase("Profil Admin", locale) || "Profil Admin"}
          </h1>
          <p className="pf-page-subtitle">
            {translatePhrase("Lihat informasi akun dan keamanan admin.", locale) ||
              "Lihat informasi akun dan keamanan admin."}
          </p>

          {errorMessage ? (
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
          ) : null}

          <div className="pf-card">
            <div className="pf-hero" />

            <div className="pf-body">
              <div className="pf-card-top-action">
                <button
                  type="button"
                  className="pf-edit-btn"
                  onClick={() => navigate("/admin/staff/profil/edit")}
                >
                  <SquarePen size={16} />
                  <span>
                    {translatePhrase("Edit Profile", locale) || "Edit Profile"}
                  </span>
                </button>
              </div>

              <div className="pf-profile-header">
                <div className="pf-avatar-wrap">
                  {savedProfile.profileImage ? (
                    <img
                      src={savedProfile.profileImage}
                      alt="Profile"
                      className="pf-avatar"
                    />
                  ) : (
                    <div className="pf-avatar pf-avatar-placeholder">
                      <User size={46} />
                    </div>
                  )}
                  <div className="pf-active-dot" />
                </div>

                <div className="pf-profile-info">
                  <h2>{savedProfile.fullName || "Staff Admin Vocaseek"}</h2>
                  <p>
                    {(translatePhrase("Staff Admin", locale) || "Staff Admin") +
                      (savedProfile.email ? ` - ${savedProfile.email}` : "")}
                  </p>
                </div>
              </div>

              <div className="pf-grid pf-grid-single">
                <div className="pf-left-column pf-full-width">
                  <div className="pf-section">
                    <div className="pf-section-title">
                      <BriefcaseBusiness size={20} />
                      <h3>
                        {translatePhrase("Informasi Akun", locale) ||
                          "Informasi Akun"}
                      </h3>
                    </div>

                    <div className="pf-view-grid">
                      <div className="pf-view-item">
                        <label>
                          {translatePhrase("Nama Lengkap", locale) || "Nama Lengkap"}
                        </label>
                        <div className="pf-view-box">
                          {isLoading
                            ? translatePhrase("Memuat...", locale) || "Memuat..."
                            : savedProfile.fullName || "-"}
                        </div>
                      </div>

                      <div className="pf-view-item">
                        <label>
                          {translatePhrase("Email Utama", locale) || "Email Utama"}
                        </label>
                        <div className="pf-view-box">
                          {isLoading
                            ? translatePhrase("Memuat...", locale) || "Memuat..."
                            : savedProfile.email || "-"}
                        </div>
                      </div>

                      <div className="pf-view-item">
                        <label>
                          {translatePhrase("Nomor Telepon", locale) || "Nomor Telepon"}
                        </label>
                        <div className="pf-view-box">
                          {isLoading
                            ? translatePhrase("Memuat...", locale) || "Memuat..."
                            : savedProfile.phone || "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pf-section">
                    <div className="pf-section-title">
                      <Shield size={20} />
                      <h3>
                        {translatePhrase("Keamanan Akun", locale) ||
                          "Keamanan Akun"}
                      </h3>
                    </div>

                    <div className="pf-security-actions">
                      <button
                        type="button"
                        className="pf-security-btn neutral"
                        onClick={() => setPasswordModalOpen(true)}
                      >
                        <KeyRound size={16} />
                        <span>
                          {translatePhrase("Ubah Kata Sandi", locale) ||
                            "Ubah Kata Sandi"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ChangePasswordModal
        open={passwordModalOpen}
        values={passwordForm}
        error={passwordError}
        isSaving={isSavingPassword}
        locale={locale}
        showCurrent={showCurrent}
        setShowCurrent={setShowCurrent}
        showNew={showNew}
        setShowNew={setShowNew}
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        onChange={handlePasswordChange}
        onClose={closePasswordModal}
        onSave={savePasswordChange}
      />

      <PasswordSuccessModal
        open={successModalOpen}
        locale={locale}
        onDone={() => setSuccessModalOpen(false)}
      />
    </div>
  );
}
