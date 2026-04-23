import "../../styles/auth-feedback.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
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
            (c) 2026 VOCASEEK INC. Semua hak dilindungi.
          </div>
        </section>
      </div>
    </div>
  );
}
