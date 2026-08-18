import "../../../styles/admin/JobPostings.css";
import React from "react";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  FileX2,
  Search,
  Users,
} from "lucide-react";
import SidebarSuper from "../../../components/admin/Sidebar";
import SidebarStaff from "../../../components/admin/SidebarStaff";
import { getApiErrorMessage } from "../../../services/auth";
import { getAdminJobs, mapAdminJobRow } from "../../../services/jobs";
import { translatePhrase } from "../../../i18n/phrases";
import { getSavedLanguage } from "../../../utils/languagePreference";
import {
  getPageNumbers,
  getPaginationMeta,
  paginateItems,
} from "../../../utils/pagination";

const ITEMS_PER_PAGE = 8;
const STATUS_LABELS = {
  All: { id: "Semua", en: "All" },
  Open: { id: "Dibuka", en: "Open" },
  Closed: { id: "Ditutup", en: "Closed" },
  Draft: { id: "Draf", en: "Draft" },
};
const LOCAL_LABELS = {
  "Total Lowongan": { id: "Total Lowongan", en: "Total Vacancies" },
  "Seluruh lowongan mitra": { id: "Seluruh lowongan mitra", en: "All partner vacancies" },
  "Lowongan Aktif": { id: "Lowongan Aktif", en: "Active Vacancies" },
  "Sedang dibuka": { id: "Sedang dibuka", en: "Currently open" },
  "Lowongan Ditutup": { id: "Lowongan Ditutup", en: "Closed Vacancies" },
  "Tidak menerima pelamar": { id: "Tidak menerima pelamar", en: "Not accepting applicants" },
  "Total Pelamar": { id: "Total Pelamar", en: "Total Applicants" },
  "Dari semua lowongan": { id: "Dari semua lowongan", en: "From all vacancies" },
  "Cari judul, perusahaan, lokasi...": {
    id: "Cari judul, perusahaan, lokasi...",
    en: "Search title, company, location...",
  },
  "Tanggal Posting": { id: "Tanggal Posting", en: "Posted Date" },
  "Posisi Lowongan": { id: "Posisi Lowongan", en: "Job Position" },
  "Perusahaan": { id: "Perusahaan", en: "Company" },
  "Kategori": { id: "Kategori", en: "Category" },
  "Pelamar": { id: "Pelamar", en: "Applicants" },
  "Status": { id: "Status", en: "Status" },
  "Daftar Lowongan": { id: "Daftar Lowongan", en: "Job Postings" },
  "MANAJEMEN LOWONGAN": { id: "MANAJEMEN LOWONGAN", en: "VACANCY MANAGEMENT" },
  "Tidak ada lowongan yang sesuai pencarian.": {
    id: "Tidak ada lowongan yang sesuai pencarian.",
    en: "No vacancies match your search.",
  },
  "Tidak ada lowongan": { id: "Tidak ada lowongan", en: "No vacancies" },
  "Coba gunakan kata kunci lain.": {
    id: "Coba gunakan kata kunci lain.",
    en: "Try another keyword.",
  },
  "Menampilkan": { id: "Menampilkan", en: "Showing" },
  "sampai": { id: "sampai", en: "to" },
  "dari": { id: "dari", en: "of" },
  "hasil": { id: "hasil", en: "results" },
};

function labelByLocale(labels, locale) {
  return labels?.[locale === "en" ? "en" : "id"] || "";
}

function translate(text, locale) {
  return (
    labelByLocale(LOCAL_LABELS[text], locale) ||
    translatePhrase(text, locale) ||
    text
  );
}

