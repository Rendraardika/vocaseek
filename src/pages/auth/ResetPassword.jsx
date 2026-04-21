import "../../styles/resetpassword.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getApiErrorMessage,
  resetPassword,
  validatePasswordResetToken,
} from "../../services/auth";

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
  const [tokenStatus, setTokenStatus] = useState(email && token ? "checking" : "invalid");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleFirstPassword = () => {
    setShow1((prev) => !prev);
  };

  const toggleSecondPassword = () => {
    setShow2((prev) => !prev);
  };

  const handleToggleKeyDown = (event, toggle) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
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
    <div className="rp-page">
      <div className="rp-logo">
        <img src="/vocaseeklogo.png" alt="Vocaseek" />
      </div>

      <div className="rp-card">
        <h2>Buat Kata Sandi Baru</h2>

        <p>
          Gunakan kata sandi yang kuat dan belum
          pernah digunakan sebelumnya.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="rp-group">
            <label>Kata Sandi Baru</label>

            <div className="rp-input">
              <input
                type={show1 ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                disabled={tokenStatus !== "valid"}
                required
              />

              <span
                onClick={toggleFirstPassword}
                onKeyDown={(event) => handleToggleKeyDown(event, toggleFirstPassword)}
                role="button"
                tabIndex={0}
              >
                Lihat
              </span>
            </div>
          </div>

          <div className="rp-group">
            <label>Konfirmasi Kata Sandi</label>

            <div className="rp-input">
              <input
                type={show2 ? "text" : "password"}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                minLength={8}
                disabled={tokenStatus !== "valid"}
                required
              />

              <span
                onClick={toggleSecondPassword}
                onKeyDown={(event) => handleToggleKeyDown(event, toggleSecondPassword)}
                role="button"
                tabIndex={0}
              >
                Lihat
              </span>
            </div>
          </div>

          {tokenStatus === "checking" ? (
            <p style={{ color: "#0f766e", fontSize: "0.9rem", marginBottom: "16px" }}>
              Memeriksa validitas link reset password...
            </p>
          ) : null}

          {tokenStatus === "invalid" ? (
            <p style={{ color: "#d93025", fontSize: "0.9rem", marginBottom: "16px" }}>
              Link reset password tidak valid. Silakan minta link baru.
            </p>
          ) : null}

          {error ? (
            <p style={{ color: "#d93025", fontSize: "0.9rem", marginBottom: "16px" }}>
              {error}
            </p>
          ) : null}

          <button
            className="rp-btn"
            type="submit"
            disabled={isSubmitting || tokenStatus !== "valid"}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>

      <div className="rp-footer">
        © 2026 VOKASIK INC. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
}
