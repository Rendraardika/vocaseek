import React from "react";
import Sidebar from "../../../components/admin/SidebarMitra";
import "../../../styles/admin/TalentManagementMitra.css";
import {
  getPageNumbers,
  getPaginationMeta,
  paginateItems,
} from "../../../utils/pagination";
import { getApiErrorMessage } from "../../../services/auth";
import {
  getCompanyCandidates,
  getCompanyCandidateDetail,
  getSelectedCompanyCandidates,
  updateCompanyCandidateStatus,
} from "../../../services/companyTalent";
import { normalizeCompanyCandidateStatus } from "../../../utils/applicationStatus";
import { pickFirstMediaValue } from "../../../utils/media";
import { mapTalentDetailPayload } from "../../../utils/talentProfile";
import { translatePhrase } from "../../../i18n/phrases";
import { getSavedLanguage } from "../../../utils/languagePreference";

import { useNavigate } from "react-router-dom";
import {
  Star,
  CalendarDays,
  CircleCheck,
  Eye,
  Trash2,
  ChevronDown,
  X,
  SquarePen,
  Search,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "PENDING", label: "Pending" },
  { value: "HIRED", label: "Diterima" },
  { value: "REJECTED", label: "Ditolak" },
];

const ITEMS_PER_PAGE = 5;

function extractCandidateCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.candidates)) return payload.candidates;
  if (Array.isArray(payload?.talents)) return payload.talents;
  return [];
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCandidateAppliedDate(item = {}) {
  return (
    item?.date_applied ||
    item?.dateApplied ||
    item?.date ||
    item?.tanggal_daftar_label ||
    item?.registered_at_label ||
    item?.joined_at_label ||
    item?.created_at ||
    item?.createdAt ||
    item?.apply_date ||
    item?.applied_at ||
    item?.tanggal_daftar ||
    item?.registered_at ||
    item?.joined_at ||
    item?.user?.created_at ||
    item?.user?.createdAt ||
    item?.user?.registered_at ||
    item?.user?.joined_at ||
    ""
  );
}

function normalizeCandidateStatus(value) {
  return normalizeCompanyCandidateStatus(value);
}

function resolveCandidatePhoto(source = {}) {
  const normalizedTalent = mapTalentDetailPayload(source);
  if (normalizedTalent?.photo) {
    return normalizedTalent.photo;
  }

  const user = source?.user || source?.intern || source?.candidate || {};
  const profile =
    user?.intern_profile ||
    user?.internProfile ||
    source?.intern_profile ||
    source?.internProfile ||
    source?.profile ||
    source?.personal ||
    {};

  return pickFirstMediaValue(
    source?.foto,
    source?.photo,
    source?.avatar,
    source?.image,
    source?.photo_url,
    source?.avatar_url,
    source?.personal?.photo,
    source?.personal?.foto,
    source?.profile?.foto,
    source?.profile?.photo,
    source?.profile?.avatar,
    profile?.foto,
    profile?.photo,
    profile?.avatar,
    user?.foto,
    user?.photo,
    user?.avatar
  );
}

