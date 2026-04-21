import "../../styles/mitra.css";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FaCheckCircle,
  FaUserTie,
  FaFileAlt,
  FaHandshake,
} from "react-icons/fa";

export default function Mitra() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="mitra-page user-nav-shell">
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
      <section className="mitra-hero">
        <div className="mitra-container">
          {/* LEFT */}
          <div className="mitra-left">
            <span className="mitra-badge">Mulai Perjalananmu</span>

            <h1>
              Jadilah Mitra <br />
              Strategis <span>Vokasi</span>
            </h1>

            <p>
              Berdayakan talenta muda Indonesia melalui kolaborasi strategis.
              Temukan kandidat terbaik yang siap kerja.
            </p>

            <div className="mitra-actions">
              <div className="mitra-highlight">
                Silahkan hubungi pihak Vocaseek untuk mengatur kerjasama dan
                mendapat LoA
              </div>
              <Link to="/register-company" className="btn-primary">
                Daftarkan Perusahaanmu
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="mitra-right">
            <div className="mitra-card large">
              <img
                src="/mitra1.webp"
                alt="Collaboration"
                className="mitra-img"
              />
            </div>

            <div className="mitra-card small top">Standar Industri Global</div>

            <div className="mitra-card small bottom">
              <FaCheckCircle className="check-icon" />
              95% Diterima Kerja
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mitra-stats">
        <div className="mitra-stats-grid">
          <div className="mitra-stats-card">
            <h3>250+</h3>
            <p>Mitra Perusahaan</p>
          </div>

          <div className="mitra-stats-card">
            <h3>20k+</h3>
            <p>Talenta Bergabung</p>
          </div>

          <div className="mitra-stats-card">
            <h3>10+</h3>
            <p>Sektor Industri</p>
          </div>
        </div>
      </section>

      {/* BENEFIT */}
      <section className="mitra-benefit">
        <div className="benefit-header">
          <span className="benefit-badge">KEUNGGULAN VOCASEEK</span>
          <h2>Mengapa Menjadi Mitra Vocaseek?</h2>
          <p>
            Platform komprehensif yang menghubungkan industri dan pendidikan
            untuk menciptakan ekosistem kerja harmonis.
          </p>
        </div>

        <div className="benefit-grid">
          <div className="benefit-card card-1">
            <h4>Talenta Siap Kerja</h4>
            <p>Kandidat sesuai kebutuhan industri</p>
          </div>

          <div className="benefit-card card-2">
            <h4>Proses Cepat</h4>
            <p>Rekrutmen efisien dan terverifikasi</p>
          </div>

          <div className="benefit-card card-3">
            <h4>Employer Branding</h4>
            <p>Tingkatkan citra perusahaan</p>
          </div>

          <div className="benefit-card card-4">
            <h4>Terverifikasi</h4>
            <p>Seleksi kandidat ketat</p>
          </div>
        </div>
      </section>

      {/* STEP / CARA BERGABUNG */}
      <section className="mitra-steps">
        <div className="steps-header">
          <h2>Cara Bergabung Menjadi Mitra</h2>
          <p>
            4 langkah mudah untuk memulai kolaborasi dan menemukan talenta
            impian Anda.
          </p>
        </div>

        <div className="steps-panel">
          <div className="steps-wrapper">
            <div className="steps-line" />

            <div className="step-item">
              <div className="step-icon">
                <span className="step-number">1</span>
                <FaUserTie />
              </div>
              <h4>Registrasi</h4>
              <p>Daftarkan profil perusahaan Anda pada platform kami.</p>
            </div>

            <div className="step-item">
              <div className="step-icon">
                <span className="step-number">2</span>
                <FaCheckCircle />
              </div>
              <h4>Verifikasi</h4>
              <p>Tim kami akan melakukan validasi data perusahaan.</p>
            </div>

            <div className="step-item">
              <div className="step-icon">
                <span className="step-number">3</span>
                <FaFileAlt />
              </div>
              <h4>Pasang Lowongan</h4>
              <p>Publikasikan kebutuhan tenaga kerja Anda.</p>
            </div>

            <div className="step-item">
              <div className="step-icon">
                <span className="step-number">4</span>
                <FaHandshake />
              </div>
              <h4>Mulai Merekrut</h4>
              <p>Pilih kandidat terbaik dan mulai berkolaborasi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="mitra-testimonial">
        <div className="testimonial-card">
          <p className="testimonial-text">
            “Vocaseek sangat membantu! Proses rekrutmen kami menjadi
            <strong> 70% lebih efisien</strong> sejak menggunakan platform ini.
            Talenta yang kami dapatkan benar-benar siap pakai dan memiliki
            kompetensi yang sesuai dengan kebutuhan industri digital saat ini.”
          </p>

          <div className="testimonial-user">
            <div className="avatar" />
            <h4>Fitri Maulana</h4>
            <span>HR Manager – Tech Giant Indonesia</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mitra-cta">
        <div className="cta-box">
          {/* decorative circles */}
          <div className="cta-circle circle-1"></div>
          <div className="cta-circle circle-2"></div>
          <div className="cta-circle circle-3"></div>

          {/* content */}
          <div className="cta-content">
            <h2>
              Siap Membangun Masa Depan <span>Vokasi</span> Bersama?
            </h2>
            <p>
              Bergabunglah dengan ratusan perusahaan lainnya dan temukan talenta
              terbaik Indonesia untuk pertumbuhan bisnis yang berkelanjutan.
            </p>

            <Link to="/register-company" className="btn-primary">
              Mulai Sekarang!
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
