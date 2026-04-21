import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/SidebarStaff";
import "../../../styles/PartnerManagement.css";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Building2,
  Handshake,
  ClipboardList,
  Eye,
  ChevronDown,
} from "lucide-react";
import { getPartners } from "../../../services/adminVerification";
import { getApiErrorMessage } from "../../../services/auth";
import {
  getPaginationMeta,
  paginateItems,
} from "../../../utils/pagination";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "review", label: "Under Review" },
  { value: "active", label: "Active" },
  { value: "approved", label: "Approved" },
];
const ITEMS_PER_PAGE = 8;

function getStatusLabel(status) {
  const found = STATUS_OPTIONS.find((item) => item.value === status);
  return found ? found.label : status;
}

export default function PartnerManagementStaff() {
  const navigate = useNavigate();
  const [partners, setPartners] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [businessFilter, setBusinessFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  const loadPartners = React.useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const result = await getPartners();
      setPartners(result);
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Gagal memuat daftar partner dari backend."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const businessOptions = React.useMemo(() => {
    return [...new Set(partners.map((item) => item.businessType).filter(Boolean))];
  }, [partners]);

  const filteredPartners = React.useMemo(() => {
    return partners.filter((partner) => {
      const keyword = searchTerm.trim().toLowerCase();
      const matchesKeyword =
        !keyword ||
        partner.name.toLowerCase().includes(keyword) ||
        partner.email.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ? true : partner.status === statusFilter;
      const matchesBusiness =
        businessFilter === "all" ? true : partner.businessType === businessFilter;

      return matchesKeyword && matchesStatus && matchesBusiness;
    });
  }, [businessFilter, partners, searchTerm, statusFilter]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, businessFilter]);

  const { pageItems } = paginateItems(filteredPartners, currentPage, ITEMS_PER_PAGE);
  const pagination = getPaginationMeta(
    filteredPartners.length,
    currentPage,
    ITEMS_PER_PAGE,
  );

  const summaryCards = React.useMemo(() => {
    const totalPartners = partners.length;
    const activePartners = partners.filter(
      (item) => item.status === "active" || item.status === "approved",
    ).length;
    const reviewPartners = partners.filter(
      (item) => item.status === "pending" || item.status === "review",
    ).length;

    return [
      {
        icon: <Building2 size={20} strokeWidth={2.2} />,
        iconClass: "pm-summary-icon yellow",
        title: "Total Partner",
        value: String(totalPartners),
        badge: `${totalPartners} terdaftar`,
        badgeClass: "green",
      },
      {
        icon: <Handshake size={20} strokeWidth={2.2} />,
        iconClass: "pm-summary-icon blue",
        title: "Kolaborasi Aktif",
        value: String(activePartners),
        badge: `${activePartners} aktif`,
        badgeClass: "green",
      },
      {
        icon: <ClipboardList size={20} strokeWidth={2.2} />,
        iconClass: "pm-summary-icon red",
        title: "Butuh Review",
        value: String(reviewPartners),
        badge: `${reviewPartners} menunggu`,
        badgeClass: reviewPartners > 0 ? "red" : "green",
      },
    ];
  }, [partners]);

  return (
    <div className="pm-layout">
      <Sidebar />

      <main className="pm-main">

        <section className="pm-content">
          <div className="pm-breadcrumb">
            <span>ADMIN &gt;</span>
            <span className="active">PARTNER MANAGEMENT</span>
          </div>

          <div className="pm-header-row">
            <div>
              <h1 className="pm-page-title">Partner Management</h1>
              <p className="pm-page-subtitle">
                Tinjau dan kelola direktori partner perusahaan dan kolaborasi
                dalam ekosistem Vocaseek.
              </p>
            </div>

            <button
              className="pm-add-btn"
              type="button"
              onClick={() => navigate("/admin/staff/partners/add-company")}
            >
              <Plus size={18} />
              <span>Add Company</span>
            </button>
          </div>

          <div className="pm-summary-grid">
            {summaryCards.map((card) => (
              <div className="pm-summary-card" key={card.title}>
                <div className="pm-summary-top">
                  <div className={card.iconClass}>{card.icon}</div>
                  <span className={`pm-summary-badge ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="pm-summary-content">
                  <p>{card.title}</p>
                  <h3>{card.value}</h3>
                </div>

                <div className="pm-summary-circle" />
              </div>
            ))}
          </div>

          <div className="pm-table-card">
            <div className="pm-table-topbar">
              <div className="pm-table-title-wrap">
                <h2>Daftar Partner</h2>
                <span className="pm-total-badge">{filteredPartners.length} Total</span>
              </div>

              <div className="pm-table-actions">
                <div className="pm-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Cari perusahaan..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <div className="pm-filter-wrap">
                  <button
                    className={`pm-filter-btn ${filterOpen ? "active" : ""}`}
                    type="button"
                    onClick={() => setFilterOpen((prev) => !prev)}
                  >
                    <SlidersHorizontal size={17} />
                    <span>Filter</span>
                    <ChevronDown
                      size={16}
                      className={`pm-filter-chevron ${filterOpen ? "open" : ""}`}
                    />
                  </button>

                  {filterOpen && (
                    <div className="pm-filter-dropdown">
                      <div className="pm-filter-group">
                        <label className="pm-filter-label">Status Verifikasi</label>
                        <select
                          className="pm-filter-select"
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

                      <div className="pm-filter-group">
                        <label className="pm-filter-label">Tipe Bisnis</label>
                        <select
                          className="pm-filter-select"
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

                      <div className="pm-filter-actions-dropdown">
                        <button
                          type="button"
                          className="pm-filter-reset"
                          onClick={() => {
                            setStatusFilter("all");
                            setBusinessFilter("all");
                          }}
                        >
                          Reset
                        </button>

                        <button
                          type="button"
                          className="pm-filter-apply"
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
              <div style={{ padding: "20px 24px", color: "#d93025" }}>{pageError}</div>
            ) : null}

            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th className="pm-col-name">NAMA PERUSAHAAN</th>
                    <th className="pm-col-business">TIPE BISNIS</th>
                    <th className="pm-col-date">TANGGAL PENGAJUAN</th>
                    <th className="pm-col-status">STATUS VERIFIKASI</th>
                    <th className="pm-col-action">AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {!loading && pageItems.length > 0 ? (
                    pageItems.map((partner) => {
                      const Icon = partner.Icon;

                      return (
                        <tr key={partner.id}>
                          <td>
                            <div className="pm-company-cell">
                              {partner.logoUrl ? (
                                <img
                                  src={partner.logoUrl}
                                  alt={partner.name}
                                  className="pm-company-icon pm-company-icon--image"
                                />
                              ) : (
                                <div className={`pm-company-icon ${partner.companyIconClass}`}>
                                  <Icon size={18} />
                                </div>
                              )}

                              <div className="pm-company-text">
                                <div className="pm-company-name">{partner.name}</div>
                                <div className="pm-company-city">{partner.city}</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`pm-business-badge ${partner.businessTypeClass}`}
                            >
                              {partner.businessType}
                            </span>
                          </td>

                          <td className="pm-date-cell">{partner.submittedAt}</td>

                          <td>
                            <span className={`pm-status-badge ${partner.status}`}>
                              {getStatusLabel(partner.status)}
                            </span>
                          </td>

                          <td>
                            <div className="pm-action-group">
                              <button
                                type="button"
                                className="pm-icon-btn"
                                onClick={() =>
                                  navigate(
                                    `/admin/staff/partners/${partner.companyProfileId || partner.id}`,
                                  )
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
                        {loading ? "Memuat data partner..." : "Belum ada data partner."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pm-table-footer">
              <p>
                Menampilkan {pagination.start}-{pagination.end} dari {filteredPartners.length} data
              </p>

              <div className="pm-pagination">
                <button
                  className="pm-page-btn wide"
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
                <button
                  className="pm-page-btn wide"
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
    </div>
  );
}