function mapCandidate(item, index) {
  const user = item?.user || item?.intern || item?.candidate || {};
  const profile =
    user?.intern_profile || user?.internProfile || item?.intern_profile || {};
  const name = user?.nama || item?.nama || item?.name || "Kandidat";
  const status = normalizeCandidateStatus(item?.status || item?.candidate_status);
  const backendId =
    item?.application_id ||
    item?.lamaran_id ||
    item?.job_application_id ||
    item?.application?.application_id ||
    item?.id ||
    item?.candidate_id ||
    item?.talent_id ||
    item?.user_id ||
    user?.user_id ||
    index + 1;

  return {
    raw: item,
    backendId: String(backendId),
    recordId: String(backendId),
    name,
    email: user?.email || item?.email || "Email belum tersedia",
    role:
      item?.posisi ||
      item?.position ||
      item?.lowongan?.judul_posisi ||
      item?.job?.judul_posisi ||
      "Kandidat",
    level: item?.level || profile?.jenjang || "Junior",
    workType: item?.work_type || item?.tipe_pekerjaan || "Internship",
    applyDate: formatDate(getCandidateAppliedDate(item)),
    status,
    image: resolveCandidatePhoto(item),
    link: `/admin/mitra/talent/${backendId}`,
    searchText: [
      name,
      user?.email,
      item?.email,
      item?.posisi,
      item?.position,
      item?.lowongan?.judul_posisi,
      item?.lowongan?.judul_pekerjaan,
      item?.job?.judul_posisi,
      item?.job?.judul_pekerjaan,
      item?.lowongan?.companyProfile?.nama_perusahaan,
      item?.lowongan?.company_profile?.nama_perusahaan,
      item?.company_name,
      item?.nama_perusahaan,
      item?.level,
      profile?.jenjang,
      item?.work_type,
      item?.tipe_pekerjaan,
      status,
      getStatusLabel(status),
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function getStatusLabel(status) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label || status;
}

function StatCard({ title, value, subtitle, icon, iconWrapClass = "", extra = null }) {
  return (
    <div className="tm-stat-card">
      <div className="tm-stat-card__inner">
        <div>
          <div className="tm-stat-card__title">{title}</div>

          <div className="tm-stat-card__value-row">
            <div className="tm-stat-card__value">{value}</div>
            {extra}
          </div>

          <div className="tm-stat-card__subtitle">{subtitle}</div>
        </div>

        <div className={`tm-stat-card__icon ${iconWrapClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`tm-badge ${className}`}>{children}</span>;
}

function CandidateRow({
  name,
  email,
  role,
  level,
  workType,
  applyDate,
  status,
  image,
  onClick,
  onEditStatus,
  onViewDetail,
}) {
  const statusMap = {
    PENDING: "tm-badge--pending",
    REJECTED: "tm-badge--rejected",
    HIRED: "tm-badge--hired",
  };

  const levelMap = {
    Senior: "tm-text-green",
    "Mid-Level": "tm-text-orange",
    Junior: "tm-text-orange",
  };

  const workTypeMap = {
    Internship: "tm-badge--internship",
    "Full Time": "tm-badge--fulltime",
    Magang: "tm-badge--internship",
  };

  return (
    <tr
      className={`tm-table__row ${onClick ? "tm-table__row--clickable" : ""}`}
      onClick={onClick}
    >
      <td className="tm-table__cell">
        <div className="tm-candidate">
          <div className="tm-candidate__avatar-wrap">
            {image ? (
              <img src={image} alt={name} className="tm-candidate__avatar" />
            ) : (
              <div className="tm-candidate__avatar tm-candidate__avatar--fallback" />
            )}
          </div>

          <div>
            <div className="tm-candidate__name">{name}</div>
            <div className="tm-candidate__email">{email}</div>
          </div>
        </div>
      </td>

      <td className="tm-table__cell">
        <div className="tm-role">{role}</div>
        <div className={`tm-role__level ${levelMap[level] || "tm-text-orange"}`}>
          {level}
        </div>
      </td>

      <td className="tm-table__cell">
        <Badge className={workTypeMap[workType] || "tm-badge--internship"}>
          {workType}
        </Badge>
      </td>

      <td className="tm-table__cell tm-table__cell--muted tm-whitespace-pre">
        {applyDate}
      </td>

      <td className="tm-table__cell">
        <Badge className={statusMap[status]}>{getStatusLabel(status)}</Badge>
      </td>

      <td className="tm-table__cell">
        <div className="tm-actions">
          <button
            type="button"
            className="tm-actions__text-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEditStatus?.();
            }}
          >
            Change
            <br />
            Status
          </button>

          <button
            type="button"
            className="tm-actions__icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail?.();
            }}
          >
            <Eye size={15} />
          </button>

          <button
            type="button"
            className="tm-actions__icon-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function CandidateCard({ candidate, onClick, onEditStatus, onViewDetail }) {
  const statusMap = {
    PENDING: "tm-badge--pending",
    REJECTED: "tm-badge--rejected",
    HIRED: "tm-badge--hired",
  };

  const workTypeMap = {
    Internship: "tm-badge--internship",
    "Full Time": "tm-badge--fulltime",
    Magang: "tm-badge--internship",
  };

  return (
    <div className="tm-mobile-card" onClick={onClick}>
      <div className="tm-mobile-card__top">
        <div className="tm-candidate">
          {candidate.image ? (
            <img
              src={candidate.image}
              alt={candidate.name}
              className="tm-candidate__avatar"
            />
          ) : (
            <div className="tm-candidate__avatar tm-candidate__avatar--fallback" />
          )}
          <div>
            <div className="tm-candidate__name">{candidate.name}</div>
            <div className="tm-candidate__email">{candidate.email}</div>
          </div>
        </div>
      </div>

      <div className="tm-mobile-card__grid">
        <div>
          <span className="tm-mobile-card__label">Posisi</span>
          <div className="tm-mobile-card__value tm-whitespace-pre">{candidate.role}</div>
        </div>
        <div>
          <span className="tm-mobile-card__label">Tanggal Daftar</span>
          <div className="tm-mobile-card__value tm-whitespace-pre">
            {candidate.applyDate}
          </div>
        </div>
        <div>
          <span className="tm-mobile-card__label">Tipe</span>
          <div className="tm-mobile-card__value">
            <Badge className={workTypeMap[candidate.workType] || "tm-badge--internship"}>
              {candidate.workType}
            </Badge>
          </div>
        </div>
      </div>

      <div className="tm-mobile-card__footer">
        <Badge className={statusMap[candidate.status]}>
          {getStatusLabel(candidate.status)}
        </Badge>
        <button
          type="button"
          className="tm-mobile-card__status-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEditStatus?.();
            onViewDetail?.();
          }}
        >
          Change Status
        </button>
      </div>
    </div>
  );
}

function ChangeStatusModal({
  open,
  candidate,
  selectedStatus,
  setSelectedStatus,
  onClose,
  onSave,
}) {
  if (!open || !candidate) return null;

  return (
    <div className="tm-modal-overlay">
      <div className="tm-modal">
        <div className="tm-modal__header">
          <div className="tm-modal__title-wrap">
            <SquarePen size={20} className="tm-text-gold" />
            <h2 className="tm-modal__title">Ubah Status Kandidat</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup popup"
            className="tm-modal__close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="tm-modal__body">
          <div className="tm-modal__candidate-card">
            {candidate.image ? (
              <img
                src={candidate.image}
                alt={candidate.name}
                className="tm-modal__candidate-avatar"
              />
            ) : (
              <div className="tm-modal__candidate-avatar tm-candidate__avatar--fallback" />
            )}

            <div>
              <div className="tm-modal__candidate-name">{candidate.name}</div>
              <div className="tm-modal__candidate-role">
                {candidate.role} • {candidate.level}
              </div>
            </div>
          </div>

          <div className="tm-modal__field">
            <label className="tm-modal__label">Pilih Status Baru</label>

            <div className="tm-select-wrap">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="tm-select"
              >
                {STATUS_OPTIONS.filter((item) => item.value !== "ALL").map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <ChevronDown size={18} className="tm-select__icon" />
            </div>
          </div>
        </div>

        <div className="tm-modal__footer">
          <button type="button" onClick={onClose} className="tm-btn tm-btn--ghost">
            Batal
          </button>

          <button type="button" onClick={onSave} className="tm-btn tm-btn--gold">
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TalentManagement({ mode = "all" }) {
  const navigate = useNavigate();
  const [locale, setLocale] = React.useState(getSavedLanguage());

  const [candidateList, setCandidateList] = React.useState([]);
  const [stats, setStats] = React.useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
    accepted_this_month: 0,
  });
  const [currentPage, setCurrentPage] = React.useState(1);

  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [activeCandidate, setActiveCandidate] = React.useState(null);
  const [selectedStatus, setSelectedStatus] = React.useState("PENDING");
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const isShortlistedPage = mode === "shortlisted";

  React.useEffect(() => {
    const syncLanguage = () => {
      setLocale(getSavedLanguage());
    };

    window.addEventListener("language-changed", syncLanguage);
    return () => {
      window.removeEventListener("language-changed", syncLanguage);
    };
  }, []);

  React.useEffect(() => {
    const loadCandidates = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = isShortlistedPage
          ? await getSelectedCompanyCandidates()
          : await getCompanyCandidates();

        const payload = response?.data?.data || response?.data || {};
        let nextCandidates = extractCandidateCollection(payload).map(mapCandidate);

        const candidatesMissingPhoto = nextCandidates.filter(
          (candidate) => !candidate.image && candidate.backendId
        );

        if (candidatesMissingPhoto.length > 0) {
          const detailPhotos = await Promise.all(
            candidatesMissingPhoto.map(async (candidate) => {
              try {
                const detailResponse = await getCompanyCandidateDetail(candidate.backendId);
                const detailPayload = detailResponse?.data?.data || detailResponse?.data || {};
                return [candidate.backendId, resolveCandidatePhoto(detailPayload)];
              } catch {
                return [candidate.backendId, ""];
              }
            })
          );

          const photoMap = new Map(detailPhotos);
          nextCandidates = nextCandidates.map((candidate) => ({
            ...candidate,
            image: candidate.image || photoMap.get(candidate.backendId) || "",
          }));
        }

        if (!isShortlistedPage) {
          setStats({
            pending: Number(payload?.stats?.pending || 0),
            accepted: Number(payload?.stats?.accepted || 0),
            rejected: Number(payload?.stats?.rejected || 0),
            accepted_this_month: Number(payload?.stats?.accepted_this_month || 0),
          });
        }

        if (isShortlistedPage) {
          nextCandidates = nextCandidates.filter((item) => item.status === "HIRED");
        }

        setCandidateList(nextCandidates);
      } catch (error) {
        setCandidateList([]);
        if (!isShortlistedPage) {
          setStats({
            pending: 0,
            accepted: 0,
            rejected: 0,
            accepted_this_month: 0,
          });
        }
        setErrorMessage(getApiErrorMessage(error, "Gagal memuat data kandidat."));
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidates();
  }, [isShortlistedPage]);

  const openStatusModal = (candidate) => {
    setActiveCandidate(candidate);
    setSelectedStatus(candidate.status || "PENDING");
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setActiveCandidate(null);
  };

  const handleSaveStatus = async () => {
    if (!activeCandidate) return;

    try {
      await updateCompanyCandidateStatus(activeCandidate.backendId, {
        status: selectedStatus,
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Status kandidat gagal diperbarui."));
      closeStatusModal();
      return;
    }

    setCandidateList((prev) => {
      const normalizedStatus = normalizeCandidateStatus(selectedStatus);
      const updated = prev.map((item) =>
        item.recordId === activeCandidate.recordId
          ? { ...item, status: normalizedStatus }
          : item
      );

      if (isShortlistedPage && normalizedStatus !== "HIRED") {
        return updated.filter((item) => item.recordId !== activeCandidate.recordId);
      }

      return updated;
    });

    if (!isShortlistedPage) {
      setStats((prev) => {
        const previousStatus = normalizeCandidateStatus(activeCandidate.status);
        const nextStatus = normalizeCandidateStatus(selectedStatus);

        if (previousStatus === nextStatus) {
          return prev;
        }

        const nextStats = { ...prev };

        if (previousStatus === "PENDING") nextStats.pending = Math.max(0, nextStats.pending - 1);
        if (previousStatus === "HIRED") nextStats.accepted = Math.max(0, nextStats.accepted - 1);
        if (previousStatus === "REJECTED") nextStats.rejected = Math.max(0, nextStats.rejected - 1);

        if (nextStatus === "PENDING") nextStats.pending += 1;
        if (nextStatus === "HIRED") {
          nextStats.accepted += 1;
          nextStats.accepted_this_month += 1;
        }
        if (nextStatus === "REJECTED") nextStats.rejected += 1;

        return nextStats;
      });
    }

    closeStatusModal();
  };

  const handleViewDetail = (candidate) => {
    if (candidate.link) {
      navigate(candidate.link);
    }
  };

  const filteredCandidates = React.useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return candidateList;
    }

    return candidateList.filter((candidate) =>
      String(candidate.searchText || "").toLowerCase().includes(keyword),
    );
  }, [candidateList, searchQuery]);

  const { totalPages, pageItems: paginatedCandidates } = React.useMemo(
    () => paginateItems(filteredCandidates, currentPage, ITEMS_PER_PAGE),
    [filteredCandidates, currentPage]
  );

  const paginationMeta = React.useMemo(
    () => getPaginationMeta(filteredCandidates.length, currentPage, ITEMS_PER_PAGE),
    [filteredCandidates.length, currentPage]
  );

  const pageNumbers = React.useMemo(
    () => getPageNumbers(paginationMeta.currentPage, paginationMeta.totalPages),
    [paginationMeta.currentPage, paginationMeta.totalPages]
  );

  React.useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages || 1));
  }, [totalPages]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [isShortlistedPage, searchQuery]);

  const pageTitle = isShortlistedPage ? "Kandidat Terpilih" : "Semua Kandidat";
  const pageBreadcrumb = isShortlistedPage ? "KANDIDAT TERPILIH" : "SEMUA KANDIDAT";
  const bottomSummary =
    locale === "en"
      ? `Showing ${paginationMeta.start} to ${paginationMeta.end} of ${filteredCandidates.length} results`
      : `Menampilkan ${paginationMeta.start} sampai ${paginationMeta.end} dari ${filteredCandidates.length} hasil`;

  return (
    <div className="tm-layout">
      <Sidebar />

      <main className="tm-main">
        <section className="tm-page">
          <div className="tm-breadcrumbs">
            <span>ADMIN &gt; </span>
            <span>
              {translatePhrase("MANAJEMEN TALENT", locale) || "MANAJEMEN TALENT"}
            </span>
            <span>›</span>
            <span className="tm-breadcrumbs__active">
              {translatePhrase(pageBreadcrumb, locale) || pageBreadcrumb}
            </span>
          </div>

          <div className="tm-header">
            <h1 className="tm-page__title">
              {translatePhrase(pageTitle, locale) || pageTitle}
            </h1>
          </div>

          {errorMessage && <div className="tm-alert tm-alert--error">{errorMessage}</div>}

          <div className="tm-search-panel">
            <div>
              <h2 className="tm-search-title">
                {translatePhrase("Cari Kandidat", locale) || "Cari Kandidat"}
              </h2>
              <p className="tm-search-subtitle">
                {bottomSummary}
              </p>
            </div>

            <div className="tm-search-box">
              <Search size={18} className="tm-search-icon" />
              <input
                type="search"
                placeholder="Cari nama, email, posisi, status..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>

 
          <div className="tm-stats-grid">
            <StatCard
              title={translatePhrase("Total Diterima", locale) || "Total Diterima"}
              value={String(stats.accepted)}
              subtitle={
                stats.accepted > 0
                  ? `${stats.accepted} ${
                      translatePhrase("kandidat sudah diterima", locale) ||
                      "kandidat sudah diterima"
                    }`
                  : translatePhrase("Belum ada kandidat diterima", locale) ||
                    "Belum ada kandidat diterima"
              }
              extra={<span className="tm-growth">{stats.accepted_this_month}</span>}
              icon={<Star size={18} className="tm-text-blue" />}
              iconWrapClass="tm-bg-light-blue"
            />

            <StatCard
              title={translatePhrase("Status Pending", locale) || "Status Pending"}
              value={String(stats.pending)}
              subtitle={
                stats.pending > 0
                  ? `${stats.pending} ${
                      translatePhrase("kandidat sedang menunggu keputusan", locale) ||
                      "kandidat sedang menunggu keputusan"
                    }`
                  : translatePhrase("Belum ada kandidat pending", locale) ||
                    "Belum ada kandidat pending"
              }
              extra={
                <Badge className="tm-badge--upcoming">
                  {stats.pending > 0
                    ? translatePhrase("Aktif", locale) || "Aktif"
                    : translatePhrase("Kosong", locale) || "Kosong"}
                </Badge>
              }
              icon={<CalendarDays size={18} className="tm-text-purple" />}
              iconWrapClass="tm-bg-light-purple"
            />

            <StatCard
              title={translatePhrase("Diterima Bulan Ini", locale) || "Diterima Bulan Ini"}
              value={String(stats.accepted_this_month)}
              subtitle={
                stats.accepted_this_month > 0
                  ? translatePhrase("Kandidat baru diterima bulan ini", locale) ||
                    "Kandidat baru diterima bulan ini"
                  : translatePhrase("Belum ada kandidat diterima", locale) ||
                    "Belum ada kandidat diterima"
              }
              extra={
                <span className="tm-extra-text">
                  {translatePhrase("kandidat", locale) || "kandidat"}
                </span>
              }
              icon={<CircleCheck size={18} className="tm-text-green" />}
              iconWrapClass="tm-bg-light-green"
            />
          </div>

          <div className="tm-content-grid">
            <div className="tm-table-card">
              <div className="tm-table-wrap">
                <table className="tm-table">
                  <thead className="tm-table__head">
                    <tr className="tm-table__head-row">
                      <th className="tm-table__heading">
                        {translatePhrase("Kandidat", locale) || "Kandidat"}
                      </th>
                      <th className="tm-table__heading">
                        {translatePhrase("Posisi", locale) || "Posisi"}
                      </th>
                      <th className="tm-table__heading">
                        {translatePhrase("Tipe Pekerjaan", locale) || "Tipe Pekerjaan"}
                      </th>
                      <th className="tm-table__heading">
                        {translatePhrase("Tanggal Daftar", locale) || "Tanggal Daftar"}
                      </th>
                      <th className="tm-table__heading">
                        {translatePhrase("Status", locale) || "Status"}
                      </th>
                      <th className="tm-table__heading">
                        {translatePhrase("Aksi", locale) || "Aksi"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr className="tm-table__row">
                        <td className="tm-table__cell" colSpan={6}>
                          <div
                            style={{
                              padding: "32px 16px",
                              textAlign: "center",
                              color: "#6b7280",
                            }}
                          >
                            Memuat data kandidat...
                          </div>
                        </td>
                      </tr>
                    ) : paginatedCandidates.length > 0 ? (
                      paginatedCandidates.map((item) => (
                        <CandidateRow
                          key={item.recordId}
                          {...item}
                          onClick={item.link ? () => navigate(item.link) : undefined}
                          onEditStatus={() => openStatusModal(item)}
                          onViewDetail={() => handleViewDetail(item)}
                        />
                      ))
                    ) : (
                      <tr className="tm-table__row">
                        <td className="tm-table__cell" colSpan={6}>
                          <div
                            style={{
                              padding: "32px 16px",
                              textAlign: "center",
                              color: "#6b7280",
                            }}
                          >
                            Tidak ada kandidat yang sesuai pencarian.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="tm-mobile-list">
                {isLoading ? (
                  <div className="tm-mobile-card">
                    <div className="tm-candidate__name">Memuat kandidat...</div>
                    <div className="tm-candidate__email">
                      Sebentar ya, data sedang diambil dari backend.
                    </div>
                  </div>
                ) : paginatedCandidates.length > 0 ? (
                  paginatedCandidates.map((item) => (
                    <CandidateCard
                      key={item.recordId}
                      candidate={item}
                      onClick={item.link ? () => navigate(item.link) : undefined}
                      onEditStatus={() => openStatusModal(item)}
                      onViewDetail={() => handleViewDetail(item)}
                    />
                  ))
                ) : (
                  <div className="tm-mobile-card">
                    <div className="tm-candidate__name">Tidak ada kandidat</div>
                    <div className="tm-candidate__email">
                      Coba gunakan kata kunci lain.
                    </div>
                  </div>
                )}
              </div>

              <div className="tm-table-footer">
                <div className="tm-table-footer__text">{bottomSummary}</div>

                {filteredCandidates.length > 0 && (
                  <div className="tm-pagination">
                    <button
                      type="button"
                      className="tm-pagination__btn tm-pagination__btn--edge"
                      disabled={paginationMeta.currentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                      ‹
                    </button>
                    {pageNumbers.map((pageNumber, index) =>
                      pageNumber === "ellipsis" ? (
                        <button
                          key={`bottom-ellipsis-${index}`}
                          type="button"
                          className="tm-pagination__btn"
                          disabled
                        >
                          ...
                        </button>
                      ) : (
                        <button
                          key={`bottom-page-${pageNumber}`}
                          type="button"
                          className={`tm-pagination__btn ${
                            pageNumber === paginationMeta.currentPage
                              ? "tm-pagination__btn--active"
                              : ""
                          }`}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      className="tm-pagination__btn tm-pagination__btn--edge"
                      disabled={paginationMeta.currentPage === paginationMeta.totalPages}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, paginationMeta.totalPages)
                        )
                      }
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <ChangeStatusModal
        open={isStatusModalOpen}
        candidate={activeCandidate}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        onClose={closeStatusModal}
        onSave={handleSaveStatus}
      />
    </div>
  );
}
