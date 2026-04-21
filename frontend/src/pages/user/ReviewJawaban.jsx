import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../styles/ProfilLayout.css";
import "../../styles/StatusLamaran.css";
import "../../styles/ReviewJawaban.css";
import { defaultProfile, getShortEmail, readProfileFromStorage } from "../../components/user/ProfileStorage";
import { getPretestReviewList } from "../../utils/pretestAssessment";
import { logoutUser } from "../../services/auth";
import { clearAuthSession } from "../../utils/authStorage";

export default function ReviewJawaban() {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(4);
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

  const shortEmail = useMemo(() => getShortEmail(profile.email), [profile.email]);

  const reviewList = useMemo(() => getPretestReviewList(), []);

  const visibleQuestions = reviewList.slice(0, visibleCount);
  const remaining = Math.max(reviewList.length - visibleCount, 0);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 4, reviewList.length));
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
    <div className="profilePage statusPage reviewJawabanPage">
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
                  <img
                    src="/home.png"
                    alt="Beranda"
                    className="asideIconImg"
                  />
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
          <div className="mainCard pretestMainCard reviewMainCard">
            <div className="reviewHeader">
              <div className="reviewHeaderIcon" aria-hidden="true">
                <div className="reviewHeaderClipboard" />
              </div>

              <div className="reviewHeaderText">
                <h1 className="reviewTitle">Review Jawaban</h1>
                <p className="reviewSubtitle">
                  Detail tanggapan untuk setiap pertanyaan assessment
                </p>
              </div>
            </div>

            <div className="reviewDivider" />

            <div className="reviewList">
              {visibleQuestions.map((item) => (
                <div className="reviewQuestionCard" key={item.no}>
                  <div className="reviewQuestionTop">
                    <div className="reviewQuestionNumber">{item.no}</div>
                    <h2 className="reviewQuestionText">{item.pertanyaan}</h2>
                  </div>

                  <div className="reviewAnswerRow">
                    <div
                      className={`reviewAnswerBox ${
                        item.pilihan !== "Belum dijawab" ? "selected" : ""
                      }`}
                    >
                      <div className="reviewAnswerLabel">PILIHAN TERPILIH</div>
                      <div className="reviewAnswerValue">{item.pilihan}</div>
                      {item.pilihan !== "Belum dijawab" && (
                        <div className="reviewCheckMark">✓</div>
                      )}
                    </div>

                    <div className="reviewAnswerBox">
                      <div className="reviewAnswerLabel muted">
                        OPSI LAINNYA
                      </div>
                      <div className="reviewAnswerValue mutedText">
                        {item.opsiLain}
                      </div>
                    </div>
                  </div>

                  <div className="reviewQuestionBottomLine" />
                </div>
              ))}
            </div>

            {remaining > 0 && (
              <div className="reviewLoadMoreWrap">
                <button
                  type="button"
                  className="reviewLoadMoreBtn"
                  onClick={handleLoadMore}
                >
                  <span>Load {Math.min(4, remaining)} More Questions</span>
                  <span className="reviewLoadMoreIcon">⌄</span>
                </button>
              </div>
            )}

            {reviewList.length === 0 && (
              <div className="reviewLoadMoreWrap">
                <p className="reviewSubtitle">Belum ada data jawaban pretest.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
