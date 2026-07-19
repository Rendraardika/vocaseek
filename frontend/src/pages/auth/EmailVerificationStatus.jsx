import "../../styles/auth-feedback.css";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiMail } from "react-icons/fi";

const STATUS_CONFIG = {
  success: {
    iconClass: "is-success",
    kicker: "Verifikasi Berhasil",
    title: "Email berhasil diverifikasi",
    message:
      "Jika Anda mendaftar sebagai pelamar, akun sudah aktif untuk login. Jika Anda mendaftar sebagai perusahaan, akun masih menunggu persetujuan admin sebelum bisa login sebagai mitra.",
  },
  companySuccess: {
    iconClass: "is-info",
    kicker: "Verifikasi Berhasil",
    title: "Email berhasil diverifikasi",
    message:
      "Akun perusahaan Anda sudah masuk antrean verifikasi admin. Silakan tunggu persetujuan admin sebelum login sebagai mitra.",
  },
  alreadyProcessedCompany: {
    iconClass: "is-info",
    kicker: "Sudah Diproses",
    title: "Pendaftaran perusahaan sudah diproses",
    message:
      "Email perusahaan ini sudah diverifikasi sebelumnya. Jika akun belum bisa login, berarti status mitra masih menunggu persetujuan admin.",
  },
  alreadyProcessed: {
    iconClass: "is-success",
    kicker: "Sudah Diproses",
    title: "Email sudah diverifikasi",
    message:
      "Email ini sudah diproses sebelumnya. Silakan masuk menggunakan email dan password Anda.",
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
  const role = searchParams.get("role") || "";
  const isCompany = role === "company";
  const configKey =
    status === "success" && isCompany
      ? "companySuccess"
      : status === "already-processed" && isCompany
        ? "alreadyProcessedCompany"
        : status;
  const config = STATUS_CONFIG[configKey] || STATUS_CONFIG.invalid;
  const loginTarget = isCompany ? "/login-company" : "/login";

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
            {status === "success" || status === "already-processed" ? (
              <Link to={loginTarget} className="auth-feedback-link-button">
                {isCompany ? "Ke Login Perusahaan" : "Login Sekarang"}
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
