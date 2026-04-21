import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/Sidebar";
import "../../../styles/CompanyVerification.css";
import {
  Search,
  SlidersHorizontal,
  ShieldAlert,
  ShieldCheck,
  CircleOff,
  SquarePen,
  Eye,
  ChevronDown,
  X,
  Check,
  SquarePen as ModalPen,
} from "lucide-react";
import {
  getVerificationCompanies,
  updateVerificationStatus,
} from "../../../services/adminVerification";
import { getApiErrorMessage } from "../../../services/auth";
import {
  getPaginationMeta,
  paginateItems,
} from "../../../utils/pagination";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "review", label: "Under Review" },
  { value: "approved", label: "Approved" },
];
const ITEMS_PER_PAGE = 8;

function getStatusLabel(status) {
  const found = STATUS_OPTIONS.find((item) => item.value === status);
  return found ? found.label : status;
}

function ChangeVerificationStatusModal({
  open,
  company,
  selectedStatus,
  setSelectedStatus,
  isSaving,
  error,
  onClose,
  onSave,
}) {
  if (!open || !company) return null;

  const Icon = company.Icon;

  return (
    <div className="cv-modal-overlay" onClick={onClose}>
      <div className="cv-modal" onClick={(event) => event.stopPropagation()}>
        <div className="cv-modal-header">
          <div className="cv-modal-title-wrap">
            <ModalPen size={19} className="cv-modal-title-icon" />
            <h3 className="cv-modal-title">Ubah Status Verifikasi Mitra</h3>
          </div>

          <button className="cv-modal-close" onClick={onClose} type="button">
            <X size={22} />
          </button>
        </div>

        <div className="cv-modal-body">
          <div className="cv-partner-box">
            <div className={`cv-company-icon ${company.companyIconClass}`}>
              <Icon size={18} />
            </div>
            <div>
              <div className="cv-partner-name">{company.name}</div>
              <div className="cv-partner-role">{company.city}</div>
            </div>
          </div>

          <div className="cv-field-group">
            <label className="cv-field-label">Pilih Status Baru</label>
            <div className="cv-select-wrap">
              <select
                className="cv-select"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="cv-select-icon" />
            </div>
          </div>

          {error ? (
            <p style={{ color: "#d93025", fontSize: "0.9rem", margin: 0 }}>{error}</p>
          ) : null}
        </div>

        <div className="cv-modal-footer">
          <button type="button" className="cv-btn-cancel" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="cv-btn-save" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanyVerification() {
  const navigate = useNavigate();
  const [companies, setCompanies] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState("");
  const [modalError, setModalError] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [activeCompany, setActiveCompany] = React.useState(null);
  const [selectedStatus, setSelectedStatus] = React.useState("pending");
  const [isSaving, setIsSaving] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [businessFilter, setBusinessFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  const loadCompanies = React.useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const result = await getVerificationCompanies();
      setCompanies(result);
    } catch (error) {
      setPageError(
        getApiErrorMessage(
          error,
          "Gagal memuat data verifikasi perusahaan dari backend.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const openModal = (company) => {
    setActiveCompany(company);
    setSelectedStatus(company.status);
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveCompany(null);
    setModalError("");
  };

  const saveStatus = async () => {
    if (!activeCompany) return;

    setIsSaving(true);
    setModalError("");

    try {
      await updateVerificationStatus(activeCompany.id, {
        status: selectedStatus,
      });

      setCompanies((prev) =>
        prev.map((item) =>
          item.id === activeCompany.id ? { ...item, status: selectedStatus } : item,
        ),
      );
      closeModal();
    } catch (error) {
      setModalError(
        getApiErrorMessage(
          error,
          "Gagal memperbarui status verifikasi perusahaan.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const businessOptions = React.useMemo(() => {
    return [...new Set(companies.map((item) => item.businessType).filter(Boolean))];
  }, [companies]);

  const filteredCompanies = React.useMemo(() => {
    return companies.filter((company) => {
      const normalizedKeyword = searchTerm.trim().toLowerCase();
      const matchesKeyword =
        !normalizedKeyword ||
        company.name.toLowerCase().includes(normalizedKeyword) ||
        company.email.toLowerCase().includes(normalizedKeyword);

      const matchesStatus =
        statusFilter === "all" ? true : company.status === statusFilter;
      const matchesBusiness =
        businessFilter === "all" ? true : company.businessType === businessFilter;

      return matchesKeyword && matchesStatus && matchesBusiness;
    });
  }, [businessFilter, companies, searchTerm, statusFilter]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, businessFilter]);

  const { pageItems } = paginateItems(filteredCompanies, currentPage, ITEMS_PER_PAGE);
  const pagination = getPaginationMeta(
    filteredCompanies.length,
    currentPage,
    ITEMS_PER_PAGE,
  );

  const summary = React.useMemo(() => {
    const pending = companies.filter((item) => item.status === "pending").length;
    const approved = companies.filter((item) => item.status === "approved").length;
    const rejected = companies.filter(
      (item) => item.status === "rejected" || item.status === "invalid",
    ).length;

    return [
      {
        icon: <ShieldAlert size={20} strokeWidth={2.2} />,
        iconClass: "cv-summary-icon yellow",
        title: "Total Pending",
        value: String(pending),
        badge: `${pending} menunggu review`,
        badgeClass: "green",
      },
      {
        icon: <ShieldCheck size={20} strokeWidth={2.2} />,
        iconClass: "cv-summary-icon blue",
        title: "Total Disetujui",
        value: String(approved),
        badge: `${approved} mitra aktif`,
        badgeClass: "green",
      },
      {
        icon: <CircleOff size={20} strokeWidth={2.2} />,
        iconClass: "cv-summary-icon red",
        title: "Total Ditolak",
        value: String(rejected),
        badge: `${rejected} pengajuan ditolak`,
        badgeClass: rejected > 0 ? "red" : "green",
      },
    ];
  }, [companies]);

  return (
    <div className="cv-layout">
      <Sidebar />

      <main className="cv-main">
        <section className="cv-content">
          <div className="breadcrumb">
            <span>ADMIN</span>
            <span>›</span>
            <span className="active">VERIFIKASI PERUSAHAAN</span>
          </div>

          <h1 className="cv-page-title">Verifikasi Perusahaan Mitra</h1>
          <p className="cv-page-subtitle">
            Tinjau dan setujui pendaftaran perusahaan baru untuk bergabung dengan
            ekosistem Vocaseek.
          </p>

          <div className="cv-summary-grid">
            {summary.map((card) => (
              <div className="cv-summary-card" key={card.title}>
                <div className="cv-summary-top">
                  <div className={card.iconClass}>{card.icon}</div>
                  <span className={`cv-summary-badge ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="cv-summary-content">
                  <p>{card.title}</p>
                  <h3>{card.value}</h3>
                </div>

                <div className="cv-summary-circle" />
              </div>
            ))}
          </div>

          <div className="cv-table-card">
            <div className="cv-table-topbar">
              <div className="cv-table-title-wrap">
                <h2>Daftar Pengajuan</h2>
                <span className="cv-total-badge">
                  {filteredCompanies.filter((item) => item.status === "pending").length} Pending
                </span>
              </div>

              <div className="cv-table-actions">
                <div className="cv-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Cari perusahaan..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <div className="cv-filter-wrap">
                  <button
                    className={`cv-filter-btn ${filterOpen ? "active" : ""}`}
                    type="button"
                    onClick={() => setFilterOpen((prev) => !prev)}
                  >
                    <SlidersHorizontal size={17} />
                    <span>Filter</span>
                    <ChevronDown
                      size={16}
                      className={`cv-filter-chevron ${filterOpen ? "open" : ""}`}
                    />
                  </button>

                  {filterOpen && (
                    <div className="cv-filter-dropdown">
                      <div className="cv-filter-group">
                        <label className="cv-filter-label">Status Verifikasi</label>
                        <select
                          className="cv-filter-select"
                          value={statusFilter}
                          onChange={(event) => setStatusFilter(event.target.value)}
                        >
                          <option value="all">Semua Status</option>
                          {STATUS_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="cv-filter-group">
                        <label className="cv-filter-label">Tipe Bisnis</label>
                        <select
                          className="cv-filter-select"
                          value={businessFilter}
                          onChange={(event) => setBusinessFilter(event.target.value)}
                        >
                          <option value="all">Semua Tipe</option>
                          {businessOptions.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="cv-filter-actions">
                        <button
                          type="button"
                          className="cv-filter-reset"
                          onClick={() => {
                            setStatusFilter("all");
                            setBusinessFilter("all");
                          }}
                        >
                          Reset
                        </button>

                        <button
                          type="button"
                          className="cv-filter-apply"
                          onClick={() => setFilterOpen(false)}
                        >
                          Terapkan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {pageError ? (
              <div style={{ padding: "20px 22px", color: "#d93025" }}>{pageError}</div>
            ) : null}

            <div className="cv-table-wrap">
              <table className="cv-table">
                <thead>
                  <tr>
                    <th className="cv-col-name">NAMA PERUSAHAAN</th>
                    <th className="cv-col-business">TIPE BISNIS</th>
                    <th className="cv-col-date">TANGGAL PENGAJUAN</th>
                    <th className="cv-col-status">STATUS VERIFIKASI</th>
                    <th className="cv-col-action">AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {!loading && pageItems.length > 0 ? (
                    pageItems.map((company) => {
                      const Icon = company.Icon;

                      return (
                        <tr key={company.id}>
                          <td>
                            <div className="cv-company-cell">
                              <div className={`cv-company-icon ${company.companyIconClass}`}>
                                <Icon size={18} />
                              </div>

                              <div className="cv-company-text">
                                <div className="cv-company-name">{company.name}</div>
                                <div className="cv-company-city">{company.city}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`cv-business-badge ${company.businessTypeClass}`}
                            >
                              {company.businessType}
                            </span>
                          </td>

                          <td className="cv-date-cell">{company.submittedAt}</td>

                          <td>
                            <span className={`cv-status-badge ${company.status}`}>
                              {getStatusLabel(company.status)}
                            </span>
                          </td>

                          <td>
                            <div className="cv-action-group">
                              <button
                                type="button"
                                className="cv-edit-status"
                                onClick={() => openModal(company)}
                              >
                                <SquarePen size={14} />
                                <span>
                                  Ubah
                                  <br />
                                  Status
                                </span>
                              </button>

                              <span className="cv-action-divider" />

                              <button
                                type="button"
                                className="cv-icon-btn"
                                onClick={() =>
                                  navigate(`/admin/verifikasi-perusahaan/${company.id}/review`)
                                }
                              >
                                <Eye size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ padding: "32px 16px", textAlign: "center", color: "#6b7280" }}
                      >
                        {loading
                          ? "Memuat pengajuan perusahaan..."
                          : "Belum ada pengajuan perusahaan."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="cv-table-footer">
              <p>
                Menampilkan {pagination.start}-{pagination.end} dari {filteredCompanies.length} data
              </p>

              <div className="cv-pagination">
                <button
                  className="cv-page-btn wide"
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
                <button
                  className="cv-page-btn wide"
                  type="button"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages))
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ChangeVerificationStatusModal
        open={modalOpen}
        company={activeCompany}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        isSaving={isSaving}
        error={modalError}
        onClose={closeModal}
        onSave={saveStatus}
      />
    </div>
  );
}
