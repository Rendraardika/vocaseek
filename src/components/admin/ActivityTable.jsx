import { useMemo, useState } from "react";
import "../../styles/ActivityTable.css";

export default function ActivityTable({ activities = [] }) {
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const getStatusClass = (status) => {
    switch (status) {
      case "REVIEWING":
        return "reviewing";
      case "ACCEPTED":
        return "accepted";
      case "DECLINED":
        return "declined";
      default:
        return "";
    }
  };

  const filteredActivities = useMemo(() => {
    if (selectedFilter === "ALL") return activities;
    return activities.filter((item) => item.status === selectedFilter);
  }, [activities, selectedFilter]);

  return (
    <div className="activity-card">
      <div className="activity-card-header">
        <div>
          <h2>Recent Activity</h2>
          <p>Unified view of talent applications and partner updates.</p>
        </div>

        <div className="activity-actions">
          <select
            className="filter-select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Declined</option>
          </select>

          <button className="outline-btn">See All</button>
        </div>
      </div>

      <div className="activity-table-wrapper">
        <table className="activity-table">
          <thead>
            <tr>
              <th>IDENTITY</th>
              <th>APPLIED COMPANY</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="identity-cell">
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="identity-avatar identity-avatar-image"
                        />
                      ) : (
                        <div
                          className="identity-avatar identity-avatar-placeholder"
                          aria-hidden="true"
                        >
                          <span className="identity-avatar-placeholder-icon" />
                        </div>
                      )}
                      <div className="identity-name">{item.name}</div>
                    </div>
                  </td>
                  <td>{item.organization}</td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="empty-state">
                  No recent activity
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
