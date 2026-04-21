import Sidebar from "../../../components/admin/SidebarStaff";
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
} from "lucide-react";
import { useMemo, useState } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../../styles/ReviewDokumen.css";

function DocMenuItem({
  title,
  subtitle,
  active = false,
  icon,
  onClick,
}) {
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

const documents = [
  {
    id: "cv",
    title: "Curriculum Vitae",
    subtitle: "Belum ada file",
    fileName: "Belum ada dokumen CV",
    uploadedAt: "-",
    size: "-",
    icon: <FileText size={18} />,
    type: "empty",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    subtitle: "Belum ada file",
    fileName: "Belum ada dokumen Portfolio",
    uploadedAt: "-",
    size: "-",
    icon: <FolderOpen size={18} />,
    type: "empty",
  },
  {
    id: "ktp",
    title: "KTP / ID Card",
    subtitle: "Belum ada file",
    fileName: "Belum ada dokumen KTP / ID Card",
    uploadedAt: "-",
    size: "-",
    icon: <BadgeCheck size={18} />,
    type: "empty",
  },
  {
    id: "transkrip",
    title: "Transkrip Nilai",
    subtitle: "Belum ada file",
    fileName: "Belum ada dokumen Transkrip Nilai",
    uploadedAt: "-",
    size: "-",
    icon: <GraduationCap size={18} />,
    type: "empty",
  },
];

export default function ReviewDokumen() {
  const navigate = useNavigate();
  const [activeDocId, setActiveDocId] = useState("cv");

  const activeDocument = useMemo(
    () => documents.find((doc) => doc.id === activeDocId) || documents[0],
    [activeDocId]
  );

  return (
    <div className="review-doc-layout">
      <Sidebar />

      <main className="review-doc-main">

        <section className="review-doc-content">
          <div className="review-doc-breadcrumb">
            <span>ADMIN &gt; </span>
            <span>TALENT MANAGEMENT &gt;</span>
            <span>DETAIL PROFIL &gt;</span>
            <span className="active">REVIEW DOKUMEN</span>
          </div>

          <div className="review-doc-header">
            <div className="review-doc-header-left">
              <div className="review-doc-avatar-box review-doc-avatar-empty">
                <div className="review-doc-avatar-placeholder">
                  <User size={34} />
                </div>
              </div>

              <div>
                <h1 className="review-doc-page-title">Belum ada nama kandidat</h1>
                <div className="review-doc-subtitle-row">
                  <BriefcaseBusiness size={15} />
                  <span>Posisi kandidat belum diisi</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/admin/staff/talent/tla-001")}
              className="review-doc-back-button"
              type="button"
            >
              <ArrowLeft size={22} />
              Kembali
            </button>
          </div>

          <div className="review-doc-grid">
            <aside>
              <div className="review-doc-side-label">
                APPLICATION DOCUMENTS
              </div>

              <div className="review-doc-menu-list">
                {documents.map((doc) => (
                  <DocMenuItem
                    key={doc.id}
                    title={doc.title}
                    subtitle={doc.id === activeDocId ? "Active Viewing" : doc.subtitle}
                    active={doc.id === activeDocId}
                    icon={doc.icon}
                    onClick={() => setActiveDocId(doc.id)}
                  />
                ))}
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
                      Dokumen akan tampil status verifikasi setelah file diunggah.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section>
              <div className="review-doc-toolbar">
                <div className="review-doc-toolbar-left">
                  <div className="review-doc-file-badge">
                    <FileBadge size={20} />
                  </div>

                  <div>
                    <div className="review-doc-file-name">
                      {activeDocument.fileName}
                    </div>
                    <div className="review-doc-file-meta">
                      Uploaded on: {activeDocument.uploadedAt}
                      &nbsp;&nbsp; · &nbsp;&nbsp; Size: {activeDocument.size}
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

                  <button type="button" className="review-doc-print-button">
                    <Printer size={18} />
                    Print
                  </button>

                  <button type="button" className="review-doc-download-button">
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>

              <div className="review-doc-preview-shell">
                <div className="review-doc-preview-page review-doc-preview-empty">
                  <div className="review-doc-empty-state">
                    <div className="review-doc-empty-icon">
                      {activeDocument.icon}
                    </div>
                    <h3>{activeDocument.title}</h3>
                    <p>Belum ada dokumen yang diupload untuk bagian ini.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}