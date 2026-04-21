import React, { useState } from "react";
import "../../styles/Pendidikan.css";

const defaultForm = {
  institusi: "",
  jurusan: "",
  ipk: "",
  statusPendidikan: "Saya Masih Kuliah Disini",
  semester: "",
  tahunLulus: "",
};

const isPdfFile = (file) =>
  file?.type === "application/pdf" ||
  String(file?.name || "")
    .toLowerCase()
    .endsWith(".pdf");

export default function Pendidikan({ open, onClose, onSubmit, initialData }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [form, setForm] = useState(() => ({
    ...defaultForm,
    ...(initialData || {}),
  }));

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setForm((prev) => ({
      ...prev,
      statusPendidikan: value,
    }));
  };

  if (!open) return null;

  const stop = (e) => e.stopPropagation();
  const isMasihKuliah = form.statusPendidikan === "Saya Masih Kuliah Disini";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.institusi || !form.jurusan) {
      alert("Institusi dan jurusan wajib diisi!");
      return;
    }

    onSubmit?.({
      ...form,
      documentFile: uploadedFile,
      documentName: uploadedFile?.name || initialData?.documentName || "",
    });
    onClose();
  };

  const handleUploadFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Ukuran file tidak boleh melebihi 1Mb.");
      e.target.value = "";
      return;
    }

    if (!isPdfFile(file)) {
      alert("Format dokumen pendukung harus PDF.");
      e.target.value = "";
      return;
    }

    setUploadedFile(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="pd-overlay" onClick={onClose}>
      <div className="pd-modal" onClick={stop} role="dialog" aria-modal="true">
        <div className="pd-header">
          <div>
            <h2 className="pd-title">Pendidikan</h2>
            <p className="pd-subtitle">
              Tambah riwayat pendidikan kamu untuk menambah peluang di Vocaseek
            </p>
          </div>

          <button className="pd-close" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        <div className="pd-line" />

        <form className="pd-body" onSubmit={handleSubmit}>
          <div className="pd-field">
            <label className="pd-label">Jenjang Pendidikan</label>
            <div className="pd-selectWrap">
              <select className="pd-select" defaultValue="S1">
                <option>SMA/SMK</option>
                <option>D3</option>
                <option>S1</option>
                <option>S2</option>
              </select>
              <span className="pd-caret">▾</span>
            </div>
          </div>

          <div className="pd-grid2">
            <div className="pd-field">
              <label className="pd-label">Kelompok Perguruan tinggi</label>
              <div className="pd-selectWrap">
                <select className="pd-select" defaultValue="Dalam Negeri">
                  <option>Dalam Negeri</option>
                  <option>Luar Negeri</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>
            </div>

            <div className="pd-field">
              <label className="pd-label">Perguruan Tinggi</label>
              <input
                className="pd-input"
                placeholder="Nama kampus"
                value={form.institusi}
                onChange={(e) => handleChange("institusi", e.target.value)}
              />
            </div>

            <div className="pd-field">
              <label className="pd-label">IPK</label>
              <input
                className="pd-input"
                placeholder="Contoh: 3.75"
                inputMode="decimal"
                value={form.ipk}
                onChange={(e) => handleChange("ipk", e.target.value)}
              />
            </div>

            <div className="pd-field">
              <label className="pd-label">Program Studi</label>
              <input
                className="pd-input"
                placeholder="Contoh: Informatika"
                value={form.jurusan}
                onChange={(e) => handleChange("jurusan", e.target.value)}
              />
            </div>

            <div className="pd-field">
              <label className="pd-label">Status Pendidikan</label>
              <div className="pd-selectWrap">
                <select
                  className="pd-select"
                  value={form.statusPendidikan}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option>Saya Masih Kuliah Disini</option>
                  <option>Sudah Lulus</option>
                </select>
                <span className="pd-caret">▾</span>
              </div>
            </div>

            <div className="pd-field">
              <label className="pd-label">
                {isMasihKuliah ? "Semester" : "Tahun Lulus"}
              </label>
              <input
                className="pd-input"
                placeholder={isMasihKuliah ? "Contoh: 6" : "Contoh: 2024"}
                inputMode="numeric"
                value={isMasihKuliah ? form.semester : form.tahunLulus}
                onChange={(e) =>
                  handleChange(
                    isMasihKuliah ? "semester" : "tahunLulus",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="pd-doc">
            <div className="pd-docTitle">Dokumen Pendukung</div>
            <div className="pd-docDesc">
              Tambahkan transkrip nilai semester terakhir atau dokumen akademik
              lain yang relevan dalam format PDF. Ukuran file tidak boleh
              melebihi 1Mb.
            </div>

            <label className="pd-upload">
              <input
                type="file"
                className="pd-uploadInput"
                onChange={handleUploadFile}
                accept=".pdf,application/pdf"
              />
              <span className="pd-uploadPlus">＋</span>
              <span>Upload Dokumen</span>
            </label>

            {(uploadedFile || initialData?.documentName) && (
              <div className="pd-uploadedFile">
                <div className="pd-uploadedFileText">
                  Dokumen diupload:{" "}
                  <strong>{uploadedFile?.name || initialData?.documentName}</strong>
                </div>

                <button
                  type="button"
                  className="pd-removeFile"
                  onClick={handleRemoveFile}
                  aria-label="Hapus file"
                  title="Hapus file"
                >
                  🗑
                </button>
              </div>
            )}
          </div>

          <div className="pd-footerLine" />

          <div className="pd-footer">
            <button type="button" className="pd-cancel" onClick={onClose}>
              Batalkan
            </button>

            <button type="submit" className="pd-save">
              Simpan Pendidikan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
