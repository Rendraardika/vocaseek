import "../../styles/registersuccess.css";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getApiErrorMessage, resendVerificationEmail } from "../../services/auth";

function getVerificationErrorMessage(error) {
  const message = String(error?.response?.data?.message || error?.message || "").toLowerCase();

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
    <div className="rs-page">
      <div className="rs-logo">
        <img src="/vocaseeklogo.png" alt="Vocaseek" />
      </div>

      <div className="rs-card">
        <div className="rs-icon">@</div>
        <h2>Cek Email Anda</h2>
        <p>{statusMessage}</p>

        <div style={{ textAlign: "left", marginBottom: 16 }}>
          <label
            htmlFor="verification-email"
            style={{ display: "block", fontSize: 14, marginBottom: 8, color: "#374151" }}
          >
            Email terdaftar
          </label>
          <input
            id="verification-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              outline: "none",
            }}
          />
        </div>

        {error ? (
          <p style={{ color: "#d93025", marginBottom: 16 }}>{error}</p>
        ) : null}

        <button
          type="button"
          className="rs-btn"
          onClick={handleResend}
          disabled={isSubmitting || !email}
          style={{ border: "none", cursor: "pointer" }}
        >
          {isSubmitting ? "Mengirim ulang..." : "Kirim Ulang Email Verifikasi"}
        </button>

        <Link to={loginPath} className="rs-back">
          Kembali ke Login
        </Link>
      </div>

      <div className="rs-footer">© 2026 VOCASEEK INC. ALL RIGHTS RESERVED.</div>
    </div>
  );
}