function formatPostedDate(row, locale) {
  const rawDate =
    row?.raw?.created_at ||
    row?.raw?.createdAt ||
    row?.created_at ||
    row?.date ||
    "";
  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return row?.date || "-";
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatBox({ title, value, subtitle, icon, iconBg, iconColor }) {
  return (
    <div className="job-postings__stat-box">
      <div className="job-postings__stat-box-inner">
        <div>
          <p className="job-postings__stat-title">{title}</p>
          <h3 className="job-postings__stat-value">{value}</h3>
          <p className="job-postings__stat-subtitle">{subtitle}</p>
        </div>
        <div className={`job-postings__stat-icon-box ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, locale }) {
  const className =
    status === "Closed"
      ? "job-postings__status-badge job-postings__status-badge--closed"
      : status === "Draft"
        ? "job-postings__status-badge job-postings__status-badge--draft"
        : "job-postings__status-badge job-postings__status-badge--open";

  return (
    <span className={className}>
      {labelByLocale(STATUS_LABELS[status], locale) || status}
    </span>
  );
}

function AdminMobileJobCard({ row, locale }) {
  return (
    <div className="job-postings__mobile-card">
      <div className="job-postings__mobile-card-top">
        <div className="job-postings__job-main">
          <div className={`job-postings__job-tag ${row.tagBg} ${row.tagText}`}>
            {row.tag}
          </div>
          <div>
            <div className="job-postings__job-title">{row.title}</div>
            <div className="job-postings__job-id">{row.company}</div>
          </div>
        </div>
        <StatusBadge status={row.status} locale={locale} />
      </div>

      <div className="job-postings__mobile-meta">
        <div className="job-postings__mobile-field">
          <div className="job-postings__mobile-label">
            {translate("Kategori", locale)}
          </div>
          <div className="job-postings__department">{row.dept}</div>
          <div className="job-postings__team">{row.team || "-"}</div>
        </div>
        <div className="job-postings__mobile-field">
          <div className="job-postings__mobile-label">
            {translate("Pelamar", locale)}
          </div>
          <div className="job-postings__date">{row.applicantCount}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobPostings({ mode = "super" }) {
  const Sidebar = mode === "staff" ? SidebarStaff : SidebarSuper;
  const [jobRows, setJobRows] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState("All");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [locale, setLocale] = React.useState(getSavedLanguage());

  React.useEffect(() => {
    const syncLanguage = () => {
      setLocale(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);
    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

  const loadJobs = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getAdminJobs();
      const jobs = response?.data?.jobs || response?.data?.data || [];
      setJobRows(jobs.map(mapAdminJobRow));
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Gagal memuat daftar lowongan."),
      );
      setJobRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const stats = React.useMemo(
    () => ({
      total: jobRows.length,
      active: jobRows.filter((row) => row.status === "Open").length,
      closed: jobRows.filter((row) => row.status === "Closed").length,
      applicants: jobRows.reduce((total, row) => total + row.applicantCount, 0),
    }),
    [jobRows],
  );

  const filteredRows = React.useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return jobRows.filter((row) => {
      const matchesTab = activeTab === "All" || row.status === activeTab;
      if (!matchesTab) return false;
      if (!keyword) return true;

      return String(row.searchText || "")
        .toLowerCase()
        .includes(keyword);
    });
  }, [activeTab, jobRows, searchQuery]);

  const { totalPages, pageItems: paginatedRows } = React.useMemo(
    () => paginateItems(filteredRows, currentPage, ITEMS_PER_PAGE),
    [filteredRows, currentPage],
  );
  const paginationMeta = React.useMemo(
    () => getPaginationMeta(filteredRows.length, currentPage, ITEMS_PER_PAGE),
    [filteredRows.length, currentPage],
  );
  const pageNumbers = React.useMemo(
    () => getPageNumbers(paginationMeta.currentPage, paginationMeta.totalPages),
    [paginationMeta.currentPage, paginationMeta.totalPages],
  );

  React.useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  return (
    <div className="job-postings">
      <Sidebar />

      <main className="job-postings__main">
        <section className="job-postings__section">
          <div className="job-postings__breadcrumb">
            <p className="dashboard-mitra__breadcrumb">
              <span>ADMIN &gt; </span>
              <span className="dashboard-mitra__breadcrumb-active">
                {translate("MANAJEMEN LOWONGAN", locale)}
              </span>
            </p>
          </div>

          <div className="job-postings__header">
            <h1 className="job-postings__title">
              {translate("Daftar Lowongan", locale)}
            </h1>
          </div>

          <div className="job-postings__stats-grid job-postings__stats-grid--admin">
            <StatBox
              title={translate("Total Lowongan", locale)}
              value={stats.total}
              subtitle={translate("Seluruh lowongan mitra", locale)}
              icon={<BriefcaseBusiness size={20} />}
              iconBg="job-postings__icon-bg--blue"
              iconColor="job-postings__icon-color--blue"
            />
            <StatBox
              title={translate("Lowongan Aktif", locale)}
              value={stats.active}
              subtitle={translate("Sedang dibuka", locale)}
              icon={<CircleCheck size={20} />}
              iconBg="job-postings__icon-bg--green"
              iconColor="job-postings__icon-color--green"
            />
            <StatBox
              title={translate("Lowongan Ditutup", locale)}
              value={stats.closed}
              subtitle={translate("Tidak menerima pelamar", locale)}
              icon={<FileX2 size={20} />}
              iconBg="job-postings__icon-bg--red"
              iconColor="job-postings__icon-color--red"
            />
            <StatBox
              title={translate("Total Pelamar", locale)}
              value={stats.applicants}
              subtitle={translate("Dari semua lowongan", locale)}
              icon={<Users size={20} />}
              iconBg="job-postings__icon-bg--yellow"
              iconColor="job-postings__icon-color--yellow"
            />
          </div>

          <div className="job-postings__table-card">
            <div className="job-postings__table-toolbar">
              <div className="job-postings__tabs">
                {["All", "Open", "Closed", "Draft"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`job-postings__tab ${activeTab === tab ? "job-postings__tab--active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {labelByLocale(STATUS_LABELS[tab], locale) || tab}
                  </button>
                ))}
              </div>

              <div className="job-postings__toolbar-actions">
                <div className="job-postings__search-wrap">
                  <Search size={18} className="job-postings__search-icon" />
                  <input
                    type="search"
                    placeholder={translate("Cari judul, perusahaan, lokasi...", locale)}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="job-postings__search-input"
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="job-postings__alert">{errorMessage}</div>
            )}

            <div className="job-postings__table-wrap">
              <table className="job-postings__table">
                <thead className="job-postings__table-head">
                  <tr className="job-postings__table-head-row">
                    <th className="job-postings__table-head-cell job-postings__table-head-cell--first">
                      {translate("Posisi Lowongan", locale)}
                    </th>
                    <th className="job-postings__table-head-cell">
                      {translate("Perusahaan", locale)}
                    </th>
                    <th className="job-postings__table-head-cell">
                      {translate("Kategori", locale)}
                    </th>
                    <th className="job-postings__table-head-cell">
                      {translate("Tanggal Posting", locale)}
                    </th>
                    <th className="job-postings__table-head-cell">
                      {translate("Pelamar", locale)}
                    </th>
                    <th className="job-postings__table-head-cell">
                      {translate("Status", locale)}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr className="job-postings__table-row">
                      <td className="job-postings__empty-cell" colSpan={6}>
                        {translate("Memuat lowongan...", locale)}
                      </td>
                    </tr>
                  ) : paginatedRows.length > 0 ? (
                    paginatedRows.map((row) => (
                      <tr key={row.id} className="job-postings__table-row">
                        <td className="job-postings__table-cell job-postings__table-cell--first">
                          <div className="job-postings__job-main">
                            <div
                              className={`job-postings__job-tag ${row.tagBg} ${row.tagText}`}
                            >
                              {row.tag}
                            </div>
                            <div>
                              <div className="job-postings__job-title">
                                {row.title}
                              </div>
                              <div className="job-postings__job-id">
                                {row.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="job-postings__table-cell">
                          <div className="job-postings__department">
                            {row.company}
                          </div>
                          <div className="job-postings__team">
                            {row.location || "-"}
                          </div>
                        </td>
                        <td className="job-postings__table-cell">
                          <div className="job-postings__department">
                            {row.dept}
                          </div>
                          <div className="job-postings__team">{row.team}</div>
                        </td>
                        <td className="job-postings__table-cell job-postings__date">
                          {formatPostedDate(row, locale)}
                        </td>
                        <td className="job-postings__table-cell job-postings__date">
                          {row.applicantCount}
                        </td>
                        <td className="job-postings__table-cell">
                          <StatusBadge status={row.status} locale={locale} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="job-postings__table-row">
                      <td className="job-postings__empty-cell" colSpan={6}>
                        {translate("Tidak ada lowongan yang sesuai pencarian.", locale)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="job-postings__mobile-list">
              {isLoading ? (
                <div className="job-postings__mobile-card">
                  <div className="job-postings__job-title">
                    {translate("Memuat lowongan...", locale)}
                  </div>
                </div>
              ) : paginatedRows.length > 0 ? (
                paginatedRows.map((row) => (
                  <AdminMobileJobCard key={row.id} row={row} locale={locale} />
                ))
              ) : (
                <div className="job-postings__mobile-card">
                  <div className="job-postings__job-title">
                    {translate("Tidak ada lowongan", locale)}
                  </div>
                  <div className="job-postings__job-id">
                    {translate("Coba gunakan kata kunci lain.", locale)}
                  </div>
                </div>
              )}
            </div>

            <div className="job-postings__pagination">
              <div className="job-postings__pagination-text">
                {locale === "en"
                  ? `Showing ${paginationMeta.start} to ${paginationMeta.end} of ${filteredRows.length} results`
                  : `Menampilkan ${paginationMeta.start} sampai ${paginationMeta.end} dari ${filteredRows.length} hasil`}
              </div>

              {filteredRows.length > 0 && (
                <div className="job-postings__pagination-controls">
                  <button
                    type="button"
                    className="job-postings__page-btn job-postings__page-btn--left"
                    disabled={paginationMeta.currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {pageNumbers.map((pageNumber, index) =>
                    pageNumber === "ellipsis" ? (
                      <button
                        key={`ellipsis-${index}`}
                        type="button"
                        className="job-postings__page-btn"
                        disabled
                      >
                        ...
                      </button>
                    ) : (
                      <button
                        key={pageNumber}
                        type="button"
                        className={`job-postings__page-btn ${
                          pageNumber === paginationMeta.currentPage
                            ? "job-postings__page-btn--active"
                            : ""
                        }`}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="job-postings__page-btn job-postings__page-btn--right"
                    disabled={
                      paginationMeta.currentPage === paginationMeta.totalPages
                    }
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, paginationMeta.totalPages),
                      )
                    }
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
