import "../../styles/auth-feedback.css";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowLeft, FiRefreshCcw } from "react-icons/fi";
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
  const isCompanyRegistration = loginPath === "/login-company";
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
      <div className="auth-feedback-shell auth-feedback-shell--single">
        <section className="auth-feedback-card">
          <div className="auth-feedback-brand auth-feedback-brand--card">
            <img
              src="/vocaseeklogo.png"
              alt="Vocaseek"
              className="auth-feedback-logo"
            />
          </div>

          <div className="auth-feedback-card-header">
            <div>
              <h2>Cek Email Anda</h2>
              {!isCompanyRegistration ? (
                <p className="auth-feedback-description">{statusMessage}</p>
              ) : null}
              {isCompanyRegistration ? (
                <div className="auth-feedback-message auth-feedback-approval-note is-info">
                  Setelah email berhasil diverifikasi, akun perusahaan Anda
                  masih menunggu persetujuan admin. Silakan cek email dan
                  halaman login secara berkala untuk mengetahui status akun.
                </div>
              ) : null}
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
            (c) 2026 VOCASEEK INC. Semua hak dilindungi.
          </div>
        </section>
      </div>
    </div>
  );
}
