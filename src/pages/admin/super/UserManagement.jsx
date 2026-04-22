import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/admin/Sidebar";
import "../../../styles/UserManagement.css";
import {
  Ban,
  MailPlus,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserRound,
  UserSearch,
} from "lucide-react";
import {
  getPageNumbers,
  getPaginationMeta,
  paginateItems,
} from "../../../utils/pagination";
import { getApiErrorMessage } from "../../../services/auth";
import {
  cancelAdminInvitation,
  deleteManagedAdminUser,
  getManagedAdminUsers,
  resendAdminInvitation,
} from "../../../services/admin";

const ITEMS_PER_PAGE = 5;

const STATUS_CLASS_MAP = {
  active: "active",
  pending: "pending",
  expired: "expired",
  cancelled: "cancelled",
  disabled: "inactive",
};

function extractAdminCollection(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeRoleLabel(role) {
  const normalized = String(role || "staff_admin").toLowerCase();
  if (normalized === "super_admin") return "Super Admin";
  if (normalized === "staff_admin") return "Admin Staff";
  return role || "Admin Staff";
}

function mapAdminRow(item, index) {
  const status = String(item?.status || "pending").toLowerCase();

  return {
    raw: item,
    id: item?.user_id || item?.id || `admin-${index}`,
    invitationId: item?.invitation?.id || null,
    name: item?.nama || item?.name || "Admin",
    email: item?.email || "Email belum tersedia",
    phone: item?.notelp || "-",
    role: item?.role || "staff_admin",
    roleLabel: item?.role_label || normalizeRoleLabel(item?.role),
    roleClass: String(item?.role || "").toLowerCase().includes("super")
      ? "super"
      : "staff",
    status,
    statusLabel: item?.status_label || "Pending",
    statusClass: STATUS_CLASS_MAP[status] || "pending",
    invitedBy: item?.invited_by || "-",
    invitationExpiresAt: item?.invitation?.expires_at || "",
    actions: item?.actions || {},
    avatarClass: ["avatar-one", "avatar-two", "avatar-three"][index % 3],
  };
}

function ActionConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(event) => event.stopPropagation()}>
        <div className="um-modal-icon-wrap">
          <div className="um-modal-icon-ring">
            <ShieldCheck size={28} />
          </div>
        </div>

        <h3 className="um-modal-title">{title}</h3>
        <p className="um-modal-text">{description}</p>

        <div className="um-modal-actions">
          <button type="button" className="um-modal-cancel" onClick={onClose}>
            Batal
          </button>
          <button type="button" className="um-modal-confirm" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();

  const [admins, setAdmins] = React.useState([]);
  const [stats, setStats] = React.useState({
    total_admin: 0,
    super_admin: 0,
    staff_admin: 0,
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState(
    location.state?.successMessage || "",
  );
  const [modalState, setModalState] = React.useState({
    type: "",
    adminId: null,
    invitationId: null,
  });

  const loadAdmins = React.useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await getManagedAdminUsers();
      const payload = response?.data || {};

      setStats(payload?.stats || {
        total_admin: 0,
        super_admin: 0,
        staff_admin: 0,
      });
      setAdmins(extractAdminCollection(payload).map(mapAdminRow));
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

  React.useEffect(() => {
    if (!successMessage) return undefined;

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const statCards = React.useMemo(() => [
    {
      title: "Total Admin",
      value: String(stats.total_admin || 0),
      icon: <UserRound size={22} strokeWidth={2.2} />,
      iconClass: "um-stat-icon blue",
    },
    {
      title: "Super Admin",
      value: String(stats.super_admin || 0),
      icon: <ShieldCheck size={22} strokeWidth={2.2} />,
      iconClass: "um-stat-icon purple",
    },
    {
      title: "Admin Staff",
      value: String(stats.staff_admin || 0),
      icon: <UserSearch size={22} strokeWidth={2.2} />,
      iconClass: "um-stat-icon green",
    },
  ], [stats]);

  const { totalPages, pageItems: paginatedAdmins } = React.useMemo(
    () => paginateItems(admins, currentPage, ITEMS_PER_PAGE),
    [admins, currentPage],
  );

  const paginationMeta = React.useMemo(
    () => getPaginationMeta(admins.length, currentPage, ITEMS_PER_PAGE),
    [admins.length, currentPage],
  );

  const pageNumbers = React.useMemo(
    () => getPageNumbers(paginationMeta.currentPage, paginationMeta.totalPages),
    [paginationMeta.currentPage, paginationMeta.totalPages],
  );

  React.useEffect(() => {
    setCurrentPage((prev) => Math.max(1, Math.min(prev, totalPages || 1)));
  }, [totalPages]);

  const closeModal = () => {
    setModalState({ type: "", adminId: null, invitationId: null });
  };

  const handleDeleteAdmin = async () => {
    try {
      await deleteManagedAdminUser(modalState.adminId);
      setSuccessMessage("Admin berhasil dihapus dari sistem.");
      closeModal();
      loadAdmins();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Admin gagal dihapus."));
      closeModal();
    }
  };

  const handleResendInvitation = async (invitationId) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await resendAdminInvitation({ invitation_id: invitationId });
      setSuccessMessage(
        response?.data?.message || "Undangan berhasil dikirim ulang ke email admin.",
      );
      await loadAdmins();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Undangan gagal dikirim ulang."));
    }
  };

  const handleCancelInvitation = async () => {
    try {
      await cancelAdminInvitation({ invitation_id: modalState.invitationId });
      setSuccessMessage("Undangan berhasil dibatalkan.");
      closeModal();
      loadAdmins();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Undangan gagal dibatalkan."));
      closeModal();
    }
  };

  return (
    <div className="um-layout">
      <Sidebar />

      <main className="um-main">
        <section className="um-content">
          <div className="breadcrumb">
            <span>ADMIN</span>
            <span>&gt;</span>
            <span className="active">MANAJEMEN USER</span>
          </div>

          <h1 className="um-page-title">Manajemen Admin Website</h1>
          <p className="um-page-subtitle">
            Kelola admin internal, pantau status invitation, dan tindak lanjuti aktivasi akun admin staff.
          </p>

          {errorMessage ? <div className="um-alert error">{errorMessage}</div> : null}
          {successMessage ? <div className="um-alert success">{successMessage}</div> : null}

          <div className="um-stats-grid">
            {statCards.map((item) => (
              <div className="um-stat-card" key={item.title}>
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
              <div>
                <h2>Daftar Admin Internal</h2>
                <p className="um-table-subtitle">
                  Status invitation akan diperbarui otomatis sesuai aktivitas aktivasi akun.
                </p>
              </div>

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
                            <span className="um-user-meta">
                              Diundang oleh: {admin.invitedBy || "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`um-role-badge ${admin.roleClass}`}>
                          {admin.roleLabel}
                        </span>
                      </td>

                      <td>
                        <span className={`um-status ${admin.statusClass}`}>
                          <span className="um-status-dot" />
                          {admin.statusLabel}
                        </span>
                        {admin.invitationExpiresAt && admin.status !== "active" ? (
                          <div className="um-status-meta">
                            Berlaku sampai {new Date(admin.invitationExpiresAt).toLocaleString("id-ID")}
                          </div>
                        ) : null}
                      </td>

                      <td>
                        <div className="um-actions">
                          {admin.actions.can_resend ? (
                            <button
                              type="button"
                              className="um-action-chip"
                              onClick={() => handleResendInvitation(admin.invitationId)}
                            >
                              <RotateCcw size={14} />
                              Kirim Ulang
                            </button>
                          ) : null}

                          {admin.actions.can_cancel ? (
                            <button
                              type="button"
                              className="um-action-chip danger"
                              onClick={() =>
                                setModalState({
                                  type: "cancel",
                                  adminId: admin.id,
                                  invitationId: admin.invitationId,
                                })
                              }
                            >
                              <Ban size={14} />
                              Batalkan
                            </button>
                          ) : null}

                          {admin.actions.can_edit ? (
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
                          ) : null}

                          {admin.actions.can_delete ? (
                            <button
                              type="button"
                              className="um-icon-btn"
                              onClick={() =>
                                setModalState({
                                  type: "delete",
                                  adminId: admin.id,
                                  invitationId: admin.invitationId,
                                })
                              }
                            >
                              <Trash2 size={15} strokeWidth={2.2} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="um-empty-state">
                        Memuat data admin...
                      </td>
                    </tr>
                  ) : null}

                  {!isLoading && admins.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="um-empty-state">
                        Belum ada data admin internal.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="um-table-footer">
              <p>
                Menampilkan {paginationMeta.start} sampai {paginationMeta.end} dari {admins.length} hasil
              </p>

              {admins.length > 0 ? (
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
                    ),
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
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <ActionConfirmModal
        open={modalState.type === "delete"}
        title="Hapus Admin?"
        description="Data admin akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Admin"
        onClose={closeModal}
        onConfirm={handleDeleteAdmin}
      />

      <ActionConfirmModal
        open={modalState.type === "cancel"}
        title="Batalkan Undangan?"
        description="Tautan aktivasi akan dinonaktifkan dan admin tidak dapat menggunakannya lagi."
        confirmLabel="Batalkan Undangan"
        onClose={closeModal}
        onConfirm={handleCancelInvitation}
      />
    </div>
  );
}
