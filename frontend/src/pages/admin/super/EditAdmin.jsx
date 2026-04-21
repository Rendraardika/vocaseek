import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/Sidebar";
import "../../../styles/EditAdmin.css";
import {
  UserRound,
  ShieldCheck,
  ChevronDown,
  Save,
  CircleHelp,
  ArrowLeft,
} from "lucide-react";

function SaveEditAdminModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="ea-modal-overlay" onClick={onClose}>
      <div className="ea-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ea-modal-icon-wrap">
          <div className="ea-modal-icon-ring">
            <CircleHelp size={28} />
          </div>
        </div>

        <h3 className="ea-modal-title">Simpan Perubahan?</h3>
        <p className="ea-modal-text">
          Apakah Anda yakin ingin menyimpan perubahan
          <br />
          pada data admin ini?
        </p>

        <div className="ea-modal-actions">
          <button type="button" className="ea-modal-cancel" onClick={onClose}>
            Tidak
          </button>
          <button type="button" className="ea-modal-confirm" onClick={onConfirm}>
            Iya
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditAdmin() {
  const navigate = useNavigate();
  const location = useLocation();

  const admin = location.state || {
    name: "Putri Eka",
    email: "putri.eka@vokaseek.com",
    phone: "+62 812 3456 7890",
    role: "SUPER ADMIN",
    status: "Active",
  };

  const [openModal, setOpenModal] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenModal(true);
  };

  const handleConfirmSave = () => {
    setOpenModal(false);
    navigate("/admin/user-management");
  };

  return (
    <div className="ea-layout">
      <Sidebar />

      <main className="ea-main">

        <section className="ea-content">
          <div className="ea-breadcrumb">
            <span>Admin</span>
            <span className="ea-breadcrumb-separator">›</span>
            <span>User Management</span>
            <span className="ea-breadcrumb-separator">›</span>
            <span className="active">Edit Admin</span>
          </div>

          <h1 className="ea-page-title">
            <ArrowLeft
              size={20}
              className="ea-back-icon"
              onClick={() => navigate(-1)}
            />
            Edit Admin
          </h1>

          <form className="ea-card" onSubmit={handleSubmit}>
            <div className="ea-card-head">
              <h2>Informasi Admin</h2>
              <p>Silakan perbarui data admin yang telah terdaftar.</p>
            </div>

            <div className="ea-section">
              <div className="ea-section-title">
                <div className="ea-section-icon blue">
                  <UserRound size={18} />
                </div>
                <h3>Informasi Akun</h3>
              </div>

              <div className="ea-grid-2">
                <div className="ea-field">
                  <label>NAMA LENGKAP</label>
                  <input type="text" defaultValue={admin.name} required />
                </div>

                <div className="ea-field">
                  <label>ALAMAT EMAIL</label>
                  <input type="email" defaultValue={admin.email} required />
                </div>
              </div>

              <div className="ea-field full">
                <label>NOMOR TELEPON</label>
                <input type="text" defaultValue={admin.phone} required />
              </div>
            </div>

            <div className="ea-section">
              <div className="ea-section-title">
                <div className="ea-section-icon yellow">
                  <ShieldCheck size={18} />
                </div>
                <h3>Pengaturan Peran</h3>
              </div>

              <div className="ea-grid-2">
                <div className="ea-field">
                  <label>PILIH ROLE / PERAN</label>
                  <div className="ea-select-wrap">
                    <select defaultValue={admin.role} required>
                      <option value="SUPER ADMIN">Super Admin</option>
                      <option value="STAFF ADMIN">Staff Admin</option>
                    </select>
                    <ChevronDown size={18} className="ea-select-icon" />
                  </div>
                  <small>
                    Peran menentukan tingkat akses dan izin di dashboard internal.
                  </small>
                </div>

                <div className="ea-field">
                  <label>STATUS AKTIVASI ADMIN</label>
                  <div className="ea-select-wrap">
                    <select defaultValue={admin.status} required>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown size={18} className="ea-select-icon" />
                  </div>
                  <small>
                    Status menentukan apakah admin dapat login ke dashboard.
                  </small>
                </div>
              </div>
            </div>

            <div className="ea-actions">
              <button
                type="button"
                className="ea-cancel-btn"
                onClick={() => navigate(-1)}
              >
                Batal
              </button>

              <button type="submit" className="ea-save-btn">
                <Save size={16} />
                <span>Simpan</span>
              </button>
            </div>
          </form>
        </section>
      </main>

      <SaveEditAdminModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}

