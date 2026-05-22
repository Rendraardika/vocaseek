import "../../styles/login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
  getApiErrorMessage,
  loginApplicant,
  loginWithGoogleAccessToken,
  requestGoogleAccessToken,
} from "../../services/auth";
import { resolveUserHomeRoute, saveAuthSession } from "../../utils/authStorage";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginApplicant({
        email: form.email,
        password: form.password,
      });

      saveAuthSession(response.data, {
        email: form.email,
        remember: form.remember,
      });
      navigate(resolveUserHomeRoute(response.data?.role), { replace: true });
    } catch (requestError) {
      if (requestError?.response?.data?.code === "email_unverified") {
        navigate("/check-email", {
          replace: true,
          state: {
            email: form.email,
            loginPath: "/login",
            message:
              "Email Anda belum diverifikasi. Silakan cek inbox atau kirim ulang link verifikasi.",
          },
        });
        return;
      }

      setError(
        getApiErrorMessage(
          requestError,
          "Login gagal. Periksa email dan password Anda.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleSubmitting(true);

    try {
      const accessToken = await requestGoogleAccessToken();
      const response = await loginWithGoogleAccessToken({
        access_token: accessToken,
      });

      const session = saveAuthSession(response.data, {
        remember: form.remember,
      });
      navigate(resolveUserHomeRoute(session.role), { replace: true });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Login Google gagal. Pastikan konfigurasi Google di frontend dan backend sudah benar.",
        ),
      );
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-overlay">
          <h1>
            Temukan Magang <br />
            Impianmu Bersama <br />
            <span>Vocaseek</span>
          </h1>

          <p>
            Platform yang menghubungkan talenta muda dengan perusahaan untuk
            membangun pengalaman dan kesiapan kerja.
          </p>

          <div className="login-left-footer">
            © VOCASEEK <span>EST. 2026</span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-right-inner">
          <div className="login-logo">
            <img src="/logovocaseek2.png" alt="Vocaseek Logo" />
          </div>

          <div className="login-form-area">
            <h2>Masuk ke Akun Vocaseek</h2>
            <p className="login-desc">
              Masuk untuk melanjutkan pencarian dan pengelolaan lamaran
              magangmu.
            </p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Masukkan email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="password-label">
                  <label>Password</label>
                  <Link to="/forget-password">Lupa Password?</Link>
                </div>

                <input
                  type="password"
                  name="password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="remember">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                  />
                  <span>Ingat saya</span>
                </label>
              </div>

              {error ? (
                <p style={{ color: "#d93025", fontSize: "0.9rem", marginBottom: "16px" }}>
                  {error}
                </p>
              ) : null}

              <button className="login-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <button
              className="login-google-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleSubmitting}
            >
              <FcGoogle size={22} />
              <span>
                {isGoogleSubmitting ? "Memproses Google..." : "Masuk dengan Google"}
              </span>
            </button>

            <div className="login-register">
              <span>Belum punya akun?</span>
              <Link to="/register">Daftar sekarang</Link>
            </div>
          </div>

          <div className="login-copyright">
            © 2026 VOCASEEK INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
