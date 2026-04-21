import "../../../styles/admin/JobApplicants.css";
import Sidebar from "../../../components/admin/SidebarMitra";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";
import {
  getPageNumbers,
  getPaginationMeta,
  paginateItems,
} from "../../../utils/pagination";

const ITEMS_PER_PAGE = 5;

function StatusBadge({ status }) {
  const statusClassMap = {
    SCREENING:
      "job-applicants__status-badge job-applicants__status-badge--screening",
    INTERVIEWING:
      "job-applicants__status-badge job-applicants__status-badge--interviewing",
    REJECTED:
      "job-applicants__status-badge job-applicants__status-badge--rejected",
    HIRED: "job-applicants__status-badge job-applicants__status-badge--hired",
  };

  return (
    <span
      className={
        statusClassMap[status] ||
        "job-applicants__status-badge job-applicants__status-badge--default"
      }
    >
      {status}
    </span>
  );
}

function ApplicantRow({
  initials,
  initialsBg,
  initialsText,
  name,
  department,
  subDepartment,
  appliedDate,
  status,
}) {
  return (
    <tr className="job-applicants__table-row">
      <td className="job-applicants__cell job-applicants__cell--name">
        <div className="job-applicants__applicant">
          <div
            className={`job-applicants__avatar ${initialsBg} ${initialsText}`}
          >
            {initials}
          </div>

          <div>
            <div className="job-applicants__applicant-name">{name}</div>
          </div>
        </div>
      </td>

      <td className="job-applicants__cell">
        <div className="job-applicants__department">{department}</div>
        <div className="job-applicants__sub-department">{subDepartment}</div>
      </td>

      <td className="job-applicants__cell job-applicants__date">
        {appliedDate}
      </td>

      <td className="job-applicants__cell">
        <StatusBadge status={status} />
      </td>

      <td className="job-applicants__cell">
        <div className="job-applicants__actions">
          <button className="job-applicants__icon-btn">
            <Pencil size={18} />
          </button>
          <button className="job-applicants__icon-btn">
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ApplicantCard({
  initials,
  initialsBg,
  initialsText,
  name,
  department,
  subDepartment,
  appliedDate,
  status,
}) {
  return (
    <div className="job-applicants__card-item">
      <div className="job-applicants__card-top">
        <div className="job-applicants__applicant">
          <div
            className={`job-applicants__avatar ${initialsBg} ${initialsText}`}
          >
            {initials}
          </div>

          <div>
            <div className="job-applicants__applicant-name">{name}</div>
          </div>
        </div>

        <div className="job-applicants__actions">
          <button className="job-applicants__icon-btn">
            <Pencil size={18} />
          </button>
          <button className="job-applicants__icon-btn">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="job-applicants__card-grid">
        <div className="job-applicants__card-field">
          <div className="job-applicants__card-label">Department</div>
          <div className="job-applicants__department">{department}</div>
          <div className="job-applicants__sub-department">{subDepartment}</div>
        </div>

        <div className="job-applicants__card-field">
          <div className="job-applicants__card-label">Applied Date</div>
          <div className="job-applicants__date">{appliedDate}</div>
        </div>

        <div className="job-applicants__card-field">
          <div className="job-applicants__card-label">Status</div>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}

export default function JobApplicants() {
  const navigate = useNavigate();

  const applicants = React.useMemo(() => [], []);

  const [currentPage, setCurrentPage] = React.useState(1);

  const { pageItems: paginatedApplicants } = React.useMemo(
    () => paginateItems(applicants, currentPage, ITEMS_PER_PAGE),
    [applicants, currentPage],
  );

  const paginationMeta = React.useMemo(
    () => getPaginationMeta(applicants.length, currentPage, ITEMS_PER_PAGE),
    [applicants.length, currentPage],
  );

  const pageNumbers = React.useMemo(
    () => getPageNumbers(paginationMeta.currentPage, paginationMeta.totalPages),
    [paginationMeta.currentPage, paginationMeta.totalPages],
  );

  React.useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, paginationMeta.totalPages));
  }, [paginationMeta.totalPages]);

  return (
    <div className="job-applicants">
      <Sidebar />

      <main className="job-applicants__main">
        <section className="job-applicants__section">
          <div className="job-applicants__breadcrumb">
            <p className="dashboard-mitra__breadcrumb">
              <span>ADMIN &gt; </span>
              <span className="dashboard-mitra__breadcrumb-active">
                MANAJEMEN LOWONGAN
              </span>
            </p>
            <span className="job-applicants__breadcrumb-muted">›</span>
            <span className="job-applicants__breadcrumb-active">
              SENIOR UX DESIGNER APPLICANTS
            </span>
          </div>

          <div className="job-applicants__header">
            <button
              onClick={() => navigate("/admin/mitra/lowongan")}
              className="job-applicants__back-btn"
            >
              <ArrowLeft size={20} />
            </button>

            <h1 className="job-applicants__title">
              Senior UX Designer Applicants
            </h1>
          </div>

          <div className="job-applicants__table-card">
            <div className="job-applicants__toolbar">
              <div className="job-applicants__toolbar-grid">
                <div className="job-applicants__search-wrap">
                  <Search size={20} className="job-applicants__search-icon" />
                  <input
                    type="text"
                    placeholder="Search applicants by name, skill, or experience..."
                    className="job-applicants__search-input"
                  />
                </div>

                <div className="job-applicants__select-wrap">
                  <select className="job-applicants__select">
                    <option>Newest First</option>
                    <option>Oldest First</option>
                  </select>
                  <ChevronDown
                    size={18}
                    className="job-applicants__select-icon"
                  />
                </div>
              </div>
            </div>

            <div className="job-applicants__desktop-table-wrap">
              <table className="job-applicants__table">
                <thead className="job-applicants__table-head">
                  <tr className="job-applicants__table-head-row">
                    <th className="job-applicants__head-cell job-applicants__head-cell--name">
                      Pelamar
                    </th>
                    <th className="job-applicants__head-cell">Department</th>
                    <th className="job-applicants__head-cell">Applied Date</th>
                    <th className="job-applicants__head-cell">Status</th>
                    <th className="job-applicants__head-cell">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedApplicants.length > 0 ? (
                    paginatedApplicants.map((applicant, index) => (
                      <ApplicantRow key={index} {...applicant} />
                    ))
                  ) : (
                    <tr className="job-applicants__table-row">
                      <td className="job-applicants__cell" colSpan={5}>
                        <div
                          style={{
                            padding: "32px 16px",
                            textAlign: "center",
                            color: "#6b7280",
                          }}
                        >
                          Belum ada pelamar untuk lowongan ini.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="job-applicants__mobile-list">
              {paginatedApplicants.length > 0 ? (
                paginatedApplicants.map((applicant, index) => (
                  <ApplicantCard key={index} {...applicant} />
                ))
              ) : (
                <div className="job-applicants__card-item">
                  <div className="job-applicants__applicant-name">
                    Belum ada pelamar
                  </div>
                  <div className="job-applicants__applicant-id">
                    Pelamar akan tampil di sini setelah ada yang apply.
                  </div>
                </div>
              )}
            </div>

            <div className="job-applicants__pagination">
              <div className="job-applicants__pagination-text">
                Showing {paginationMeta.start} to {paginationMeta.end} of{" "}
                {applicants.length} results
              </div>

              {applicants.length > 0 && (
                <div className="job-applicants__pagination-controls job-applicants__pagination-controls--dynamic">
                  <button
                    className="job-applicants__page-btn job-applicants__page-btn--left"
                    type="button"
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
                        className="job-applicants__page-btn"
                        type="button"
                        disabled
                      >
                        ...
                      </button>
                    ) : (
                      <button
                        key={pageNumber}
                        className={`job-applicants__page-btn ${
                          pageNumber === paginationMeta.currentPage
                            ? "job-applicants__page-btn--active"
                            : ""
                        }`}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}
                  <button
                    className="job-applicants__page-btn job-applicants__page-btn--right"
                    type="button"
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
