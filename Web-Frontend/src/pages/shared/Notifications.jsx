import { useMemo, useState } from "react";
// import { mockNotifications } from "../../utils/data";
import { useNotifications } from "../../context/NotificationContext";

const Notifications = () => {
  const [filter, setFilter] = useState("All");
  const { notifications, markAllAsRead} = useNotifications();
  // const [list, setList] = useState(mockNotifications); // define the list

  // ✅ Filter notifications based on filter selection
  const filteredNotifications = useMemo(() => {
    // if (filter === "All") return list;
    if (filter === "All") return notifications;

    if (filter === "Unseen") return notifications.filter((n) => n.unseen);
    if (filter === "Personal")
      return notifications.filter((n) => n.type.toLowerCase() === "personal");

    if (filter === "Tasks")
      return notifications.filter(
        (n) =>
          n.type.toLowerCase() === "task" ||
          n.type.toLowerCase() === "deadline",
      );

    return notifications.filter((n) => n.type.toLowerCase() === filter.toLowerCase());
  }, [filter, notifications]);

  // ✅ Mark all as read (optional)
  // const markAllAsRead = () => {
  //   setList((prev) => prev.map((n) => ({ ...n, unseen: false })));
  // };

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
        {["All", "Tasks", "Personal", "System", "Unseen"].map((f) => (
          <button
            key={f}
            className={`staff-filter ${filter === f ? "staff-filter--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🔹 Notification List */}
      <ul className="staff-list staff-list--spacious">
        {filteredNotifications.map((n) => (
          <li key={n.id} className="staff-list-item">
            <div>
              <div className="staff-list-title">{n.message}</div>
              <div className="staff-list-meta">{n.time}</div>
            </div>
            <span className="staff-badge staff-badge--muted">
              {n.type}
              {n.unseen ? " • Unseen" : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
