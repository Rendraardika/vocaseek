import "../../styles/registersuccess.css";
import { Link, useLocation } from "react-router-dom";

export default function RegisterSuccess() {
  const location = useLocation();
  const message =
    location.state?.message ||
    "Akun Anda telah berhasil dibuat. Silakan cek email Anda untuk verifikasi sebelum melanjutkan ke aplikasi Vocaseek.";
  const loginPath = location.state?.loginPath || "/login";

  return (
    <div className="rs-page">
      <div className="rs-logo">
        <img src="/vocaseeklogo.png" alt="Vocaseek" />
      </div>

      <div className="rs-card">
        <div className="rs-icon">✓</div>

        <h2>Registrasi Berhasil!</h2>

        <p>{message}</p>

        <Link to={loginPath} className="rs-btn">
          Masuk ke Akun
        </Link>

        <Link to="/" className="rs-back">
          ← Kembali ke Beranda
        </Link>
      </div>

      <div className="rs-footer">
        © 2026 VOKASIK INC. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
}
