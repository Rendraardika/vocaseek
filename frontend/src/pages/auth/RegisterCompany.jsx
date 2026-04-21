import "../../styles/registercompany.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage, registerCompany } from "../../services/auth";
import { saveLanguagePreference } from "../../utils/languagePreference";

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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      {/* LEFT */}
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

          <div className="rc-left-footer">© VOKASIK EST. 2026</div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="rc-right">
        <div className="rc-container">
          {/* LOGO */}
          <div className="rc-logo">
            <img src="/logovocaseek2.png" alt="Vocaseek" />
          </div>

          {/* TITLE */}
          <h2 className="rc-title">Partner With Us</h2>

          <p className="rc-desc">
            Complete legal registration to start a professional partnership.
          </p>

          {/* ROLE SWITCH */}
          <div className="rc-role-switch">
            <Link to="/register" className="rc-role">
              Pelamar
            </Link>

            <div className="rc-role active">Company</div>
          </div>

          {/* FORM */}
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
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="rc-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="passwordConfirmation"
                value={form.passwordConfirmation}
                onChange={handleChange}
                required
              />
            </div>

            {/* Upload LoA */}
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

            {/* Upload SK */}
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

            {/* TERMS */}
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
