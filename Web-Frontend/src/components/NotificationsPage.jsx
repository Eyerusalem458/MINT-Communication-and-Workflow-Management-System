import { useMemo, useState } from "react";

const NotificationsPage = ({ notifications }) => {
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    if (filter === "All") return notifications;
    if (filter === "Unseen") return notifications.filter((n) => n.unseen);
    return notifications.filter((n) => n.type.toLowerCase() === filter.toLowerCase());
  }, [filter, notifications]);

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <div>
          <h2>Notifications</h2>
          <p className="staff-card-subtitle">
            Central place for all task, unseen, and system updates.
          </p>
        </div>
        <button className="staff-btn staff-btn--ghost" onClick={() => setFilter("All")}>Mark all as read</button>
      </div>

      <div className="staff-filters">
        <button className={`staff-filter ${filter === "All" ? "staff-filter--active" : ""}`} onClick={() => setFilter("All")}>All</button>
        <button className={`staff-filter ${filter === "Tasks" ? "staff-filter--active" : ""}`} onClick={() => setFilter("Tasks")}>Tasks</button>
        <button className={`staff-filter ${filter === "Unseen" ? "staff-filter--active" : ""}`} onClick={() => setFilter("Unseen")}>Unseen</button>
        <button className={`staff-filter ${filter === "System" ? "staff-filter--active" : ""}`} onClick={() => setFilter("System")}>System</button>
      </div>

      <ul className="staff-list staff-list--spacious">
        {filtered.map((n) => (
          <li key={n.id} className="staff-list-item">
            <div>
              <div className="staff-list-title">{n.message}</div>
              <div className="staff-list-meta">{n.time}</div>
            </div>
            <span className="staff-badge staff-badge--muted">
              {n.type}{n.unseen ? " • Unseen" : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
