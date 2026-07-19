import "../../styles/Sidebar.css";
import {
  LayoutGrid,
  BriefcaseBusiness,
  Users,
  Handshake,
  UserCog,
  BadgeCheck,
  User,
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
  clearStoredAdminProfile,
  getStoredAdminProfile,
} from "../../utils/profileStorage";

function isMasterRole(value) {
  const normalized = String(value || "").toLowerCase();
  return normalized.includes("super") || normalized.includes("master");
}

function resolveMasterProfile() {
  const session = getAuthSession();
  const savedProfile = getStoredAdminProfile();
  const user = session?.user || {};
  const raw = session?.raw || {};
  const sessionName =
    user?.nama ||
    user?.name ||
    raw?.nama ||
    raw?.name ||
    "";
  const sessionImage =
    pickFirstMediaValue(
      user?.foto,
      user?.photo,
      user?.avatar,
      raw?.foto,
      raw?.photo,
      raw?.avatar,
    ) || "";

  return {
    fullName:
      sessionName ||
      (isMasterRole(savedProfile.role) ? savedProfile.fullName || "" : ""),
    profileImage:
      sessionImage ||
      (isMasterRole(savedProfile.role)
        ? pickFirstMediaValue(savedProfile.profileImage)
        : ""),
  };
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [savedProfile, setSavedProfile] = useState(() => resolveMasterProfile());

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutGrid,
      path: "/admin/dashboard",
      active: location.pathname === "/admin/dashboard",
    },
    {
      label: "Talent Management",
      icon: Users,
      path: "/admin/talent-management",
      active: location.pathname.startsWith("/admin/talent-management"),
    },
    {
      label: "Partners",
      icon: Handshake,
      path: "/admin/partners",
      active: location.pathname.startsWith("/admin/partners"),
    },
    {
      label: "Lowongan",
      icon: BriefcaseBusiness,
      path: "/admin/lowongan",
      active: location.pathname.startsWith("/admin/lowongan"),
    },
    {
      label: "User Management",
      icon: UserCog,
      path: "/admin/user-management",
      active: location.pathname.startsWith("/admin/user-management"),
    },
    {
      label: "Verifikasi Perusahaan",
      icon: BadgeCheck,
      path: "/admin/verifikasi-perusahaan",
      active: location.pathname.startsWith("/admin/verifikasi-perusahaan"),
    },
    {
      label: "Profil",
      icon: User,
      path: "/admin/profil",
      active: location.pathname.startsWith("/admin/profil"),
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const roleLabel = "ADMIN MASTER";

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout backend gagal, sesi lokal tetap dibersihkan:", error);
    } finally {
      clearStoredAdminProfile("super_admin");
      clearAuthSession();
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setSavedProfile(resolveMasterProfile());
    };

    const handleAuthChange = () => {
      setSavedProfile(resolveMasterProfile());
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
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
            <p className="sidebar-subtitle">ADMIN MASTER</p>
          </div>

          <div className="sidebar-menu-heading">Core Menu</div>

          <div className="sidebar-menu-list">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className={`sidebar-menu-item ${item.active ? "active" : ""}`}
                >
                  <Icon size={18} strokeWidth={2.1} />
                  <span className="sidebar-menu-text">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <div className="sidebar-avatar-box">
              {savedProfile.profileImage ? (
                <img
                  src={savedProfile.profileImage}
                  alt={savedProfile.fullName || "Admin Vocaseek"}
                  className="sidebar-avatar"
                />
              ) : (
                <div className="sidebar-avatar sidebar-avatar-placeholder">
                  <User size={20} />
                </div>
              )}
            </div>

            <div className="sidebar-user-info">
              <p className="sidebar-user-name">
                {savedProfile.fullName || "Admin Vocaseek"}
              </p>
              <p className="sidebar-user-role">
                {roleLabel}
              </p>
            </div>

            <button
              type="button"
              className="sidebar-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
