import { useMemo, useState } from "react";
// import { mockNotifications } from "../../utils/data";
import { useNotifications } from "../../context/NotificationContext";

const Notifications = () => {
  const [filter, setFilter] = useState("All");
  const { notifications, markAllAsRead, markOneAsRead, loading } =
    useNotifications();

  // ✅ Filter notifications based on filter selection
  const filteredNotifications = useMemo(() => {
    if (filter === "All") return notifications;

    if (filter === "Unseen") return notifications.filter((n) => n.unseen);
    if (filter === "Personal")
      return notifications.filter((n) => n.type.toLowerCase() === "personal");

    if (filter === "Tasks")
      return notifications.filter((n) => ["Task", "Deadline"].includes(n.type));

    return notifications.filter(
      (n) => n.type?.toLowerCase() === filter.toLowerCase(),
    );
  }, [filter, notifications]);

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <div>
          <p className="staff-card-subtitle">
            Central place for all task, unseen, and system updates.
          </p>
        </div>
        <button className="staff-btn staff-btn--ghost" onClick={markAllAsRead}>
          Mark all as read
        </button>
      </div>

      {/* 🔹 Filters */}
      <div className="staff-filters">
        {["All", "Tasks", "Personal", "System", "Project", "Unseen"].map(
          (f) => (
            <button
              key={f}
              className={`staff-filter ${filter === f ? "staff-filter--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ),
        )}
      </div>

      {/* 🔹 Notification List */}
      {loading ? (
        <p style={{ padding: "12px" }}>Loading...</p>
      ) : filteredNotifications.length === 0 ? (
        <p style={{ padding: "12px" }}>No notifications found.</p>
      ) : (
        <ul className="staff-list staff-list--spacious">
          {filteredNotifications.map((n) => (
            <li
              key={n._id || n.id}
              className="staff-list-item"
              style={{
                cursor: n.unseen ? "pointer" : "default",
                background: n.unseen ? "rgba(59,130,246,0.05)" : undefined,
              }}
              onClick={() => n.unseen && markOneAsRead(n._id || n.id)}
            >
              <div>
                <div className="staff-list-title">{n.message}</div>
                <div className="staff-list-meta">
                  {n.createdAt
                    ? new Date(n.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : n.time}
                </div>
              </div>
              <span className="staff-badge staff-badge--muted">
                {n.type}
                {n.unseen ? " • Unseen" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
