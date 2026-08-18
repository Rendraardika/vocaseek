import "../../styles/StatCard.css";

export default function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card-head">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon">{icon}</div>
      </div>

      <div className="stat-card-value">{value}</div>
    </div>
  );
}
