import { mockTasks, mockNotifications } from "../../utils/data";

const Dashboard = () => {
  const tasks = mockTasks;
  const notifications = mockNotifications;

  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;

  return (
    <>
      <div className="staff-welcome">
        <h1 className="staff-welcome-title">Welcome, Staff Member</h1>
        <p className="staff-welcome-subtitle">
          Track your tasks, collaborate with your team, and keep projects moving
          for MINT.
        </p>
      </div>

      <div className="staff-grid staff-grid--cols-3">
        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">Assigned Tasks</div>
          <div className="staff-card-value">{totalTasks}</div>
          <div className="staff-card-caption">
            Tasks assigned to you this period
          </div>
        </div>
        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">In Progress</div>
          <div className="staff-card-value staff-card-value--warning">
            {inProgress}
          </div>
          <div className="staff-card-caption">
            Stay focused on high-priority work
          </div>
        </div>
        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">Completed</div>
          <div className="staff-card-value staff-card-value--success">
            {completed}
          </div>
          <div className="staff-card-caption">
            Great progress towards MINT objectives
          </div>
        </div>
      </div>

      <div className="staff-grid staff-grid--cols-2">
        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Task Completion Overview</h2>
          </div>
          <div className="staff-chart">
            {[
              {
                label: "Completed",
                value: completed,
                cls: "staff-chart-bar-fill--success",
              },
              {
                label: "In Progress",
                value: inProgress,
                cls: "staff-chart-bar-fill--warning",
              },
              {
                label: "Pending",
                value: pending,
                cls: "staff-chart-bar-fill--muted",
              },
            ].map((row) => (
              <div className="staff-chart-row" key={row.label}>
                <span>{row.label}</span>
                <div className="staff-chart-bar">
                  <div
                    className={`staff-chart-bar-fill ${row.cls}`}
                    style={{
                      width: totalTasks
                        ? `${(row.value / totalTasks) * 100}%`
                        : "0%",
                    }}
                  />
                </div>
                <span className="staff-chart-value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Deadline Alerts</h2>
          </div>
          <ul className="staff-list">
            {tasks.map((task) => (
              <li key={task.id} className="staff-list-item">
                <div>
                  <div className="staff-list-title">{task.title}</div>
                  <div className="staff-list-meta">
                    {task.project} · Due {task.due}
                  </div>
                </div>
                <span
                  className={`staff-badge staff-badge--${
                    task.priority === "High"
                      ? "danger"
                      : task.priority === "Medium"
                        ? "warning"
                        : "muted"
                  }`}
                >
                  {task.priority} priority
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="staff-grid staff-grid--stack staff-profile-layout">
        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Recent Notifications</h2>
          </div>
          <ul className="staff-list">
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
      </div>
    </>
  );
};

export default Dashboard;
