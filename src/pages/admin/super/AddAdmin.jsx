import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/Sidebar";
import "../../../styles/AddAdmin.css";
import {
  UserRound,
  ShieldCheck,
  LockKeyhole,
  Save,
  CircleHelp,
  ArrowLeft,
} from "lucide-react";
import { getApiErrorMessage } from "../../../services/auth";
import { createManagedAdminUser } from "../../../services/admin";

function SaveAdminModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="aa-modal-overlay" onClick={onClose}>
      <div className="aa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="aa-modal-icon-wrap">
          <div className="aa-modal-icon-ring">
            <CircleHelp size={28} />
          </div>
        </div>

        <h3 className="aa-modal-title">Tambah Admin Baru?</h3>
        <p className="aa-modal-text">
          Admin staff baru akan dibuat
          <br />
          dengan password yang Anda tetapkan.
        </p>

        <div className="aa-modal-actions">
          <button type="button" className="aa-modal-cancel" onClick={onClose}>
            Batal
          </button>

          <button type="button" className="aa-modal-confirm" onClick={onConfirm}>
            Ya, Tambahkan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddAdmin() {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    nama: "",
    email: "",
    notelp: "",
    password: "",
    passwordConfirmation: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.passwordConfirmation) {
      setError("Konfirmasi password harus sama dengan create password.");
      return;
    }

    setOpenModal(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      await createManagedAdminUser({
        nama: form.nama,
        email: form.email,
        notelp: form.notelp,
        role: "staff_admin",
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      });

      setOpenModal(false);
      navigate("/admin/user-management");
    } catch (submitError) {
      setOpenModal(false);
      setError(getApiErrorMessage(submitError, "Admin gagal dibuat."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="aa-layout">
      <Sidebar />

      <main className="aa-main">

        <section className="aa-content">
          <div className="aa-breadcrumb">
            <span>Admin</span>
            <span className="aa-breadcrumb-separator">›</span>
            <span>User Management</span>
            <span className="aa-breadcrumb-separator">›</span>
            <span className="active">Tambah Admin Baru</span>
          </div>

          <h1 className="aa-page-title">
            <ArrowLeft
              size={20}
              className="aa-back-icon"
              onClick={() => navigate(-1)}
            />
            Tambah Admin Website Baru
          </h1>

          <form className="aa-card" onSubmit={handleSubmit}>
            <div className="aa-card-head">
              <h2>Informasi Admin Baru</h2>
              <p>
                Silakan lengkapi detail informasi untuk membuat akun
                administrasi baru.
              </p>
            </div>

            {/* INFORMASI AKUN */}

            <div className="aa-section">
              <div className="aa-section-title">
                <div className="aa-section-icon blue">
                  <UserRound size={18} />
                </div>
                <h3>Informasi Akun</h3>
              </div>

              <div className="aa-grid-2">
                <div className="aa-field">
                  <label>NAMA LENGKAP</label>
                  <input
                    type="text"
                    name="nama"
                    placeholder="Masukkan nama lengkap admin"
                    value={form.nama}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="aa-field">
                  <label>ALAMAT EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="contoh@vokaseek.id"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="aa-field full">
                <label>NOMOR TELEPON</label>
                <input
                  type="text"
                  name="notelp"
                  placeholder="+62 812 3456 7890"
                  value={form.notelp}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* ROLE */}

            <div className="aa-section">
              <div className="aa-section-title">
                <div className="aa-section-icon yellow">
                  <ShieldCheck size={18} />
                </div>
                <h3>Pengaturan Peran</h3>
              </div>

              <div className="aa-field full">
                <label>PILIH ROLE / PERAN</label>
                <input type="text" value="Admin Staff" readOnly />

                <small>
                  Peran menentukan tingkat akses dan izin di dashboard internal.
                </small>
              </div>
            </div>

            {/* CREATE PASSWORD */}

            <div className="aa-section">
              <div className="aa-section-title">
                <div className="aa-section-icon green">
                  <LockKeyhole size={18} />
                </div>
                <h3>Create Password</h3>
              </div>

              <div className="aa-grid-2">
                <div className="aa-field">
                  <label>CREATE PASSWORD</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Masukkan password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="aa-field">
                  <label>KONFIRMASI PASSWORD</label>
                  <input
                    type="password"
                    name="passwordConfirmation"
                    placeholder="Ulangi password"
                    value={form.passwordConfirmation}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {error ? <p className="aa-form-error">{error}</p> : null}
            </div>

            {/* ACTION */}

            <div className="aa-actions">
              <button
                type="button"
                className="aa-cancel-btn"
                onClick={() => navigate(-1)}
              >
                Batal
              </button>

              <button type="submit" className="aa-save-btn" disabled={isSaving}>
                <Save size={16} />
                <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
              </button>
            </div>
          </form>
        </section>
      </main>

      <SaveAdminModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}

