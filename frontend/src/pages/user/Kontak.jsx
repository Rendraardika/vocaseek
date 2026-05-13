import "../../styles/kontak.css";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import FooterSocialIcons from "../../components/common/FooterSocialIcons";
import FooterBrandLogo from "../../components/common/FooterBrandLogo";

export default function Kontak() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="contact-page user-nav-shell">
      {/* ORNAMEN BACKGROUND */}
      <div className="contact-ornament contact-ornament-big"></div>
      <div className="contact-ornament contact-ornament-small"></div>
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

      {/* ===== HERO CONTACT ===== */}
      <section className="contact-hero">
        <div className="contact-left">
          <h1>
            Mari Berkolaborasi & <br />
            <span>Kembangkan Bisnis Anda</span>
          </h1>

          <div className="contact-desc">
            <span className="line"></span>
            <p>
              Vokasik membantu perusahaan terhubung dengan talenta potensial
              melalui program magang yang terkurasi dan relevan dengan kebutuhan
              industri.
            </p>
          </div>

          <div className="contact-tag">
            <span></span>
            <p>TALENTA & INDUSTRI</p>
          </div>
        </div>

        {/* ===== CARD KUNING ===== */}
        <div className="contact-card">
          <h3>Hubungi Sekarang!</h3>

          <div className="phone">
            <div className="icon">📞</div>
            <p>+62 31 1234567</p>
          </div>

          <div className="card-divider"></div>

          <div className="card-info">
            <div>
              <h4>LOCATION</h4>
              <p>
                Jalan Bukit Darmo Raya, Jl. Raya Graha Famili Tim. No.Kel,
                Pradahkalikendal, Kec. Dukuhpakis, Kota SBY, Jawa Timur 60226
              </p>
            </div>

            <div>
              <h4>HOURS</h4>
              <p>
                Monday – Friday
                <br />
                9:00 AM – 17:00 PM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MAP ===== */}
      <section className="contact-map">
        <iframe
          title="KADIN Jawa Timur"
          src="https://www.google.com/maps?q=Kamar+Dagang+dan+Industri+(KADIN)+Provinsi+Jawa+Timur&output=embed"
          width="100%"
          height="500"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>

        {/* FLOATING INFO */}
        <div className="map-info-card">
          <div className="map-info-icon">📍</div>
          <div>
            <h4>Vocaseek HQ</h4>
            <p>
              Centennial Tower, Level 28
              <br />
              South Jakarta City
            </p>
            <a href="#">Get Directions →</a>
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
          © 2026 Vocaseek. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

