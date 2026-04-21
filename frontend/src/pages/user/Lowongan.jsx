import "../../styles/lowongan.css";
import { NavLink } from "react-router-dom";
import ProcessSection from "../../components/common/ProcessSection";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FaBriefcase,
  FaPaintBrush,
  FaUsers,
  FaLaptopCode,
  FaUtensils,
  FaStar,
} from "react-icons/fa";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="page user-nav-shell">
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

      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-container">
          {/* LEFT */}
          <div className="hero-left">
            <span className="hero-badge-label">
              #1 Platform Magang & Karier
            </span>

            <h1 className="hero-title">
              <span>Temukan Peluang</span>
              <span className="highlight">Magang</span>
              <span>Terbaikmu</span>
            </h1>

            <p>
              Kami menghubungkan talenta muda ambisius dengan perusahaan
              teknologi global untuk membuka peluang karier tanpa batas.
            </p>

            <Link to="/login" className="hero-btn">
              Cari Magang Sekarang 
            </Link>
          </div>

          {/* RIGHT */}
          <div className="hero-right">
            <div className="hero-image">
              <img src="/lowongan1.webp" alt="magang" />

              <div className="hero-floating hero-verified">✔ Terverifikasi</div>

              <div className="hero-floating hero-rate">98% Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARTNER ===== */}
      <section className="partner">
        <div className="partner-container">
          <div className="partner-left">
            <h3>300+</h3>
            <p>Perusahaan Mitra Global</p>
          </div>

          <div className="partner-right">
            <div className="partner-item">
              <FaStar />
              <span>EduCorp</span>
            </div>

            <div className="partner-item">
              <FaStar />
              <span>UniTrust</span>
            </div>

            <div className="partner-item">
              <FaStar />
              <span>SciLab</span>
            </div>

            <div className="partner-item">
              <FaStar />
              <span>StarTech</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BIDANG ===== */}
      <section className="kategori-section">
        <h2>Bidang Magang & Karier</h2>

        <p className="kategori-sub">
          Temukan spesialisasi yang sesuai dengan passion dan keahlianmu.
        </p>

        <div className="kategori-grid">
          <div className="kategori-card">
            <div className="kategori-icon">
              <FaBriefcase />
            </div>

            <h3>Bisnis & Manajemen</h3>
            <p>Strategi HR, Operasional</p>

            <Link to="/login" className="kategori-link">
              Lihat →
            </Link>
          </div>

          <div className="kategori-card">
            <div className="kategori-icon">
              <FaPaintBrush />
            </div>
            <h3>Kreatif & Media</h3>
            <p>Design, Konten, UI/UX</p>
            <Link to="/login" className="kategori-link">
              Lihat →
            </Link>
          </div>

          <div className="kategori-card">
            <div className="kategori-icon">
              <FaLaptopCode />
            </div>
            <h3>Teknologi & IT</h3>
            <p>Web App, Data Science</p>
            <Link to="/login" className="kategori-link">
              Lihat →
            </Link>
          </div>

          <div className="kategori-card">
            <div className="kategori-icon">
              <FaUsers />
            </div>
            <h3>Sumber Daya Manusia</h3>
            <p>Recruitment, Talent Dev</p>
            <Link to="/login" className="kategori-link">
              Lihat →
            </Link>
          </div>

          <div className="kategori-card">
            <div className="kategori-icon">
              <FaUtensils />
            </div>
            <h3>Perhotelan & Kuliner</h3>
            <p>Tourism, F&B Service</p>
            <Link to="/login" className="kategori-link">
              Lihat →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="process">
        <div className="process-container">
          {/* LEFT */}
          <div className="process-left">
            <span className="process-label">PROSES KERJA VOKISIK</span>

            <h2>
              Bagaimana <span>Vocaseek</span> Bekerja
            </h2>

            <div className="process-steps">
              <div className="process-item">
                <div className="process-number">01</div>

                <div className="process-content">
                  <h4>Pendaftaran & Pembuatan Profil</h4>
                  <p>
                    Daftarkan dirimu dan buat portofolio digital yang menarik.
                    Lengkapi data diri untuk meningkatkan peluang dilirik
                    perusahaan impian.
                  </p>
                </div>
              </div>

              <div className="process-item">
                <div className="process-number">02</div>

                <div className="process-content">
                  <h4>Eksplorasi & Lamar Posisi</h4>
                  <p>
                    Telusuri ribuan posisi magang dari berbagai industri.
                    Gunakan filter cerdas untuk menemukan yang paling pas dengan
                    passionmu.
                  </p>
                </div>
              </div>

              <div className="process-item">
                <div className="process-number">03</div>

                <div className="process-content">
                  <h4>Proses Seleksi & Interview</h4>
                  <p>
                    Dapatkan undangan interview dan tes teknis langsung melalui
                    platform. Kami menyediakan resource untuk persiapan
                    interviewmu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="process-right">
            <div className="process-image">
              <img src="/lowongan2.webp" alt="Recruitment Process" />

              <div className="process-note">
                <p>Membangun pengalaman nyata untuk masa depan profesional.</p>

                <span>
                  Ribuan talenta telah berhasil memulai karier mereka melalui
                  Vocaseek.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EXPLORE SECTION ===== */}

      <section className="explore">
        <h2>Jelajahi Berdasarkan Bidang</h2>
        <p>Temukan posisi magang terpopuler minggu ini.</p>

        <div className="explore-grid">
          <div className="explore-card">
            <img src="/lowongan3.webp" />
            <h3>Teknologi & Digital</h3>
            <Link to="/login" className="lihat-lowongan">
              Lihat Lowongan →
            </Link>
          </div>

          <div className="explore-card">
            <img src="/lowongan4.webp" />
            <h3>Bisnis & Manajemen</h3>
            <Link to="/login" className="lihat-lowongan">
              Lihat Lowongan →
            </Link>
          </div>

          <div className="explore-card">
            <img src="/lowongan5.webp" />
            <h3>Layanan Kesehatan</h3>
            <Link to="/login" className="lihat-lowongan">
              Lihat Lowongan →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CAREER BANNER ===== */}
      <section className="career-banner-section">
        <div className="career-banner-container">
          <div className="career-banner-content">
            <h2>
              Gabung Vocaseek, Raih
              <br />
              Karier Impianmu
            </h2>

            <p>
              Jembatan penghubung talenta vokasi dengan
              <br />
              dunia industri nyata.
            </p>
          </div>

          <Link to="/login" className="mulai-btn">
            Mulai Karirmu
          </Link>
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
