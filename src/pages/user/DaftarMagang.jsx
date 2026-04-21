import "../../styles/daftarmagang.css";
import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiFileText } from "react-icons/fi";
import { getApiErrorMessage, logoutUser } from "../../services/auth";
import { getInternProfile } from "../../services/intern";
import { getPublicJobs, mapPublicJob } from "../../services/jobs";
import { clearAuthSession, isAuthenticated } from "../../utils/authStorage";
import { readProfileFromStorage } from "../../components/user/ProfileStorage";
import { mapTalentDetailPayload } from "../../utils/talentProfile";
import {
  getScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";

const defaultUserData = {
  name: "",
  email: "",
  photo: "",
};

const defaultProfileData = {
  nama: "",
  email: "",
  foto: "",
  universitas: "",
  jurusan: "",
  ipk: "",
  cv: "",
  portfolio: "",
  recommendation_letter: "",
  ktp: "",
  transcript: "",
  education_document: "",
};

function readDraftJob() {
  try {
    const saved = getScopedItem(USER_STORAGE_KEYS.applicationDraft);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Gagal membaca draft lamaran:", error);
    return null;
  }
}

export default function DaftarMagang() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [jobDraft, setJobDraft] = useState(() => readDraftJob());
  const [motivation, setMotivation] = useState(
    () => readDraftJob()?.motivation || "",
  );
  const [profileData, setProfileData] = useState(defaultProfileData);
  const [profileError, setProfileError] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const userData = useMemo(
    () => ({
      name: profileData.nama || defaultUserData.name,
      email: profileData.email || defaultUserData.email,
      photo: profileData.foto || defaultUserData.photo,
    }),
    [profileData],
  );

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

  const autoDocuments = useMemo(
    () => [
      {
        key: "ktp",
        label: "KTP / Identitas Diri",
        url: profileData.ktp,
      },
      {
        key: "portfolio",
        label: "Portofolio",
        url: profileData.portfolio,
      },
      {
        key: "rekomendasi",
        label: "Surat Rekomendasi",
        url: profileData.recommendation_letter,
      },
      {
        key: "transcript",
        label: "Transkrip Nilai",
        url: profileData.education_document || profileData.transcript,
      },
      {
        key: "cv",
        label: "Curriculum Vitae",
        url: profileData.cv,
      },
    ],
    [profileData],
  );

  const missingDocuments = autoDocuments.filter((document) => !document.url);

  useEffect(() => {
    if (!jobDraft?.id) {
      navigate("/searchlowongan", { replace: true });
    }
  }, [jobDraft, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError("");

      try {
        const response = await getInternProfile();
        const payload = response?.data?.data || {};
        const savedProfile = readProfileFromStorage() || {};
        const normalizedProfile = mapTalentDetailPayload(payload);

        setProfileData((prev) => ({
          ...prev,
          ...payload,
          nama: normalizedProfile.name || savedProfile.fullName || prev.nama,
          email: normalizedProfile.email || savedProfile.email || prev.email,
          foto: normalizedProfile.photo || savedProfile.photo || prev.foto,
          universitas: normalizedProfile.university || prev.universitas,
          jurusan: normalizedProfile.major || prev.jurusan,
          ipk: normalizedProfile.ipk || prev.ipk,
          cv:
            normalizedProfile.documents?.cv?.url ||
            payload?.cv ||
            payload?.cv_url ||
            payload?.cv_pdf ||
            prev.cv,
          portfolio:
            normalizedProfile.documents?.portfolio?.url ||
            payload?.portfolio ||
            payload?.portfolio_url ||
            payload?.portofolio_pdf ||
            prev.portfolio,
          ktp:
            normalizedProfile.documents?.identity?.url ||
            payload?.ktp ||
            payload?.ktp_url ||
            payload?.ktp_pdf ||
            prev.ktp,
          recommendation_letter:
            normalizedProfile.documents?.recommendation?.url ||
            payload?.recommendation_letter ||
            payload?.recommendation_letter_url ||
            payload?.surat_rekomendasi_pdf ||
            prev.recommendation_letter,
          transcript:
            normalizedProfile.documents?.transcript?.url ||
            payload?.transcript ||
            payload?.transcript_url ||
            payload?.transkrip_nilai_pdf ||
            prev.transcript,
          education_document:
            normalizedProfile.educationDocument?.url ||
            payload?.education_document ||
            payload?.education_document_url ||
            prev.education_document,
        }));
        setImageError(false);
      } catch (error) {
        setProfileError(
          getApiErrorMessage(error, "Gagal memuat data profil intern."),
        );
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const syncDraftJob = async () => {
      const currentDraft = readDraftJob();

      if (!currentDraft?.id) {
        return;
      }

      try {
        const response = await getPublicJobs();
        const publicJobs = (response?.data?.data || response?.data?.jobs || []).map(
          mapPublicJob,
        );
        const latestJob = publicJobs.find(
          (item) => String(item.id) === String(currentDraft.id),
        );

        if (!latestJob) {
          return;
        }

        const refreshedDraft = {
          ...currentDraft,
          title: latestJob.title,
          company: latestJob.company,
          location: latestJob.location,
          type: latestJob.type,
          duration: latestJob.duration,
          work: latestJob.work,
          description: latestJob.description,
          qualifications: latestJob.qualifications || [],
          benefits: latestJob.benefits || [],
          education: latestJob.education || {},
          documents: latestJob.documents || [],
          dates: latestJob.dates || {},
          companyProfile: latestJob.companyProfile || {},
        };

        setJobDraft(refreshedDraft);
        setScopedItem(
          USER_STORAGE_KEYS.applicationDraft,
          JSON.stringify(refreshedDraft),
        );
      } catch (error) {
        console.error("Gagal menyegarkan lowongan draft:", error);
      }
    };

    syncDraftJob();
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

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout backend gagal, sesi lokal tetap dibersihkan:", error);
    } finally {
      clearAuthSession();
      navigate("/");
    }
  };

  const handleContinue = () => {
    if (!jobDraft?.id) {
      navigate("/searchlowongan", { replace: true });
      return;
    }

    if (missingDocuments.length > 0) {
      alert(
        `Lengkapi dulu dokumen berikut di profil: ${missingDocuments
          .map((item) => item.label)
          .join(", ")}.`,
      );
      return;
    }

    const updatedDraft = {
      ...jobDraft,
      motivation: motivation.trim(),
    };

    setScopedItem(
      USER_STORAGE_KEYS.applicationDraft,
      JSON.stringify(updatedDraft),
    );
    setJobDraft(updatedDraft);
    navigate("/review-lamaran");
  };

  return (
    <div className="dm-page user-nav-shell">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <img
              src="/vocaseeklogo.png"
              alt="Vocaseek Logo"
              className="logo-img"
            />
          </div>

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
              className={
                location.pathname === "/searchlowongan" ||
                location.pathname === "/daftar-magang" ||
                location.pathname === "/review-lamaran"
                  ? "active"
                  : ""
              }
            >
              Lowongan
            </NavLink>

            <NavLink
              to={isLoggedIn ? "/searchmitra" : "/mitra"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Mitra
            </NavLink>

            <NavLink
              to={isLoggedIn ? "/contact" : "/kontak"}
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

      <main className="dm-main">
        <div className="dm-header">
          <h1>Daftar Magang</h1>
          <p>
            Data diri dan dokumen akan otomatis terisi dari profil kamu saat
            melamar lowongan.
          </p>

          <div className="dm-step">
            <div className="dm-step-active">1</div>
            <span className="dm-step-text">Cek Kelengkapan Berkas</span>
            <div className="dm-line"></div>
            <div className="dm-step-inactive">2</div>
            <span className="dm-step-gray">Review Lamaran Magang</span>
          </div>
        </div>

        <div className="dm-card">
          <h2>Data Pribadi</h2>
          <p>Pastikan data profil kamu sudah sesuai sebelum lanjut melamar.</p>

          <div className="dm-profile">
            {userData.photo && !imageError ? (
              <img src={userData.photo} alt={userData.name || "Profile"} />
            ) : (
              <div className="profile-dropdown-avatar fallback">{initials}</div>
            )}

            <div>
              <div className="dm-name">{profileData.nama || "-"}</div>
              <div className="dm-email">{profileData.email || "-"}</div>
              <div className="dm-email">
                {[
                  profileData.universitas,
                  profileData.jurusan,
                  profileData.ipk ? `IPK ${profileData.ipk}` : "",
                ]
                  .filter(Boolean)
                  .join(" • ") || "Lengkapi data akademik di profil"}
              </div>
            </div>
          </div>

          <label className="dm-label" htmlFor="motivation">
            Motivasi mendaftar <span>*</span>
          </label>
          <textarea
            id="motivation"
            className="dm-textarea"
            placeholder="Tulis motivasi kamu..."
            value={motivation}
            onChange={(event) => setMotivation(event.target.value)}
          />

          <h2 className="dm-doc-title">Dokumen Pendukung</h2>
          <p>
            Dokumen di bawah diambil otomatis dari profil. Kamu tidak perlu
            upload ulang saat daftar lowongan.
          </p>

          {isLoadingProfile && <p>Memuat data profil...</p>}

          {!isLoadingProfile && profileError && (
            <p style={{ marginTop: "12px", color: "#dc2626" }}>{profileError}</p>
          )}

          {!isLoadingProfile &&
            !profileError &&
            autoDocuments.map((document) => (
              <div className="dm-file" key={document.key}>
                <div className="dm-file-info">
                  <FiFileText className="dm-file-icon" />
                  <div>
                    <div className="dm-file-name">{document.label}</div>
                    <div className="dm-email">
                      {document.url
                        ? "Otomatis dari profil"
                        : "Belum tersedia di profil"}
                    </div>
                  </div>
                </div>

                {document.url ? (
                  <a
                    className="dm-file-btn"
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lihat File
                  </a>
                ) : (
                  <button
                    type="button"
                    className="dm-file-btn"
                    onClick={() => navigate("/profil/dokumen")}
                  >
                    Lengkapi Profil
                  </button>
                )}
              </div>
            ))}

          {jobDraft?.title && (
            <div style={{ marginTop: "28px" }}>
              <h2>Lowongan Tujuan</h2>
              <p>
                Kamu akan melamar <strong>{jobDraft.title}</strong> di{" "}
                <strong>{jobDraft.company}</strong>.
              </p>
            </div>
          )}

          {missingDocuments.length > 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "#fff7ed",
                color: "#9a3412",
              }}
            >
              Lengkapi dulu dokumen berikut di profil agar lamaran siap dikirim:{" "}
              {missingDocuments.map((item) => item.label).join(", ")}.
            </div>
          )}
        </div>

        <div className="dm-next-wrapper">
          <button className="dm-back" onClick={() => navigate("/searchlowongan")}>
            <FiArrowLeft />
            Kembali
          </button>

          <button className="dm-next" onClick={handleContinue}>
            Selanjutnya
          </button>
        </div>
      </main>
    </div>
  );
}
