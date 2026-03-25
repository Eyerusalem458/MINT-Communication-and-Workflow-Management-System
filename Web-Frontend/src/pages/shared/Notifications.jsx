import { mockNotifications } from "../../utils/data";
const Notifications = () => {
  const notifications = mockNotifications;
  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <div>
          <h2>Notifications</h2>
          <p className="staff-card-subtitle">
            Central place for all task, project, and system updates.
          </p>
        </div>
        <button className="staff-btn staff-btn--ghost">Mark all as read</button>
      </div>

      <div className="staff-filters">
        <button className="staff-filter staff-filter--active">All</button>
        <button className="staff-filter">Tasks</button>
        <button className="staff-filter">Projects</button>
        <button className="staff-filter">System</button>
      </div>

      <ul className="staff-list staff-list--spacious">
        {notifications.map((n) => (
          <li key={n.id} className="staff-list-item">
            <div>
              <div className="staff-list-title">{n.message}</div>
              <div className="staff-list-meta">{n.time}</div>
            </div>
            <span className="staff-badge staff-badge--muted">{n.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
