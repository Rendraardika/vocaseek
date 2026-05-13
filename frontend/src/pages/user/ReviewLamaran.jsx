import "../../styles/reviewlamaran.css";
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import { applyInternJob, getInternApplications, getInternProfile } from "../../services/intern";
import { getApiErrorMessage, logoutUser } from "../../services/auth";
import { getPublicJobs, mapPublicJob } from "../../services/jobs";
import { clearAuthSession, isAuthenticated } from "../../utils/authStorage";
import { readProfileFromStorage } from "../../components/user/ProfileStorage";
import { mapTalentDetailPayload } from "../../utils/talentProfile";
import {
  getScopedItem,
  removeScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";

function readDraftJob() {
  try {
    const saved = getScopedItem(USER_STORAGE_KEYS.applicationDraft);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Gagal membaca draft lamaran:", error);
    return null;
  }
}

export default function ReviewLamaran() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [job, setJob] = useState(() => readDraftJob());
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    photo: "",
  });

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
    if (!job?.id) {
      navigate("/searchlowongan", { replace: true });
    }
  }, [job, navigate]);

  useEffect(() => {
    const syncReviewData = async () => {
      const draftJob = readDraftJob();

      if (!draftJob?.id) {
        return;
      }

      try {
        const [profileResponse, jobsResponse, applicationsResponse] = await Promise.all([
          getInternProfile(),
          getPublicJobs(),
          getInternApplications(),
        ]);

        const profile = profileResponse?.data?.data || {};
        const normalizedProfile = mapTalentDetailPayload(profile);
        const savedProfile = readProfileFromStorage() || {};
        const publicJobs = (jobsResponse?.data?.data || jobsResponse?.data?.jobs || []).map(
          mapPublicJob,
        );
        const latestJob = publicJobs.find(
          (item) => String(item.id) === String(draftJob.id),
        );
        const applications =
          applicationsResponse?.data?.data ||
          applicationsResponse?.data?.applications ||
          [];
        const hasApplied = applications.some(
          (application) =>
            String(application?.job_id || application?.job?.id) ===
            String(draftJob.id),
        );

        setAlreadyApplied(hasApplied);

        setUserData({
          name: normalizedProfile.name || savedProfile.fullName || "",
          email: normalizedProfile.email || savedProfile.email || "",
          photo: normalizedProfile.photo || savedProfile.photo || "",
        });
        setImageError(false);

        if (latestJob) {
          const refreshedDraft = {
            ...draftJob,
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

          setJob(refreshedDraft);
          setScopedItem(
            USER_STORAGE_KEYS.applicationDraft,
            JSON.stringify(refreshedDraft),
          );
        }
      } catch (error) {
        console.error("Gagal menyegarkan data review lamaran:", error);
      }
    };

    syncReviewData();
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

  const handleSubmitApplication = async () => {
    if (!job?.id) {
      navigate("/searchlowongan", { replace: true });
      return;
    }

    try {
      setIsSubmitting(true);

      const applicationsResponse = await getInternApplications();
      const applications =
        applicationsResponse?.data?.data ||
        applicationsResponse?.data?.applications ||
        [];
      const hasApplied = applications.some(
        (application) =>
          String(application?.job_id || application?.job?.id) === String(job.id),
      );

      if (hasApplied) {
        setAlreadyApplied(true);
        alert("Anda sudah melamar di lowongan ini.");
        navigate("/searchlowongan");
        return;
      }

      await applyInternJob({
        job_id: Number(job.id),
      });

      const appliedJob = {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        duration: job.duration,
        work: job.work,
        stage: "Pending",
        rawStatus: "PENDING",
        motivation: job.motivation || "",
        companyProfile: job.companyProfile || {},
        appliedAt: new Date().toISOString(),
      };

      setScopedItem(USER_STORAGE_KEYS.appliedJob, JSON.stringify(appliedJob));
      removeScopedItem(USER_STORAGE_KEYS.applicationDraft);
      window.dispatchEvent(new Event("career-journey-updated"));
      navigate("/success-apply");
    } catch (error) {
      alert(getApiErrorMessage(error, "Gagal mengirim lamaran."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rl-page user-nav-shell">
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

      <main className="rl-main">
        <div className="rl-header">
          <h1>Daftar Magang</h1>
          <p>
            Pastikan seluruh informasi dan berkas di bawah sudah benar dan
            sesuai dengan data kamu.
          </p>

          <div className="rl-step">
            <FiCheckCircle className="rl-step-done" />
            <span className="rl-step-gray">Cek Kelengkapan Berkas</span>
            <div className="rl-line"></div>
            <div className="rl-step-active">2</div>
            <span className="rl-step-text">Review Lamaran Magang</span>
          </div>
        </div>

        <div className="rl-card">
          <div className="rl-job">
            <div className="rl-job-left">
              <div className="rl-logo"></div>
              <div>
                <h3 className="rl-job-title">
                  {job?.title || "Lowongan yang Dilamar"}
                </h3>
                <p className="rl-job-company">
                  {job
                    ? [job.company, job.location].filter(Boolean).join(" • ")
                    : "Nama Perusahaan • Lokasi"}
                </p>
              </div>
            </div>

            <div className="rl-badge">{job?.type || "LOWONGAN"}</div>
          </div>

          <div className="rl-info">
            <div className="rl-info-item">
              <h4>Bersertifikat</h4>
              <p>Kamu akan mendapatkan sertifikat yang dijamin oleh Vocaseek.</p>
            </div>

            <div className="rl-info-item">
              <h4>Sistem Kerja</h4>
              <p>
                {job?.work
                  ? `Lowongan ini menggunakan sistem kerja ${job.work.toLowerCase()}.`
                  : "Informasi sistem kerja mengikuti detail lowongan perusahaan."}
              </p>
            </div>

            <div className="rl-info-item">
              <h4>Tanggal Penting</h4>

              <div className="rl-dates">
                <div className="rl-date">
                  <span>Penutupan Lamaran</span>
                  <strong>{job?.dates?.deadline || "-"}</strong>
                </div>

                <div className="rl-date">
                  <span>Mulai Kerja / Magang</span>
                  <strong>{job?.dates?.start || "-"}</strong>
                </div>
              </div>
            </div>
          </div>

          {job?.motivation && (
            <div className="rl-terms">
              <h4>Motivasi Pendaftar</h4>
              <p>{job.motivation}</p>
            </div>
          )}

          <div className="rl-terms">
            <h4>Pernyataan Ketentuan dan Komitmen Peserta</h4>

            <div className="rl-term">
              <span className="rl-check">✓</span>
              <p>
                Dengan ini pengguna menyatakan telah membaca, mengerti, dan
                patuh pada syarat serta ketentuan.
              </p>
            </div>

            <div className="rl-term">
              <span className="rl-check">✓</span>
              <p>Kerahasiaan dan etika: wajib menjaga data perusahaan.</p>
            </div>

            <div className="rl-term">
              <span className="rl-check">✓</span>
              <p>
                Pelaksanaan program dan kepatuhan: peserta bertanggung jawab
                atas proses program yang diikuti.
              </p>
            </div>
          </div>
        </div>

        <div className="rl-buttons">
          <button
            className="rl-back"
            onClick={() => navigate("/daftar-magang")}
          >
            Kembali
          </button>

          <button
            className="rl-submit"
            onClick={handleSubmitApplication}
            disabled={isSubmitting || alreadyApplied}
          >
            {alreadyApplied
              ? "Sudah Melamar"
              : isSubmitting
                ? "Mengirim Lamaran..."
                : "Kirim Lamaran"}
          </button>
        </div>
      </main>
    </div>
  );
}
