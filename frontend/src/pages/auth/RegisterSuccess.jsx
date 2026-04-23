import "../../styles/auth-feedback.css";
import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiMail } from "react-icons/fi";

export default function RegisterSuccess() {
  const location = useLocation();
  const message =
    location.state?.message ||
    "Akun Anda telah berhasil dibuat. Silakan cek email Anda untuk verifikasi sebelum melanjutkan ke aplikasi Vocaseek.";
  const loginPath = location.state?.loginPath || "/login";

  return (
    <div className="auth-feedback-page">
      <div className="auth-feedback-shell">
        <section className="auth-feedback-panel">
          <div className="auth-feedback-brand">
            <img
              src="/vocaseeklogo.png"
              alt="Vocaseek"
              className="auth-feedback-logo"
            />
            <div className="auth-feedback-kicker">
              <FiMail />
              Registrasi Berhasil
            </div>
            <h1>Akun baru sudah tercatat dan tinggal menunggu verifikasi email.</h1>
            <p>
              Kami sudah siapkan langkah berikutnya supaya kamu bisa lanjut ke
              Vocaseek dengan alur yang lebih rapi dan jelas.
            </p>
          </div>

          <div className="auth-feedback-stats">
            <div className="auth-feedback-stat">
              <strong>Langkah selanjutnya</strong>
              <span>
                Buka inbox email yang kamu daftarkan, lalu klik tautan
                verifikasi dari Vocaseek.
              </span>
            </div>
          </div>
        </section>

        <section className="auth-feedback-card">
          <div className="auth-feedback-card-header">
            <div className="auth-feedback-icon is-success">
              <FiCheckCircle size={28} />
            </div>
            <div>
              <h2>Registrasi Berhasil</h2>
              <p className="auth-feedback-description">{message}</p>
            </div>
          </div>

          <div className="auth-feedback-actions">
            <Link to={loginPath} className="auth-feedback-link-button">
              Masuk ke Akun
            </Link>

            <Link to="/" className="auth-feedback-link-ghost">
              <FiArrowLeft />
              Kembali ke Beranda
            </Link>
          </div>

          <div className="auth-feedback-footer">
            © 2026 VOCASEEK INC. ALL RIGHTS RESERVED.
          </div>
        </section>
      </div>
    </div>
  );
}
