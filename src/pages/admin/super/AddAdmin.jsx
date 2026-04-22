import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/Sidebar";
import "../../../styles/AddAdmin.css";
import {
  ArrowLeft,
  BadgeCheck,
  CircleHelp,
  Mail,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getApiErrorMessage } from "../../../services/auth";
import { inviteManagedAdminUser } from "../../../services/admin";

function InviteAdminModal({ open, onClose, onConfirm, isSubmitting }) {
  if (!open) return null;

  return (
    <div className="aa-modal-overlay" onClick={onClose}>
      <div className="aa-modal" onClick={(event) => event.stopPropagation()}>
        <div className="aa-modal-icon-wrap">
          <div className="aa-modal-icon-ring">
            <CircleHelp size={28} />
          </div>
        </div>

        <h3 className="aa-modal-title">Kirim Undangan Admin?</h3>
        <p className="aa-modal-text">
          Tautan aktivasi akan dikirim ke email admin yang didaftarkan.
          Password akan dibuat sendiri oleh admin saat aktivasi akun.
        </p>

        <div className="aa-modal-actions">
          <button type="button" className="aa-modal-cancel" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="aa-modal-confirm"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Mengirim..." : "Kirim Undangan"}
          </button>
        </div>
      </div>
    </div>
  );
}

const INITIAL_FORM = {
  nama: "",
  email: "",
  notelp: "",
  role: "staff_admin",
};

function validateForm(form) {
  if (!form.nama.trim()) return "Nama lengkap wajib diisi.";
  if (!form.email.trim()) return "Alamat email wajib diisi.";
  if (!form.notelp.trim()) return "Nomor telepon wajib diisi.";
  return "";
}

export default function AddAdmin() {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = React.useState(false);
  const [form, setForm] = React.useState(INITIAL_FORM);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setSuccess("");
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setOpenModal(true);
  };

  const handleConfirmInvite = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await inviteManagedAdminUser({
        nama: form.nama.trim(),
        email: form.email.trim(),
        notelp: form.notelp.trim(),
        role: form.role,
      });

      setOpenModal(false);
      setSuccess("Undangan berhasil dikirim ke email admin.");

      navigate("/admin/user-management", {
        replace: true,
        state: {
          successMessage: "Undangan berhasil dikirim ke email admin.",
        },
      });
    } catch (submitError) {
      setOpenModal(false);
      setError(getApiErrorMessage(submitError, "Undangan admin gagal dikirim."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="aa-layout">
      <Sidebar />

      <main className="aa-main">
        <section className="aa-content">
          <div className="aa-breadcrumb">
            <span>Admin</span>
            <span className="aa-breadcrumb-separator">&gt;</span>
            <span>Manajemen User</span>
            <span className="aa-breadcrumb-separator">&gt;</span>
            <span className="active">Tambah Admin Baru</span>
          </div>

          <div className="aa-page-header">
            <div>
              <h1 className="aa-page-title">
                <ArrowLeft
                  size={20}
                  className="aa-back-icon"
                  onClick={() => navigate(-1)}
                />
                Tambah Admin Baru
              </h1>
              <p className="aa-page-subtitle">
                Masukkan data admin yang akan diundang ke sistem. Tautan aktivasi akan
                dikirim ke email yang didaftarkan.
              </p>
            </div>

            <div className="aa-page-summary">
              <div className="aa-summary-icon">
                <BadgeCheck size={18} />
              </div>
              <div>
                <strong>Invitation-based onboarding</strong>
                <p>Password tidak diatur oleh admin master.</p>
              </div>
            </div>
          </div>

          {error ? <div className="aa-alert aa-alert-error">{error}</div> : null}
          {success ? <div className="aa-alert aa-alert-success">{success}</div> : null}

          <form className="aa-card" onSubmit={handleSubmit}>
            <div className="aa-card-head">
              <div>
                <h2>Formulir Undangan Admin</h2>
                <p>
                  Informasi berikut akan digunakan untuk membuat akun admin staff
                  dengan status undangan menunggu aktivasi.
                </p>
              </div>

              <div className="aa-head-badge">Admin Staff</div>
            </div>

            <div className="aa-section">
              <div className="aa-section-title">
                <div className="aa-section-icon blue">
                  <UserRound size={18} />
                </div>
                <div>
                  <h3>Informasi Akun</h3>
                  <p>Lengkapi identitas dasar admin yang akan diundang.</p>
                </div>
              </div>

              <div className="aa-grid-2">
                <div className="aa-field">
                  <label htmlFor="admin-name">Nama Lengkap</label>
                  <input
                    id="admin-name"
                    type="text"
                    name="nama"
                    placeholder="Masukkan nama lengkap admin"
                    value={form.nama}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="aa-field">
                  <label htmlFor="admin-email">Alamat Email</label>
                  <div className="aa-input-icon-wrap">
                    <Mail size={16} className="aa-input-icon" />
                    <input
                      id="admin-email"
                      type="email"
                      name="email"
                      placeholder="contoh@vocaseek.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <small>Email ini akan menerima tautan aktivasi akun.</small>
                </div>
              </div>

              <div className="aa-grid-2 aa-grid-compact">
                <div className="aa-field">
                  <label htmlFor="admin-phone">Nomor Telepon</label>
                  <div className="aa-input-icon-wrap">
                    <Phone size={16} className="aa-input-icon" />
                    <input
                      id="admin-phone"
                      type="text"
                      name="notelp"
                      placeholder="+62 812 3456 7890"
                      value={form.notelp}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="aa-field">
                  <label htmlFor="admin-role">Role / Peran</label>
                  <div className="aa-select-static" id="admin-role">
                    <ShieldCheck size={16} />
                    <span>Admin Staff</span>
                  </div>
                  <small>Role ini memiliki akses operasional sesuai otorisasi staff admin.</small>
                </div>
              </div>
            </div>

            <div className="aa-section aa-section-muted">
              <div className="aa-section-title">
                <div className="aa-section-icon yellow">
                  <Send size={18} />
                </div>
                <div>
                  <h3>Ringkasan Proses Aktivasi</h3>
                  <p>Tahapan yang akan dijalankan sistem setelah undangan dikirim.</p>
                </div>
              </div>

              <div className="aa-timeline">
                <div className="aa-timeline-item">
                  <span className="aa-timeline-step">1</span>
                  <div>
                    <strong>Undangan dikirim via email</strong>
                    <p>Sistem membuat tautan aktivasi yang unik, aman, dan memiliki masa berlaku.</p>
                  </div>
                </div>
                <div className="aa-timeline-item">
                  <span className="aa-timeline-step">2</span>
                  <div>
                    <strong>Admin staff membuat password sendiri</strong>
                    <p>Password hanya diketahui oleh admin yang menerima undangan.</p>
                  </div>
                </div>
                <div className="aa-timeline-item">
                  <span className="aa-timeline-step">3</span>
                  <div>
                    <strong>Akun aktif setelah aktivasi berhasil</strong>
                    <p>Status akun akan berubah menjadi aktif dan dapat digunakan untuk login.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="aa-actions">
              <button
                type="button"
                className="aa-cancel-btn"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Batal
              </button>

              <button type="submit" className="aa-save-btn" disabled={isSubmitting}>
                <Send size={16} />
                <span>{isSubmitting ? "Mengirim..." : "Kirim Undangan"}</span>
              </button>
            </div>
          </form>
        </section>
      </main>

      <InviteAdminModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirmInvite}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
