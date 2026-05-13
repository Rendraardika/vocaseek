import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../../styles/searchmitra.css";
import { FiSearch, FiMapPin, FiStar } from "react-icons/fi";
import { getApiErrorMessage, logoutUser } from "../../services/auth";
import { getPublicJobs, mapPublicJob } from "../../services/jobs";
import { clearAuthSession, isAuthenticated } from "../../utils/authStorage";
import { readProfileFromStorage } from "../../components/user/ProfileStorage";
import FooterSocialIcons from "../../components/common/FooterSocialIcons";
import FooterBrandLogo from "../../components/common/FooterBrandLogo";
import {
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";

const defaultUserData = {
  name: "",
  email: "",
  photo: "",
};

function PartnerLogo({ name, logoUrl }) {
  const [hasError, setHasError] = useState(false);
  const fallback = String(name || "VS").slice(0, 3).toUpperCase();

  return (
    <div className={`searchmitra-logo-circle ${!logoUrl || hasError ? "is-fallback" : ""}`}>
      {logoUrl && !hasError ? (
        <img
          src={logoUrl}
          alt={name}
          className="searchmitra-logo-image"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="searchmitra-logo-text">{fallback}</span>
      )}
    </div>
  );
}

function buildPartnerDirectoryFromJobs(jobs) {
  const partnerMap = new Map();

  jobs.forEach((job) => {
    const normalizedJob = mapPublicJob(job);
    const companyProfile = normalizedJob.companyProfile || {};
    const partnerKey = String(
      companyProfile?.name ||
        normalizedJob.company ||
        job?.company_profile_id ||
        normalizedJob.id,
    ).toLowerCase();

    if (!partnerMap.has(partnerKey)) {
      partnerMap.set(partnerKey, {
        id: companyProfile?.id || job?.company_profile_id || normalizedJob.id,
        name: companyProfile?.name || normalizedJob.company || "Perusahaan",
        logoUrl:
          companyProfile?.logoUrl ||
          companyProfile?.logo ||
          companyProfile?.logo_url ||
          companyProfile?.logo_perusahaan ||
          "",
        industry: companyProfile?.industry || "Industri belum diisi",
        location:
          companyProfile?.address || normalizedJob.location || "Lokasi belum diisi",
        description: companyProfile?.description || "",
        vision: companyProfile?.vision || "",
        mission: companyProfile?.mission || "",
        rating: "4.8",
        website: companyProfile?.website || "",
        phone: companyProfile?.phone || "",
        size: companyProfile?.size || "",
        jobs: [],
      });
    }

    partnerMap.get(partnerKey).jobs.push({
      id: normalizedJob.id,
      title: normalizedJob.title,
      company: normalizedJob.company,
      location: normalizedJob.location,
      type: normalizedJob.type,
      duration: normalizedJob.duration,
      work: normalizedJob.work,
      description: normalizedJob.description,
      qualifications: normalizedJob.qualifications || [],
      benefits: normalizedJob.benefits || [],
      education: normalizedJob.education || {},
      documents: normalizedJob.documents || [],
      dates: normalizedJob.dates || {},
      companyProfile: normalizedJob.companyProfile || {},
    });
  });

  return Array.from(partnerMap.values());
}

export default function SearchMitra() {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [imageError, setImageError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(defaultUserData);
  const [mitraData, setMitraData] = useState([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const [partnersErrorMessage, setPartnersErrorMessage] = useState("");

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
    const loadPartners = async () => {
      setIsLoadingPartners(true);
      setPartnersErrorMessage("");

      try {
        const response = await getPublicJobs();
        const publicJobs = response?.data?.data || response?.data?.jobs || [];
        const partnerDirectory = buildPartnerDirectoryFromJobs(publicJobs);

        setMitraData(partnerDirectory);
        setScopedItem(
          USER_STORAGE_KEYS.publicPartnerDirectory,
          JSON.stringify(partnerDirectory),
        );
      } catch (error) {
        setMitraData([]);
        setPartnersErrorMessage(
          getApiErrorMessage(error, "Gagal memuat daftar mitra perusahaan."),
        );
      } finally {
        setIsLoadingPartners(false);
      }
    };

    loadPartners();
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

  const filtered = useMemo(
    () =>
      mitraData.filter((m) => {
        const keyword = search.toLowerCase();
        const searchMatch =
          String(m.name || "").toLowerCase().includes(keyword) ||
          String(m.industry || "").toLowerCase().includes(keyword) ||
          String(m.location || "").toLowerCase().includes(keyword);

        return searchMatch;
      }),
    [mitraData, search],
  );

  const itemsPerPage = 6;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="searchmitra-page user-nav-shell">
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

      <section className="searchmitra-hero">
        <h1>Perusahaan Mitra</h1>

        <div className="searchmitra-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Cari nama perusahaan, industri, atau lokasi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </section>

      <section className="searchmitra-section">
        <div className="searchmitra-container">
          <div className="searchmitra-header-text">
            <p>
              {isLoadingPartners
                ? "Memuat mitra perusahaan..."
                : `Menampilkan ${filtered.length} Mitra Perusahaan`}
            </p>
          </div>

          {partnersErrorMessage ? (
            <div className="searchmitra-empty">
              <h2>Gagal memuat mitra</h2>
              <p>{partnersErrorMessage}</p>
            </div>
          ) : currentItems.length > 0 ? (
            <div className="searchmitra-grid">
              {currentItems.map((mitra) => (
                <div key={mitra.id} className="searchmitra-card">
                  <div className="searchmitra-rating">
                    <FiStar size={14} /> {mitra.rating}
                  </div>

                  <PartnerLogo name={mitra.name} logoUrl={mitra.logoUrl} />

                  <h3 className="searchmitra-title">{mitra.name}</h3>

                  <span className="searchmitra-industry">{mitra.industry}</span>

                  <div className="searchmitra-location">
                    <FiMapPin size={14} />
                    <span>{mitra.location}</span>
                  </div>

                  <div className="searchmitra-divider"></div>

                  <div className="searchmitra-desc">
                    <span className="searchmitra-desc-label">
                      DESKRIPSI MITRA
                    </span>
                    <p>{mitra.description || "Belum diisi"}</p>
                  </div>

                  <button
                    className="searchmitra-btn"
                    onClick={() =>
                      navigate(`/mitra/${mitra.id}`, {
                        state: { mitra },
                      })
                    }
                  >
                    Lihat Detail
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="searchmitra-empty">
              <h2>Belum ada mitra tersedia</h2>
              <p>
                Saat ini belum ada perusahaan mitra yang aktif. Ketika mitra
                sudah disetujui dan dipublikasikan, kartu mitra akan muncul di sini.
              </p>
            </div>
          )}

          {totalPages > 0 ? (
            <div className="searchmitra-pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                &lsaquo;
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                &rsaquo;
              </button>
            </div>
          ) : null}
        </div>
      </section>

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
              <FooterBrandLogo />
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

