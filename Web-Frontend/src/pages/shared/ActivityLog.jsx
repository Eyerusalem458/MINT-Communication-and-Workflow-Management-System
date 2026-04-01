import { useOutletContext } from "react-router-dom";
import { mockActivity } from "../../utils/data";

const ActivityLog = () => {
  // Try to get activity from Outlet context, fallback to mockActivity
  const { activity } = useOutletContext() || {};
  const activityList = activity || mockActivity;

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
       
        <p className="staff-card-subtitle">
          Audit trail of your recent actions in the system.
        </p>
      </div>

      <ul className="staff-timeline">
        {activityList.map((item) => (
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
