import "../../styles/AdminActivateAccount.css";
import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, KeyRound, LoaderCircle } from "lucide-react";
import { getApiErrorMessage } from "../../services/auth";
import { acceptAdminInvitation, verifyAdminInvitation } from "../../services/admin";

const STATUS_UI = {
  loading: {
    title: "Memverifikasi Tautan Aktivasi",
    description: "Mohon tunggu. Sistem sedang memeriksa validitas tautan aktivasi akun admin.",
    tone: "neutral",
  },
  valid: {
    title: "Aktivasi Akun Admin",
    description: "Buat password Anda untuk mengaktifkan akun admin.",
    tone: "neutral",
  },
  expired: {
    title: "Tautan Aktivasi Kedaluwarsa",
    description: "Tautan aktivasi sudah kedaluwarsa.",
    tone: "warning",
  },
  used: {
    title: "Tautan Sudah Digunakan",
    description: "Tautan aktivasi tidak valid atau sudah tidak dapat digunakan.",
    tone: "danger",
  },
  invalid: {
    title: "Tautan Aktivasi Tidak Valid",
    description: "Tautan aktivasi tidak valid atau sudah tidak dapat digunakan.",
    tone: "danger",
  },
  success: {
    title: "Aktivasi Berhasil",
    description: "Akun admin berhasil diaktifkan. Anda akan diarahkan ke halaman login.",
    tone: "success",
  },
};

function mapInvitationErrorState(error) {
  const errorCode = error?.response?.data?.code;

  if (errorCode === "invitation_expired") return "expired";
  if (errorCode === "invitation_used") return "used";
  return "invalid";
}

export default function AdminActivateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = React.useState(token ? "loading" : "invalid");
  const [invitation, setInvitation] = React.useState(null);
  const [form, setForm] = React.useState({
    password: "",
    passwordConfirmation: "",
  });
  const [error, setError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadInvitation = async () => {
      if (!token) {
        setStatus("invalid");
        return;
      }

      setStatus("loading");
      setError("");

      try {
        const response = await verifyAdminInvitation({ token });
        if (!isMounted) return;

        setInvitation(response?.data?.data || null);
        setStatus("valid");
      } catch (requestError) {
        if (!isMounted) return;
        setStatus(mapInvitationErrorState(requestError));
        setError(getApiErrorMessage(requestError, "Verifikasi undangan gagal."));
      }
    };

    loadInvitation();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.passwordConfirmation) {
      setError("Konfirmasi password harus sama dengan password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await acceptAdminInvitation({
        token,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      });

      setSuccessMessage(
        response?.data?.message || "Akun admin berhasil diaktifkan.",
      );
      setStatus("success");

      window.setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (requestError) {
      const mappedState = mapInvitationErrorState(requestError);
      if (mappedState !== "invalid") {
        setStatus(mappedState);
      }
      setError(
        getApiErrorMessage(
          requestError,
          "Aktivasi akun admin gagal. Silakan periksa kembali tautan dan password Anda.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const ui = STATUS_UI[status] || STATUS_UI.invalid;
  const isFormVisible = status === "valid";

  return (
    <div className="admin-activate">
      <div className="admin-activate__card">
        <div className={`admin-activate__badge admin-activate__badge--${ui.tone}`}>
          {status === "loading" ? (
            <LoaderCircle size={24} className="admin-activate__spin" />
          ) : status === "success" ? (
            <CheckCircle2 size={24} />
          ) : (
            <CircleAlert size={24} />
          )}
        </div>

        <h1>{ui.title}</h1>
        <p className="admin-activate__description">
          {status === "success" ? successMessage || ui.description : ui.description}
        </p>

        {invitation?.email ? (
          <div className="admin-activate__email-box">
            <span>Email akun</span>
            <strong>{invitation.email}</strong>
          </div>
        ) : null}

        {error && status !== "loading" ? (
          <div className="admin-activate__alert">{error}</div>
        ) : null}

        {isFormVisible ? (
          <form className="admin-activate__form" onSubmit={handleSubmit}>
            <label htmlFor="activation-password">Password</label>
            <div className="admin-activate__input-wrap">
              <KeyRound size={16} />
              <input
                id="activation-password"
                type="password"
                name="password"
                placeholder="Masukkan password baru"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <label htmlFor="activation-password-confirmation">Konfirmasi Password</label>
            <div className="admin-activate__input-wrap">
              <KeyRound size={16} />
              <input
                id="activation-password-confirmation"
                type="password"
                name="passwordConfirmation"
                placeholder="Ulangi password baru"
                value={form.passwordConfirmation}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="admin-activate__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Aktifkan Akun"}
            </button>
          </form>
        ) : (
          <div className="admin-activate__actions">
            <Link to="/login" className="admin-activate__secondary">
              Kembali ke Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
