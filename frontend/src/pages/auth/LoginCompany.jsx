import "../../styles/logincompany.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { getApiErrorMessage, loginCompany } from "../../services/auth";
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
      const response = await loginCompany({
        email: form.email,
        password: form.password,
      });
      const session = saveAuthSession(response.data, {
        email: form.email,
        remember: form.remember,
      });
      navigate(resolveUserHomeRoute(session.role), { replace: true });
    } catch (requestError) {
      if (requestError?.response?.data?.code === "email_unverified") {
        navigate("/check-email", {
          replace: true,
          state: {
            email: form.email,
            loginPath: "/login-company",
            message:
              "Email company belum diverifikasi. Silakan cek inbox atau kirim ulang link verifikasi.",
          },
        });
        return;
      }

      setError(
        getApiErrorMessage(
          requestError,
          "Login partner gagal. Periksa email dan password Anda.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lc-login-page">
      <div className="lc-login-left">
        <div className="lc-login-overlay">
          <h1>
            Temukan Magang <br />
            Impianmu Bersama <br />
            <span>Vocaseek</span>
          </h1>

          <p>
            Platform yang menghubungkan talenta muda dengan perusahaan untuk
            membangun pengalaman dan kesiapan kerja.
          </p>

          <div className="lc-login-left-footer">
            © VOCASEEK <span>EST. 2026</span>
          </div>
        </div>
      </div>

      <div className="lc-login-right">
        <div className="lc-login-logo">
          <img src="/logovocaseek2.png" alt="Vocaseek Logo" />
        </div>

        <div className="lc-login-form">
          <h2>Masuk ke Akun Vocaseek</h2>

          <p className="lc-login-desc">
            Masuk untuk melanjutkan pencarian dan pengelolaan lamaran magangmu.
          </p>
          <form onSubmit={handleLogin}>
            <div className="lc-form-group">
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

            <div className="lc-form-group">
              <div className="lc-password-label">
                <label>Password</label>
                <Link to="/forget-password">Lupa Password?</Link>
              </div>

              <div className="lc-password-field">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="lc-password-toggle"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  aria-label={
                    isPasswordVisible ? "Sembunyikan password" : "Lihat password"
                  }
                >
                  {isPasswordVisible ? (
                    <EyeOff size={19} aria-hidden="true" />
                  ) : (
                    <Eye size={19} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="lc-remember">
              <label className="lc-remember-wrap">
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

            <button className="lc-login-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        <div className="lc-login-copyright">
          © 2026 VOCASEEK INC. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
}

export default Login;
