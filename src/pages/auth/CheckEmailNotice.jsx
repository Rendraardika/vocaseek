import "../../styles/auth-feedback.css";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft, FiMail, FiRefreshCcw, FiSend } from "react-icons/fi";
import {
  getApiErrorMessage,
  resendVerificationEmail,
} from "../../services/auth";

function getVerificationErrorMessage(error) {
  const message = String(
    error?.response?.data?.message || error?.message || "",
  ).toLowerCase();

  if (message.includes("csrf token mismatch")) {
    return "Permintaan kirim ulang email verifikasi sempat ditolak server. Silakan coba lagi setelah backend diperbarui.";
  }

  return getApiErrorMessage(
    error,
    "Gagal mengirim ulang email verifikasi.",
  );
}

export default function CheckEmailNotice() {
  const location = useLocation();
  const initialEmail = useMemo(
    () => location.state?.email || "",
    [location.state],
  );
  const loginPath = location.state?.loginPath || "/login";
  const [email, setEmail] = useState(initialEmail);
  const [statusMessage, setStatusMessage] = useState(
    location.state?.message ||
      "Kami sudah mengirim link verifikasi ke email Anda. Buka inbox lalu klik link tersebut sebelum login.",
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResend = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await resendVerificationEmail({ email });
      setStatusMessage(
        response?.data?.message ||
          "Jika email terdaftar dan belum diverifikasi, link verifikasi baru sudah dikirim.",
      );
    } catch (requestError) {
      setError(getVerificationErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <FiSend />
              Verifikasi Email
            </div>
            <h1>Aktivasi akunmu lewat inbox dengan tampilan yang lebih jelas.</h1>
            <p>
              Setelah email diverifikasi, akun baru akan aktif dan bisa lanjut
              ke langkah berikutnya di Vocaseek.
            </p>
          </div>

          <div className="auth-feedback-stats">
            <div className="auth-feedback-stat">
              <strong>Sudah kirim email</strong>
              <span>
                Cek inbox dan folder spam/promosi untuk memastikan email
                Vocaseek tidak terlewat.
              </span>
            </div>
            <div className="auth-feedback-stat">
              <strong>Butuh link baru?</strong>
              <span>
                Kamu bisa kirim ulang link verifikasi langsung dari halaman ini.
              </span>
            </div>
          </div>
        </section>

        <section className="auth-feedback-card">
          <div className="auth-feedback-card-header">
            <div className="auth-feedback-icon">
              <FiMail size={28} />
            </div>
            <div>
              <h2>Cek Email Anda</h2>
              <p className="auth-feedback-description">{statusMessage}</p>
            </div>
          </div>

          <div className="auth-feedback-form">
            <div className="auth-feedback-field">
              <label htmlFor="verification-email">Email terdaftar</label>
              <input
                id="verification-email"
                type="email"
                className="auth-feedback-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
              />
            </div>

            {error ? (
              <div className="auth-feedback-message is-error">{error}</div>
            ) : null}

            <button
              type="button"
              className="auth-feedback-button"
              onClick={handleResend}
              disabled={isSubmitting || !email}
            >
              <FiRefreshCcw />
              {isSubmitting
                ? "Mengirim ulang..."
                : "Kirim Ulang Email Verifikasi"}
            </button>
          </div>

          <div className="auth-feedback-actions" style={{ marginTop: 16 }}>
            <Link to={loginPath} className="auth-feedback-link-secondary">
              Masuk ke Halaman Login
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
