import "../../styles/auth-feedback.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiKey, FiMail, FiShield } from "react-icons/fi";
import {
  getApiErrorMessage,
  requestPasswordReset,
} from "../../services/auth";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({ email });
      setSuccessMessage(
        response?.data?.message ||
          "Tautan reset kata sandi telah dikirim ke email Anda.",
      );
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Gagal mengirim email reset password. Coba lagi.",
        ),
      );
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
              <FiKey />
              Pulihkan Akses
            </div>
            <h1>Reset password tanpa bingung dan tanpa tampilan yang polos.</h1>
            <p>
              Kami bantu kirim tautan aman ke email terdaftar agar kamu bisa
              membuat kata sandi baru dengan cepat.
            </p>
          </div>

          <div className="auth-feedback-stats">
            <div className="auth-feedback-stat">
              <strong>Langkah aman</strong>
              <span>
                Tautan reset divalidasi dulu sebelum halaman ubah password bisa
                dipakai.
              </span>
            </div>
            <div className="auth-feedback-stat">
              <strong>Fokus ke akunmu</strong>
              <span>
                Cukup masukkan email yang terdaftar di Vocaseek, sisanya kami
                yang arahkan.
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
              <h2>Lupa Kata Sandi?</h2>
              <p className="auth-feedback-description">
                Masukkan email terdaftar untuk menerima tautan reset kata sandi
                yang baru.
              </p>
            </div>
          </div>

          <form className="auth-feedback-form" onSubmit={handleSubmit}>
            <div className="auth-feedback-field">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                className="auth-feedback-input"
                placeholder="email@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-feedback-meta">
              <FiShield />
              <span>
                Tautan reset hanya berlaku untuk email yang memang terdaftar.
              </span>
            </div>

            {error ? (
              <div className="auth-feedback-message is-error">{error}</div>
            ) : null}

            {successMessage ? (
              <div className="auth-feedback-message is-success">
                {successMessage}
              </div>
            ) : null}

            <button
              className="auth-feedback-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Mengirim..." : "Kirim Email Reset"}
            </button>
          </form>

          <div className="auth-feedback-actions" style={{ marginTop: 16 }}>
            <Link to="/login" className="auth-feedback-link-ghost">
              <FiArrowLeft />
              Kembali ke Login
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
