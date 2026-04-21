import "../../styles/registersuccess.css";
import { Link, useSearchParams } from "react-router-dom";

const STATUS_CONFIG = {
  success: {
    icon: "✓",
    title: "Email Berhasil Diverifikasi",
    message:
      "Akun Anda sudah aktif untuk login. Silakan masuk menggunakan email dan password Anda.",
    color: "#16a34a",
    background: "#d1fae5",
  },
  expired: {
    icon: "!",
    title: "Link Verifikasi Kedaluwarsa",
    message:
      "Link verifikasi sudah tidak berlaku. Silakan kirim ulang email verifikasi dari halaman cek email.",
    color: "#d97706",
    background: "#fef3c7",
  },
  invalid: {
    icon: "!",
    title: "Link Verifikasi Tidak Valid",
    message:
      "Link verifikasi tidak dikenali. Pastikan Anda membuka link terbaru dari email Vocaseek.",
    color: "#dc2626",
    background: "#fee2e2",
  },
};

export default function EmailVerificationStatus() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "invalid";
  const email = searchParams.get("email") || "";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.invalid;

  return (
    <div className="rs-page">
      <div className="rs-logo">
        <img src="/vocaseeklogo.png" alt="Vocaseek" />
      </div>

      <div className="rs-card">
        <div
          className="rs-icon"
          style={{ color: config.color, background: config.background }}
        >
          {config.icon}
        </div>

        <h2>{config.title}</h2>
        <p>{config.message}</p>
        {email ? <p style={{ marginTop: -10 }}>Email: {email}</p> : null}

        {status === "success" ? (
          <Link to="/login" className="rs-btn">
            Login Sekarang
          </Link>
        ) : (
          <Link
            to="/check-email"
            state={{ email }}
            className="rs-btn"
          >
            Kembali ke Cek Email
          </Link>
        )}

        <Link to="/" className="rs-back">
          Kembali ke Beranda
        </Link>
      </div>

      <div className="rs-footer">© 2026 VOCASEEK INC. ALL RIGHTS RESERVED.</div>
    </div>
  );
}
