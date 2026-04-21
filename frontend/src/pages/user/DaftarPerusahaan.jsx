import "../../styles/daftarperusahaan.css";
import { useState } from "react";

import {
  FaCheckCircle,
  FaArrowLeft,
  FaFileAlt,
  FaFileUpload,
  FaFileSignature,
  FaBuilding,
  FaUserTie,
  FaEnvelope,
  FaTag,
  FaCommentDots,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

export default function DaftarPerusahaan() {
  const navigate = useNavigate();

  const [files, setFiles] = useState({
    profile: null,
    nib: null,
    npwp: null,
    proposal: null,
  });

  const [errors, setErrors] = useState({
    profile: "",
    nib: "",
    npwp: "",
    proposal: "",
  });

  // 🔥 MODAL STATE
  const [showConfirm, setShowConfirm] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrors((prev) => ({
        ...prev,
        [type]: "File harus berupa PDF.",
      }));
      setFiles((prev) => ({ ...prev, [type]: null }));
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        [type]: "Ukuran file maksimal 5MB.",
      }));
      setFiles((prev) => ({ ...prev, [type]: null }));
      e.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, [type]: "" }));
    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  // 🔥 PREVIEW FILE
  const openFile = (file) => {
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
  };

  // 🔥 TRIGGER MODAL
  const handleResetFiles = () => {
    const hasFiles =
      files.profile || files.nib || files.npwp || files.proposal;

    if (!hasFiles) {
      alert("Belum ada dokumen yang diupload.");
      return;
    }

    setShowConfirm(true);
  };

  // 🔥 CONFIRM DELETE
  const confirmDelete = () => {
    setFiles({
      profile: null,
      nib: null,
      npwp: null,
      proposal: null,
    });

    setErrors({
      profile: "",
      nib: "",
      npwp: "",
      proposal: "",
    });

    setShowConfirm(false);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const renderFileLabel = (file, defaultText) => {
    return file ? file.name : defaultText;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/register-company");
  };

  return (
    <div className="dp-page">
      {/* SIDEBAR */}
      <div className="dp-sidebar">
        <div className="dp-sidebar-content">
          <div className="dp-logo">
            <img src="/logovocaseek2.png" alt="Vocaseek" />
          </div>

          <h2>Bangun Masa Depan Vokasi Bersama.</h2>

          <p>
            Hubungkan perusahaan Anda dengan talenta terbaik dari institusi
            vokasi di seluruh Indonesia melalui kemitraan strategis.
          </p>
        </div>

        <div className="dp-sidebar-footer">
          <div className="dp-verified">
            <FaCheckCircle />
            <div>
              <strong>Proses Terverifikasi</strong>
              <p>Keamanan data dokumen perusahaan terjamin.</p>
            </div>
          </div>

          <span className="dp-copy">
            © 2026 VOCASEEK INC. ALL RIGHTS RESERVED.
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="dp-content">
        <div className="dp-header">
          <button
            type="button"
            className="dp-back"
            onClick={() => navigate("/mitra")}
          >
            <FaArrowLeft />
          </button>

          <div>
            <span className="dp-badge">KEMITRAAN STRATEGIS</span>

            <h1>
              Pengajuan Kerjasama <span>Strategis</span>
            </h1>

            <p>
              Lengkapi formulir di bawah ini untuk memulai kolaborasi dengan
              Vocaseek.
            </p>
          </div>
        </div>

        <div className="dp-form-box">
          <form className="dp-form" onSubmit={handleSubmit}>
            <div className="dp-grid">
              <div className="dp-input">
                <FaBuilding className="dp-input-icon" />
                <input type="text" placeholder="Nama Perusahaan" />
              </div>

              <div className="dp-input">
                <FaTag className="dp-input-icon" />
                <select defaultValue="">
                  <option value="" disabled hidden>
                    Subjek Kerjasama
                  </option>
                  <option value="magang">Program Magang Mahasiswa</option>
                  <option value="rekrutmen">Rekrutmen Talenta</option>
                </select>
              </div>

              <div className="dp-input">
                <FaUserTie className="dp-input-icon" />
                <input type="text" placeholder="Kontak Person" />
              </div>

              <div className="dp-input">
                <FaEnvelope className="dp-input-icon" />
                <input type="email" placeholder="Email Perusahaan" />
              </div>
            </div>

            <div className="dp-input dp-textarea">
              <FaCommentDots className="dp-input-icon" />
              <textarea placeholder="Pesan tambahan..." rows="4" />
            </div>

            {/* UPLOAD */}
            <div className="dp-upload">

              {["profile","nib","npwp","proposal"].map((key) => {
                const labels = {
                  profile: "Company Profile / SK (PDF)",
                  nib: "Izin Usaha / NIB (PDF)",
                  npwp: "NPWP (PDF)",
                  proposal: "Proposal Kerjasama (PDF)"
                };

                const icons = {
                  profile: <FaFileAlt />,
                  nib: <FaFileUpload />,
                  npwp: <FaFileUpload />,
                  proposal: <FaFileSignature />
                };

                return (
                  <label
                    key={key}
                    className="dp-upload-item"
                    onClick={(e) => {
                      if (files[key]) {
                        e.preventDefault();
                        openFile(files[key]);
                      }
                    }}
                  >
                    <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, key)} />

                    <div className="dp-upload-content">
                      <div className="dp-upload-icon">{icons[key]}</div>

                      <span>{renderFileLabel(files[key], labels[key])}</span>
                      <small>
                        {files[key]
                          ? "File berhasil dipilih"
                          : "Maksimal file 5MB"}
                      </small>

                      {errors[key] && (
                        <small style={{ color: "red" }}>
                          {errors[key]}
                        </small>
                      )}
                    </div>
                  </label>
                );
              })}

            </div>

            {/* RESET */}
            <button type="button" className="dp-reset" onClick={handleResetFiles}>
              Hapus Semua Dokumen
            </button>

            <label className="dp-check">
              <input type="checkbox" />
              Saya menyetujui proses verifikasi oleh tim Vocaseek
            </label>

            <button type="submit" className="dp-submit">
              Kirim Sekarang
            </button>
          </form>
        </div>
      </div>

      {/* MODAL */}
      {showConfirm && (
        <div className="dp-modal-overlay">
          <div className="dp-modal">
            <h3>Konfirmasi Hapus</h3>
            <p>
              Apakah Anda yakin ingin menghapus semua dokumen yang telah diupload?
            </p>

            <div className="dp-modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Batal
              </button>
              <button className="btn-confirm" onClick={confirmDelete}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
