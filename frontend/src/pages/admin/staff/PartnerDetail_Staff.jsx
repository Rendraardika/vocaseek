import Sidebar from "../../../components/admin/SidebarStaff";
import "../../../styles/PartnerDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Trash2,
  Building2,
  ExternalLink,
  UserCircle2,
  Mail,
  Phone,
  Plus,
  History,
  ArrowLeft,
} from "lucide-react";

export default function PartnerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const documents = [];

  return (
    <div className="pd-layout">
      <Sidebar />

      <main className="pd-main">

        <section className="pd-content">
          <div className="pd-top-row">
            <div>
              <div className="pd-breadcrumb">
                <span>ADMIN &gt; </span>
                <span>PARTNERS &gt;</span>
                <span className="active">DETAIL MITRA</span>
              </div>

              <h1 className="pd-page-title">
                <ArrowLeft
                  size={20}
                  className="pd-back-icon"
                  onClick={() => navigate(-1)}
                />
                Belum ada nama mitra
              </h1>
            </div>

            <button className="pd-delete-btn" type="button">
              <Trash2 size={18} />
              <span>Hapus Mitra</span>
            </button>
          </div>

          <div className="pd-company-card">
            <div className="pd-company-head">
              <div className="pd-company-logo">
                <Building2 size={28} />
              </div>

              <div className="pd-company-main">
                <div className="pd-company-title-row">
                  <h2>Belum ada nama perusahaan</h2>
                </div>

                <a
                  href="/"
                  className="pd-company-link"
                  onClick={(e) => e.preventDefault()}
                >
                  Belum ada website <ExternalLink size={18} />
                </a>

                <div className="pd-company-meta">
                  <div>
                    <span>INDUSTRI</span>
                    <strong>-</strong>
                  </div>
                  <div>
                    <span>KANTOR PUSAT</span>
                    <strong>-</strong>
                  </div>
                  <div>
                    <span>TGL BERGABUNG</span>
                    <strong>-</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pd-grid">
            <div className="pd-left-column">
              <div className="pd-card">
                <div className="pd-card-title">
                  <UserCircle2 size={22} />
                  <h3>Informasi Kontak (PIC)</h3>
                </div>

                <div className="pd-contact-row">
                  <div className="pd-contact-user">
                    <div className="pd-contact-avatar" />
                    <div>
                      <div className="pd-contact-name">Belum ada PIC</div>
                      <div className="pd-contact-role">-</div>
                    </div>
                  </div>

                  <div className="pd-contact-info">
                    <div className="pd-contact-item">
                      <Mail size={20} />
                      <span>-</span>
                    </div>
                    <div className="pd-contact-item">
                      <Phone size={20} />
                      <span>-</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pd-card">
                <div className="pd-card-title">
                  <History size={22} />
                  <h3>Riwayat Aktivitas</h3>
                </div>

                <div className="pd-empty-state">
                  Belum ada aktivitas.
                </div>
              </div>
            </div>

            <div className="pd-right-column">
              <div className="pd-card pd-doc-card">
                <div className="pd-doc-head">
                  <h3>Dokumen Kerjasama</h3>
                  <button className="pd-plus-btn" type="button">
                    <Plus size={22} />
                  </button>
                </div>

                <div className="pd-doc-list">
                  {documents.length === 0 ? (
                    <div className="pd-empty-state">
                      Dokumen telah diverifikasi secara offline.
                    </div>
                  ) : (
                    documents.map((doc, index) => (
                      <div key={index} className="pd-doc-item">
                        <div
                          className={`pd-doc-status ${
                            doc.status === "verified" ? "verified" : "review"
                          }`}
                        >
                          <span>{doc.statusLabel}</span>
                        </div>

                        <div className="pd-doc-body">
                          <div className={doc.iconClass}>{doc.icon}</div>

                          <div className="pd-doc-meta">
                            <strong>{doc.title}</strong>
                            <span>{doc.meta}</span>
                          </div>
                        </div>

                        <div className="pd-doc-actions">
                          <button
                            className="pd-doc-btn secondary"
                            onClick={() =>
                              navigate(
                                `/admin/staff/partners/${id}/review-dokumen-mitra`
                              )
                            }
                            type="button"
                          >
                            Lihat
                          </button>
                          <button className="pd-doc-btn primary" type="button">
                            Unduh
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
