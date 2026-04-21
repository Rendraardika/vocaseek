import React, { useMemo, useState } from "react";
import Sidebar from "../../../components/admin/Sidebar";
import {
  ArrowLeft,
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  BadgeCheck,
  GraduationCap,
  ShieldCheck,
  Search,
  ZoomIn,
  Printer,
  Download,
  FileBadge,
  Building2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../styles/ReviewDokumen.css";
import { getScopedUiItem } from "../../../utils/uiScopedStorage";

function DocMenuItem({ title, subtitle, active = false, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`review-doc-menu-item ${active ? "active" : ""}`}
      type="button"
    >
      <div className={`review-doc-menu-icon ${active ? "active" : ""}`}>
        {icon}
      </div>

      <div>
        <div className={`review-doc-menu-title ${active ? "active" : ""}`}>
          {title}
        </div>
        <div className={`review-doc-menu-subtitle ${active ? "active" : ""}`}>
          {subtitle}
        </div>
      </div>
    </button>
  );
}

function formatPartnerStatus(status) {
  const statusMap = {
    pending: "PENDING REVIEW",
    review: "UNDER REVIEW",
    active: "ACTIVE",
    approved: "APPROVED",
  };

  return statusMap[status] || "PENDING REVIEW";
}

function buildPartnerDocuments(partner) {
  const partnerName = partner?.name || "Nama Partner";
  const businessType = partner?.businessType || "Tipe Bisnis";
  const companyCode = partner?.code || "-";
  const companyEmail = partner?.email || "-";
  const submittedAt = partner?.submittedAt || "-";
  const city = partner?.city || "Indonesia";
  const status = formatPartnerStatus(partner?.status);

  return [
    {
      id: "company-profile",
      title: "Company Profile",
      subtitle: "PDF, 2.4 MB",
      fileName: `Company_Profile_${partnerName.replace(/\s+/g, "_")}.pdf`,
      fileMeta: `Uploaded on: ${submittedAt} · Size: 2.4 MB`,
      icon: <FileText size={18} />,
      previewType: "company-profile",
      mimeType: "application/pdf",
      fileUrl: "/documents/Company_Profile.pdf",
      downloadUrl: "/documents/Company_Profile.pdf",
      fileSize: 2516582,
      uploadedAt: submittedAt,
      totalPages: 2,
      uploaderName: partnerName,
      uploaderRole: "Partner",
      companyName: partnerName,
      status,
      statusDescription:
        "Dokumen partner ini belum diverifikasi oleh admin. Silakan periksa kelengkapan sebelum menyetujui.",
      businessType,
      companyCode,
      companyEmail,
      city,
    },
    {
      id: "legal-document",
      title: "Legal Document",
      subtitle: "PDF, 12.4 MB",
      fileName: `Legal_Document_${partnerName.replace(/\s+/g, "_")}.pdf`,
      fileMeta: `Uploaded on: ${submittedAt} · Size: 12.4 MB`,
      icon: <FolderOpen size={18} />,
      previewType: "legal-document",
      mimeType: "application/pdf",
      fileUrl: "/documents/Legal_Document.pdf",
      downloadUrl: "/documents/Legal_Document.pdf",
      fileSize: 13002342,
      uploadedAt: submittedAt,
      totalPages: 8,
      uploaderName: partnerName,
      uploaderRole: "Partner",
      companyName: partnerName,
      status,
      statusDescription:
        "Dokumen legal partner ini belum diverifikasi oleh admin. Silakan periksa kelengkapan sebelum menyetujui.",
      businessType,
      companyCode,
      companyEmail,
      city,
    },
    {
      id: "nib",
      title: "NIB / Legalitas",
      subtitle: "JPG, 1.2 MB",
      fileName: `NIB_${partnerName.replace(/\s+/g, "_")}.jpg`,
      fileMeta: `Uploaded on: ${submittedAt} · Size: 1.2 MB`,
      icon: <BadgeCheck size={18} />,
      previewType: "nib",
      mimeType: "image/jpeg",
      fileUrl: "/documents/NIB.jpg",
      downloadUrl: "/documents/NIB.jpg",
      fileSize: 1258291,
      uploadedAt: submittedAt,
      totalPages: 1,
      uploaderName: partnerName,
      uploaderRole: "Partner",
      companyName: partnerName,
      status,
      statusDescription:
        "Dokumen legalitas partner ini belum diverifikasi oleh admin. Silakan periksa kelengkapan sebelum menyetujui.",
      businessType,
      companyCode,
      companyEmail,
      city,
    },
    {
      id: "supporting-document",
      title: "Supporting Document",
      subtitle: "PDF, 4.8 MB",
      fileName: `Supporting_Document_${partnerName.replace(/\s+/g, "_")}.pdf`,
      fileMeta: `Uploaded on: ${submittedAt} · Size: 4.8 MB`,
      icon: <GraduationCap size={18} />,
      previewType: "supporting-document",
      mimeType: "application/pdf",
      fileUrl: "/documents/Supporting_Document.pdf",
      downloadUrl: "/documents/Supporting_Document.pdf",
      fileSize: 5033164,
      uploadedAt: submittedAt,
      totalPages: 3,
      uploaderName: partnerName,
      uploaderRole: "Partner",
      companyName: partnerName,
      status,
      statusDescription:
        "Dokumen pendukung partner ini belum diverifikasi oleh admin. Silakan periksa kelengkapan sebelum menyetujui.",
      businessType,
      companyCode,
      companyEmail,
      city,
    },
  ];
}

