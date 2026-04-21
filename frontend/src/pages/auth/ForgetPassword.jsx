import "../../styles/forgetpassword.css";
import { useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="fp-page">

      {/* LOGO */}
      <div className="fp-logo">
        <img src="/vocaseeklogo.png" alt="Vocaseek" />
      </div>

      {/* CARD */}
      <div className="fp-card">

        <h2>Lupa Kata Sandi?</h2>

        <p>
          Masukkan email terdaftar untuk menerima
          tautan reset kata sandi.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="fp-group">
            <label>Email</label>

            <div className="fp-input">
              <input
                type="email"
                placeholder="email@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

          </div>

          {error ? (
            <p style={{ color: "#d93025", fontSize: "0.9rem", marginBottom: "16px" }}>
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p style={{ color: "#0f766e", fontSize: "0.9rem", marginBottom: "16px" }}>
              {successMessage}
            </p>
          ) : null}

          <button className="fp-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Mengirim..." : "Kirim Email"}
          </button>

        </form>

        <Link to="/login" className="fp-back">
          ← Kembali ke Login
        </Link>

      </div>

      <div className="fp-footer">
        © 2026 VOKASIK INC. ALL RIGHTS RESERVED.
      </div>

    </div>
  );
}
