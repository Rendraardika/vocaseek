import Sidebar from "../../../components/admin/SidebarStaff";
import "../../../styles/PartnerDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Building2,
  ExternalLink,
  UserCircle2,
  Mail,
  Phone,
  CircleCheckBig,
  Clock3,
  FileText,
  History,
  ArrowLeft,
} from "lucide-react";
import { getPartnerDetail } from "../../../services/adminVerification";
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

export default function PartnerDetailStaff() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              "Gagal memuat detail mitra dari backend.",
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
                {partner?.name || "Detail Mitra"}
              </h1>
            </div>
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
                  <h2>{partner?.name || "Memuat mitra..."}</h2>
                  <span className="pd-mou-badge">
                    {(partner?.status || "pending").toUpperCase()}
                  </span>
                </div>

                {partner?.raw?.perusahaan?.website_url ? (
                  <a
                    href={partner.raw.perusahaan.website_url}
                    className="pd-company-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {partner.raw.perusahaan.website_url} <ExternalLink size={18} />
                  </a>
                ) : null}

                <div className="pd-company-meta">
                  <div>
                    <span>INDUSTRI</span>
                    <strong>{partner?.businessType || "-"}</strong>
                  </div>
                  <div>
                    <span>KANTOR PUSAT</span>
                    <strong>{partner?.city || "-"}</strong>
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
                      <div className="pd-contact-name">
                        {partner?.picName || partner?.name || "-"}
                      </div>
                      <div className="pd-contact-role">
                        {partner?.picRole || "PIC Perusahaan"}
                      </div>
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
                  <h3>Riwayat Aktivitas</h3>
                </div>

                {Array.isArray(partner?.activities) && partner.activities.length > 0 ? (
                  <div className="pd-timeline">
                    {partner.activities.map((activity, index) => (
                      <div
                        key={`${activity?.tgl || activity?.date || index}-${index}`}
                        className={`pd-timeline-item ${index === 0 ? "active" : ""}`}
                      >
                        <div className="pd-timeline-dot" />
                        <div className="pd-timeline-content">
                          <span>{activity?.tgl || activity?.date || "-"}</span>
                          <p>{activity?.pesan || activity?.message || "-"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pd-empty-state">Belum ada aktivitas.</div>
                )}
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
                    <div className="pd-empty-state">
                      {loading ? "Memuat dokumen mitra..." : "Belum ada dokumen mitra."}
                    </div>
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
