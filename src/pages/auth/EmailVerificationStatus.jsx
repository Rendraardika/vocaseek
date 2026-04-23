import "../../styles/auth-feedback.css";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiMail } from "react-icons/fi";

const STATUS_CONFIG = {
  success: {
    iconClass: "is-success",
    kicker: "Verifikasi Berhasil",
    title: "Email berhasil diverifikasi",
    message:
      "Akun Anda sudah aktif untuk login. Silakan masuk menggunakan email dan password Anda.",
  },
  expired: {
    iconClass: "is-warning",
    kicker: "Link Kedaluwarsa",
    title: "Link verifikasi sudah kedaluwarsa",
    message:
      "Link verifikasi sudah tidak berlaku. Silakan kirim ulang email verifikasi dari halaman cek email.",
  },
  invalid: {
    iconClass: "is-danger",
    kicker: "Link Tidak Valid",
    title: "Link verifikasi tidak valid",
    message:
      "Link verifikasi tidak dikenali. Pastikan Anda membuka link terbaru dari email Vocaseek.",
  },
};

export default function EmailVerificationStatus() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "invalid";
  const email = searchParams.get("email") || "";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.invalid;

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
              <h2>{config.title}</h2>
              <p className="auth-feedback-description">{config.message}</p>
            </div>
          </div>

          {email ? (
            <div className="auth-feedback-meta auth-feedback-meta--simple">
              <FiMail />
              <span>
                Email terkait: <strong>{email}</strong>
              </span>
            </div>
          ) : null}

          <div className="auth-feedback-actions" style={{ marginTop: 20 }}>
            {status === "success" ? (
              <Link to="/login" className="auth-feedback-link-button">
                Login Sekarang
              </Link>
            ) : (
              <Link
                to="/check-email"
                state={{ email }}
                className="auth-feedback-link-button"
              >
                Kembali ke Cek Email
              </Link>
            )}

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
