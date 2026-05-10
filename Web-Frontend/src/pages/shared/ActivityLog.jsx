import { useState, useEffect } from "react";
import API from "../../api/axios";

const ActivityLog = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/activity")
      .then((res) => setActivity(res.data || []))
      .catch((err) => console.error("Failed to fetch activity:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
        <p className="staff-card-subtitle">
          Audit trail of your recent actions in the system.
        </p>
      </div>

      {loading ? (
        <p style={{ padding: 12 }}>Loading activity...</p>
      ) : activity.length === 0 ? (
        <p style={{ padding: 12 }}>No activity recorded yet.</p>
      ) : (
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
      )}
    </div>
  );
};

export default ActivityLog;
