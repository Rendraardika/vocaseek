import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../styles/ProfilLayout.css";
import "../../styles/Pretest.css";
import AfterTest from "./AfterTest";
import {
  getShortEmail,
  readProfileFromStorage,
} from "../../components/user/ProfileStorage";
import { getApiErrorMessage, logoutUser } from "../../services/auth";
import { getInternTestQuestions, startInternTest } from "../../services/intern";
import { clearAuthSession } from "../../utils/authStorage";
import {
  getScopedItem,
  removeScopedItem,
  setScopedItem,
  USER_STORAGE_KEYS,
} from "../../utils/userScopedStorage";
import {
  PRETEST_DURATION_MS,
  PRETEST_STORAGE_KEYS,
} from "../../utils/pretestAssessment";

export default function Pretest() {
  const navigate = useNavigate();
  const [isTestCompleted, setIsTestCompleted] = useState(
    () => getScopedItem(USER_STORAGE_KEYS.pretestCompleted) === "true"
  );
  const [profile, setProfile] = useState(() => readProfileFromStorage());
  const [isStartingTest, setIsStartingTest] = useState(false);

  useEffect(() => {
    const syncProfile = () => {
      setProfile(readProfileFromStorage());
    };

    window.addEventListener("profile-updated", syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener("profile-updated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  useEffect(() => {
    if (!isTestCompleted) return;

    let isMounted = true;

    const verifyBackendPretestState = async () => {
      try {
        await getInternTestQuestions();

        if (!isMounted) return;

        removeScopedItem(USER_STORAGE_KEYS.pretestCompleted);
        removeScopedItem(USER_STORAGE_KEYS.pretestStartedAt);
        setIsTestCompleted(false);
      } catch (error) {
        if (!isMounted) return;

        const alreadyCompleted =
          error?.response?.data?.data?.already_completed ||
          String(error?.response?.data?.message || "")
            .toLowerCase()
            .includes("hanya dapat dikerjakan satu kali") ||
          String(error?.response?.data?.message || "")
            .toLowerCase()
            .includes("only be taken once");

        if (!alreadyCompleted) {
          removeScopedItem(USER_STORAGE_KEYS.pretestCompleted);
          removeScopedItem(USER_STORAGE_KEYS.pretestStartedAt);
          setIsTestCompleted(false);
        }
      }
    };

    verifyBackendPretestState();

    return () => {
      isMounted = false;
    };
  }, [isTestCompleted]);

  const shortEmail = useMemo(
    () => getShortEmail(profile.email),
    [profile.email],
  );

  if (isTestCompleted) {
    return <AfterTest />;
  }

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

  const handleStartAssessment = async () => {
    if (isStartingTest) return;

    setIsStartingTest(true);

    try {
      await startInternTest();

      const now = Date.now();
      const savedStartedAt = Number(getScopedItem(PRETEST_STORAGE_KEYS.startedAt));
      const hasRunningTimer =
        Number.isFinite(savedStartedAt) &&
        savedStartedAt > 0 &&
        now - savedStartedAt < PRETEST_DURATION_MS;

      if (!hasRunningTimer) {
        setScopedItem(PRETEST_STORAGE_KEYS.startedAt, String(now));
      }

      navigate("/soal/1");
    } catch (error) {
      window.alert(
        getApiErrorMessage(error, "Gagal memulai pre-test. Coba lagi sebentar."),
      );
    } finally {
      setIsStartingTest(false);
    }
  };

  return (
    <div className="profilePage pretestPage">
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
                  <img src="/home.png" alt="home" className="asideIconImg" />
                </span>
                <span className="asideLabel">Beranda</span>
              </NavLink>

              <div className="asideDivider" />

              <button
                className="asideLink danger"
                type="button"
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
          <div className="mainCard pretestMainCard">
            <div className="pretestInner">
              <div className="pretestTopIcon" aria-hidden="true">
                <div className="pretestDoc" />
                <div className="pretestCheck">✓</div>
              </div>

              <h1 className="pretestTitle">
                <span className="pretestTitleBlack">Online Assessment:</span>
                <br />
                <span className="pretestTitleGold">Pre-Test</span>
              </h1>

              <p className="pretestDesc">
                Ukur potensi dan kesiapan karirmu melalui asesmen komprehensif
                Vocaseek. Hasil tes akan menjadi poin plus untuk profil magangmu
                dan membantu kami mencocokkanmu dengan posisi yang tepat.
              </p>

              <div className="pretestStats">
                <div className="pretestStatCard">
                  <div className="pretestStatIcon">▦</div>
                  <div className="pretestStatLabel">TOTAL SOAL</div>
                  <div className="pretestStatValue">20</div>
                </div>

                <div className="pretestStatCard">
                  <div className="pretestStatIcon">◷</div>
                  <div className="pretestStatLabel">ESTIMASI WAKTU</div>
                  <div className="pretestStatValue">
                    30<span className="pretestStatUnit">Min</span>
                  </div>
                </div>
              </div>

              <button
                className="pretestCta"
                type="button"
                onClick={handleStartAssessment}
                disabled={isStartingTest}
              >
                <span>{isStartingTest ? "Memulai..." : "Mulai Asesmen"}</span>
                <span className="pretestCtaArrow" aria-hidden="true">
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
