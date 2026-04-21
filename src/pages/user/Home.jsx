import "../../styles/home.css";
import PerjalananKarirmu from "../../components/user/JourneyStepCard";
import { useNavigate, NavLink } from "react-router-dom";
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
  const [userData, setUserData] = useState(defaultUserData);
  const [appliedJob, setAppliedJob] = useState(null);
  const [progressState, setProgressState] = useState({
    completedSteps: 0,
    progressPercent: 0,
  });

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
        <h2 className="home-status-title">Status Lamaran Terbaru</h2>

        <p className="home-status-sub">
          Pantau aktivitas lamaran Anda di sini.
        </p>

        {appliedJob ? (
          <div className="home-status-card">
            <div className="home-status-card-top">
              <div className="home-status-card-icon">
                <FaBriefcase />
              </div>

              <div className="home-status-card-main">
                <div className="home-status-card-badge">
                  Lamaran Aktif
                </div>
                <h3>{appliedJob.title}</h3>
                <p>{appliedJob.company}</p>
              </div>

              <div className="home-status-stage">
                <span className="home-status-stage-label">Tahap Saat Ini</span>
                <strong>{appliedJob.stage || "Pending"}</strong>
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
                Lamaran kamu untuk posisi ini sudah berhasil dikirim. Pantau
                perkembangan proses seleksinya dari halaman status lamaran.
              </p>

              <button
                type="button"
                className="home-status-action"
                onClick={() => navigate("/status-lamaran")}
              >
                Lihat Status Lamaran <FaArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div className="home-status-box">
            <div className="home-status-icon">
              <FaSearch />
            </div>

            <h3>Belum Ada Lamaran Aktif</h3>

            <p>
              Perjalanan karirmu belum dimulai. Selesaikan Pre-Test sekarang agar
              bisa mulai melamar pekerjaan impianmu!
            </p>
          </div>
        )}
      </section>

      {/* REKOMENDASI */}
      <section className="home-recommend">
        <h2 className="home-recommend-title">Direkomendasikan Untukmu</h2>

        <p className="home-recommend-sub">Berdasarkan profil awal Anda.</p>

        <div className="home-recommend-grid">
          <div className="home-recommend-card">
            <div className="home-recommend-icon">
              <FaCode />
            </div>

            <h3>Frontend Developer</h3>
            <span>TechNusantara • Jakarta</span>
          </div>

          <div className="home-recommend-card">
            <div className="home-recommend-icon">
              <FaPenNib />
            </div>

            <h3>UI/UX Designer</h3>
            <span>Kreatif Studio • Bandung</span>
          </div>

          <div className="home-recommend-card">
            <div className="home-recommend-icon">
              <FaBullhorn />
            </div>

            <h3>Digital Marketing</h3>
            <span>GoCommerce • Surabaya</span>
          </div>
        </div>
      </section>

      {/* ===== BANNER ===== */}
      <section className="home-banner">
        <div className="home-banner-box">
          <h2>Mulai Membangun Karir Impian Anda Hari Ini</h2>

          <p>
            Ribuan perusahaan top menanti talenta sepertimu. Selesaikan langkah
            pendaftaran untuk mulai terhubung.
          </p>

          <button
            className="home-btn-primary"
            onClick={() => navigate("/profil")}
          >
            Lanjutkan Pendaftaran
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

            <div className="footer-social">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 2v.51l-8 6.22-8-6.22V6zM4 18V9.04l7.39 5.74c.18.14.4.21.61.21s.43-.07.61-.21L20 9.03v8.96H4Z"></path>
                </svg>
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>
                  <path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248m0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008M16.806 6.129a1.078 1.078 0 1 0 0 2.156 1.078 1.078 0 1 0 0-2.156" />
                  <path d="M20.533 6.111A4.6 4.6 0 0 0 17.9 3.479a6.6 6.6 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.6 6.6 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.6 6.6 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71s0 2.753.056 3.71c.015.748.156 1.486.419 2.187a4.6 4.6 0 0 0 2.634 2.632 6.6 6.6 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.6 6.6 0 0 0 2.186-.419 4.61 4.61 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.6 6.6 0 0 0-.421-2.217m-1.218 9.532a5 5 0 0 1-.311 1.688 2.99 2.99 0 0 1-1.712 1.711 5 5 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a5 5 0 0 1-1.669-.311 2.99 2.99 0 0 1-1.719-1.711 5.1 5.1 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654s0-2.686.053-3.655a5 5 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5 5 0 0 1 1.669-.311c.951-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a5 5 0 0 1 1.67.311 3 3 0 0 1 1.712 1.712 5.1 5.1 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655s0 2.698-.043 3.654z" />
                </svg>
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>
                  <path d="M12 6.81c-2.86 0-5.19 2.33-5.19 5.19s2.33 5.19 5.19 5.19 5.19-2.33 5.19-5.19S14.86 6.81 12 6.81m-1.93 8.15V9.05L15.18 12l-5.11 2.95Z" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 15.92c-3.27 0-5.92-2.65-5.92-5.92S8.73 6.08 12 6.08s5.92 2.65 5.92 5.92-2.65 5.92-5.92 5.92" />
                </svg>
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill={"currentColor"} viewBox={"0 0 24 24"}>
                  <path d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.04 4.04 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.03 4.03 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.02 4.02 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.46 11.46 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a8 8 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8 8 0 0 0 2.319-.624 8.7 8.7 0 0 1-2.019 2.083" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Vocaseek. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
