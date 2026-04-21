import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/admin/Sidebar";
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
import {
  getScopedUiItem,
  setScopedUiItem,
} from "../../../utils/uiScopedStorage";

const STORAGE_KEY = "review_dokumen_mitra_selected_document";

const DEFAULT_VALIDATION_OPTIONS = [
  { value: "valid", label: "Valid" },
  { value: "review", label: "Perlu Review" },
  { value: "invalid", label: "Tidak Valid" },
];

function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) {
    return "-";
  }

  const size = Number(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getFileExtension(fileName = "") {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function isPreviewableFile(file = {}) {
  const extension = getFileExtension(file.fileName || file.name || "");
  const mimeType = (file.mimeType || "").toLowerCase();

  return (
    mimeType.includes("pdf") ||
    mimeType.includes("image/") ||
    ["pdf", "png", "jpg", "jpeg", "webp"].includes(extension)
  );
}

function isPdfFile(file = {}) {
  const extension = getFileExtension(file.fileName || file.name || "");
  const mimeType = (file.mimeType || "").toLowerCase();

  return mimeType.includes("pdf") || extension === "pdf";
}

export default function ReviewDokumenMitra() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const initialSelectedDocument = useMemo(() => {
    const stateDocument = location.state?.document || null;

    if (stateDocument) {
      try {
        setScopedUiItem(STORAGE_KEY, JSON.stringify(stateDocument));
      } catch (error) {
        console.error("Gagal menyimpan dokumen ke localStorage:", error);
      }
      return stateDocument;
    }

    const savedDocument = getScopedUiItem(STORAGE_KEY);

    if (!savedDocument) {
      return null;
    }

    try {
      return JSON.parse(savedDocument);
    } catch (error) {
      console.error("Gagal membaca dokumen dari localStorage:", error);
      return null;
    }
  }, [location.state]);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [validationStatus, setValidationStatus] = useState("");
  const [verifierNote, setVerifierNote] = useState("");
  const [selectedDocument] = useState(initialSelectedDocument);

  const documentData = useMemo(() => {
    if (!selectedDocument) return null;

    return {
      id: selectedDocument.id || id || "-",
      title: selectedDocument.title || "Dokumen Mitra",
      fileName:
        selectedDocument.fileName ||
        selectedDocument.name ||
        selectedDocument.originalName ||
        "Dokumen Tanpa Nama",
      fileUrl:
        selectedDocument.fileUrl ||
        selectedDocument.url ||
        selectedDocument.previewUrl ||
        selectedDocument.downloadUrl ||
        "",
      downloadUrl:
        selectedDocument.downloadUrl ||
        selectedDocument.fileUrl ||
        selectedDocument.url ||
        selectedDocument.previewUrl ||
        "",
      mimeType: selectedDocument.mimeType || "",
      fileSize:
        selectedDocument.fileSize ||
        selectedDocument.size ||
        selectedDocument.fileBytes ||
        null,
      uploadedAt:
        selectedDocument.uploadedAt ||
        selectedDocument.createdAt ||
        selectedDocument.date ||
        null,
      totalPages: selectedDocument.totalPages || selectedDocument.pages || 1,
      uploaderName:
        selectedDocument.uploaderName ||
        selectedDocument.picName ||
        selectedDocument.uploadedBy ||
        "PIC Mitra",
      uploaderRole:
        selectedDocument.uploaderRole ||
        selectedDocument.picRole ||
        selectedDocument.position ||
        "-",
      companyName:
        selectedDocument.companyName ||
        selectedDocument.partnerName ||
        "Mitra",
      status: selectedDocument.status || "PENDING REVIEW",
      statusDescription:
        selectedDocument.statusDescription ||
        "Dokumen ini belum diverifikasi oleh admin. Silakan periksa kelengkapan sebelum menyetujui.",
    };
  }, [selectedDocument, id]);

  const hasDocument = Boolean(documentData && documentData.fileUrl);
  const canPreview = Boolean(documentData && isPreviewableFile(documentData));
  const isPdf = Boolean(documentData && isPdfFile(documentData));

  const handleDownload = () => {
    if (!documentData?.downloadUrl) return;

    const link = document.createElement("a");
    link.href = documentData.downloadUrl;
    link.download = documentData.fileName || "dokumen";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const handleFullscreen = () => {
    if (!documentData?.fileUrl) return;
    window.open(documentData.fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleSaveVerification = () => {
    void ({
      documentId: documentData?.id || null,
      validationStatus,
      verifierNote,
    });
  };

  return (
    <div className="rd-layout">
      <Sidebar />

      <main className="rd-main">

        <section className="rd-content">
          <div className="rd-header">
            <div>
              <div className="rd-breadcrumb">
                <span>ADMIN</span>
                <ChevronRight size={14} />
                <span>PARTNERS</span>
                <ChevronRight size={14} />
                <span>DETAIL MITRA</span>
                <ChevronRight size={14} />
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
            <button
              className="rd-download-btn"
              type="button"
              onClick={handleDownload}
              disabled={!hasDocument}
              style={{
                opacity: hasDocument ? 1 : 0.5,
                cursor: hasDocument ? "pointer" : "not-allowed",
              }}
            >
              <Download size={16} />
              <span>Unduh Dokumen</span>
            </button>
          </div>

          <div className="rd-body-grid">
            <div className="rd-viewer-card">
                <div className="rd-pdf-fileinfo">
                  <span className="rd-pdf-name">
                    {documentData?.fileName || "Belum ada dokumen"}
                  </span>
                  <span className="rd-pdf-page">
                    {hasDocument ? `1 / ${documentData?.totalPages || 1}` : "0 / 0"}
                  </span>
                </div>

                <div className="rd-pdf-actions">
                  <button
                    type="button"
                    className="rd-pdf-icon-btn"
                    onClick={handleZoomOut}
                    disabled={!hasDocument || !canPreview}
                  >
                    <ZoomOut size={14} />
                  </button>
                  <button
                    type="button"
                    className="rd-pdf-icon-btn"
                    onClick={handleZoomIn}
                    disabled={!hasDocument || !canPreview}
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    type="button"
                    className="rd-pdf-icon-btn"
                    onClick={handleFullscreen}
                    disabled={!hasDocument}
                  >
                    <Maximize2 size={14} />
                  </button>
                </div>
              

              <div className="rd-document-stage">
                {!hasDocument && (
                  <div
                    className="rd-document-paper"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "70vh",
                      textAlign: "center",
                      padding: "32px",
                    }}
                  >
                    <div>
                      <FileText size={56} style={{ opacity: 0.4, marginBottom: 16 }} />
                      <h2 style={{ marginBottom: 8 }}>Belum ada dokumen untuk direview</h2>
                      <p style={{ color: "#6b7280", maxWidth: 420 }}>
                        Halaman ini sengaja kosong dan tidak menampilkan template.
                        Dokumen akan muncul otomatis ketika data dikirim dari
                        halaman ReviewDokumen.jsx.
                      </p>
                    </div>
                  </div>
                )}

                {hasDocument && canPreview && isPdf && (
                  <div
                    className="rd-document-paper"
                    style={{
                      width: "100%",
                      minHeight: "70vh",
                      padding: 0,
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      src={`${documentData.fileUrl}#zoom=${zoomLevel}`}
                      title={documentData.fileName}
                      width="100%"
                      height="100%"
                      style={{
                        border: "none",
                        minHeight: "70vh",
                      }}
                    />
                  </div>
                )}

                {hasDocument && canPreview && !isPdf && (
                  <div
                    className="rd-document-paper"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "70vh",
                      padding: 16,
                      overflow: "auto",
                    }}
                  >
                    <img
                      src={documentData.fileUrl}
                      alt={documentData.fileName}
                      style={{
                        maxWidth: `${zoomLevel}%`,
                        transition: "all 0.2s ease",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                )}

                {hasDocument && !canPreview && (
                  <div
                    className="rd-document-paper"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "70vh",
                      textAlign: "center",
                      padding: "32px",
                    }}
                  >
                    <div>
                      <FileText size={56} style={{ opacity: 0.4, marginBottom: 16 }} />
                      <h2 style={{ marginBottom: 8 }}>Preview tidak tersedia</h2>
                      <p style={{ color: "#6b7280", marginBottom: 16 }}>
                        Tipe file ini tidak dapat dipreview langsung di halaman.
                      </p>
                      <button
                        className="rd-download-btn"
                        type="button"
                        onClick={handleDownload}
                      >
                        <Download size={16} />
                        <span>Unduh Dokumen</span>
                      </button>
                    </div>
                  </div>
                )}
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
                      <strong>{formatDate(documentData?.uploadedAt)}</strong>
                    </div>
                    <div>
                      <span>UKURAN FILE</span>
                      <strong>{formatFileSize(documentData?.fileSize)}</strong>
                    </div>
                  </div>

                  <div className="rd-divider" />

                  <div className="rd-uploader-wrap">
                    <span className="rd-mini-label">DIUPLOAD OLEH (PIC)</span>

                    <div className="rd-uploader-row">
                      <div className="rd-uploader-avatar" />
                      <div>
                        <strong>{documentData?.uploaderName || "-"}</strong>
                        <p>
                          {documentData?.uploaderRole || "-"}
                          {documentData?.companyName ? ` @ ${documentData.companyName}` : ""}
                        </p>
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

                <div className="rd-status-box">
                  <div className="rd-status-head">
                    <strong>Status Saat Ini</strong>
                    <span className="rd-status-badge">
                      {documentData?.status || "PENDING REVIEW"}
                    </span>
                  </div>

                  <p>{documentData?.statusDescription || "-"}</p>
                </div>

                <div className="rd-form-group">
                  <label>Tentukan Validitas</label>
                  <div className="rd-select-wrap">
                    <select
                      value={validationStatus}
                      onChange={(e) => setValidationStatus(e.target.value)}
                    >
                      <option value="" disabled>
                        Pilih status validitas...
                      </option>
                      {DEFAULT_VALIDATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="rd-select-icon" />
                  </div>
                </div>

                <div className="rd-form-group">
                  <label>Catatan Verifikator</label>
                  <textarea
                    placeholder="Tambahkan catatan jika dokumen tidak valid atau ada hal yang perlu diperhatikan..."
                    rows={5}
                    value={verifierNote}
                    onChange={(e) => setVerifierNote(e.target.value)}
                  />
                </div>

                <button
                  className="rd-save-btn"
                  type="button"
                  onClick={handleSaveVerification}
                >
                  Simpan Verifikasi
                </button>
              </div>

              <div className="rd-side-footer">
                <strong>Verifikasi terakhir: -</strong>
                <p>Sistem mencatat setiap perubahan status dokumen.</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
