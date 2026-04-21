import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/Sidebar";
import "../../../styles/UserManagement.css";
import {
  UserRound,
  ShieldCheck,
  UserSearch,
  Plus,
  Pencil,
  Trash2,
  CircleHelp,
} from "lucide-react";
import {
  getPageNumbers,
  getPaginationMeta,
  paginateItems,
} from "../../../utils/pagination";
import { getApiErrorMessage } from "../../../services/auth";
import {
  deleteManagedAdminUser,
  getManagedAdminUsers,
} from "../../../services/admin";

const ITEMS_PER_PAGE = 5;

function extractAdminCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.admins)) return payload.admins;
  return [];
}

function normalizeRole(role) {
  const normalized = String(role || "staff_admin").toLowerCase();
  if (normalized === "super_admin") return "Super Admin";
  if (normalized === "staff_admin") return "Staff Admin";
  return role || "Staff Admin";
}

function mapAdminRow(item, index) {
  const source = item?.user || item?.admin || item;
  const role = normalizeRole(source?.role || item?.role);
  const status =
    source?.status ||
    item?.status ||
    source?.is_active ||
    item?.is_active ||
    "Active";
  const isActive = String(status).toLowerCase() !== "inactive";

  return {
    raw: item,
    id: source?.user_id || item?.user_id || source?.id || item?.id || `admin-${index}`,
    name:
      source?.nama ||
      source?.name ||
      item?.nama_lengkap ||
      item?.full_name ||
      "Admin",
    email:
      source?.email ||
      item?.primary_email ||
      item?.mail ||
      "Email belum tersedia",
    phone: source?.notelp || source?.phone || item?.notelp || item?.phone || "-",
    role,
    roleClass: role.toLowerCase().includes("super") ? "super" : "staff",
    status: isActive ? "Active" : "Inactive",
    statusClass: isActive ? "active" : "inactive",
    avatarClass: ["avatar-one", "avatar-two", "avatar-three"][index % 3],
  };
}

function DeleteAdminModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <div className="um-modal-icon-wrap">
          <div className="um-modal-icon-ring">
            <CircleHelp size={28} />
          </div>
        </div>

        <h3 className="um-modal-title">Hapus Mitra Perusahaan?</h3>
        <p className="um-modal-text">
          Apakah Anda yakin ingin menghapus Mitra
          <br />
          dengan Perusahaan ini?
        </p>

        <div className="um-modal-actions">
          <button type="button" className="um-modal-cancel" onClick={onClose}>
            Tidak
          </button>
          <button type="button" className="um-modal-confirm" onClick={onConfirm}>
            Iya
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const navigate = useNavigate();

  const [admins, setAdmins] = React.useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedAdminId, setSelectedAdminId] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");

  const loadAdmins = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getManagedAdminUsers();
      setAdmins(extractAdminCollection(response.data).map(mapAdminRow));
    } catch (error) {
      setAdmins([]);
      setErrorMessage(getApiErrorMessage(error, "Gagal memuat data admin."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const stats = React.useMemo(() => [
    {
      title: "Total Admin",
      value: String(admins.length),
      icon: <UserRound size={22} strokeWidth={2.2} />,
      iconClass: "um-stat-icon blue",
    },
    {
      title: "Super Admin",
      value: String(admins.filter((admin) => admin.roleClass === "super").length),
      icon: <ShieldCheck size={22} strokeWidth={2.2} />,
      iconClass: "um-stat-icon purple",
    },
    {
      title: "Staff Admin",
      value: String(admins.filter((admin) => admin.roleClass === "staff").length),
      icon: <UserSearch size={22} strokeWidth={2.2} />,
      iconClass: "um-stat-icon green",
    },
  ], [admins]);

  const { totalPages, pageItems: paginatedAdmins } = React.useMemo(
    () => paginateItems(admins, currentPage, ITEMS_PER_PAGE),
    [admins, currentPage]
  );

  const paginationMeta = React.useMemo(
    () => getPaginationMeta(admins.length, currentPage, ITEMS_PER_PAGE),
    [admins.length, currentPage]
  );

  const pageNumbers = React.useMemo(
    () => getPageNumbers(paginationMeta.currentPage, paginationMeta.totalPages),
    [paginationMeta.currentPage, paginationMeta.totalPages]
  );

  React.useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const openDeleteModal = (id) => {
    setSelectedAdminId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedAdminId(null);
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdminId) return;

    try {
      await deleteManagedAdminUser(selectedAdminId);
      setAdmins((prev) => prev.filter((item) => item.id !== selectedAdminId));
      closeDeleteModal();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Admin gagal dihapus."));
      closeDeleteModal();
    }
  };

  return (
    <div className="um-layout">
      <Sidebar />

      <main className="um-main">

        <section className="um-content">
          <div className="breadcrumb">
            <span>ADMIN</span>
            <span>›</span>
            <span className="active">MANAJEMEN USER</span>
          </div>

          <h1 className="um-page-title">Manajemen Admin Website</h1>

          {errorMessage && <div className="um-alert error">{errorMessage}</div>}

          <div className="um-stats-grid">
            {stats.map((item, index) => (
              <div className="um-stat-card" key={index}>
                <div className={item.iconClass}>{item.icon}</div>

                <div className="um-stat-content">
                  <p>{item.title}</p>
                  <h3>{item.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="um-table-card">
            <div className="um-table-header">
              <h2>Daftar Admin Internal</h2>

              <button
                className="um-add-btn"
                type="button"
                onClick={() => navigate("/admin/user-management/add-admin")}
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Tambah Admin Website</span>
              </button>
            </div>

            <div className="um-table-wrap">
              <table className="um-table">
                <thead>
                  <tr>
                    <th className="col-name">NAMA &amp; EMAIL</th>
                    <th className="col-role">ROLE</th>
                    <th className="col-status">STATUS</th>
                    <th className="col-action">AKSI</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className="um-user-cell">
                          <div className={`um-avatar ${admin.avatarClass}`} />

                          <div className="um-user-text">
                            <h4>{admin.name}</h4>
                            <p>{admin.email}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`um-role-badge ${admin.roleClass}`}>
                          {admin.role}
                        </span>
                      </td>

                      <td>
                        <span className={`um-status ${admin.statusClass}`}>
                          <span className="um-status-dot" />
                          {admin.status}
                        </span>
                      </td>

                      <td>
                        <div className="um-actions">
                          <button
                            type="button"
                            className="um-icon-btn"
                            onClick={() =>
                              navigate(`/admin/user-management/edit-admin/${admin.id}`, {
                                state: admin,
                              })
                            }
                          >
                            <Pencil size={15} strokeWidth={2.2} />
                          </button>

                          <button
                            type="button"
                            className="um-icon-btn"
                            onClick={() => openDeleteModal(admin.id)}
                          >
                            <Trash2 size={15} strokeWidth={2.2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {isLoading && (
                    <tr>
                      <td colSpan="4" className="um-empty-state">
                        Memuat data admin...
                      </td>
                    </tr>
                  )}

                  {!isLoading && admins.length === 0 && (
                    <tr>
                      <td colSpan="4" className="um-empty-state">
                        Tidak ada data admin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="um-table-footer">
              <p>
                Menampilkan {paginationMeta.start} sampai {paginationMeta.end} dari {admins.length} hasil
              </p>

              {admins.length > 0 && (
              <div className="um-pagination">
                <button
                  className="um-page-btn muted"
                  type="button"
                  disabled={paginationMeta.currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
                {pageNumbers.map((pageNumber, index) =>
                  pageNumber === "ellipsis" ? (
                    <button key={`ellipsis-${index}`} className="um-page-btn muted" type="button" disabled>
                      ...
                    </button>
                  ) : (
                    <button
                      key={pageNumber}
                      className={`um-page-btn ${pageNumber === paginationMeta.currentPage ? "active" : "muted"}`}
                      type="button"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  )
                )}
                <button
                  className="um-page-btn active"
                  type="button"
                  disabled={paginationMeta.currentPage === paginationMeta.totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, paginationMeta.totalPages))
                  }
                >
                  Next
                </button>
              </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <DeleteAdminModal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteAdmin}
      />
    </div>
  );
}

