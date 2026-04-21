import "../../styles/beranda.css";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FaUserPlus,
  FaFileUpload,
  FaSearch,
  FaPaperPlane,
  FaPaintBrush,
  FaCode,
  FaBullhorn,
  FaVideo,
  FaMusic,
  FaChartBar,
  FaStethoscope,
  FaBrain,
  FaBriefcase,
  FaBuilding,
  FaUsers,
  FaBolt,
} from "react-icons/fa";
import { FaMapMarkerAlt, FaMoneyBillWave, FaRegClock } from "react-icons/fa";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="beranda-page user-nav-shell">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-inner">
          <div className="nav-left">
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
          </div>

          <nav className={`nav ${menuOpen ? "show" : ""}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Beranda</NavLink>
          <NavLink to="/lowongan" onClick={() => setMenuOpen(false)}>Lowongan</NavLink>
          <NavLink to="/mitra" onClick={() => setMenuOpen(false)}>Mitra</NavLink>
          <NavLink to="/kontak" onClick={() => setMenuOpen(false)}>Kontak</NavLink>

          <Link
            to="/login"
            className="mobile-login"
            onClick={() => setMenuOpen(false)}
          >
            Masuk
          </Link>
        </nav>

        <Link to="/login" className="btn-login">
          Masuk
        </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-container">
          {/* LEFT */}
          <div className="hero-left">
            <h1>
              Temukan pekerjaan <br />
              sesuai <span>skill kalian!</span>
            </h1>

            <p>
              Platform pencarian kerja modern untuk membantu kamu mendapatkan
              pekerjaan impian lebih cepat.
            </p>
          </div>

          {/* RIGHT */}
          <div className="hero-right">
            <div className="hero-img-wrapper">
              <img src="beranda1.webp" alt="Hero" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="home-stats">
        <div className="home-stats-grid">
          <div className="home-stats-card">
            <div className="home-stats-icon">
              <FaBriefcase />
            </div>
            <h3>1,75,324</h3>
            <p>Lowongan</p>
          </div>

          <div className="home-stats-card">
            <div className="home-stats-icon">
              <FaBuilding />
            </div>
            <h3>97,354</h3>
            <p>Perusahaan</p>
          </div>

          <div className="home-stats-card">
            <div className="home-stats-icon">
              <FaUsers />
            </div>
            <h3>38,475</h3>
            <p>Kandidat</p>
          </div>

          <div className="home-stats-card">
            <div className="home-stats-icon">
              <FaBolt />
            </div>
            <h3>7,532</h3>
            <p>Lowongan Baru</p>
          </div>
        </div>
      </section>

      {/* POPULAR */}
      <section className="popular">
        <h2>Most Popular Vacancies</h2>

        <div className="popular-grid">
          <div className="popular-item">
            <h4>Anesthesiologists</h4>
            <p>45,904 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>Surgeons</h4>
            <p>50,364 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>Obstetricians-Gynecologists</h4>
            <p>4,339 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>Orthodontists</h4>
            <p>20,079 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>Maxillofacial Surgeons</h4>
            <p>74,875 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>Software Developer</h4>
            <p>43,359 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>Psychiatrists</h4>
            <p>18,599 Open Positions</p>
          </div>

          <div className="popular-item active">
            <h4>Data Scientist</h4>
            <p>28,200 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>Financial Manager</h4>
            <p>61,391 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>Management Analysis</h4>
            <p>93,046 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>IT Manager</h4>
            <p>50,963 Open Positions</p>
          </div>

          <div className="popular-item">
            <h4>Operations Research Analysis</h4>
            <p>16,627 Open Positions</p>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="steps-section">
        <h2>Langkah Kerja</h2>

        <div className="steps-panel">
          <div className="steps-container">
            <div className="step">
              <div className="step-icon">
                <FaUserPlus />
              </div>
              <h3>Create account</h3>
              <p>Daftar dan lengkapi profil kamu.</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <FaFileUpload />
              </div>
              <h3>Upload CV/Resume</h3>
              <p>Unggah CV terbaikmu.</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <FaSearch />
              </div>
              <h3>Find suitable job</h3>
              <p>Pilih pekerjaan sesuai minat.</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <FaPaperPlane />
              </div>
              <h3>Apply job</h3>
              <p>Lamar pekerjaan dengan mudah.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="category-section">
        <div className="category-header">
          <h2>Bidang Kategori</h2>
          <Link to="/login" className="view-all">
            Tampilkan semua →
          </Link>
        </div>

        <div className="category-grid">
          <div className="category-card">
            <div className="category-icon">
              <FaPaintBrush />
            </div>
            <h3>Graphics & Design</h3>
            <p>357 Open position</p>
          </div>

          <div className="category-card">
            <div className="category-icon">
              <FaCode />
            </div>
            <h3>Code & Programming</h3>
            <p>312 Open position</p>
          </div>

          <div className="category-card">
            <div className="category-icon">
              <FaBullhorn />
            </div>
            <h3>Digital Marketing</h3>
            <p>297 Open position</p>
          </div>

          <div className="category-card">
            <div className="category-icon">
              <FaVideo />
            </div>
            <h3>Video & Animation</h3>
            <p>247 Open position</p>
          </div>

          <div className="category-card">
            <div className="category-icon">
              <FaMusic />
            </div>
            <h3>Music & Audio</h3>
            <p>204 Open position</p>
          </div>

          <div className="category-card">
            <div className="category-icon">
              <FaChartBar />
            </div>
            <h3>Account & Finance</h3>
            <p>167 Open position</p>
          </div>

          <div className="category-card">
            <div className="category-icon">
              <FaStethoscope />
            </div>
            <h3>Health & Care</h3>
            <p>125 Open position</p>
          </div>

          <div className="category-card">
            <div className="category-icon">
              <FaBrain />
            </div>
            <h3>Data & Science</h3>
            <p>57 Open position</p>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-header">
          <h2>Featured Job</h2>
          <button className="view-all">View All →</button>
        </div>

        <div className="job-list">
          {/* JOB 1 */}
          <div className="job-card">
            <div className="job-left">
              <div className="company-logo green">Up</div>

              <div className="job-info">
                <div className="job-title-row">
                  <h3>Senior UX Designer</h3>
                  <span className="badge contract">Contract Base</span>
                </div>

                <div className="job-meta">
                  <span>
                    <FaMapMarkerAlt /> Jakarta
                  </span>
                  <span>
                    <FaMoneyBillWave /> $5K
                  </span>
                  <span>
                    <FaRegClock /> 2 Days ago
                  </span>
                </div>
              </div>
            </div>

            <Link to="/login">
              <button className="apply-btn">Gabung Sekarang! →</button>
            </Link>
          </div>

          {/* JOB 2 */}
          <div className="job-card">
            <div className="job-left">
              <div className="company-logo dark"></div>

              <div className="job-info">
                <div className="job-title-row">
                  <h3>Software Engineer</h3>
                  <span className="badge fulltime">Full Time</span>
                </div>

                <div className="job-meta">
                  <span>
                    <FaMapMarkerAlt /> Jakarta
                  </span>
                  <span>
                    <FaMoneyBillWave /> $6K
                  </span>
                  <span>
                    <FaRegClock /> 1 Day ago
                  </span>
                </div>
              </div>
            </div>

            <button className="apply-btn">Gabung Sekarang! →</button>
          </div>

          {/* JOB 3 */}
          <div className="job-card">
            <div className="job-left">
              <div className="company-logo pink">F</div>

              <div className="job-info">
                <div className="job-title-row">
                  <h3>Junior Graphic Designer</h3>
                  <span className="badge fulltime">Full Time</span>
                </div>

                <div className="job-meta">
                  <span>
                    <FaMapMarkerAlt /> Remote
                  </span>
                  <span>
                    <FaMoneyBillWave /> $3K
                  </span>
                  <span>
                    <FaRegClock /> 3 Days ago
                  </span>
                </div>
              </div>
            </div>

            <button className="apply-btn">Gabung sekarang! →</button>
          </div>
        </div>
      </section>
      {/* CTA */}
      <section className="cta">
        <div className="cta-container">
          <div className="cta-card candidate">
            <h3>Jadilah Kandidat!</h3>
            <p>
              Kamu bisa menjadi salah satu kandidat terpilih Vocaseek. Cobalah
              mendaftar segera!
            </p>
            <Link to="/login" className="cta-btn">
              Daftar Sekarang →
            </Link>
          </div>

          <div className="cta-card employer">
            <h3>Gabung Menjadi Mitra</h3>
            <p>
              Calon mitra yang mendaftar, dipersilahkan untuk segera mendaftar
              sesuai ketentuan yang tertera!
            </p>
            <Link to="/login" className="cta-btn">
              Daftar Sekarang →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          {/* LEFT */}
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

          {/* RIGHT */}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill={"currentColor"}
                  viewBox={"0 0 24 24"}
                >
                  {/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 2v.51l-8 6.22-8-6.22V6zM4 18V9.04l7.39 5.74c.18.14.4.21.61.21s.43-.07.61-.21L20 9.03v8.96H4Z"></path>
                </svg>
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill={"currentColor"}
                  viewBox={"0 0 24 24"}
                >
                  {/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}
                  <path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248m0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008M16.806 6.129a1.078 1.078 0 1 0 0 2.156 1.078 1.078 0 1 0 0-2.156" />
                  <path d="M20.533 6.111A4.6 4.6 0 0 0 17.9 3.479a6.6 6.6 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.6 6.6 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.6 6.6 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71s0 2.753.056 3.71c.015.748.156 1.486.419 2.187a4.6 4.6 0 0 0 2.634 2.632 6.6 6.6 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.6 6.6 0 0 0 2.186-.419 4.61 4.61 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.6 6.6 0 0 0-.421-2.217m-1.218 9.532a5 5 0 0 1-.311 1.688 2.99 2.99 0 0 1-1.712 1.711 5 5 0 0 1-1.67.311c-.95.044-1.218.055-3.654.055-2.438 0-2.687 0-3.655-.055a5 5 0 0 1-1.669-.311 2.99 2.99 0 0 1-1.719-1.711 5.1 5.1 0 0 1-.311-1.669c-.043-.95-.053-1.218-.053-3.654s0-2.686.053-3.655a5 5 0 0 1 .311-1.687c.305-.789.93-1.41 1.719-1.712a5 5 0 0 1 1.669-.311c.951-.043 1.218-.055 3.655-.055s2.687 0 3.654.055a5 5 0 0 1 1.67.311 3 3 0 0 1 1.712 1.712 5.1 5.1 0 0 1 .311 1.669c.043.951.054 1.218.054 3.655s0 2.698-.043 3.654z" />
                </svg>
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill={"currentColor"}
                  viewBox={"0 0 24 24"}
                >
                  {/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}
                  <path d="M12 6.81c-2.86 0-5.19 2.33-5.19 5.19s2.33 5.19 5.19 5.19 5.19-2.33 5.19-5.19S14.86 6.81 12 6.81m-1.93 8.15V9.05L15.18 12l-5.11 2.95Z" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 15.92c-3.27 0-5.92-2.65-5.92-5.92S8.73 6.08 12 6.08s5.92 2.65 5.92 5.92-2.65 5.92-5.92 5.92" />
                </svg>
              </span>
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  fill={"currentColor"}
                  viewBox={"0 0 24 24"}
                >
                  {/* Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free */}
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

export default App;
