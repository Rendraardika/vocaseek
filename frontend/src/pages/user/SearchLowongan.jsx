import "../../styles/searchlowongan.css";
import { useNavigate, NavLink } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiFolder,
  FiAward,
  FiFileText,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";
import { getApiErrorMessage, logoutUser } from "../../services/auth";
import { getInternApplications } from "../../services/intern";
import { getPublicJobs, mapPublicJob } from "../../services/jobs";
import { clearAuthSession, isAuthenticated } from "../../utils/authStorage";
import { readProfileFromStorage } from "../../components/user/ProfileStorage";
import { setScopedItem, USER_STORAGE_KEYS } from "../../utils/userScopedStorage";
import { translatePhrase } from "../../i18n/phrases";
import { getSavedLanguage } from "../../utils/languagePreference";

const defaultUserData = {
  name: "",
  email: "",
  photo: "",
};

function hasValue(value) {
  return String(value || "").trim().length > 0;
}

function CompanyLogo({ name, logoUrl, fallbackIcon = <FiBriefcase /> }) {
  const [hasError, setHasError] = useState(false);
  const fallback = String(name || "VS")
    .trim()
    .slice(0, 2)
    .toUpperCase();

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={name || "Logo perusahaan"}
        onError={() => setHasError(true)}
      />
    );
  }

  return fallback.length > 0 ? <span>{fallback}</span> : fallbackIcon;
}

