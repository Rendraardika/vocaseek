import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../styles/ProfilLayout.css";
import "../../styles/StatusLamaran.css";
import {
  defaultProfile,
  getShortEmail,
  readProfileFromStorage,
} from "../../components/user/ProfileStorage";
import { logoutUser } from "../../services/auth";
import { clearAuthSession } from "../../utils/authStorage";
import { getInternApplications } from "../../services/intern";
import {
  getScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";
import {
  extractApplicationCollection,
  mapAppliedJobFromApplication,
} from "../../utils/applicationStatus";

export default function StatusLamaran() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(defaultProfile);

  useEffect(() => {
    setScopedItem(USER_STORAGE_KEYS.statusViewed, "true");
    window.dispatchEvent(new Event("career-journey-updated"));
  }, []);

  useEffect(() => {
    const syncProfile = () => {
      setProfile(readProfileFromStorage());
    };

    syncProfile();
    window.addEventListener("profile-updated", syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener("profile-updated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  const shortEmail = useMemo(
    () => getShortEmail(profile.email),
    [profile.email],
  );

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

  useEffect(() => {
    const syncApplicationState = async () => {
      try {
        const response = await getInternApplications();
        const applications = extractApplicationCollection(response?.data);
        const latestApplication = applications[0];

        if (latestApplication) {
          const savedAppliedJob = getScopedItem(USER_STORAGE_KEYS.appliedJob);
          const parsedAppliedJob = savedAppliedJob
            ? JSON.parse(savedAppliedJob)
            : {};
          const normalizedAppliedJob = mapAppliedJobFromApplication(
            latestApplication,
            parsedAppliedJob,
          );

          setScopedItem(
            USER_STORAGE_KEYS.appliedJob,
            JSON.stringify(normalizedAppliedJob),
          );
          navigate("/histori-lamaran", { replace: true });
          return;
        }
      } catch (error) {
        console.error("Gagal membaca data lamaran dari backend:", error);
      }

      try {
        const savedAppliedJob = getScopedItem(USER_STORAGE_KEYS.appliedJob);

        if (!savedAppliedJob) return;

        const parsedAppliedJob = JSON.parse(savedAppliedJob);
        const hasAppliedJob = parsedAppliedJob && parsedAppliedJob.id;

        if (hasAppliedJob) {
          navigate("/histori-lamaran", { replace: true });
        }
      } catch (error) {
        console.error("Gagal membaca data lamaran aktif:", error);
      }
    };

    syncApplicationState();
  }, [navigate]);

  return (
    <div className="profilePage statusPage">
      <header className="profileHeader">
        <div className="headerContainer">
          <div className="headerLeft">
            <div className="logoWrap">
              <img
                src="/vocaseeklogo.png"
                alt="Vocaseek Logo"
                className="logoImage"
              />
            </div>
          </div>

          <div className="headerRight">
            <button className="userPill" type="button">
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt="Foto Profil"
                  className="userAvatarImage"
                />
              ) : (
                <span className="userAvatar" aria-hidden="true" />
              )}
              <span className="userName">{profile.fullName || ""}</span>
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
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt="Foto Profil"
                      className="asideAvatarImage"
                    />
                  ) : (
                    <div className="asideAvatar" aria-hidden="true" />
                  )}
                  <div className="asideOnlineDot" aria-hidden="true" />
                </div>

                <div className="asideMeta">
                  <div className="asideName">{profile.fullName || ""}</div>
                  <div className="asideEmail">{shortEmail}</div>
                </div>
              </div>
            </div>

            <nav className="asideNav" aria-label="Sidebar Navigation">
              <NavLink
                to="/profil"
                end
                className={({ isActive }) =>
                  `asideLink ${isActive ? "isActive" : ""}`
                }
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
                  <img src="/home.png" alt="Beranda" className="asideIconImg" />
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
          <div className="mainCard statusMainCard">
            <div className="statusHeaderRow">
              <div className="statusHeaderText">
                <h1 className="statusTitle">Status Lamaran</h1>
                <p className="statusSubtitle">
                  Pantau semua aktivitas lamaran Anda di berbagai mitra
                  perusahaan pilihan Vocaseek secara real-time.
                </p>
              </div>
            </div>

            <div className="statusFilterRow">
              <button className="statusFilterChip isActive" type="button">
                Semua
              </button>
            </div>

            <div className="statusDivider" />

            <div className="statusEmptyWrap">
              <div className="statusEmptyIconWrap" aria-hidden="true">
                <div className="statusBriefcase" />
                <div className="statusMiniSearch" />
              </div>

              <h2 className="statusEmptyTitle">Belum Ada Lamaran Aktif</h2>
              <p className="statusEmptyDesc">
                Sepertinya kamu belum mendaftar ke lowongan manapun. Mulai cari
                kesempatan karir terbaikmu hari ini!
              </p>

              <button
                className="statusCtaBtn"
                type="button"
                onClick={() => navigate("/searchlowongan")}
              >
                <span>Cari Lowongan Sekarang</span>
                <span className="statusCtaArrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
