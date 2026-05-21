import "../../styles/lowongan.css";
import { NavLink } from "react-router-dom";
import ProcessSection from "../../components/common/ProcessSection";
import { Link } from "react-router-dom";
import { useState } from "react";
import FooterSocialIcons from "../../components/common/FooterSocialIcons";
import FooterBrandLogo from "../../components/common/FooterBrandLogo";
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

            <div className="hero-points">
              <span>
                <FaStar /> Mitra terpercaya
              </span>
              <span>
                <FaStar /> Posisi terkurasi
              </span>
            </div>

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
              Lihat &gt;
            </Link>
          </div>

          <div className="kategori-card">
            <div className="kategori-icon">
              <FaPaintBrush />
            </div>
            <h3>Kreatif & Media</h3>
            <p>Design, Konten, UI/UX</p>
            <Link to="/login" className="kategori-link">
              Lihat &gt;
            </Link>
          </div>

          <div className="kategori-card">
            <div className="kategori-icon">
              <FaLaptopCode />
            </div>
            <h3>Teknologi & IT</h3>
            <p>Web App, Data Science</p>
            <Link to="/login" className="kategori-link">
              Lihat &gt;
            </Link>
          </div>

          <div className="kategori-card">
            <div className="kategori-icon">
              <FaUsers />
            </div>
            <h3>Sumber Daya Manusia</h3>
            <p>Recruitment, Talent Dev</p>
            <Link to="/login" className="kategori-link">
              Lihat &gt;
            </Link>
          </div>

          <div className="kategori-card">
            <div className="kategori-icon">
              <FaUtensils />
            </div>
            <h3>Perhotelan & Kuliner</h3>
            <p>Tourism, F&B Service</p>
            <Link to="/login" className="kategori-link">
              Lihat &gt;
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
              Lihat &gt;
            </Link>
          </div>

          <div className="explore-card">
            <img src="/lowongan4.webp" />
            <h3>Bisnis & Manajemen</h3>
            <Link to="/login" className="lihat-lowongan">
              Lihat &gt;
            </Link>
          </div>

          <div className="explore-card">
            <img src="/lowongan5.webp" />
            <h3>Layanan Kesehatan</h3>
            <Link to="/login" className="lihat-lowongan">
              Lihat &gt;
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

            <p>Jembatan penghubung talenta vokasi dengan dunia industri nyata.</p>
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
          © 2026 Vocaseek. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;