function normalizePartnerDocuments(partner) {
  const partnerName = partner?.name || "Nama Partner";
  const businessType = partner?.businessType || "Tipe Bisnis";
  const companyCode = partner?.code || "-";
  const companyEmail = partner?.email || "-";
  const submittedAt = partner?.submittedAt || "-";
  const city = partner?.city || "Indonesia";
  const status = formatPartnerStatus(partner?.status);

  const rawDocuments = Array.isArray(partner?.documents) ? partner.documents : [];

  return rawDocuments.map((doc, index) => {
    const title = doc?.title || doc?.name || `Dokumen ${index + 1}`;
    const fileName =
      doc?.fileName ||
      doc?.name ||
      doc?.originalName ||
      `${title.replace(/\s+/g, "_")}_${partnerName.replace(/\s+/g, "_")}`;

    const fileSize = doc?.fileSize || doc?.size || doc?.fileBytes || null;
    const uploadedAt = doc?.uploadedAt || doc?.createdAt || doc?.date || submittedAt;
    const mimeType = doc?.mimeType || "";
    const fileUrl = doc?.fileUrl || doc?.url || doc?.previewUrl || doc?.downloadUrl || "";
    const downloadUrl =
      doc?.downloadUrl || doc?.fileUrl || doc?.url || doc?.previewUrl || "";

    return {
      id: doc?.id || `document-${index + 1}`,
      title,
      subtitle: doc?.subtitle || `${mimeType || "FILE"}${fileSize ? `, ${Math.round(fileSize / 1024)} KB` : ""}`,
      fileName,
      fileMeta:
        doc?.fileMeta ||
        `Uploaded on: ${uploadedAt || "-"}${fileSize ? ` · Size: ${Math.round(fileSize / 1024)} KB` : ""}`,
      icon: doc?.icon || <FileText size={18} />,
      previewType: doc?.previewType || "document",
      mimeType,
      fileUrl,
      downloadUrl,
      fileSize,
      uploadedAt,
      totalPages: doc?.totalPages || doc?.pages || 1,
      uploaderName: doc?.uploaderName || partnerName,
      uploaderRole: doc?.uploaderRole || "Partner",
      companyName: doc?.companyName || partnerName,
      status: doc?.status || status,
      statusDescription:
        doc?.statusDescription ||
        "Dokumen partner ini belum diverifikasi oleh admin. Silakan periksa kelengkapan sebelum menyetujui.",
      businessType,
      companyCode,
      companyEmail,
      city,
    };
  });
}

