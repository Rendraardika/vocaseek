import "../../styles/home.css";
import PerjalananKarirmu from "../../components/user/JourneyStepCard";
import { useNavigate, NavLink } from "react-router-dom";
import FooterSocialIcons from "../../components/common/FooterSocialIcons";
import {
  FaRocket,
  FaSearch,
  FaCode,
  FaPenNib,
  FaBullhorn,
  FaBriefcase,
  FaMapMarkerAlt,
  FaRegClock,
  FaArrowRight,
} from "react-icons/fa";
import { useState, useEffect, useMemo, useCallback } from "react";
import { logoutUser } from "../../services/auth";
import { clearAuthSession, isAuthenticated } from "../../utils/authStorage";
import { readProfileFromStorage } from "../../components/user/ProfileStorage";
import { translatePhrase } from "../../i18n/phrases";
import { getSavedLanguage } from "../../utils/languagePreference";
import {
  getScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";
import {
  extractApplicationCollection,
  mapAppliedJobFromApplication,
} from "../../utils/applicationStatus";
import { getInternApplications } from "../../services/intern";
const REQUIRED_DOC_IDS = [
  "cv",
  "portfolio",
  "rekomendasi",
  "ktp",
  "transkrip",
];

const defaultUserData = {
  name: "",
  email: "",
  photo: "",
};

const isDataDiriComplete = (data) => {
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
      data.addressDetail?.trim(),
  );
};

const isAkademikComplete = (data) => {
  if (!data) return false;

  const pendidikan = data?.pendidikan || {};
  const pengalaman = Array.isArray(data?.pengalaman) ? data.pengalaman : [];
  const sertifikasi = Array.isArray(data?.sertifikasi) ? data.sertifikasi : [];

  return Boolean(
    pendidikan.institusi?.trim() &&
      pendidikan.jurusan?.trim() &&
      pengalaman.length > 0 &&
      sertifikasi.length > 0,
  );
};

