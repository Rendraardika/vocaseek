import "../../styles/logincompany.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
      const session = saveAuthSession(response.data, { email: form.email });
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
      {/* LEFT SIDE */}
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
            © VOKASIK <span>EST. 2026</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="lc-login-right">
        <div className="lc-login-logo">
          <img src="/logovocaseek2.png" alt="Vocaseek Logo" />
        </div>

        <div className="lc-login-form">
          <h2>Masuk ke Akun Vokasik</h2>

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

              <input
                type="password"
                name="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
                required
              />
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
          © 2026 VOKASIK INC. ALL RIGHTS RESERVED.
        </div>
      </div>
    </div>
  );
}

export default Login;
