import "../../styles/registercompany.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { getApiErrorMessage, registerCompany } from "../../services/auth";
import { saveLanguagePreference } from "../../utils/languagePreference";

function sanitizePhoneInput(value) {
  const cleaned = String(value || "").replace(/[^\d+]/g, "");

  if (!cleaned) return "";
  if (cleaned.startsWith("+")) {
    return `+${cleaned.slice(1).replace(/\+/g, "")}`;
  }

  return cleaned.replace(/\+/g, "");
}

function isStrongPassword(value) {
  return /^[A-Z](?=.*[^A-Za-z0-9])[^\s]{7,}$/.test(String(value || ""));
}

export default function RegisterCompany() {
  const maxFileSizeInBytes = 5 * 1024 * 1024;
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    nib: "",
    password: "",
    passwordConfirmation: "",
    agreeTerms: false,
  });
  const [documents, setDocuments] = useState({
    loaFile: null,
    deedFile: null,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswordFields, setVisiblePasswordFields] = useState({
    password: false,
    passwordConfirmation: false,
  });

  const togglePasswordVisibility = (fieldName) => {
    setVisiblePasswordFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const normalizedValue =
      name === "phone" ? sanitizePhoneInput(value) : value;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : normalizedValue,
    }));
  };

  const handleFileChange = (fieldName) => (event) => {
    const selectedFile = event.target.files?.[0] || null;

    if (!selectedFile) {
      setDocuments((prev) => ({
        ...prev,
        [fieldName]: null,
      }));
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Dokumen yang diunggah harus dalam format PDF.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > maxFileSizeInBytes) {
      setError("Ukuran dokumen maksimal 5 MB sesuai batas backend.");
      event.target.value = "";
      return;
    }

    setError("");
    setDocuments((prev) => ({
      ...prev,
      [fieldName]: selectedFile,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.agreeTerms) {
      setError("Anda harus menyetujui syarat kemitraan sebelum mendaftar.");
      return;
    }

    if (form.password !== form.passwordConfirmation) {
      setError("Konfirmasi password harus sama dengan password.");
      return;
    }

    if (!isStrongPassword(form.password)) {
      setError(
        "Password minimal 8 karakter, huruf pertama harus kapital, wajib mengandung karakter unik, dan tidak boleh memakai spasi.",
      );
      return;
    }

    if (!documents.loaFile || !documents.deedFile) {
      setError("Dokumen LoA dan Akta Pendirian wajib diunggah.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("nama", form.companyName);
      payload.append("email", form.email);
      payload.append("notelp", form.phone);
      payload.append("nib", form.nib);
      payload.append("password", form.password);
      payload.append("password_confirmation", form.passwordConfirmation);
      payload.append("role", "company");
      payload.append("nama_perusahaan", form.companyName);
      payload.append("loa_pdf", documents.loaFile);
      payload.append("akta_pdf", documents.deedFile);

      const response = await registerCompany(payload);
      const responseLocale = response?.data?.locale || response?.data?.data?.locale;

      if (responseLocale === "id" || responseLocale === "en") {
        saveLanguagePreference(responseLocale);
      }

      navigate("/check-email", {
        replace: true,
        state: {
          loginPath: "/login-company",
          email: form.email,
          message:
            response?.data?.message ||
            "Registrasi company berhasil. Cek email untuk verifikasi akun terlebih dahulu. Setelah itu, akun company tetap menunggu approval sebelum bisa login.",
        },
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Registrasi company gagal. Pastikan data legal perusahaan sudah lengkap.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rc-page">
      <div className="rc-left">
        <div className="rc-overlay">
          <h1>
            Temukan Magang <br />
            Impianmu Bersama <br />
            <span>Vocaseek</span>
          </h1>

          <p>
            Platform yang menghubungkan talenta muda dengan perusahaan untuk
            membangun pengalaman dan kesiapan kerja.
          </p>

          <div className="rc-left-footer">© VOCASEEK EST. 2026</div>
        </div>
      </div>

      <div className="rc-right">
        <div className="rc-container">
          <div className="rc-logo">
            <img src="/logovocaseek2.png" alt="Vocaseek" />
          </div>

          <h2 className="rc-title">Partner With Us</h2>

          <p className="rc-desc">
            Complete legal registration to start a professional partnership.
          </p>

          <div className="rc-role-switch">
            <Link to="/register" className="rc-role">
              Pelamar
            </Link>

            <div className="rc-role active">Company</div>
          </div>

          <form className="rc-form" onSubmit={handleSubmit}>
            <div className="rc-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                placeholder="company name"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="rc-group">
              <label>Company Email</label>
              <input
                type="email"
                name="email"
                placeholder="company@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="rc-group">
              <label>Company Phone</label>
              <input
                type="text"
                name="phone"
                placeholder="+62 "
                value={form.phone}
                onChange={handleChange}
                inputMode="numeric"
                pattern="^\+?\d+$"
                autoComplete="tel"
                required
              />
            </div>

            <div className="rc-group">
              <label>Nomor Induk Berusaha (NIB)</label>
              <input
                type="text"
                name="nib"
                placeholder="NIB number"
                value={form.nib}
                onChange={handleChange}
                required
              />
            </div>

            <div className="rc-group">
              <label>Create Password</label>
              <div className="rc-password-field">
                <input
                  type={visiblePasswordFields.password ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="rc-password-toggle"
                  onClick={() => togglePasswordVisibility("password")}
                  aria-label={
                    visiblePasswordFields.password
                      ? "Sembunyikan password"
                      : "Lihat password"
                  }
                >
                  {visiblePasswordFields.password ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
              <p style={{ marginTop: 8, fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.5 }}>
                Minimal 8 karakter, huruf pertama kapital, dan wajib ada karakter unik.
              </p>
            </div>

            <div className="rc-group">
              <label>Confirm Password</label>
              <div className="rc-password-field">
                <input
                  type={
                    visiblePasswordFields.passwordConfirmation
                      ? "text"
                      : "password"
                  }
                  name="passwordConfirmation"
                  value={form.passwordConfirmation}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="rc-password-toggle"
                  onClick={() => togglePasswordVisibility("passwordConfirmation")}
                  aria-label={
                    visiblePasswordFields.passwordConfirmation
                      ? "Sembunyikan konfirmasi password"
                      : "Lihat konfirmasi password"
                  }
                >
                  {visiblePasswordFields.passwordConfirmation ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="rc-upload-group">
              <label>Letter of Acceptance (LoA)</label>

              <label className="rc-upload">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange("loaFile")}
                  hidden
                />

                <strong>
                  {documents.loaFile
                    ? documents.loaFile.name
                    : "Upload LoA (PDF)"}
                </strong>
                <span>Maximum file size: 5MB</span>
              </label>
            </div>

            <div className="rc-upload-group">
              <label>Akta Pendirian (SK)</label>

              <label className="rc-upload rc-upload-yellow">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange("deedFile")}
                  hidden
                />

                <strong>
                  {documents.deedFile
                    ? documents.deedFile.name
                    : "Upload Deed of Establishment (PDF)"}
                </strong>
                <span>Maximum file size: 5MB</span>
              </label>
            </div>

            <div className="rc-terms">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={form.agreeTerms}
                onChange={handleChange}
              />
              <span>
                I agree to the <a href="#">Terms of Partnership</a> and legal
                compliance requirements.
              </span>
            </div>

            {error ? (
              <p style={{ color: "#d93025", fontSize: "0.9rem", marginBottom: "16px" }}>
                {error}
              </p>
            ) : null}

            <button type="submit" className="rc-btn">
              {isSubmitting ? "Memproses..." : "Register Company"}
            </button>
          </form>

          <div className="rc-footer">
            Already a partner? <Link to="/login-company">Sign in</Link>
          </div>

          <div className="rc-copyright">
            © 2026 VOCASEEK INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </div>
  );
}
