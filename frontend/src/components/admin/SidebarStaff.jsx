import "../../styles/Sidebar.css";
import {
  LayoutGrid,
  BriefcaseBusiness,
  Users,
  Handshake,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage, logoutUser } from "../../services/auth";
import { getAdminProfile } from "../../services/admin";
import { clearAuthSession, getAuthSession } from "../../utils/authStorage";
import { pickFirstMediaValue } from "../../utils/media";
import {
  clearStoredAdminProfile,
  getStoredAdminProfile,
  setStoredAdminProfile,
} from "../../utils/profileStorage";

function getStoredStaffProfile() {
  return getStoredAdminProfile("staff_admin");
}

function resolveStaffProfile() {
  const session = getAuthSession();
  const savedProfile = getStoredStaffProfile();
  const user = session?.user || {};
  const raw = session?.raw || {};

  return {
    fullName:
      savedProfile.fullName ||
      user?.nama ||
      user?.name ||
      raw?.nama ||
      raw?.name ||
      "",
    profileImage:
      pickFirstMediaValue(
        savedProfile.profileImage,
        user?.foto,
        user?.photo,
        user?.avatar,
        raw?.foto,
        raw?.photo,
        raw?.avatar,
      ) ||
      "",
  };
}

function normalizeStaffProfile(payload) {
  const source = payload?.data?.data || payload?.data || payload || {};

  return {
    fullName: source?.nama || source?.name || "",
    profileImage: pickFirstMediaValue(
      source?.foto,
      source?.photo,
      source?.avatar,
      source?.profile_photo,
      source?.photo_url,
      source?.avatar_url,
    ),
  };
}

function syncStaffProfileStorage(profile) {
  setStoredAdminProfile(
    {
      ...profile,
      role: "STAFF ADMIN",
    },
    "staff_admin",
  );
  window.dispatchEvent(new Event("profileUpdated"));
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState(() => resolveStaffProfile());

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutGrid,
      path: "/admin/staff/dashboard",
      active: location.pathname.startsWith("/admin/staff/dashboard"),
    },
    {
      label: "Talent Management",
      icon: Users,
      path: "/admin/staff/talent-management",
      active: location.pathname.startsWith("/admin/staff/talent-management"),
    },
    {
      label: "Partners",
      icon: Handshake,
      path: "/admin/staff/partners",
      active: location.pathname.startsWith("/admin/staff/partners"),
    },
    {
      label: "Lowongan",
      icon: BriefcaseBusiness,
      path: "/admin/staff/lowongan",
      active: location.pathname.startsWith("/admin/staff/lowongan"),
    },
    {
      label: "Profil",
      icon: User,
      path: "/admin/staff/profil",
      active: location.pathname.startsWith("/admin/staff/profil"),
    },
  ];

  const loadProfileFromStorage = () => {
    try {
      setProfileData(resolveStaffProfile());
    } catch (error) {
      console.error("Gagal membaca profile dari localStorage:", error);
      setProfileData({
        fullName: "",
        profileImage: "",
      });
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const roleLabel = "STAFF ADMIN";

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout backend gagal, sesi lokal tetap dibersihkan:", error);
    } finally {
      clearAuthSession();
      clearStoredAdminProfile("staff_admin");
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    setIsOpen(false);
    loadProfileFromStorage();
  }, [location.pathname]);

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
      loadProfileFromStorage();
    };

    const handleAuthChange = () => {
      loadProfileFromStorage();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const shouldLoadProfile = !profileData.fullName;

    if (!shouldLoadProfile) {
      return undefined;
    }

    let isMounted = true;

    const loadStaffProfile = async () => {
      try {
        const response = await getAdminProfile();
        const normalizedProfile = normalizeStaffProfile(response);

        if (!isMounted || !normalizedProfile.fullName) {
          return;
        }

        setProfileData(normalizedProfile);
        syncStaffProfileStorage(normalizedProfile);
      } catch (error) {
        console.error(
          getApiErrorMessage(error, "Gagal memuat profil staff admin untuk sidebar."),
        );
      }
    };

    loadStaffProfile();

    return () => {
      isMounted = false;
    };
  }, [profileData.fullName]);

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
            <p className="sidebar-subtitle">STAFF ADMIN</p>
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
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt={profileData.fullName || "Admin"}
                  className="sidebar-avatar"
                />
              ) : (
                <div className="sidebar-avatar-placeholder">
                  <User size={18} />
                </div>
              )}
            </div>

            <div className="sidebar-user-info">
              <p className="sidebar-user-name">
                {profileData.fullName || "Memuat nama..."}
              </p>
              <p className="sidebar-user-role">{roleLabel}</p>
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
