import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/SidebarStaff";
import "../../../styles/ReviewDokumenMitra.css";
import {
  ChevronRight,
  Download,
  ZoomOut,
  ZoomIn,
  Maximize2,
  FileText,
  ShieldCheck,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { setScopedUiItem } from "../../../utils/uiScopedStorage";

export default function ReviewDokumen() {
  const navigate = useNavigate();

  // null = belum ada dokumen
  // nanti kalau sudah ada data backend, tinggal isi dari API
  const [documentData, setDocumentData] = useState(null);

  // pilihan dari "Tentukan Validitas"
  const [validationStatus, setValidationStatus] = useState("");
  const [validatorNotes, setValidatorNotes] = useState("");

  const effectiveValidationStatus = !documentData
    ? ""
    : validationStatus || "review";

  const statusConfig = useMemo(() => {
    if (!documentData) {
      return {
        badge: "BELUM ADA DOKUMEN",
        className: "empty",
        title: "Status Saat Ini",
        description: "Dokumen belum tersedia, sehingga belum dapat diverifikasi.",
      };
    }

    switch (validationStatus) {
      case "valid":
        return {
          badge: "VALID",
          className: "verified",
          title: "Status Saat Ini",
          description: "Dokumen dinyatakan valid dan siap digunakan.",
        };

      case "invalid":
        return {
          badge: "TIDAK VALID",
          className: "invalid",
          title: "Status Saat Ini",
          description:
            "Dokumen dinyatakan tidak valid. Silakan cek catatan verifikator.",
        };

      case "review":
      default:
        return {
          badge: "PENDING REVIEW",
          className: "review",
          title: "Status Saat Ini",
          description:
            "Dokumen masih perlu ditinjau lebih lanjut sebelum disetujui.",
        };
    }
  }, [documentData, validationStatus]);

  const handleSaveVerification = () => {
    if (!documentData) return;

    const payload = {
      ...documentData,
      verificationStatus: validationStatus || "review",
      validatorNotes,
      verifiedAt: new Date().toLocaleString("id-ID"),
    };

    // sementara simpan lokal dulu
    setScopedUiItem("partnerDocumentVerification", JSON.stringify(payload));
    alert("Status verifikasi berhasil disimpan.");
  };

  // contoh helper untuk simulasi ada dokumen
  const handleMockFillDocument = () => {
    setDocumentData({
      fileName: "MOU_TechNova_2024.pdf",
      uploadDate: "24 Okt 2024",
      fileSize: "2.4 MB",
      uploaderName: "Bagus Setiawan",
      uploaderRole: "HR Manager @ TechNova",
    });
    setValidationStatus("review");
  };

  return (
    <div className="rd-layout">
      <Sidebar />

      <main className="rd-main">

        <section className="rd-content">
          <div className="rd-header">
            <div>
              <div className="rd-breadcrumb">
                <span>ADMIN &gt;</span>
                <span>PARTNERS &gt;</span>
                <span>DETAIL MITRA &gt;</span>
                <span className="active">REVIEW DOKUMEN</span>
              </div>

              <h1 className="pd-page-title">
                <ArrowLeft
                  size={20}
                  className="pd-back-icon"
                  onClick={() => navigate(-1)}
                />
                Tinjau Dokumen Kerjasama
              </h1>
            </div>
          </div>

          <div className="rd-toolbar">
            <div className="rd-toolbar-left" />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="rd-download-btn rd-download-btn-secondary"
                type="button"
                onClick={handleMockFillDocument}
              >
                Isi Mock Data
              </button>

              <button className="rd-download-btn" type="button">
                <Download size={16} />
                <span>Unduh Dokumen</span>
              </button>
            </div>
          </div>

          <div className="rd-body-grid">
            <div className="rd-viewer-card">
              <div className="rd-pdf-topbar">
                <div className="rd-pdf-fileinfo">
                  <span className="rd-pdf-name">
                    {documentData?.fileName || "Belum ada dokumen dipilih"}
                  </span>
                  <span className="rd-pdf-page">{documentData ? "1 / 1" : "- / -"}</span>
                </div>

                <div className="rd-pdf-actions">
                  <button type="button" className="rd-pdf-icon-btn">
                    <ZoomOut size={14} />
                  </button>
                  <button type="button" className="rd-pdf-icon-btn">
                    <ZoomIn size={14} />
                  </button>
                  <button type="button" className="rd-pdf-icon-btn">
                    <Maximize2 size={14} />
                  </button>
                </div>
              </div>

              <div className="rd-document-stage">
                <div className="rd-document-paper rd-empty-paper">
                  {!documentData ? (
                    <div className="rd-empty-document-state">
                      <div className="rd-empty-document-icon">
                        <FileText size={34} />
                      </div>
                      <h3>Belum ada dokumen kerjasama</h3>
                      <p>Tidak ada file yang dapat ditinjau saat ini.</p>
                    </div>
                  ) : (
                    <div className="rd-empty-document-state">
                      <div className="rd-empty-document-icon">
                        <FileText size={34} />
                      </div>
                      <h3>{documentData.fileName}</h3>
                      <p>Dokumen tersedia dan status verifikasi dapat diubah dari panel kanan.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="rd-sidebar-panel">
              <div className="rd-side-section">
                <h3 className="rd-side-title">Informasi Dokumen</h3>
                <p className="rd-side-subtitle">
                  Detail metadata dari file yang dipilih.
                </p>

                <div className="rd-info-card">
                  <div className="rd-file-row">
                    <div className="rd-file-icon">
                      <FileText size={22} />
                    </div>

                    <div className="rd-file-meta">
                      <span>NAMA FILE</span>
                      <strong>{documentData?.fileName || "-"}</strong>
                    </div>
                  </div>

                  <div className="rd-meta-grid">
                    <div>
                      <span>TANGGAL UPLOAD</span>
                      <strong>{documentData?.uploadDate || "-"}</strong>
                    </div>
                    <div>
                      <span>UKURAN FILE</span>
                      <strong>{documentData?.fileSize || "-"}</strong>
                    </div>
                  </div>

                  <div className="rd-divider" />

                  <div className="rd-uploader-wrap">
                    <span className="rd-mini-label">DIUPLOAD OLEH (PIC)</span>

                    <div className="rd-uploader-row">
                      <div className="rd-uploader-avatar rd-uploader-avatar-empty" />
                      <div>
                        <strong>{documentData?.uploaderName || "-"}</strong>
                        <p>{documentData?.uploaderRole || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rd-side-section">
                <div className="rd-verify-title">
                  <ShieldCheck size={18} />
                  <h3>Status Verifikasi Dokumen</h3>
                </div>

                <div className={`rd-status-box ${statusConfig.className}`}>
                  <div className="rd-status-head">
                    <strong>{statusConfig.title}</strong>
                    <span className={`rd-status-badge ${statusConfig.className}`}>
                      {statusConfig.badge}
                    </span>
                  </div>

                  <p>{statusConfig.description}</p>
                </div>

                <div className="rd-form-group">
                  <label>Tentukan Validitas</label>
                  <div className="rd-select-wrap">
                    <select
                      value={effectiveValidationStatus}
                      onChange={(e) => setValidationStatus(e.target.value)}
                      disabled={!documentData}
                    >
                      <option value="" disabled>
                        Pilih status validitas...
                      </option>
                      <option value="valid">Valid</option>
                      <option value="review">Perlu Review</option>
                      <option value="invalid">Tidak Valid</option>
                    </select>
                    <ChevronDown size={16} className="rd-select-icon" />
                  </div>
                </div>

                <div className="rd-form-group">
                  <label>Catatan Verifikator</label>
                  <textarea
                    value={validatorNotes}
                    onChange={(e) => setValidatorNotes(e.target.value)}
                    placeholder="Tambahkan catatan jika dokumen tidak valid atau ada hal yang perlu diperhatikan..."
                    rows={5}
                    disabled={!documentData}
                  />
                </div>

                <button
                  className="rd-save-btn"
                  type="button"
                  onClick={handleSaveVerification}
                  disabled={!documentData || !effectiveValidationStatus}
                >
                  Simpan Verifikasi
                </button>
              </div>

              <div className="rd-side-footer">
                <strong>
                  Verifikasi terakhir:{" "}
                  {documentData && validationStatus ? "Sudah diperbarui" : "-"}
                </strong>
                <p>Sistem mencatat setiap perubahan status dokumen.</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