const isDokumenComplete = (docs) => {
  if (!Array.isArray(docs)) return false;

  return REQUIRED_DOC_IDS.every((requiredId) => {
    const found = docs.find((item) => item.id === requiredId);
    return found?.status === "uploaded";
  });
};

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout backend gagal, sesi lokal tetap dibersihkan:", error);
    } finally {
      clearAuthSession();
      navigate("/", { replace: true });
    }
  };

  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [locale, setLocale] = useState(getSavedLanguage());
  const [userData, setUserData] = useState(defaultUserData);
  const [appliedJob, setAppliedJob] = useState(null);
  const [progressState, setProgressState] = useState({
    completedSteps: 0,
    progressPercent: 0,
  });

  useEffect(() => {
    const syncLanguage = () => {
      setLocale(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);

    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

  const readSavedProfile = () => {
    const profile = readProfileFromStorage();
    return {
      name: profile.fullName || "",
      email: profile.email || "",
      photo: profile.photo || "",
    };
  };

  const readAppliedJob = () => {
    try {
      const saved = getScopedItem(USER_STORAGE_KEYS.appliedJob);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      return parsed?.id ? parsed : null;
    } catch (error) {
      console.error("Gagal membaca lamaran aktif:", error);
      return null;
    }
  };

  const syncAppliedJobFromSources = useCallback(async () => {
    const localAppliedJob = readAppliedJob();

    try {
      const response = await getInternApplications();
      const applications = extractApplicationCollection(response?.data);
      const latestApplication = applications[0];

      if (latestApplication) {
        setAppliedJob(mapAppliedJobFromApplication(latestApplication, localAppliedJob || {}));
        return;
      }
    } catch (error) {
      console.error("Gagal membaca status lamaran dari backend:", error);
    }

    setAppliedJob(localAppliedJob);
  }, []);

  const readJourneyProgress = () => {
    try {
      const dataDiri = JSON.parse(getScopedItem(USER_STORAGE_KEYS.dataDiri) || "null");
      const akademik = JSON.parse(getScopedItem(USER_STORAGE_KEYS.akademik) || "null");
      const dokumen = JSON.parse(getScopedItem(USER_STORAGE_KEYS.dokumen) || "null");

      const step1Completed =
        isDataDiriComplete(dataDiri) &&
        isAkademikComplete(akademik) &&
        isDokumenComplete(dokumen);
      const step2Completed =
        getScopedItem(USER_STORAGE_KEYS.pretestCompleted) === "true";
      const step3Completed = Boolean(getScopedItem(USER_STORAGE_KEYS.appliedJob));
      const step4Completed =
        getScopedItem(USER_STORAGE_KEYS.statusViewed) === "true";

      const completedSteps = [
        step1Completed,
        step2Completed,
        step3Completed,
        step4Completed,
      ].filter(Boolean).length;

      return {
        completedSteps,
        progressPercent: completedSteps * 25,
      };
    } catch (error) {
      console.error("Gagal membaca progres perjalanan karir:", error);
      return {
        completedSteps: 0,
        progressPercent: 0,
      };
    }
  };

  const initials = useMemo(() => {
    const name = userData.name?.trim();
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [userData.name]);

  useEffect(() => {
    const syncProfile = () => {
      const profile = readSavedProfile();
      setUserData(profile);
      setImageError(false);
    };

    syncProfile();

    window.addEventListener("profile-updated", syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener("profile-updated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, [syncAppliedJobFromSources]);

  useEffect(() => {
    const syncAppliedJob = () => {
      syncAppliedJobFromSources();
    };

    syncAppliedJob();

    window.addEventListener("storage", syncAppliedJob);
    window.addEventListener("career-journey-updated", syncAppliedJob);

    return () => {
      window.removeEventListener("storage", syncAppliedJob);
      window.removeEventListener("career-journey-updated", syncAppliedJob);
    };
  }, [syncAppliedJobFromSources]);

  useEffect(() => {
    const syncProgress = () => {
      setProgressState(readJourneyProgress());
    };

    syncProgress();

    window.addEventListener("storage", syncProgress);
    window.addEventListener("profile-updated", syncProgress);
    window.addEventListener("career-journey-updated", syncProgress);

    return () => {
      window.removeEventListener("storage", syncProgress);
      window.removeEventListener("profile-updated", syncProgress);
      window.removeEventListener("career-journey-updated", syncProgress);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-menu-wrapper")) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="home user-nav-shell">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <img
              src="/vocaseeklogo.png"
              alt="Vocaseek Logo"
              className="logo-img"
            />
          </div>

          {/* HAMBURGER */}
          <div
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <nav className={`nav ${menuOpen ? "show" : ""}`}>
            <NavLink
              to="/home"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Beranda
            </NavLink>

            <NavLink
              to="/searchlowongan"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Lowongan
            </NavLink>

            <NavLink
              to="/searchmitra"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Mitra
            </NavLink>

            <NavLink
              to="/contact"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Kontak
            </NavLink>
          </nav>

          <div className="profile">
            {isLoggedIn ? (
              <div className="profile-menu-wrapper">
                <button
                  type="button"
                  className={`profile-trigger ${profileOpen ? "active" : ""}`}
                  onClick={() => setProfileOpen((prev) => !prev)}
                >
                  <div className="profile-trigger-avatar-wrap">
                    <div className="avatar">
                      {userData.photo && !imageError ? (
                        <img
                          src={userData.photo}
                          alt={userData.name || "Profile"}
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <span className="avatar-fallback">{initials}</span>
                      )}
                    </div>
                    <span className="profile-online-badge"></span>
                  </div>
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-top centered">
                      <div className="profile-avatar-accent"></div>

                      <div className="profile-avatar-center">
                        {userData.photo && !imageError ? (
                          <img
                            src={userData.photo}
                            alt={userData.name || "Profile"}
                            className="profile-dropdown-avatar"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="profile-dropdown-avatar fallback">
                            {initials}
                          </div>
                        )}
                      </div>

                      <div className="profile-dropdown-info centered">
                        <h4>{userData.name || "Nama Pengguna"}</h4>
                        <span>{userData.email || "email@contoh.com"}</span>
                      </div>
                    </div>

                    <div className="profile-dropdown-actions">
                      <NavLink
                        to="/profil"
                        className="profile-dropdown-link primary"
                        onClick={() => setProfileOpen(false)}
                      >
                        Lihat Profil
                      </NavLink>

                      <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" className="login-btn">
                Masuk
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="home-hero">
        <div className="home-hero-container">
          <div className="home-hero-left">
            <span className="home-hero-badge">EKSKLUSIF UNTUK VOKASI</span>

            <h1 className="home-hero-title">
              Halo,
              <span className="home-hero-name"> Sobat Vocaseek!</span>
              <span className="home-wave">👋</span>
            </h1>

            <p className="home-hero-desc">
              Tinggal sedikit lagi! Selesaikan profil Anda untuk membuka akses
              ke ratusan peluang karir impian di industri.
            </p>

            <div className="home-hero-buttons">
              <button
                className="home-btn-primary"
                onClick={() => navigate("/profil")}
              >
                Mulai Sekarang <FaRocket />
              </button>

              <button className="home-btn-secondary">Tonton Panduan</button>
            </div>
          </div>

          <div className="home-hero-right">
            <div
              className={`home-progress-card ${
                progressState.progressPercent > 0 ? "is-complete-started" : ""
              }`}
            >
              <div
                className={`home-progress-badge ${
                  progressState.progressPercent > 0 ? "is-complete-started" : ""
                }`}
              >
                {progressState.progressPercent}% Selesai
              </div>

              <div
                className="home-progress-ring"
                style={{
                  "--progress-angle": `${progressState.progressPercent * 3.6}deg`,
                  "--progress-color":
                    progressState.progressPercent > 0 ? "#16a34a" : "#2563eb",
                }}
              >
                <div className="home-progress-circle">
                  {progressState.progressPercent}%
                </div>

                <div className="home-progress-dots">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <span
                      key={index}
                      className={
                        index < progressState.completedSteps ? "is-completed" : ""
                      }
                    />
                  ))}
                </div>
              </div>

              <p>Profil Lengkap</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PERJALANAN KARIR ===== */}
      <PerjalananKarirmu />

      {/* STATUS LAMARAN */}
      <section className="home-status">
        <h2 className="home-status-title">
          {translatePhrase("Status Lamaran Terbaru", locale) ||
            "Status Lamaran Terbaru"}
        </h2>

        <p className="home-status-sub">
          {translatePhrase("Pantau aktivitas lamaran Anda di sini.", locale) ||
            "Pantau aktivitas lamaran Anda di sini."}
        </p>

        {appliedJob ? (
          <div className="home-status-card">
            <div className="home-status-card-top">
              <div className="home-status-card-icon">
                <FaBriefcase />
              </div>

              <div className="home-status-card-main">
                <div className="home-status-card-badge">
                  {translatePhrase("Lamaran Aktif", locale) || "Lamaran Aktif"}
                </div>
                <h3>{appliedJob.title}</h3>
                <p>{appliedJob.company}</p>
              </div>

              <div className="home-status-stage">
                <span className="home-status-stage-label">
                  {translatePhrase("Tahap Saat Ini", locale) || "Tahap Saat Ini"}
                </span>
                <strong>
                  {translatePhrase(appliedJob.stage || "Pending", locale) ||
                    appliedJob.stage ||
                    "Pending"}
                </strong>
              </div>
            </div>

            <div className="home-status-card-meta">
              <span>
                <FaMapMarkerAlt />
                {appliedJob.location}
              </span>
              <span>
                <FaRegClock />
                {appliedJob.type}
              </span>
              <span>
                <FaBriefcase />
                {appliedJob.work}
              </span>
            </div>

            <div className="home-status-card-footer">
              <p>
                {translatePhrase(
                  "Lamaran kamu untuk posisi ini sudah berhasil dikirim. Pantau perkembangan proses seleksinya dari halaman status lamaran.",
                  locale
                ) ||
                  "Lamaran kamu untuk posisi ini sudah berhasil dikirim. Pantau perkembangan proses seleksinya dari halaman status lamaran."}
              </p>

              <button
                type="button"
                className="home-status-action"
                onClick={() => navigate("/status-lamaran")}
              >
                {translatePhrase("Lihat Status Lamaran", locale) ||
                  "Lihat Status Lamaran"}{" "}
                <FaArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div className="home-status-box">
            <div className="home-status-icon">
              <FaSearch />
            </div>

            <h3>
              {translatePhrase("Belum Ada Lamaran Aktif", locale) ||
                "Belum Ada Lamaran Aktif"}
            </h3>

            <p>
              {translatePhrase(
                "Perjalanan karirmu belum dimulai. Selesaikan Pre-Test sekarang agar bisa mulai melamar pekerjaan impianmu!",
                locale
              ) ||
                "Perjalanan karirmu belum dimulai. Selesaikan Pre-Test sekarang agar bisa mulai melamar pekerjaan impianmu!"}
            </p>
          </div>
        )}
      </section>

      {/* ===== BANNER ===== */}
      <section className="home-banner">
        <div className="home-banner-box">
          <h2>
            {translatePhrase(
              "Mulai Membangun Karir Impian Anda Hari Ini",
              locale
            ) || "Mulai Membangun Karir Impian Anda Hari Ini"}
          </h2>

          <p>
            {translatePhrase(
              "Ribuan perusahaan top menanti talenta sepertimu. Selesaikan langkah pendaftaran untuk mulai terhubung.",
              locale
            ) ||
              "Ribuan perusahaan top menanti talenta sepertimu. Selesaikan langkah pendaftaran untuk mulai terhubung."}
          </p>

          <button
            className="home-btn-primary"
            onClick={() => navigate("/profil")}
          >
            {translatePhrase("Lanjutkan Pendaftaran", locale) ||
              "Lanjutkan Pendaftaran"}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-about">
            <h3>About Us</h3>
            <span className="footer-line"></span>
            <p>
              Vocaseek berdedikasi dalam mengembangkan kapasitas talenta muda
              Indonesia melalui program pelatihan, mentoring, dan penyaluran
              karir yang terintegrasi.
            </p>

            <div className="footer-logo">
              <img src="/logovocaseek2.png" alt="Vocaseek" />
            </div>
          </div>

          <div className="footer-contact">
            <h3>Contact Info</h3>
            <span className="footer-line"></span>

            <ul>
              <li>Jl. Pahlawan No.1, Surabaya, Jawa Timur</li>
              <li>+628517159231</li>
              <li>admin@vocaseek.id</li>
            </ul>

            <FooterSocialIcons />
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Vocaseek. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

