import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../styles/ProfilLayout.css";
import { logoutUser } from "../../services/auth";
import { clearAuthSession } from "../../utils/authStorage";
import { normalizeAssetUrl } from "../../utils/media";
import {
  getScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";

const defaultProfile = {
  photo: "",
  fullName: "",
  email: "",
};

export default function ProfilLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;

  const isAkademik =
    pathname.includes("data-akademik");
  const isDokumen = pathname.includes("dokumen");
  const isTampilanProfil = pathname.includes("/profil/tampilan");
  const isProfilGroup = pathname.startsWith("/profil");
  const isDataPribadiTab =
    pathname === "/profil" || pathname === "/profil/tampilan";

  const readSavedProfile = () => {
    try {
      const saved = getScopedItem(USER_STORAGE_KEYS.dataDiri);
      if (!saved) return defaultProfile;

      const parsed = JSON.parse(saved);
      return {
        photo: parsed?.photo || "",
        fullName: parsed?.fullName || "",
        email: parsed?.email || "",
      };
    } catch (error) {
      console.error("Gagal membaca profil dari localStorage:", error);
      return defaultProfile;
    }
  };

  const readSavedAkademik = () => {
    try {
      const saved = getScopedItem(USER_STORAGE_KEYS.akademik);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      const pendidikan = parsed?.pendidikan || {};
      const pengalaman = Array.isArray(parsed?.pengalaman)
        ? parsed.pengalaman
        : [];
      const sertifikasi = Array.isArray(parsed?.sertifikasi)
        ? parsed.sertifikasi
        : [];

      const hasAkademikData = Boolean(
        pendidikan.institusi ||
          pendidikan.jurusan ||
          pendidikan.ipk ||
          pendidikan.tahunLulus ||
          pendidikan.semester ||
          pendidikan.documentName ||
          pengalaman.length > 0 ||
          sertifikasi.length > 0,
      );

      return hasAkademikData ? parsed : null;
    } catch (error) {
      console.error("Gagal membaca data akademik dari localStorage:", error);
      return null;
    }
  };

  const [savedProfile, setSavedProfile] = useState(() => readSavedProfile());
  const [savedAkademik, setSavedAkademik] = useState(() => readSavedAkademik());
  const [isHeaderPhotoBroken, setIsHeaderPhotoBroken] = useState(false);
  const [isAsidePhotoBroken, setIsAsidePhotoBroken] = useState(false);

  useEffect(() => {
    const handleProfileUpdated = () => {
      setSavedProfile(readSavedProfile());
      setSavedAkademik(readSavedAkademik());
    };

    window.addEventListener("profile-updated", handleProfileUpdated);
    window.addEventListener("akademik-updated", handleProfileUpdated);
    window.addEventListener("career-journey-updated", handleProfileUpdated);
    window.addEventListener("storage", handleProfileUpdated);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated);
      window.removeEventListener("akademik-updated", handleProfileUpdated);
      window.removeEventListener("career-journey-updated", handleProfileUpdated);
      window.removeEventListener("storage", handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    setIsHeaderPhotoBroken(false);
    setIsAsidePhotoBroken(false);
  }, [savedProfile.photo]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout backend gagal, sesi lokal tetap dibersihkan:", error);
    } finally {
      clearAuthSession();
      navigate("/login");
    }
  };

  const displayName = useMemo(() => {
    return savedProfile.fullName?.trim() || "";
  }, [savedProfile.fullName]);

  const displayEmail = useMemo(() => {
    return savedProfile.email?.trim() || "";
  }, [savedProfile.email]);

  const shortEmail = useMemo(() => {
    if (!displayEmail) return "";
    return displayEmail.length > 18
      ? `${displayEmail.slice(0, 18)}...`
      : displayEmail;
  }, [displayEmail]);

  const normalizedPhoto = useMemo(() => {
    return normalizeAssetUrl(savedProfile.photo);
  }, [savedProfile.photo]);

  const hasSavedProfile = useMemo(() => {
    return Boolean(
      savedProfile.fullName?.trim() ||
        savedProfile.email?.trim() ||
        savedProfile.photo?.trim()
    );
  }, [savedProfile]);

  const isEditMode =
    getScopedItem(USER_STORAGE_KEYS.dataDiriEditMode) === "true";
  const isAkademikEditMode =
    getScopedItem(USER_STORAGE_KEYS.akademikEditMode) === "true";

  const dataPribadiPath = hasSavedProfile && !isEditMode ? "tampilan" : "";
  const dataAkademikPath =
    savedAkademik && !isAkademikEditMode
      ? "data-akademik/simpan"
      : "data-akademik";

  const clearBrokenPhoto = () => {
    setSavedProfile((prev) => {
      const nextProfile = {
        ...prev,
        photo: "",
      };

      setScopedItem(USER_STORAGE_KEYS.dataDiri, JSON.stringify(nextProfile));
      return nextProfile;
    });
  };

  return (
    <div className="profilePage">
      <header className="profileHeader">
        <div className="headerContainer">
          <div className="headerLeft">
            <div className="logoWrap">
              <img
                src="/vocaseeklogo.png"
                alt="logo vocaseek"
                className="logoImage"
              />
            </div>
          </div>

          <div className="headerRight">
            <button className="userPill" type="button">
              {normalizedPhoto && !isHeaderPhotoBroken ? (
                <img
                  src={normalizedPhoto}
                  alt="Foto Profil"
                  className="userAvatarImage"
                  onError={() => {
                    setIsHeaderPhotoBroken(true);
                    clearBrokenPhoto();
                  }}
                />
              ) : (
                <span className="userAvatar" aria-hidden="true" />
              )}

              <span className="userName">{displayName || "User"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="pageContainer">
        <aside className="aside">
          <div className="asideInner">
            <div className="asideCard">
              <div className="asideOverlay" aria-hidden="true" />
              <div className="asideCardRow">
                <div className="asideAvatarWrap">
                  {normalizedPhoto && !isAsidePhotoBroken ? (
                    <img
                      src={normalizedPhoto}
                      alt="Foto Profil"
                      className="asideAvatarImage"
                      onError={() => {
                        setIsAsidePhotoBroken(true);
                        clearBrokenPhoto();
                      }}
                    />
                  ) : (
                    <div className="asideAvatar" aria-hidden="true" />
                  )}

                  <div className="asideOnlineDot" aria-hidden="true" />
                </div>

                <div className="asideMeta">
                  <div className="asideName">{displayName || "Nama Pengguna"}</div>
                  <div className="asideEmail">{shortEmail || "email@domain.com"}</div>
                </div>
              </div>
            </div>

            <nav className="asideNav" aria-label="Sidebar Navigation">
              <NavLink
                to="/profil"
                end={false}
                className={() => `asideLink ${isProfilGroup ? "isActive" : ""}`}
              >
                <span className="asideIcon" aria-hidden="true">
                  <img src="/CV.png" alt="CV" className="asideIconImg" />
                </span>
                <span className="asideLabel">Curriculum Vitae</span>
              </NavLink>

              <NavLink
                to="/status-lamaran"
                className={({ isActive }) =>
                  `asideLink ${isActive ? "isActive" : ""}`
                }
              >
                <span className="asideIcon" aria-hidden="true">
                  <img
                    src="/StatusLamaran.png"
                    alt="Status Lamaran"
                    className="asideIconImg"
                  />
                </span>
                <span className="asideLabel">Status Lamaran</span>
              </NavLink>

              <NavLink
                to="/pretest"
                className={({ isActive }) =>
                  `asideLink ${isActive ? "isActive" : ""}`
                }
              >
                <span className="asideIcon" aria-hidden="true">
                  <img
                    src="/Pretest.png"
                    alt="Pre-Test"
                    className="asideIconImg"
                  />
                </span>
                <span className="asideLabel">Pre-Test</span>
              </NavLink>

              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `asideLink ${isActive ? "isActive" : ""}`
                }
              >
                <span className="asideIcon" aria-hidden="true">
                  <img
                    src="/home.png"
                    alt="home"
                    className="asideIconImg"
                  />
                </span>
                <span className="asideLabel">Beranda</span>
              </NavLink>

              <div className="asideDivider" />

              <button
                type="button"
                className="asideLink"
                onClick={handleLogout}
              >
                <span className="asideIcon" aria-hidden="true">
                  <img
                    src="/Keluar.png"
                    alt="Keluar"
                    className="asideIconImg"
                  />
                </span>
                <span className="asideLabel">Keluar</span>
              </button>
            </nav>
          </div>
        </aside>

        <main className="main">
          <div className="mainCard">
            <div className="tabsBar">
              <NavLink
                to={dataPribadiPath}
                end={dataPribadiPath === ""}
                className={() =>
                  `tabBtn ${isDataPribadiTab ? "tabActive" : ""}`
                }
              >
                Data Pribadi
              </NavLink>

              <NavLink
                to={dataAkademikPath}
                className={() => `tabBtn ${isAkademik ? "tabActive" : ""}`}
              >
                Data Akademik
              </NavLink>

              <NavLink
                to="dokumen"
                className={() => `tabBtn ${isDokumen ? "tabActive" : ""}`}
              >
                Dokumen
              </NavLink>
            </div>

            <div className="mainInner">
              {!isTampilanProfil && !pathname.includes("/profil/data-akademik/simpan") && (
                <p className="hintText">
                  Pastikan data pribadi benar untuk mempermudah proses
                  pendaftaran program Vocaseek.
                </p>
              )}

              <Outlet />

              {!isAkademik && !isDokumen && !isTampilanProfil && (
                <div className="actionsRow">
                  <button
                    className="saveBtn"
                    type="submit"
                    form="dataDiriForm"
                    name="action"
                    value="save"
                  >
                    Simpan Perubahan
                  </button>

                  <button
                    className="deleteBtn"
                    type="submit"
                    form="dataDiriForm"
                    name="action"
                    value="reset"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
