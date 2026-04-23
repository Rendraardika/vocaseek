import "../../styles/registerpelamar.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getApiErrorMessage,
  loginWithGoogleAccessToken,
  requestGoogleAccessToken,
  registerApplicant,
} from "../../services/auth";
import { resolveUserHomeRoute, saveAuthSession } from "../../utils/authStorage";
import { saveLanguagePreference } from "../../utils/languagePreference";

function sanitizePhoneInput(value) {
  const cleaned = String(value || "").replace(/[^\d+]/g, "");

  if (!cleaned) return "";
  if (cleaned.startsWith("+")) {
    return `+${cleaned.slice(1).replace(/\+/g, "")}`;
  }

  return cleaned.replace(/\+/g, "");
}

function RegisterPelamar() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const normalizedValue =
      name === "phone" ? sanitizePhoneInput(value) : value;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : normalizedValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await registerApplicant({
        nama: form.fullName,
        email: form.email,
        notelp: form.phone,
        password: form.password,
        password_confirmation: form.password,
        role: "intern",
      });
      const responseLocale = response?.data?.locale || response?.data?.data?.locale;

      if (responseLocale === "id" || responseLocale === "en") {
        saveLanguagePreference(responseLocale);
      }

      navigate("/check-email", {
        replace: true,
        state: {
          loginPath: "/login",
          email: form.email,
          message:
            "Akun pelamar berhasil dibuat. Kami sudah mengirim email verifikasi ke inbox Anda.",
        },
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Registrasi pelamar gagal. Pastikan data yang diisi sudah benar.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setIsGoogleSubmitting(true);

    try {
      const accessToken = await requestGoogleAccessToken();
      const response = await loginWithGoogleAccessToken({
        access_token: accessToken,
      });

      const session = saveAuthSession(response.data);
      navigate(resolveUserHomeRoute(session.role), { replace: true });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Registrasi dengan Google gagal. Pastikan konfigurasi Google di frontend dan backend sudah benar.",
        ),
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-left">
        <div className="register-overlay">
          <h1>
            Temukan Magang <br />
            Impianmu Bersama <br />
            <span>Vocaseek</span>
          </h1>

          <p>
            Platform yang menghubungkan talenta muda dengan perusahaan untuk
            membangun pengalaman dan kesiapan kerja.
          </p>

          <div className="register-left-footer">
            © VOKASIK <span>EST. 2026</span>
          </div>
        </div>
      </div>

      <div className="register-right">
        <div className="register-container">
          <div className="register-logo">
            <img src="/logovocaseek2.png" alt="Vocaseek Logo" />
          </div>

          <h2 className="register-title">Get Started</h2>
          <p className="register-desc">
            Silakan isi Role Anda dan berikan detail Anda.
          </p>

          <div className="register-role-switch">
            <div className="register-role active">Pelamar</div>

            <Link to="/register-company" className="register-role">
              Company
            </Link>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="register-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Nama lengkap"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="name@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="+62"
                value={form.phone}
                onChange={handleChange}
                inputMode="numeric"
                pattern="^\+?\d+$"
                autoComplete="tel"
                required
              />
            </div>

            <div className="register-form-group">
              <div className="register-password-label">
                <label>Create Password</label>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="register-remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </div>

            {error ? (
              <p style={{ color: "#d93025", fontSize: "0.9rem", marginBottom: "16px" }}>
                {error}
              </p>
            ) : null}

            <button className="register-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : "Daftar Sebagai Pelamar"}
            </button>
          </form>

          <div className="register-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <button
            className="register-google"
            type="button"
            onClick={handleGoogleRegister}
            disabled={isGoogleSubmitting}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
            {isGoogleSubmitting ? "Memproses Google..." : "Google"}
          </button>

          <div className="register-login">
            <span>Do you have an account?</span>
            <Link to="/login">Login</Link>
          </div>

          <div className="register-copyright">
            © 2026 VOKASIK INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPelamar;
