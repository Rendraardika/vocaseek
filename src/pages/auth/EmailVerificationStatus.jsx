import "../../styles/auth-feedback.css";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiMail,
} from "react-icons/fi";

const STATUS_CONFIG = {
  success: {
    icon: FiCheckCircle,
    iconClass: "is-success",
    kicker: "Verifikasi Berhasil",
    title: "Email berhasil diverifikasi",
    message:
      "Akun Anda sudah aktif untuk login. Silakan masuk menggunakan email dan password Anda.",
    panelTitle: "Satu langkah selesai, akunmu siap dipakai.",
    panelCopy:
      "Sekarang Vocaseek sudah mengenali emailmu sebagai akun aktif dan aman untuk dipakai login.",
  },
  expired: {
    icon: FiClock,
    iconClass: "is-warning",
    kicker: "Link Kedaluwarsa",
    title: "Link verifikasi sudah kedaluwarsa",
    message:
      "Link verifikasi sudah tidak berlaku. Silakan kirim ulang email verifikasi dari halaman cek email.",
    panelTitle: "Butuh link baru untuk melanjutkan aktivasi akun.",
    panelCopy:
      "Tautan verifikasi punya masa berlaku. Kalau sudah lewat waktunya, kamu tinggal minta kirim ulang.",
  },
  invalid: {
    icon: FiAlertCircle,
    iconClass: "is-danger",
    kicker: "Link Tidak Valid",
    title: "Link verifikasi tidak valid",
    message:
      "Link verifikasi tidak dikenali. Pastikan Anda membuka link terbaru dari email Vocaseek.",
    panelTitle: "Pastikan kamu membuka tautan yang benar dari email terakhir.",
    panelCopy:
      "Kalau link lama terbuka lagi, sistem akan menganggapnya tidak valid dan meminta kirim ulang.",
  },
};

export default function EmailVerificationStatus() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "invalid";
  const email = searchParams.get("email") || "";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.invalid;
  const Icon = config.icon;

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
              <FiMail />
              {config.kicker}
            </div>
            <h1>{config.panelTitle}</h1>
            <p>{config.panelCopy}</p>
          </div>

          <div className="auth-feedback-stats">
            <div className="auth-feedback-stat">
              <strong>Status akun</strong>
              <span>
                Vocaseek menampilkan hasil verifikasi secara langsung agar kamu
                tahu langkah berikutnya.
              </span>
            </div>
            <div className="auth-feedback-stat">
              <strong>Email terhubung</strong>
              <span>{email || "Email tidak ditemukan di tautan verifikasi."}</span>
            </div>
          </div>
        </section>

        <section className="auth-feedback-card">
          <div className="auth-feedback-card-header">
            <div className={`auth-feedback-icon ${config.iconClass}`}>
              <Icon size={28} />
            </div>
            <div>
              <h2>{config.title}</h2>
              <p className="auth-feedback-description">{config.message}</p>
            </div>
          </div>

          {email ? (
            <div className="auth-feedback-meta">
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
            © 2026 VOCASEEK INC. ALL RIGHTS RESERVED.
          </div>
        </section>
      </div>
    </div>
  );
}
