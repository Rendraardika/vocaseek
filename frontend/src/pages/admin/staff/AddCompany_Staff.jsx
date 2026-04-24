import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/SidebarStaff";
import "../../../styles/AddCompany.css";
import {
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  Mail,
  Phone,
  Save,
  CircleHelp,
} from "lucide-react";
import { getApiErrorMessage } from "../../../services/auth";
import { createAdminPartner } from "../../../services/admin";
import { translatePhrase } from "../../../i18n/phrases";
import { getSavedLanguage } from "../../../utils/languagePreference";

const INDUSTRY_OPTIONS = [
  "Teknologi Informasi",
  "Retail",
  "NGO",
  "Design Agency",
];

const INITIAL_FORM = {
  nama_perusahaan: "",
  industry: "Teknologi Informasi",
  website_url: "",
  description: "",
  nama_pic: "",
  jabatan_pic: "",
  email: "",
  notelp: "",
  alamat_kantor_pusat: "",
  kota: "",
  provinsi: "",
  kode_pos: "",
};

function SaveConfirmationModal({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  locale,
}) {
  if (!open) return null;

  return (
    <div className="ac-modal-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ac-modal-icon-wrap">
          <div className="ac-modal-icon-ring">
            <CircleHelp size={28} />
          </div>
        </div>

        <h3 className="ac-modal-title">
          {translatePhrase("Simpan Perubahan?", locale) || "Simpan Perubahan?"}
        </h3>
        <p className="ac-modal-text">
          {(translatePhrase("Apakah Anda yakin ingin menambah", locale) ||
            "Apakah Anda yakin ingin menambah")}
          <br />
          {translatePhrase("Perusahaan ini?", locale) || "Perusahaan ini?"}
        </p>

        <div className="ac-modal-actions">
          <button
            type="button"
            className="ac-modal-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {translatePhrase("Tidak", locale) || "Tidak"}
          </button>

          <button
            type="button"
            className="ac-modal-confirm"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? translatePhrase("Menyimpan...", locale) || "Menyimpan..."
              : translatePhrase("Iya", locale) || "Iya"}
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeWebsiteUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function appendValue(formData, key, value) {
  if (value === null || value === undefined) return;

  const text = String(value).trim();
  if (!text) return;

  formData.append(key, text);
}

function buildPartnerPayload(form) {
  const formData = new FormData();
  const websiteUrl = normalizeWebsiteUrl(form.website_url);

  appendValue(formData, "nama_perusahaan", form.nama_perusahaan);
  appendValue(formData, "company_name", form.nama_perusahaan);
  appendValue(formData, "industri", form.industry);
  appendValue(formData, "industry", form.industry);
  appendValue(formData, "website_url", websiteUrl);
  appendValue(formData, "website", websiteUrl);
  appendValue(formData, "description", form.description);
  appendValue(formData, "deskripsi", form.description);
  appendValue(formData, "nama_pic", form.nama_pic);
  appendValue(formData, "pic_name", form.nama_pic);
  appendValue(formData, "jabatan_pic", form.jabatan_pic);
  appendValue(formData, "pic_role", form.jabatan_pic);
  appendValue(formData, "email", form.email);
  appendValue(formData, "company_email", form.email);
  appendValue(formData, "notelp", form.notelp);
  appendValue(formData, "phone", form.notelp);
  appendValue(formData, "alamat_lengkap", form.alamat_kantor_pusat);
  appendValue(formData, "address", form.alamat_kantor_pusat);
  appendValue(formData, "alamat", form.alamat_kantor_pusat);
  appendValue(formData, "alamat_kantor_pusat", form.alamat_kantor_pusat);
  appendValue(formData, "alamat_kantor", form.alamat_kantor_pusat);
  appendValue(formData, "city", form.kota);
  appendValue(formData, "kota", form.kota);
  appendValue(formData, "province", form.provinsi);
  appendValue(formData, "provinsi", form.provinsi);
  appendValue(formData, "postal_code", form.kode_pos);
  appendValue(formData, "kode_pos", form.kode_pos);

  return formData;
}

export default function AddCompany() {
  const navigate = useNavigate();
  const [locale, setLocale] = React.useState(getSavedLanguage());
  const [form, setForm] = React.useState(INITIAL_FORM);
  const [openModal, setOpenModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const syncLanguage = () => {
      setLocale(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);
    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setOpenModal(true);
  };

  const handleConfirmSave = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = buildPartnerPayload(form);
      await createAdminPartner(payload);

      setSuccessMessage(
        translatePhrase("Mitra baru berhasil ditambahkan.", locale) ||
          "Mitra baru berhasil ditambahkan.",
      );
      setOpenModal(false);
      navigate("/admin/staff/partners");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          translatePhrase("Gagal menambahkan mitra baru.", locale) ||
            "Gagal menambahkan mitra baru.",
        ),
      );
      setOpenModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ac-layout">
      <Sidebar />

      <main className="ac-main">
        <section className="ac-content">
          <div className="ac-top-row">
            <div>
              <div className="ac-breadcrumb">
                <span>ADMIN &gt; </span>
                <span>{translatePhrase("PARTNERS", locale) || "PARTNERS"} &gt; </span>
                <span className="active">
                  {translatePhrase("TAMBAH MITRA", locale) || "TAMBAH MITRA"}
                </span>
              </div>

              <h1 className="ac-page-title">
                {translatePhrase("Tambah Mitra Baru", locale) || "Tambah Mitra Baru"}
              </h1>
            </div>

            <button type="button" className="ac-back-btn" onClick={handleBack}>
              <ArrowLeft size={15} />
              <span>
                {translatePhrase("Kembali ke Daftar", locale) || "Kembali ke Daftar"}
              </span>
            </button>
          </div>

          {errorMessage && (
            <div style={{ marginBottom: 16, color: "#d93025", fontWeight: 500 }}>
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div style={{ marginBottom: 16, color: "#169b62", fontWeight: 500 }}>
              {successMessage}
            </div>
          )}

          <form className="ac-form" onSubmit={handleSubmit}>
            <div className="ac-card">
              <div className="ac-card-head">
                <h2>
                  {translatePhrase("Informasi Dasar Perusahaan", locale) ||
                    "Informasi Dasar Perusahaan"}
                </h2>
                <p>
                  {translatePhrase("Detail utama profil perusahaan mitra.", locale) ||
                    "Detail utama profil perusahaan mitra."}
                </p>

                <div className="ac-field full">
                  <label>
                    {translatePhrase("Nama Perusahaan", locale) || "Nama Perusahaan"}{" "}
                    <span>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nama_perusahaan}
                    onChange={handleChange("nama_perusahaan")}
                    placeholder={
                      translatePhrase("Masukkan nama perusahaan", locale) ||
                      "Masukkan nama perusahaan"
                    }
                    required
                  />
                </div>

                <div className="ac-grid-2">
                  <div className="ac-field">
                    <label>
                      {translatePhrase("Industri", locale) || "Industri"} <span>*</span>
                    </label>
                    <div className="ac-select-wrap">
                      <select
                        value={form.industry}
                        onChange={handleChange("industry")}
                        required
                      >
                        {INDUSTRY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {translatePhrase(option, locale) || option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="ac-select-icon" />
                    </div>
                  </div>

                  <div className="ac-field">
                    <label>Website</label>
                    <div className="ac-url-input">
                      <span>https://</span>
                      <input
                        type="text"
                        placeholder="www.example.com"
                        value={form.website_url}
                        onChange={handleChange("website_url")}
                      />
                    </div>
                  </div>
                </div>

                <div className="ac-field full">
                  <label>
                    {translatePhrase("Deskripsi Singkat", locale) || "Deskripsi Singkat"}
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={handleChange("description")}
                    maxLength={500}
                  />
                  <small>
                    {translatePhrase("Maksimal 500 karakter.", locale) ||
                      "Maksimal 500 karakter."}
                  </small>
                </div>
              </div>
            </div>

            <div className="ac-card">
              <div className="ac-card-head">
                <h2>
                  {translatePhrase("Kontak PIC (Person In Charge)", locale) ||
                    "Kontak PIC (Person In Charge)"}
                </h2>
                <p>
                  {translatePhrase(
                    "Informasi kontak penanggung jawab dari pihak mitra.",
                    locale,
                  ) || "Informasi kontak penanggung jawab dari pihak mitra."}
                </p>
              </div>

              <div className="ac-card-body">
                <div className="ac-grid-2">
                  <div className="ac-field">
                    <label>
                      {translatePhrase("Nama Lengkap PIC", locale) ||
                        "Nama Lengkap PIC"}{" "}
                      <span>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nama_pic}
                      onChange={handleChange("nama_pic")}
                      required
                    />
                  </div>

                  <div className="ac-field">
                    <label>
                      {translatePhrase("Jabatan", locale) || "Jabatan"} <span>*</span>
                    </label>
                    <input
                      type="text"
                      value={form.jabatan_pic}
                      onChange={handleChange("jabatan_pic")}
                      required
                    />
                  </div>
                </div>

                <div className="ac-grid-2">
                  <div className="ac-field">
                    <label>
                      {translatePhrase("Alamat Email", locale) || "Alamat Email"}{" "}
                      <span>*</span>
                    </label>
                    <div className="ac-icon-input">
                      <Mail size={15} />
                      <input
                        type="email"
                        placeholder={
                          translatePhrase("pic@perusahaan.com", locale) ||
                          "pic@perusahaan.com"
                        }
                        value={form.email}
                        onChange={handleChange("email")}
                        required
                      />
                    </div>
                  </div>

                  <div className="ac-field">
                    <label>
                      {translatePhrase("Nomor Telepon / WhatsApp", locale) ||
                        "Nomor Telepon / WhatsApp"}{" "}
                      <span>*</span>
                    </label>
                    <div className="ac-icon-input">
                      <Phone size={15} />
                      <input
                        type="text"
                        placeholder="+62 812 3456 7890"
                        value={form.notelp}
                        onChange={handleChange("notelp")}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ac-card">
              <div className="ac-card-head">
                <h2>{translatePhrase("Alamat Kantor", locale) || "Alamat Kantor"}</h2>
                <p>
                  {translatePhrase("Lokasi operasional utama perusahaan.", locale) ||
                    "Lokasi operasional utama perusahaan."}
                </p>
              </div>

              <div className="ac-card-body">
                <div className="ac-field full">
                  <label>
                    {translatePhrase("Alamat Lengkap", locale) || "Alamat Lengkap"}
                  </label>
                      <input
                        type="text"
                        value={form.alamat_kantor_pusat}
                        onChange={handleChange("alamat_kantor_pusat")}
                        required
                      />
                    </div>

                    <div className="ac-grid-3">
                      <div className="ac-field">
                        <label>{translatePhrase("Kota", locale) || "Kota"}</label>
                        <input
                          type="text"
                          value={form.kota}
                          onChange={handleChange("kota")}
                          required
                        />
                      </div>

                      <div className="ac-field">
                        <label>{translatePhrase("Provinsi", locale) || "Provinsi"}</label>
                        <input
                          type="text"
                          value={form.provinsi}
                          onChange={handleChange("provinsi")}
                          required
                        />
                      </div>

                      <div className="ac-field">
                        <label>{translatePhrase("Kode Pos", locale) || "Kode Pos"}</label>
                        <input
                          type="text"
                          value={form.kode_pos}
                          onChange={handleChange("kode_pos")}
                          required
                        />
                      </div>
                    </div>
              </div>
            </div>

            <div className="ac-actions">
              <button type="button" className="ac-cancel-btn" onClick={handleBack}>
                {translatePhrase("Batal", locale) || "Batal"}
              </button>

              <button type="submit" className="ac-save-btn" disabled={isSubmitting}>
                <Save size={15} />
                <span>
                  {isSubmitting
                    ? translatePhrase("Menyimpan...", locale) || "Menyimpan..."
                    : translatePhrase("Simpan Mitra", locale) || "Simpan Mitra"}
                </span>
              </button>
            </div>
          </form>

          <footer className="ac-footer">© 2026 VOKASIK ACADEMY</footer>
        </section>
      </main>

      <SaveConfirmationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirmSave}
        isSubmitting={isSubmitting}
        locale={locale}
      />
    </div>
  );
}
