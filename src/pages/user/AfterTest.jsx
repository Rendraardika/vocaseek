import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../styles/ProfilLayout.css";
import "../../styles/AfterTest.css";
import {
  defaultProfile,
  getShortEmail,
  readProfileFromStorage,
} from "../../components/user/ProfileStorage";
import { logoutUser } from "../../services/auth";
import { clearAuthSession } from "../../utils/authStorage";

export default function AfterTest() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(defaultProfile);

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

  const handleReviewJawaban = () => {
    navigate("/review-jawaban");
  };

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

  return (
    <div className="profilePage aftertestPage">
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
          <div className="mainCard aftertestMainCard">
            <div className="aftertestInner">
              <div className="aftertestTopIcon" aria-hidden="true">
                <div className="aftertestDoc" />
                <div className="aftertestCheck">✓</div>
              </div>

              <h1 className="aftertestTitle">
                <span className="aftertestTitleBlack">Online Assessment:</span>
                <br />
                <span className="aftertestTitleGold">Pre-Test</span>
              </h1>

              <p className="aftertestDesc">
                Terima kasih telah melaksanakan ukur potensi dan kesiapan
                karirmu melalui asesmen komprehensif <strong>Vocaseek</strong>.
                <br />
                Hasil tes akan menjadi poin plus untuk profil magangmu dan
                membantu kami mencocokkanmu dengan posisi yang tepat.
              </p>

              <button
                className="aftertestCta"
                type="button"
                onClick={handleReviewJawaban}
              >
                Review Jawaban
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
