const ActivityLog = ({ activity }) => {
  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
        <h2>Activity Log</h2>
        <p className="staff-card-subtitle">
          Audit trail of your recent actions in the system.
        </p>
      </div>

      <ul className="staff-timeline">
        {activity.map((item) => (
          <li key={item.id} className="staff-timeline-item">
            <div className="staff-timeline-dot" />
            <div className="staff-timeline-content">
              <div className="staff-timeline-time">{item.time}</div>
              <div className="staff-timeline-action">{item.action}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityLog;
