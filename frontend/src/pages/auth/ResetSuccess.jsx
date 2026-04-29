import "../../styles/auth-feedback.css";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiShield } from "react-icons/fi";

export default function ResetSuccess() {
  return (
    <div className="auth-feedback-page">
      <div className="auth-feedback-shell auth-feedback-shell--success">
        <section className="auth-feedback-card auth-feedback-card--success">
          <div className="auth-feedback-brand auth-feedback-brand--card">
            <img
              src="/vocaseeklogo.png"
              alt="Vocaseek"
              className="auth-feedback-logo"
            />
          </div>

          <div className="auth-feedback-card-header auth-feedback-card-header--success">
            <div className="auth-feedback-icon is-success">
              <FiCheckCircle size={34} />
            </div>
            <div>
              <h2>Kata Sandi Berhasil Diperbarui</h2>
              <p className="auth-feedback-description">
                Password baru sudah tersimpan. Anda dapat masuk kembali ke
                Vocaseek menggunakan kata sandi terbaru.
              </p>
            </div>
          </div>

          <div className="auth-feedback-success-note">
            <FiShield />
            <div>
              <strong>Status keamanan aman</strong>
              <span>Password lama tidak lagi berlaku untuk akun Anda.</span>
            </div>
          </div>

          <div className="auth-feedback-actions">
            <Link to="/login" className="auth-feedback-link-button">
              Masuk ke Login
            </Link>

            <Link to="/" className="auth-feedback-link-ghost">
              <FiArrowLeft />
              Kembali ke Beranda
            </Link>
          </div>

          <div className="auth-feedback-footer">
            (c) 2026 VOCASEEK INC. Semua hak dilindungi.
          </div>
        </section>
      </div>
    </div>
  );
}
