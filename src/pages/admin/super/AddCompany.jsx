import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/Sidebar";
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

        <h3 className="ac-modal-title">Simpan Perubahan?</h3>
        <p className="ac-modal-text">
          Apakah Anda yakin ingin menambah
          <br />
          Perusahaan ini?
        </p>

        <div className="ac-modal-actions">
          <button
            type="button"
            className="ac-modal-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Tidak
          </button>

          <button
            type="button"
            className="ac-modal-confirm"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Iya"}
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
  const [form, setForm] = React.useState(INITIAL_FORM);
  const [openModal, setOpenModal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

      setSuccessMessage("Mitra baru berhasil ditambahkan.");
      setOpenModal(false);
      navigate("/admin/partners");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Gagal menambahkan mitra baru."));
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
                <span>ADMIN</span>
                <ChevronRight size={14} />
                <span>PARTNERS</span>
                <ChevronRight size={14} />
                <span className="active">TAMBAH MITRA</span>
              </div>

              <h1 className="ac-page-title">Tambah Mitra Baru</h1>
            </div>

            <button type="button" className="ac-back-btn" onClick={handleBack}>
              <ArrowLeft size={15} />
              <span>Kembali ke Daftar</span>
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
                <h2>Informasi Dasar Perusahaan</h2>
                <p>Detail utama profil perusahaan mitra.</p>

                <div className="ac-field full">
                  <label>
                    Nama Perusahaan <span>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nama_perusahaan}
                    onChange={handleChange("nama_perusahaan")}
                    placeholder="Masukkan nama perusahaan"
                    required
                  />
                </div>

                <div className="ac-grid-2">
                  <div className="ac-field">
                    <label>
                      Industri <span>*</span>
                    </label>
                    <div className="ac-select-wrap">
                      <select
                        value={form.industry}
                        onChange={handleChange("industry")}
                        required
                      >
                        {INDUSTRY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
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
                  <label>Deskripsi Singkat</label>
                  <textarea
                    rows={4}
                    placeholder="Jelaskan secara singkat tentang perusahaan..."
                    value={form.description}
                    onChange={handleChange("description")}
                    maxLength={500}
                  />
                  <small>Maksimal 500 karakter.</small>
                </div>
              </div>
            </div>

            <div className="ac-card">
              <div className="ac-card-head">
                <h2>Kontak PIC (Person In Charge)</h2>
                <p>Informasi kontak penanggung jawab dari pihak mitra.</p>
              </div>

              <div className="ac-card-body">
                <div className="ac-grid-2">
                  <div className="ac-field">
                    <label>
                      Nama Lengkap PIC <span>*</span>
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
                      Jabatan <span>*</span>
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
                      Alamat Email <span>*</span>
                    </label>
                    <div className="ac-icon-input">
                      <Mail size={15} />
                      <input
                        type="email"
                        placeholder="pic@perusahaan.com"
                        value={form.email}
                        onChange={handleChange("email")}
                        required
                      />
                    </div>
                  </div>

                  <div className="ac-field">
                    <label>
                      Nomor Telepon / WhatsApp <span>*</span>
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
                <h2>Alamat Kantor</h2>
                <p>Lokasi operasional utama perusahaan.</p>
              </div>

              <div className="ac-card-body">
                <div className="ac-field full">
                  <label>Alamat Lengkap</label>
                    <input
                      type="text"
                      value={form.alamat_kantor_pusat}
                      onChange={handleChange("alamat_kantor_pusat")}
                      required
                    />
                  </div>

                  <div className="ac-grid-3">
                    <div className="ac-field">
                      <label>Kota</label>
                      <input
                        type="text"
                        value={form.kota}
                        onChange={handleChange("kota")}
                        required
                      />
                    </div>

                    <div className="ac-field">
                      <label>Provinsi</label>
                      <input
                        type="text"
                        value={form.provinsi}
                        onChange={handleChange("provinsi")}
                        required
                      />
                    </div>

                    <div className="ac-field">
                      <label>Kode Pos</label>
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
                Batal
              </button>

              <button type="submit" className="ac-save-btn" disabled={isSubmitting}>
                <Save size={15} />
                <span>{isSubmitting ? "Menyimpan..." : "Simpan Mitra"}</span>
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
      />
    </div>
  );
}
