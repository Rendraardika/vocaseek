import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../../styles/searchmitra.css";
import { FiSearch, FiMapPin, FiStar } from "react-icons/fi";
import { getApiErrorMessage, logoutUser } from "../../services/auth";
import { getPublicJobs, mapPublicJob } from "../../services/jobs";
import { clearAuthSession, isAuthenticated } from "../../utils/authStorage";
import { readProfileFromStorage } from "../../components/user/ProfileStorage";
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
        description:
          companyProfile?.description ||
          "Profil perusahaan belum dilengkapi oleh perusahaan.",
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
      location: normalizedJob.location,
      work: normalizedJob.work,
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
  const [activeCategory, setActiveCategory] = useState("Semua");
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

  const categories = ["Semua", "Fintech", "Manufaktur", "Teknologi", "Kesehatan"];

  const getCategory = (mitra) => {
    const name = String(mitra.name || "").toLowerCase();
    const industry = String(mitra.industry || "").toLowerCase();

    if (
      name.includes("bank") ||
      name.includes("bni") ||
      name.includes("mandiri") ||
      industry.includes("keuangan") ||
      industry.includes("fintech")
    ) {
      return "Fintech";
    }

    if (
      name.includes("telkom") ||
      name.includes("gojek") ||
      industry.includes("teknologi") ||
      industry.includes("telekomunikasi") ||
      industry.includes("digital") ||
      industry.includes("media")
    ) {
      return "Teknologi";
    }

    if (
      name.includes("kimia farma") ||
      name.includes("kalbe") ||
      industry.includes("farmasi") ||
      industry.includes("kesehatan")
    ) {
      return "Kesehatan";
    }

    if (
      name.includes("astra") ||
      name.includes("pertamina") ||
      name.includes("waskita") ||
      industry.includes("manufaktur") ||
      industry.includes("konstruksi") ||
      industry.includes("energi") ||
      industry.includes("industri") ||
      industry.includes("otomotif") ||
      industry.includes("infrastruktur")
    ) {
      return "Manufaktur";
    }

    return "Semua";
  };

  const filtered = useMemo(
    () =>
      mitraData.filter((m) => {
        const keyword = search.toLowerCase();
        const categoryMatch =
          activeCategory === "Semua" || getCategory(m) === activeCategory;

        const searchMatch =
          String(m.name || "").toLowerCase().includes(keyword) ||
          String(m.industry || "").toLowerCase().includes(keyword) ||
          String(m.location || "").toLowerCase().includes(keyword);

        return categoryMatch && searchMatch;
      }),
    [activeCategory, mitraData, search],
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

      <section className="searchmitra-category-bar">
        {categories.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? "active" : ""}
            onClick={() => {
              setActiveCategory(category);
              setCurrentPage(1);
            }}
          >
            {category}
          </button>
        ))}
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
                    <p>{mitra.description}</p>
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