export default function ReviewDokumen() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedPartner = useMemo(() => {
    if (location.state?.partner) {
      return location.state.partner;
    }

    try {
      const raw = getScopedUiItem("selectedPartnerManagement");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error("Gagal membaca selected partner dari localStorage:", error);
      return null;
    }
  }, [location.state]);

  const documents = useMemo(() => {
    if (!selectedPartner) return [];

    const normalizedDocuments = normalizePartnerDocuments(selectedPartner);

    if (normalizedDocuments.length > 0) {
      return normalizedDocuments;
    }

    return buildPartnerDocuments(selectedPartner);
  }, [selectedPartner]);

  const [activeDocumentId, setActiveDocumentId] = useState("");
  const resolvedActiveDocumentId =
    documents.some((doc) => doc.id === activeDocumentId)
      ? activeDocumentId
      : documents[0]?.id || "";

  const activeDocument =
    documents.find((doc) => doc.id === resolvedActiveDocumentId) || documents[0] || null;

  const partnerName = selectedPartner?.name || "Nama Partner";
  const partnerBusinessType =
    selectedPartner?.businessType || "Tipe Bisnis Partner";
  const partnerCity = selectedPartner?.city || "Indonesia";
  const partnerEmail = selectedPartner?.email || "-";
  const partnerId = selectedPartner?.id || "";

  const handleOpenReview = () => {
    if (!activeDocument) return;

    navigate(`/admin/partners/${partnerId}/review-dokumen-mitra`, {
      state: {
        partner: selectedPartner,
        document: activeDocument,
      },
    });
  };

  const handleDownload = () => {
    if (!activeDocument?.downloadUrl) return;

    const link = document.createElement("a");
    link.href = activeDocument.downloadUrl;
    link.download = activeDocument.fileName || "dokumen";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="review-doc-layout">
      <Sidebar />

      <main className="review-doc-main">

        <section className="review-doc-content">
          <div className="review-doc-breadcrumb">
            <span>ADMIN</span>
            <span>›</span>
            <span>PARTNER MANAGEMENT</span>
            <span>›</span>
            <span>DETAIL PARTNER</span>
            <span>›</span>
            <span className="active">REVIEW DOKUMEN</span>
          </div>

          <div className="review-doc-header">
            <div className="review-doc-header-left">
              <div className="review-doc-avatar-box">
                <img
                  src="/Sarah_Jenkins.png"
                  alt="Partner"
                  className="review-doc-avatar"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop";
                  }}
                />
              </div>

              <div>
                <h1 className="review-doc-page-title">{partnerName}</h1>
                <div className="review-doc-subtitle-row">
                  <BriefcaseBusiness size={15} />
                  <span>{partnerBusinessType}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(
                  partnerId ? `/admin/partners/${partnerId}` : "/admin/partners",
                  {
                    state: {
                      partner: selectedPartner,
                    },
                  }
                )
              }
              className="review-doc-back-button"
              type="button"
            >
              <ArrowLeft size={22} />
              Kembali
            </button>
          </div>

          <div className="review-doc-grid">
            <aside>
              <div className="review-doc-side-label">PARTNER DOCUMENTS</div>

              <div className="review-doc-menu-list">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <DocMenuItem
                      key={doc.id}
                      title={doc.title}
                      subtitle={
                        activeDocumentId === doc.id ? "Active Viewing" : doc.subtitle
                      }
                      active={resolvedActiveDocumentId === doc.id}
                      icon={doc.icon}
                      onClick={() => setActiveDocumentId(doc.id)}
                    />
                  ))
                ) : (
                  <div
                    style={{
                      padding: "16px",
                      border: "1px dashed #d1d5db",
                      borderRadius: "12px",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Belum ada dokumen partner untuk ditampilkan.
                  </div>
                )}
              </div>

              <div className="review-doc-verified-box">
                <div className="review-doc-verified-row">
                  <div className="review-doc-verified-icon">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <div className="review-doc-verified-title">
                      Verified Document
                    </div>
                    <p className="review-doc-verified-text">
                      This document has been automatically verified by our
                      system for authenticity and malware safety.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="review-doc-download-button"
                onClick={handleOpenReview}
                style={{ marginTop: 16, width: "100%" }}
                disabled={!activeDocument}
              >
                <FileText size={18} />
                Review di Halaman Mitra
              </button>
            </aside>

            <section>
              <div className="review-doc-toolbar">
                <div className="review-doc-toolbar-left">
                  <div className="review-doc-file-badge">
                    <FileBadge size={20} />
                  </div>

                  <div>
                    <div className="review-doc-file-name">
                      {activeDocument?.fileName || "Belum ada dokumen"}
                    </div>
                    <div className="review-doc-file-meta">
                      {activeDocument?.fileMeta || "-"}
                    </div>
                  </div>
                </div>

                <div className="review-doc-toolbar-actions">
                  <div className="review-doc-zoom-box">
                    <button type="button" className="review-doc-icon-button">
                      <Search size={16} />
                    </button>
                    <span className="review-doc-zoom-text">100%</span>
                    <button type="button" className="review-doc-icon-button">
                      <ZoomIn size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="review-doc-print-button"
                    onClick={handlePrint}
                    disabled={!activeDocument}
                  >
                    <Printer size={18} />
                    Print
                  </button>

                  <button
                    type="button"
                    className="review-doc-download-button"
                    onClick={handleDownload}
                    disabled={!activeDocument?.downloadUrl}
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>

              {!activeDocument ? (
                <div className="review-doc-preview-shell">
                  <div className="review-doc-preview-page">
                    <div
                      style={{
                        minHeight: "420px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        color: "#6b7280",
                        padding: "32px",
                      }}
                    >
                      <div>
                        <FileText size={52} style={{ opacity: 0.4, marginBottom: 16 }} />
                        <h2 style={{ marginBottom: 8 }}>Belum ada dokumen</h2>
                        <p>Dokumen partner akan tampil di sini saat data tersedia.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="review-doc-preview-shell">
                  {activeDocument.previewType === "company-profile" && (
                    <div className="review-doc-preview-page">
                      <div className="review-doc-cv-header">
                        <div>
                          <h2 className="review-doc-cv-name">{partnerName}</h2>
                          <div className="review-doc-cv-role">
                            {partnerBusinessType}
                          </div>

                          <div className="review-doc-cv-contact">
                            <span>✉ {partnerEmail}</span>
                            <span>📍 {partnerCity}</span>
                          </div>
                        </div>

                        <div className="review-doc-cv-photo">
                          <img
                            src="/Sarah_Jenkins.png"
                            alt="Partner"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop";
                            }}
                          />
                        </div>
                      </div>

                      <div className="review-doc-cv-divider" />

                      <div className="review-doc-cv-body">
                        <div>
                          <div className="review-doc-section">
                            <div className="review-doc-section-head">
                              <div className="review-doc-accent-line" />
                              <h3>Ringkasan Perusahaan</h3>
                            </div>

                            <p>
                              Data perusahaan ini ditampilkan langsung dari data
                              partner yang dipilih pada tabel Partner Management.
                              Informasi utama seperti nama perusahaan, email, tipe
                              bisnis, lokasi, dan status verifikasi sudah
                              mengikuti data partner yang aktif.
                            </p>
                          </div>

                          <div className="review-doc-section">
                            <div className="review-doc-section-head">
                              <div className="review-doc-accent-line" />
                              <h3>Informasi Partner</h3>
                            </div>

                            <div className="review-doc-experience-list">
                              <div className="review-doc-experience-item active">
                                <span className="review-doc-timeline-dot active" />
                                <div>
                                  <div className="review-doc-job-title">
                                    {partnerName}
                                  </div>
                                  <div className="review-doc-job-company active">
                                    {partnerBusinessType}
                                  </div>
                                  <p>
                                    <strong>Email:</strong> {partnerEmail}
                                  </p>
                                  <p>
                                    <strong>Kota:</strong> {partnerCity}
                                  </p>
                                  <p>
                                    <strong>Status:</strong> {activeDocument.status}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <aside className="review-doc-cv-side">
                          <div className="review-doc-side-section">
                            <div className="review-doc-side-title">
                              Data Utama
                            </div>

                            <div className="review-doc-skill-tags">
                              {[
                                partnerBusinessType,
                                partnerCity,
                                activeDocument.status,
                                "Partner",
                                "Vocaseek",
                              ].map((item) => (
                                <div key={item} className="review-doc-skill-tag">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="review-doc-side-section">
                            <div className="review-doc-side-title">Validasi</div>

                            <div className="review-doc-tool-list">
                              <div className="review-doc-tool-item">
                                <div className="review-doc-tool-label">
                                  Kelengkapan Data
                                </div>
                                <div className="review-doc-tool-bar">
                                  <div
                                    className="review-doc-tool-fill"
                                    style={{ width: "85%" }}
                                  />
                                </div>
                              </div>

                              <div className="review-doc-tool-item">
                                <div className="review-doc-tool-label">
                                  Dokumen Legal
                                </div>
                                <div className="review-doc-tool-bar">
                                  <div
                                    className="review-doc-tool-fill"
                                    style={{ width: "72%" }}
                                  />
                                </div>
                              </div>

                              <div className="review-doc-tool-item">
                                <div className="review-doc-tool-label">
                                  Status Review
                                </div>
                                <div className="review-doc-tool-bar">
                                  <div
                                    className="review-doc-tool-fill"
                                    style={{ width: "55%" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="review-doc-side-section">
                            <div className="review-doc-side-title">Catatan</div>

                            <div className="review-doc-edu-title">
                              {activeDocument.status}
                            </div>
                            <div className="review-doc-edu-subtitle">
                              {activeDocument.statusDescription}
                            </div>
                          </div>
                        </aside>
                      </div>

                      <div className="review-doc-cv-footer">
                        <span>Page 1 of {activeDocument.totalPages}</span>
                        <span>Generated via Vocaseek Partner Review</span>
                      </div>
                    </div>
                  )}

                  {activeDocument.previewType === "legal-document" && (
                    <div className="review-doc-preview-page">
                      <div className="review-doc-generic-preview">
                        <h2>Legal Document Preview</h2>
                        <p>Dokumen legal partner tampil di sini.</p>

                        <div className="review-doc-placeholder-card">
                          <FileText size={56} />
                          <strong>{activeDocument.fileName}</strong>
                          <span>{activeDocument.fileMeta}</span>
                          <span>{partnerName}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDocument.previewType === "nib" && (
                    <div className="review-doc-preview-page">
                      <div className="review-doc-generic-preview">
                        <h2>NIB / Legalitas</h2>
                        <p>Dokumen legalitas partner tampil di sini.</p>

                        <div className="review-doc-id-preview">
                          <div className="review-doc-id-card">
                            <div className="review-doc-id-header">
                              DOKUMEN LEGALITAS PERUSAHAAN
                            </div>

                            <div className="review-doc-id-body">
                              <div className="review-doc-id-photo">
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Building2 size={48} />
                                </div>
                              </div>

                              <div className="review-doc-id-info">
                                <div>
                                  <strong>Nama:</strong> {partnerName}
                                </div>
                                <div>
                                  <strong>Email:</strong> {partnerEmail}
                                </div>
                                <div>
                                  <strong>Alamat:</strong> {partnerCity}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDocument.previewType === "supporting-document" && (
                    <div className="review-doc-preview-page">
                      <div className="review-doc-generic-preview">
                        <h2>Supporting Document</h2>
                        <p>Ringkasan dokumen pendukung partner.</p>

                        <div className="review-doc-transcript-box">
                          <div className="review-doc-transcript-row">
                            <span>Nama Perusahaan</span>
                            <strong>{partnerName}</strong>
                          </div>
                          <div className="review-doc-transcript-row">
                            <span>Tipe Bisnis</span>
                            <strong>{partnerBusinessType}</strong>
                          </div>
                          <div className="review-doc-transcript-row">
                            <span>Email</span>
                            <strong>{partnerEmail}</strong>
                          </div>
                          <div className="review-doc-transcript-row">
                            <span>Status</span>
                            <strong>{activeDocument.status}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!["company-profile", "legal-document", "nib", "supporting-document"].includes(
                    activeDocument.previewType
                  ) && (
                    <div className="review-doc-preview-page">
                      <div className="review-doc-generic-preview">
                        <h2>{activeDocument.title || "Document Preview"}</h2>
                        <p>Dokumen partner tampil di sini.</p>

                        <div className="review-doc-placeholder-card">
                          <FileText size={56} />
                          <strong>{activeDocument.fileName}</strong>
                          <span>{activeDocument.fileMeta}</span>
                          <span>{partnerName}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
