import "../../styles/admin/StatCardMitra.css";

export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <p className="stat-card__title">{title}</p>
      <h2 className="stat-card__value">{value}</h2>
      <p className="stat-card__subtitle">{subtitle}</p>
    </div>
  );
}

/* ===== STATUS HELPERS (optional, bisa dipakai di komponen lain) ===== */

