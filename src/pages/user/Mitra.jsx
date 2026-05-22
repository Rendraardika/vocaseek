import "../../styles/mitra.css";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import FooterSocialIcons from "../../components/common/FooterSocialIcons";
import FooterBrandLogo from "../../components/common/FooterBrandLogo";
import {
  FaCheckCircle,
  FaUserTie,
  FaFileAlt,
  FaHandshake,
} from "react-icons/fa";
import { translatePhrase } from "../../i18n/phrases";
import { getSavedLanguage } from "../../utils/languagePreference";

export default function Mitra() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [locale, setLocale] = useState(getSavedLanguage());

  useEffect(() => {
    const syncLanguage = () => {
      setLocale(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);

    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

  const testimonialText =
    translatePhrase(
      "Vocaseek sangat membantu! Proses rekrutmen kami menjadi 70% lebih efisien sejak menggunakan platform ini. Talenta yang kami dapatkan benar-benar siap pakai dan memiliki kompetensi yang sesuai dengan kebutuhan industri digital saat ini.",
      locale
    ) ||
    "Vocaseek sangat membantu! Proses rekrutmen kami menjadi 70% lebih efisien sejak menggunakan platform ini. Talenta yang kami dapatkan benar-benar siap pakai dan memiliki kompetensi yang sesuai dengan kebutuhan industri digital saat ini.";

  const testimonialRole =
    translatePhrase("CEO - Empat Beruang Perkasa", locale) ||
    "CEO - Empat Beruang Perkasa";

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
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              Beranda
            </NavLink>
            <NavLink to="/lowongan" onClick={() => setMenuOpen(false)}>
              Lowongan
            </NavLink>
            <NavLink to="/mitra" onClick={() => setMenuOpen(false)}>
              Mitra
            </NavLink>
            <NavLink to="/kontak" onClick={() => setMenuOpen(false)}>
              Kontak
            </NavLink>

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
              Strategis <span>Vocaseek</span>
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
            <div className="benefit-icon">
              <FaUserTie />
            </div>
            <h4>Talenta Siap Kerja</h4>
            <p>Kandidat sesuai kebutuhan industri</p>
          </div>

          <div className="benefit-card card-2">
            <div className="benefit-icon">
              <FaHandshake />
            </div>
            <h4>Proses Cepat</h4>
            <p>Rekrutmen efisien dan terverifikasi</p>
          </div>

          <div className="benefit-card card-3">
            <div className="benefit-icon">
              <FaFileAlt />
            </div>
            <h4>Employer Branding</h4>
            <p>Tingkatkan citra perusahaan</p>
          </div>

          <div className="benefit-card card-4">
            <div className="benefit-icon">
              <FaCheckCircle />
            </div>
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
          <p className="testimonial-text">"{testimonialText}"</p>

          <div className="testimonial-user">
            <div className="avatar" />
            <h4>Bapak Ageng Permadi</h4>
            <span>{testimonialRole}</span>
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
              <FooterBrandLogo />
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

            <FooterSocialIcons />
          </div>
        </div>

        <div className="footer-bottom">
          Â© 2026 Vocaseek. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