export default function SearchLowongan() {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const [activeTab, setActiveTab] = useState("deskripsi");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [jobsErrorMessage, setJobsErrorMessage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [locale, setLocale] = useState(getSavedLanguage());
  const [selectedJob, setSelectedJob] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(defaultUserData);
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());

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

  const readSavedProfile = () => {
    const profile = readProfileFromStorage();
    return {
      name: profile.fullName || "",
      email: profile.email || "",
      photo: profile.photo || "",
    };
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
    const loadJobs = async () => {
      setIsLoadingJobs(true);
      setJobsErrorMessage("");

      try {
        const response = await getPublicJobs();
        const publicJobs = response?.data?.data || response?.data?.jobs || [];
        setJobs(publicJobs.map(mapPublicJob));
      } catch (error) {
        setJobs([]);
        setJobsErrorMessage(
          getApiErrorMessage(error, "Gagal memuat daftar lowongan.")
        );
      } finally {
        setIsLoadingJobs(false);
      }
    };

    loadJobs();
  }, [locale]);

  useEffect(() => {
    const loadApplications = async () => {
      if (!isLoggedIn) {
        setAppliedJobIds(new Set());
        return;
      }

      try {
        const response = await getInternApplications();
        const applications = response?.data?.data || response?.data?.applications || [];
        setAppliedJobIds(
          new Set(
            applications
              .map((application) => application?.job_id || application?.job?.id)
              .filter((jobId) => jobId !== undefined && jobId !== null)
              .map((jobId) => String(jobId)),
          ),
        );
      } catch (error) {
        console.error("Gagal memuat status lamaran:", error);
        setAppliedJobIds(new Set());
      }
    };

    loadApplications();
  }, [isLoggedIn]);

  useEffect(() => {
    const syncLanguage = () => {
      setLocale(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);

    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

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

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const keyword = search.toLowerCase();

    return (
      job.title.toLowerCase().includes(keyword) ||
      job.company.toLowerCase().includes(keyword) ||
      job.location.toLowerCase().includes(keyword) ||
      job.type.toLowerCase().includes(keyword)
    );
  }), [jobs, search]);

  useEffect(() => {
    if (filteredJobs.length === 0) {
      setSelectedJob(null);
      return;
    }

    setSelectedJob((currentJob) => {
      if (currentJob && filteredJobs.some((job) => job.id === currentJob.id)) {
        return currentJob;
      }

      return filteredJobs[0];
    });
  }, [filteredJobs]);

  const handleApply = () => {
    if (!selectedJob) {
      return;
    }

    if (appliedJobIds.has(String(selectedJob.id))) {
      return;
    }

    const applicationDraft = {
      id: selectedJob.id,
      title: selectedJob.title,
      company: selectedJob.company,
      location: selectedJob.location,
      type: selectedJob.type,
      duration: selectedJob.duration,
      work: selectedJob.work,
      description: selectedJob.description,
      qualifications: selectedJob.qualifications || [],
      benefits: selectedJob.benefits || [],
      education: selectedJob.education || {},
      documents: selectedJob.documents || [],
      dates: selectedJob.dates || {},
      companyProfile: selectedJob.companyProfile || {},
      motivation: "",
    };

    setScopedItem(
      USER_STORAGE_KEYS.applicationDraft,
      JSON.stringify(applicationDraft),
    );
    navigate("/daftar-magang");
  };

  const selectedJobAlreadyApplied = selectedJob
    ? appliedJobIds.has(String(selectedJob.id))
    : false;

  return (
    <div className="searchlowongan-page">
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

      <div className="searchlowongan-container">
        <div className="searchlowongan-wrapper">
          <div className="searchlowongan-box">
            <div className="searchlowongan-top">
              <button className="searchlowongan-tab active">
                <FiFolder size={16} />
                Semua Lowongan
              </button>
            </div>

            <div className="searchlowongan-divider"></div>

            <div className="searchlowongan-row">
              <div className="searchlowongan-field searchlowongan-input">
                <FiSearch />
                <input
                  placeholder="Posisi, Kata Kunci, atau Perusahaan"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <button className="searchlowongan-btn">
                <FiSearch size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="searchlowongan-layout">
          <div className="searchlowongan-sidebar">
            <div className="searchlowongan-sidebar-header">
              <span>
                Total Posisi: <b>{filteredJobs.length}</b>
              </span>
              <span>Urutkan: Terbaru</span>
            </div>

            {jobsErrorMessage && (
              <div className="searchlowongan-empty-card">
                <h3>Gagal memuat lowongan</h3>
                <p>{jobsErrorMessage}</p>
              </div>
            )}

            {!jobsErrorMessage && isLoadingJobs ? (
              <div className="searchlowongan-empty-card">
                <h3>Memuat lowongan...</h3>
                <p>Sebentar ya, kami sedang mengambil lowongan terbaru.</p>
              </div>
            ) : !jobsErrorMessage && filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className={`searchlowongan-card ${
                    selectedJob?.id === job.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="searchlowongan-left">
                    <div className="searchlowongan-company-head">
                      <div className="searchlowongan-company-logo">
                        <CompanyLogo
                          name={job.company}
                          logoUrl={job.companyProfile?.logoUrl}
                        />
                      </div>

                      <div className="searchlowongan-company-copy">
                        <div className="searchlowongan-title">{job.title}</div>
                        <div className="searchlowongan-company">{job.company}</div>
                      </div>
                    </div>
                  </div>

                  <div className="searchlowongan-right">
                    {(hasValue(job.type) ||
                      hasValue(job.duration) ||
                      hasValue(job.work)) && (
                      <div className="searchlowongan-badges">
                        {hasValue(job.type) && <span>{job.type}</span>}
                        {hasValue(job.duration) && <span>{job.duration}</span>}
                        {hasValue(job.work) && <span>{job.work}</span>}
                      </div>
                    )}

                    {(hasValue(job.postedAt) || hasValue(job.location)) && (
                      <div className="searchlowongan-meta">
                        {hasValue(job.postedAt) && <span>{job.postedAt}</span>}
                        {hasValue(job.location) && <span>{job.location}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : !jobsErrorMessage ? (
              <div className="searchlowongan-empty-card">
                <h3>Belum ada lowongan</h3>
                <p>
                  Saat ini belum ada perusahaan yang mempublikasikan lowongan.
                  Ketika lowongan tersedia, daftar dan detailnya akan muncul di sini.
                </p>
              </div>
            ) : null}
          </div>

          <div className="searchlowongan-detail">
            {selectedJob ? (
              <>
                <div className="job-detail-header">
                  <div className="job-company">
                    <div className="job-logo">
                      <CompanyLogo
                        name={selectedJob.companyProfile?.name || selectedJob.company}
                        logoUrl={selectedJob.companyProfile?.logoUrl}
                        fallbackIcon={<FiBriefcase />}
                      />
                    </div>

                    <div className="job-info">
                      <h2>{selectedJob.title}</h2>

                      <div className="job-meta">
                        {hasValue(selectedJob.company) && (
                          <span>{selectedJob.company}</span>
                        )}
                        {hasValue(selectedJob.location) && (
                          <span>
                            <FiMapPin /> {selectedJob.location}
                          </span>
                        )}
                      </div>

                      {String(selectedJob.raw?.status || "").toUpperCase() === "ACTIVE" && (
                        <div className="job-status">
                          <FiCheckCircle />
                          {translatePhrase("Sedang membuka lowongan", locale) ||
                            "Sedang membuka lowongan"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="job-actions">
                    <button
                      className={`apply-btn ${selectedJobAlreadyApplied ? "applied" : ""}`}
                      onClick={handleApply}
                      disabled={selectedJobAlreadyApplied}
                    >
                      {selectedJobAlreadyApplied ? "Sudah Melamar" : "Daftar Sekarang ->"}
                    </button>
                  </div>
                </div>

                <div className="job-tabs">
                  <button
                    className={activeTab === "deskripsi" ? "active" : ""}
                    onClick={() => setActiveTab("deskripsi")}
                  >
                    Deskripsi Pekerjaan
                  </button>

                  <button
                    className={activeTab === "perusahaan" ? "active" : ""}
                    onClick={() => setActiveTab("perusahaan")}
                  >
                    Profil Perusahaan
                  </button>

                  <button
                    className={activeTab === "lokasi" ? "active" : ""}
                    onClick={() => setActiveTab("lokasi")}
                  >
                    Lokasi
                  </button>
                </div>

                {activeTab === "deskripsi" && (
                  <>
                    {hasValue(selectedJob.description) && (
                      <div className="searchlowongan-section">
                        <h3>Deskripsi Pekerjaan</h3>
                        <p>{selectedJob.description}</p>
                      </div>
                    )}

                    {selectedJob.education && selectedJob.documents && (
                      <div className="job-info-grid">
                        <div className="job-info-card">
                          <div className="job-card-title">
                            <FiAward />
                            <h4>Pendidikan</h4>
                          </div>

                          <ul>
                            <li>Jenjang: {selectedJob.education.level}</li>
                            <li>Jurusan: {selectedJob.education.major}</li>
                            <li>IPK: {selectedJob.education.gpa}</li>
                          </ul>
                        </div>

                        <div className="job-info-card">
                          <div className="job-card-title">
                            <FiFileText />
                            <h4>Persyaratan Dokumen</h4>
                          </div>

                          <div className="doc-tags">
                            {selectedJob.documents.map((doc, index) => (
                              <span key={index}>{doc}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {(hasValue(selectedJob.dates?.deadline) ||
                      hasValue(selectedJob.dates?.start)) && (
                      <div className="searchlowongan-section">
                        <h3>
                          <FiCalendar style={{ marginRight: "6px" }} />
                          Tanggal Penting
                        </h3>

                        <ul>
                          {hasValue(selectedJob.dates?.deadline) && (
                            <li>
                              <b>Deadline:</b> {selectedJob.dates.deadline}
                            </li>
                          )}

                          {hasValue(selectedJob.dates?.start) && (
                            <li>
                              <b>Mulai:</b> {selectedJob.dates.start}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {selectedJob.qualifications.length > 0 && (
                      <div className="searchlowongan-section">
                        <h3>
                          <FiCheckCircle style={{ marginRight: "6px" }} />
                          Kualifikasi
                        </h3>

                        <ul>
                          {selectedJob.qualifications.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedJob.benefits.length > 0 && (
                      <div className="searchlowongan-section">
                        <h3>
                          <FiDollarSign style={{ marginRight: "6px" }} />
                          Benefit
                        </h3>

                        <div className="searchlowongan-benefits">
                          {selectedJob.benefits.map((item, index) => (
                            <div className="searchlowongan-benefit" key={index}>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "perusahaan" && (
                    <div className="searchlowongan-company-panel">
                      <div className="searchlowongan-company-hero">
                        <div className="searchlowongan-company-avatar">
                          {selectedJob.companyProfile?.logoUrl ? (
                          <img
                            src={selectedJob.companyProfile.logoUrl}
                            alt={selectedJob.companyProfile.name}
                          />
                        ) : (
                          <span>
                            {(selectedJob.companyProfile?.name || selectedJob.company)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3>{selectedJob.companyProfile?.name || selectedJob.company}</h3>
                        {hasValue(selectedJob.companyProfile?.description) && (
                          <p>{selectedJob.companyProfile.description}</p>
                        )}
                      </div>
                    </div>

                    {(hasValue(selectedJob.companyProfile?.industry) ||
                      hasValue(selectedJob.companyProfile?.size) ||
                      hasValue(selectedJob.companyProfile?.status) ||
                      hasValue(selectedJob.companyProfile?.website)) && (
                      <div className="searchlowongan-company-facts">
                        {hasValue(selectedJob.companyProfile?.industry) && (
                          <div>
                            <span>{translatePhrase("Industri", locale) || "Industri"}</span>
                            <strong>{selectedJob.companyProfile.industry}</strong>
                          </div>
                        )}
                        {hasValue(selectedJob.companyProfile?.size) && (
                          <div>
                            <span>
                              {translatePhrase("Ukuran Perusahaan", locale) ||
                                "Ukuran Perusahaan"}
                            </span>
                            <strong>{selectedJob.companyProfile.size}</strong>
                          </div>
                        )}
                        {hasValue(selectedJob.companyProfile?.status) && (
                          <div>
                            <span>
                              {translatePhrase("Status Mitra", locale) ||
                                "Status Mitra"}
                            </span>
                            <strong>
                              {translatePhrase(
                                selectedJob.companyProfile.status,
                                locale
                              ) || selectedJob.companyProfile.status}
                            </strong>
                          </div>
                        )}
                        {hasValue(selectedJob.companyProfile?.website) && (
                          <div>
                            <span>Website</span>
                            <strong>
                              <a
                                href={selectedJob.companyProfile.website}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {selectedJob.companyProfile.website}
                              </a>
                            </strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "lokasi" && (
                  <div className="searchlowongan-location-panel">
                    <div className="searchlowongan-location-icon">
                      <FiMapPin />
                    </div>
                    <div>
                      <h3>
                        {translatePhrase("Lokasi Lowongan", locale) ||
                          "Lokasi Lowongan"}
                      </h3>
                      {hasValue(selectedJob.location) && <p>{selectedJob.location}</p>}

                      {hasValue(selectedJob.companyProfile?.address) && (
                        <>
                          <h4>
                            {translatePhrase("Alamat Perusahaan", locale) ||
                              "Alamat Perusahaan"}
                          </h4>
                          <p>{selectedJob.companyProfile.address}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="searchlowongan-empty-detail">
                <div className="job-logo">
                  <FiBriefcase />
                </div>
                <h2>Belum ada lowongan tersedia</h2>
                <p>
                  Panel detail ini akan otomatis menampilkan informasi lowongan
                  ketika perusahaan mulai mempublikasikan lowongan di sistem.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill={"currentColor"}
                  viewBox={"0 0 24 24"}
                >
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 2v.51l-8 6.22-8-6.22V6zM4 18V9.04l7.39 5.74c.18.14.4.21.61.21s.43-.07.61-.21L20 9.03v8.96H4Z"></path>
                </svg>
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill={"currentColor"}
                  viewBox={"0 0 24 24"}
                >
                  <path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248m0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008M16.806 6.129a1.078 1.078 0 1 0 0 2.156 1.078 1.078 0 1 0 0-2.156" />
                  <path d="M20.533 6.111A4.6 4.6 0 0 0 17.9 3.479a6.6 6.6 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.6 6.6 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.6 6.6 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71s0 2.753.056 3.71c.015.748.156 1.486.419 2.187a4.6 4.6 0 0 0 2.634 2.632 6.6 6.6 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.6 6.6 0 0 0 2.186-.419 4.61 4.61 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.6 6.6 0 0 0-.421-2.217m-1.218 9.532a5 5 0 0 1-.311 1.688 2.99 2.99 0 0 1-1.712 1.711 5 5 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a5 5 0 0 1-1.669-.311 2.99 2.99 0 0 1-1.719-1.711 5.1 5.1 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654s0-2.686.053-3.655a5 5 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5 5 0 0 1 1.669-.311c.951-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a5 5 0 0 1 1.67.311 3 3 0 0 1 1.712 1.712 5.1 5.1 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655s0 2.698-.043 3.654z" />
                </svg>
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill={"currentColor"}
                  viewBox={"0 0 24 24"}
                >
                  <path d="M12 6.81c-2.86 0-5.19 2.33-5.19 5.19s2.33 5.19 5.19 5.19 5.19-2.33 5.19-5.19S14.86 6.81 12 6.81m-1.93 8.15V9.05L15.18 12l-5.11 2.95Z" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 15.92c-3.27 0-5.92-2.65-5.92-5.92S8.73 6.08 12 6.08s5.92 2.65 5.92 5.92-2.65 5.92-5.92 5.92" />
                </svg>
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill={"currentColor"}
                  viewBox={"0 0 24 24"}
                >
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
