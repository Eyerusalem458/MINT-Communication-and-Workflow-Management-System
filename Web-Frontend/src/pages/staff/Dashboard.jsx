import { useTasks } from "../../context/TaskContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

const NOTIF_DOT = {
  Task: "#6366f1",
  Message: "#2196F3",
  System: "#FF9800",
  default: "#90A4AE",
};

const StaffDashboard = () => {
  const { tasks } = useTasks();
  const { notifications } = useNotifications();

  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const overdueTasks = tasks.filter(
    (t) => new Date(t.due) < new Date() && t.status !== "Completed",
  );
  const completionPct = totalTasks
    ? Math.round((completed / totalTasks) * 100)
    : 0;

  const radialData = [
    { name: "Completed", value: completionPct, fill: "#4CAF50" },
  ];

  return (
    <>
      <style>{`
        .sf-page {
          padding: 24px;
          background: #f0f2f5;
          min-height: 100vh;
          font-family: 'Segoe UI', sans-serif;
          box-sizing: border-box;
        }
        .sf-subtitle { margin: 0 0 20px; color: #555; font-size: 14px; }

        /* ── stat cards ── */
        .sf-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .sf-card {
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          display: flex; flex-direction: column; gap: 4px;
        }
        .sf-card-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 6px;
        }
        .sf-card h4 { margin: 0; font-size: 12px; color: #666; font-weight: 500; }
        .sf-card h1 { margin: 0; font-size: 26px; font-weight: 700; color: #1a1a2e; }
        .sf-card-sub { font-size: 11px; color: #888; }

        /* ── widget ── */
        .sf-mid, .sf-bottom {
          display: grid; gap: 16px; margin-bottom: 20px;
        }
        .sf-mid    { grid-template-columns: 2fr 1fr; }
        .sf-bottom { grid-template-columns: 1fr 1fr; }

        .sf-widget {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
        }
        .sf-widget h3 { margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #333; }

        /* ── progress bars ── */
        .sf-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; font-size: 13px; color: #444; }
        .sf-bar-label { min-width: 80px; }
        .sf-bar-wrap  { flex: 1; height: 8px; background: #eee; border-radius: 99px; overflow: hidden; }
        .sf-bar-fill  { height: 100%; border-radius: 99px; transition: width .6s ease; }
        .sf-bar-count { min-width: 20px; text-align: right; font-weight: 600; color: #333; }

        /* ── ring ── */
        .sf-ring-wrap {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 180px; gap: 8px;
        }
        .sf-ring { position: relative; width: 110px; height: 110px; }
        .sf-ring svg { transform: rotate(-90deg); }
        .sf-ring-label {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-weight: 700; font-size: 20px; color: #1a1a2e;
        }
        .sf-ring-label span { font-size: 11px; color: #888; font-weight: 400; }

        /* ── deadline alerts ── */
        .sf-task-list { display: flex; flex-direction: column; gap: 10px; }
        .sf-task-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          background: #f8f9fb; font-size: 13px;
        }
        .sf-task-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .sf-task-info { flex: 1; }
        .sf-task-title { font-weight: 500; color: #222; margin-bottom: 2px; }
        .sf-task-meta  { font-size: 11px; color: #888; }
        .sf-badge {
          font-size: 10px; font-weight: 600; padding: 2px 8px;
          border-radius: 99px; white-space: nowrap;
        }
        .sf-badge--high   { background: #fde8e8; color: #c0392b; }
        .sf-badge--medium { background: #fff3e0; color: #e67e22; }
        .sf-badge--low    { background: #e8f5e9; color: #27ae60; }

        /* ── notifications ── */
        .sf-notif-list { display: flex; flex-direction: column; gap: 12px; }
        .sf-notif-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #444; }
        .sf-notif-dot  { width: 10px; height: 10px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
        .sf-notif-time { font-size: 11px; color: #aaa; margin-top: 2px; }
        .sf-notif-badge {
          font-size: 10px; font-weight: 600; padding: 2px 8px;
          border-radius: 99px; background: #f0f2f5; color: #555; white-space: nowrap;
          margin-left: auto;
        }

        /* ── overdue alert banner ── */
        .sf-alert {
          background: #fff8f8;
          border: 1px solid #fde8e8;
          border-left: 4px solid #F44336;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #c0392b;
        }

        @media (max-width: 768px) {
          .sf-mid    { grid-template-columns: 1fr; }
          .sf-bottom { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sf-page">
        <p className="sf-subtitle">
          Track your tasks, collaborate with your team, and keep projects moving
          for MINT.
        </p>

        {/* overdue alert banner */}
        {overdueTasks.length > 0 && (
          <div className="sf-alert">
            ⚠️ You have{" "}
            <strong style={{ margin: "0 4px" }}>{overdueTasks.length}</strong>
            overdue task{overdueTasks.length > 1 ? "s" : ""} that need your
            attention.
          </div>
        )}

        {/* ── stat cards ── */}
        <div className="sf-cards">
          {[
            {
              icon: "📌",
              bg: "#e3f2fd",
              label: "Assigned Tasks",
              val: totalTasks,
              sub: "tasks assigned to you",
            },
            {
              icon: "⚡",
              bg: "#fff3e0",
              label: "In Progress",
              val: inProgress,
              sub: "stay focused on these",
            },
            {
              icon: "✅",
              bg: "#e8f5e9",
              label: "Completed",
              val: completed,
              sub: `${completionPct}% completion`,
            },
            {
              icon: "🕐",
              bg: "#fce4ec",
              label: "Pending",
              val: pending,
              sub: "not yet started",
            },
          ].map(({ icon, bg, label, val, sub }) => (
            <div className="sf-card" key={label}>
              <div className="sf-card-icon" style={{ background: bg }}>
                {icon}
              </div>
              <h4>{label}</h4>
              <h1>{val}</h1>
              <span className="sf-card-sub">{sub}</span>
            </div>
          ))}
        </div>

        {/* ── progress bars + ring ── */}
        <div className="sf-mid">
          <div className="sf-widget">
            <h3>📊 Task Completion Overview</h3>
            {[
              { label: "Completed", value: completed, color: "#4CAF50" },
              { label: "In Progress", value: inProgress, color: "#FF9800" },
              { label: "Pending", value: pending, color: "#90A4AE" },
            ].map(({ label, value, color }) => (
              <div className="sf-bar-row" key={label}>
                <span className="sf-bar-label">{label}</span>
                <div className="sf-bar-wrap">
                  <div
                    className="sf-bar-fill"
                    style={{
                      width: totalTasks
                        ? `${(value / totalTasks) * 100}%`
                        : "0%",
                      background: color,
                    }}
                  />
                </div>
                <span className="sf-bar-count">{value}</span>
              </div>
            ))}
          </div>

          <div className="sf-widget">
            <h3>🎯 My Progress</h3>
            <div className="sf-ring-wrap">
              <div className="sf-ring">
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle
                    cx="55"
                    cy="55"
                    r="45"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="10"
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r="45"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - completionPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset .8s ease" }}
                  />
                </svg>
                <div className="sf-ring-label">
                  {completionPct}%<span>done</span>
                </div>
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: "#555" }}>
                {completed} of {totalTasks} tasks completed
              </div>
            </div>
          </div>
        </div>

        {/* ── deadline alerts + notifications ── */}
        <div className="sf-bottom">
          <div className="sf-widget">
            <h3>⏰ Deadline Alerts</h3>
            <div className="sf-task-list">
              {tasks.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: 13 }}>
                  No tasks assigned.
                </p>
              ) : (
                tasks.slice(0, 5).map((task) => {
                  const isOverdue =
                    new Date(task.due) < new Date() &&
                    task.status !== "Completed";
                  return (
                    <div className="sf-task-item" key={task._id || task.id}>
                      <div
                        className="sf-task-dot"
                        style={{
                          background: isOverdue
                            ? "#F44336"
                            : task.status === "Completed"
                              ? "#4CAF50"
                              : task.status === "In Progress"
                                ? "#FF9800"
                                : "#90A4AE",
                        }}
                      />
                      <div className="sf-task-info">
                        <div className="sf-task-title">{task.title}</div>
                        <div className="sf-task-meta">
                          {task.project ? `${task.project} · ` : ""}Due{" "}
                          {task.due}
                          {isOverdue && (
                            <span style={{ color: "#F44336", marginLeft: 4 }}>
                              · Overdue
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`sf-badge sf-badge--${
                          task.priority === "High"
                            ? "high"
                            : task.priority === "Medium"
                              ? "medium"
                              : "low"
                        }`}
                      >
                        {task.priority} priority
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="sf-widget">
            <h3>🔔 Recent Notifications</h3>
            <div className="sf-notif-list">
              {notifications.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: 13 }}>
                  No notifications yet.
                </p>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div className="sf-notif-item" key={n._id || n.id}>
                    <span
                      className="sf-notif-dot"
                      style={{
                        background: NOTIF_DOT[n.type] ?? NOTIF_DOT.default,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div>{n.message}</div>
                      <div className="sf-notif-time">
                        {n.createdAt ? relativeTime(n.createdAt) : n.time}
                      </div>
                    </div>
                    <span className="sf-notif-badge">{n.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffDashboard;
