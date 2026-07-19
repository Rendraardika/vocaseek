import Sidebar from "../../../components/admin/Sidebar";
import "../../../styles/PartnerDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Trash2,
  Building2,
  UserCircle2,
  Mail,
  Phone,
  CircleCheckBig,
  Clock3,
  FileText,
  History,
  ArrowLeft,
} from "lucide-react";
import {
  deletePartner,
  getPartnerDetail,
} from "../../../services/adminVerification";
import { getApiErrorMessage } from "../../../services/auth";

function buildDocuments(partner) {
  const docs = [
    {
      status: "verified",
      statusLabel: "Tersimpan",
      title: "Letter of Acceptance (LoA)",
      meta: "",
      available: Boolean(partner?.documents?.loa),
    },
    {
      status: "verified",
      statusLabel: "Tersimpan",
      title: "Akta Pendirian",
      meta: "",
      available: Boolean(partner?.documents?.akta),
    },
  ];

  const availableDocs = docs.filter((item) => item.available);

  if (availableDocs.length > 0) {
    return availableDocs;
  }

  if (partner?.status === "active") {
    return [
      {
        status: "verified",
        statusLabel: "Terverifikasi",
        title: "Dokumen Kerjasama",
        meta: "Dokumen telah diverifikasi secara offline.",
        available: true,
        offlineOnly: true,
      },
    ];
  }

  return [];
}

export default function PartnerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPartner = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await getPartnerDetail(id);
        if (isMounted) {
          setPartner(result);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              requestError,
              "Gagal memuat detail partner dari backend.",
            ),
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPartner();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const documents = useMemo(() => buildDocuments(partner), [partner]);

  const handleDeletePartner = async () => {
    if (!partner || deleteLoading) return;

    setDeleteLoading(true);
    setError("");

    try {
      await deletePartner(partner.companyProfileId || partner.id || id);
      navigate("/admin/partners", {
        replace: true,
        state: {
          successMessage: `Mitra ${partner.name || ""} berhasil dihapus.`,
        },
      });
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Gagal menghapus mitra dari database.",
        ),
      );
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="pd-layout">
      <Sidebar />

      <main className="pd-main">

        <section className="pd-content">
          <div className="pd-top-row">
            <div>
              <div className="pd-breadcrumb">
                <span>ADMIN</span>
                <ChevronRight size={14} />
                <span>PARTNERS</span>
                <ChevronRight size={14} />
                <span className="active">DETAIL MITRA</span>
              </div>

              <h1 className="pd-page-title">
                <ArrowLeft
                  size={20}
                  className="pd-back-icon"
                  onClick={() => navigate(-1)}
                />
                {partner?.name || "Detail Partner"}
              </h1>
            </div>

            <button
              className="pd-delete-btn"
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={loading || deleteLoading || !partner}
            >
              <Trash2 size={18} />
              <span>{deleteLoading ? "Menghapus..." : "Hapus Mitra"}</span>
            </button>
          </div>

          {error ? (
            <div style={{ color: "#d93025", marginBottom: "16px" }}>{error}</div>
          ) : null}

          <div className="pd-company-card">
            <div className="pd-company-head">
              <div className="pd-company-logo">
                {partner?.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="pd-company-logo-image" />
                ) : (
                  <Building2 size={28} />
                )}
              </div>

              <div className="pd-company-main">
                <div className="pd-company-title-row">
                  <h2>{partner?.name || "Memuat partner..."}</h2>
                  <span className="pd-mou-badge">
                    {(partner?.status || "pending").toUpperCase()}
                  </span>
                </div>

                <div className="pd-company-meta">
                  <div>
                    <span>INDUSTRI</span>
                    <strong>{partner?.businessType || "-"}</strong>
                  </div>
                  <div>
                    <span>KONTAK</span>
                    <strong>{partner?.phone || "-"}</strong>
                  </div>
                  <div>
                    <span>TGL BERGABUNG</span>
                    <strong>{partner?.submittedAt || "-"}</strong>
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
                      <div className="pd-contact-name">{partner?.name || "-"}</div>
                      <div className="pd-contact-role">Perusahaan Mitra</div>
                    </div>
                  </div>

                  <div className="pd-contact-info">
                    <div className="pd-contact-item">
                      <Mail size={20} />
                      <span>{partner?.email || "-"}</span>
                    </div>
                    <div className="pd-contact-item">
                      <Phone size={20} />
                      <span>{partner?.phone || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pd-card">
                <div className="pd-card-title">
                  <History size={22} />
                  <h3>Ringkasan Status</h3>
                </div>

                <div className="pd-timeline">
                  <div className="pd-timeline-item active">
                    <div className="pd-timeline-dot" />
                    <div className="pd-timeline-content">
                      <span>Status saat ini</span>
                      <p>
                        Partner berada pada status <strong>{partner?.status || "-"}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="pd-timeline-item">
                    <div className="pd-timeline-dot" />
                    <div className="pd-timeline-content">
                      <span>Tanggal Pengajuan</span>
                      <p>{partner?.submittedAt || "Belum tersedia."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pd-right-column">
              <div className="pd-card pd-doc-card">
                <div className="pd-doc-head">
                  <h3>Dokumen Kerjasama</h3>
                </div>

                <div className="pd-doc-list">
                  {!loading && documents.length > 0 ? (
                    documents.map((doc) => (
                      <div key={doc.title} className="pd-doc-item">
                        <div
                          className={`pd-doc-status ${doc.status === "verified" ? "verified" : "review"}`}
                        >
                          {doc.status === "verified" ? (
                            <CircleCheckBig size={16} />
                          ) : (
                            <Clock3 size={16} />
                          )}
                          <span>{doc.statusLabel}</span>
                        </div>

                        <div className="pd-doc-body">
                          <div className={`pd-doc-icon ${doc.offlineOnly ? "green" : "red"}`}>
                            <FileText size={24} />
                          </div>

                          <div className="pd-doc-meta">
                            <strong>{doc.title}</strong>
                            {doc.meta ? <span>{doc.meta}</span> : null}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: "#6b7280", textAlign: "center", padding: "20px 0" }}>
                      {loading ? "Memuat dokumen partner..." : "Belum ada dokumen partner."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {isDeleteModalOpen ? (
        <div
          className="pd-modal-overlay"
          onClick={() => {
            if (!deleteLoading) setIsDeleteModalOpen(false);
          }}
        >
          <div
            className="pd-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pd-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pd-confirm-icon">
              <Trash2 size={24} />
            </div>

            <h2 id="pd-delete-title">Hapus Mitra?</h2>
            <p>
              Mitra <strong>{partner?.name || "ini"}</strong> akan dihapus dari
              sistem. Data partner akan terhapus dari database.
            </p>

            <div className="pd-confirm-actions">
              <button
                type="button"
                className="pd-confirm-btn pd-confirm-btn--ghost"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
              >
                Batal
              </button>
              <button
                type="button"
                className="pd-confirm-btn pd-confirm-btn--danger"
                onClick={handleDeletePartner}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Menghapus..." : "Hapus Mitra"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
