import "../../styles/admin/SidebarMitra.css";
import {
  LayoutGrid,
  BriefcaseBusiness,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth";
import { clearAuthSession, getAuthSession } from "../../utils/authStorage";
import { pickFirstMediaValue } from "../../utils/media";
import {
  clearStoredCompanyProfile,
  getStoredCompanyProfile,
} from "../../utils/profileStorage";
import { translatePhrase } from "../../i18n/phrases";
import { getSavedLanguage } from "../../utils/languagePreference";

function resolveCompanyDisplayName(session) {
  const user = session?.user;
  const raw = session?.raw;
  const storedProfile = getStoredCompanyProfile();

  if (typeof user === "string" && user.trim()) {
    return user;
  }

  return (
    storedProfile?.nama_perusahaan ||
    storedProfile?.company_name ||
    storedProfile?.name ||
    user?.nama_perusahaan ||
    user?.company_name ||
    user?.nama ||
    raw?.nama_perusahaan ||
    raw?.company_name ||
    raw?.nama ||
    session?.identifier ||
    "Company"
  );
}

function resolveCompanyLogo(session) {
  const user = session?.user;
  const raw = session?.raw;
  const storedProfile = getStoredCompanyProfile();

  return pickFirstMediaValue(
    storedProfile?.logo_url,
    storedProfile?.logo,
    storedProfile?.logo_perusahaan,
    user?.logo_url,
    user?.logo,
    user?.logo_perusahaan,
    raw?.logo_url,
    raw?.logo,
    raw?.logo_perusahaan,
  );
}

function getCompanyInitials(name) {
  const words = String(name || "")
    .replace(/^pt\.?\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "CO";
  }

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [locale, setLocale] = useState(getSavedLanguage());
  const [isOpen, setIsOpen] = useState(false);
  const [companyMeta, setCompanyMeta] = useState(() => {
    const session = getAuthSession();
    return {
      displayName: resolveCompanyDisplayName(session),
      logo: resolveCompanyLogo(session),
    };
  });

  const isDashboard = location.pathname === "/admin/mitra/dashboard";
  const isLowongan = location.pathname.startsWith("/admin/mitra/lowongan");
  const isTalent =
    location.pathname.startsWith("/admin/mitra/talent") ||
    location.pathname.startsWith("/admin/mitra/tambah-kandidat");
  const isCompanyProfile = location.pathname.startsWith(
    "/admin/mitra/company-profile",
  );

  const isAllCandidates =
    location.pathname === "/admin/mitra/talent/semua-kandidat";
  const isShortlisted =
    location.pathname === "/admin/mitra/talent/kandidat-terpilih";

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutGrid,
      path: "/admin/mitra/dashboard",
      active: isDashboard,
    },
    {
      label: "Manajemen Lowongan",
      icon: BriefcaseBusiness,
      path: "/admin/mitra/lowongan",
      active: isLowongan,
    },
    {
      label: "Manajemen Talent",
      icon: Users,
      path: "/admin/mitra/talent/semua-kandidat",
      active: isTalent,
    },
    {
      label: "Profil Perusahaan",
      icon: Building2,
      path: "/admin/mitra/company-profile",
      active: isCompanyProfile,
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout backend gagal, sesi lokal tetap dibersihkan:", error);
    } finally {
      clearStoredCompanyProfile();
      clearAuthSession();
      navigate("/login", { replace: true });
    }
  };

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
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncSession = () => {
      const session = getAuthSession();
      setCompanyMeta({
        displayName: resolveCompanyDisplayName(session),
        logo: resolveCompanyLogo(session),
      });
    };

    window.addEventListener("auth-changed", syncSession);
    window.addEventListener("profileUpdated", syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("auth-changed", syncSession);
      window.removeEventListener("profileUpdated", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        <div>
          <div className="sidebar-brand">
            <div className="sidebar-logo-box">
              <img
                src="/Logo_Vocaseek.png"
                alt="Logo Vocaseek"
                className="sidebar-logo"
              />
            </div>

            <h1 className="sidebar-title">VOCASEEK</h1>
            <p className="sidebar-subtitle">COMPANY PORTAL</p>
          </div>

          <div className="sidebar-menu-heading">Menu Utama</div>

          <div className="sidebar-menu-list">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="sidebar-menu-group">
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className={`sidebar-menu-item ${item.active ? "active" : ""}`}
                  >
                    <Icon size={18} strokeWidth={2.1} />
                    <span className="sidebar-menu-text">
                      {translatePhrase(item.label, locale) || item.label}
                    </span>
                  </button>

                  {item.label === "Manajemen Talent" && item.active && (
                    <div className="sidebar-submenu">
                      <button
                        type="button"
                        onClick={() =>
                          handleNavigate("/admin/mitra/talent/semua-kandidat")
                        }
                        className={`sidebar-submenu-item ${
                          isAllCandidates ? "active" : ""
                        }`}
                      >
                        {translatePhrase("Semua Kandidat", locale) || "Semua Kandidat"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleNavigate(
                            "/admin/mitra/talent/kandidat-terpilih",
                          )
                        }
                        className={`sidebar-submenu-item ${
                          isShortlisted ? "active highlight" : ""
                        }`}
                      >
                        {translatePhrase("Kandidat Terpilih", locale) || "Kandidat Terpilih"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sidebar-footer">
            <div className="sidebar-footer-content">
            <div className="sidebar-avatar-box">
              {companyMeta.logo ? (
                <img
                  src={companyMeta.logo}
                  alt={companyMeta.displayName || "Company"}
                  className="sidebar-avatar"
                />
              ) : (
                <span className="sidebar-avatar-initials">
                  {getCompanyInitials(companyMeta.displayName)}
                </span>
              )}
            </div>

            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{companyMeta.displayName || "Company"}</p>
              <p className="sidebar-user-role">
                {translatePhrase("Company", locale) || "Company"}
              </p>
            </div>

            <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
