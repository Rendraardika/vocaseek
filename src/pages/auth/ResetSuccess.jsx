import "../../styles/auth-feedback.css";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiLock } from "react-icons/fi";

export default function ResetSuccess() {
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
              <FiLock />
              Password Diperbarui
            </div>
            <h1>Password baru sudah tersimpan dan akunmu siap dipakai lagi.</h1>
            <p>
              Sekarang kamu bisa masuk kembali menggunakan kata sandi terbaru
              tanpa perlu mengulang proses reset.
            </p>
          </div>

          <div className="auth-feedback-stats">
            <div className="auth-feedback-stat">
              <strong>Status keamanan</strong>
              <span>
                Password lama tidak lagi dipakai. Lanjut login dengan password
                yang baru.
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
              <h2>Kata Sandi Berhasil Diperbarui</h2>
              <p className="auth-feedback-description">
                Kata sandi berhasil diubah. Anda dapat masuk menggunakan kata
                sandi baru.
              </p>
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
            © 2026 VOCASEEK INC. ALL RIGHTS RESERVED.
          </div>
        </section>
      </div>
    </div>
  );
}
