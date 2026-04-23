import "../../styles/auth-feedback.css";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiKey,
} from "react-icons/fi";
import {
  getApiErrorMessage,
  resetPassword,
  validatePasswordResetToken,
} from "../../services/auth";

function isStrongPassword(value) {
  return /^[A-Z](?=.*[^A-Za-z0-9])[^\s]{7,}$/.test(String(value || ""));
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [tokenStatus, setTokenStatus] = useState(
    email && token ? "checking" : "invalid",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (tokenStatus !== "valid") {
      setError("Link reset password tidak valid atau tidak lengkap.");
      return;
    }

    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi password harus sama dengan password baru.");
      return;
    }

    if (!isStrongPassword(form.password)) {
      setError(
        "Password minimal 8 karakter, huruf pertama harus kapital, wajib mengandung karakter unik, dan tidak boleh memakai spasi.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      navigate("/reset-success", { replace: true });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Gagal memperbarui password. Pastikan link reset masih berlaku.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!email || !token) {
      setTokenStatus("invalid");
      return;
    }

    let isMounted = true;

    const checkToken = async () => {
      setError("");
      setTokenStatus("checking");

      try {
        await validatePasswordResetToken({ email, token });

        if (isMounted) {
          setTokenStatus("valid");
        }
      } catch (requestError) {
        if (isMounted) {
          setTokenStatus("invalid");
          setError(
            getApiErrorMessage(
              requestError,
              "Link reset password tidak valid atau sudah kadaluarsa.",
            ),
          );
        }
      }
    };

    checkToken();

    return () => {
      isMounted = false;
    };
  }, [email, token]);

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
              Password Baru
            </div>
            <h1>Ubah kata sandi dengan langkah yang lebih nyaman dibaca.</h1>
            <p>
              Kami cek dulu validitas tautannya, lalu kamu bisa langsung membuat
              password baru dengan aman.
            </p>
          </div>

          <div className="auth-feedback-stats">
            <div className="auth-feedback-stat">
              <strong>Status tautan</strong>
              <span>
                {tokenStatus === "checking"
                  ? "Sedang memeriksa tautan reset password."
                  : tokenStatus === "valid"
                    ? "Tautan valid dan siap dipakai."
                    : "Tautan tidak valid atau sudah kedaluwarsa."}
              </span>
            </div>
            <div className="auth-feedback-stat">
              <strong>Email tujuan</strong>
              <span>{email || "Email tidak ditemukan pada tautan reset."}</span>
            </div>
          </div>
        </section>

        <section className="auth-feedback-card">
          <div className="auth-feedback-card-header">
            <div
              className={`auth-feedback-icon ${
                tokenStatus === "invalid"
                  ? "is-danger"
                  : tokenStatus === "valid"
                    ? "is-success"
                    : ""
              }`}
            >
              {tokenStatus === "invalid" ? (
                <FiAlertCircle size={28} />
              ) : tokenStatus === "valid" ? (
                <FiCheckCircle size={28} />
              ) : (
                <FiKey size={28} />
              )}
            </div>
            <div>
              <h2>Buat Kata Sandi Baru</h2>
              <p className="auth-feedback-description">
                Gunakan kata sandi yang kuat dan belum pernah digunakan
                sebelumnya.
              </p>
              <p className="auth-feedback-description" style={{ marginTop: 8 }}>
                Minimal 8 karakter, huruf pertama kapital, dan wajib ada karakter unik.
              </p>
            </div>
          </div>

          <form className="auth-feedback-form" onSubmit={handleSubmit}>
            <div className="auth-feedback-field">
              <label htmlFor="new-password">Kata Sandi Baru</label>
              <div className="auth-feedback-input-wrap">
                <input
                  id="new-password"
                  type={show1 ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  disabled={tokenStatus !== "valid"}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-feedback-toggle"
                  onClick={() => setShow1((prev) => !prev)}
                >
                  {show1 ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="auth-feedback-field">
              <label htmlFor="confirm-password">Konfirmasi Kata Sandi</label>
              <div className="auth-feedback-input-wrap">
                <input
                  id="confirm-password"
                  type={show2 ? "text" : "password"}
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  minLength={8}
                  disabled={tokenStatus !== "valid"}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-feedback-toggle"
                  onClick={() => setShow2((prev) => !prev)}
                >
                  {show2 ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {tokenStatus === "checking" ? (
              <div className="auth-feedback-message is-info">
                Memeriksa validitas link reset password...
              </div>
            ) : null}

            {tokenStatus === "invalid" ? (
              <div className="auth-feedback-message is-error">
                Link reset password tidak valid. Silakan minta link baru.
              </div>
            ) : null}

            {error ? (
              <div className="auth-feedback-message is-error">{error}</div>
            ) : null}

            <button
              className="auth-feedback-button"
              type="submit"
              disabled={isSubmitting || tokenStatus !== "valid"}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
          </form>

          <div className="auth-feedback-actions" style={{ marginTop: 16 }}>
            <Link to="/forget-password" className="auth-feedback-link-secondary">
              Minta Link Reset Baru
            </Link>
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
