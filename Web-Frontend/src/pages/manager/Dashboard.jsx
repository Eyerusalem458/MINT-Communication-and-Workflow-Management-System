import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { useTasks } from "../../context/TaskContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const ManagerDashboard = () => {
  const { users } = useContext(UserContext);
  const { tasks } = useTasks();
  const navigate = useNavigate();

  const staff = useMemo(() => users.filter((u) => u.role === "staff"), [users]);

  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.status === "Active").length;
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const overdueTasks = tasks.filter(
    (t) => new Date(t.due) < new Date() && t.status !== "Completed",
  );
  const highPriority = tasks.filter((t) => t.priority === "High");
  const idleStaff = staff.filter(
    (s) =>
      !tasks.some((t) => {
        const id = t.assignedTo?._id || t.assignedTo;
        return id?.toString() === s._id?.toString();
      }),
  );

  const taskChartData = [
    { name: "Completed", value: completed, color: "#4CAF50" },
    { name: "In Progress", value: inProgress, color: "#FF9800" },
    { name: "Pending", value: pending, color: "#90A4AE" },
  ];

  const completionPct = totalTasks
    ? Math.round((completed / totalTasks) * 100)
    : 0;

  const recentTasks = tasks.slice(0, 5);

  return (
    <>
      <style>{`
        .mgr-page {
          padding: 24px;
          background: #f0f2f5;
          min-height: 100vh;
          font-family: 'Segoe UI', sans-serif;
          box-sizing: border-box;
        }
        .mgr-subtitle {
          margin: 0 0 20px;
          color: #555;
          font-size: 14px;
        }

        /* ── quick actions ── */
        .mgr-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .mgr-action-card {
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,.12);
          transition: transform .15s, box-shadow .15s;
        }
        .mgr-action-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.18); }
        .mgr-action-card h4 { margin: 0; font-size: 15px; font-weight: 600; }
        .mgr-action-card p  { margin: 0; font-size: 12px; opacity: .85; }
        .mgr-action-icon { font-size: 28px; }

        /* ── stat cards ── */
        .mgr-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .mgr-card {
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .mgr-card-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 6px;
        }
        .mgr-card h4 { margin: 0; font-size: 12px; color: #666; font-weight: 500; }
        .mgr-card h1 { margin: 0; font-size: 26px; font-weight: 700; color: #1a1a2e; }
        .mgr-card-sub { font-size: 11px; color: #888; }

        /* ── widget shared ── */
        .mgr-mid, .mgr-bottom {
          display: grid;
          gap: 16px;
          margin-bottom: 20px;
        }
        .mgr-mid    { grid-template-columns: 2fr 1fr; }
        .mgr-bottom { grid-template-columns: 1fr 1fr; }

        .mgr-widget {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
        }
        .mgr-widget h3 {
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        /* ── insight cards ── */
        .mgr-insights {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        .mgr-insight {
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          border-left: 4px solid transparent;
        }
        .mgr-insight h4 { margin: 0 0 6px; font-size: 13px; color: #444; font-weight: 600; }
        .mgr-insight p  { margin: 0; font-size: 22px; font-weight: 700; color: #1a1a2e; }
        .mgr-insight span { font-size: 11px; color: #888; }

        /* ── progress ring ── */
        .mgr-ring-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 100%;
          min-height: 180px;
        }
        .mgr-ring { position: relative; width: 110px; height: 110px; }
        .mgr-ring svg { transform: rotate(-90deg); }
        .mgr-ring-label {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-weight: 700; font-size: 20px; color: #1a1a2e;
        }
        .mgr-ring-label span { font-size: 11px; color: #888; font-weight: 400; }

        /* ── task list ── */
        .mgr-task-list { display: flex; flex-direction: column; gap: 10px; }
        .mgr-task-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #f8f9fb;
          font-size: 13px;
        }
        .mgr-task-info { flex: 1; }
        .mgr-task-title { font-weight: 500; color: #222; margin-bottom: 2px; }
        .mgr-task-meta  { font-size: 11px; color: #888; }
        .mgr-badge {
          font-size: 10px; font-weight: 600; padding: 2px 8px;
          border-radius: 99px; white-space: nowrap;
        }
        .mgr-badge--high   { background: #fde8e8; color: #c0392b; }
        .mgr-badge--medium { background: #fff3e0; color: #e67e22; }
        .mgr-badge--low    { background: #e8f5e9; color: #27ae60; }

        /* ── status dot ── */
        .mgr-status-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .mgr-actions   { grid-template-columns: 1fr; }
          .mgr-insights  { grid-template-columns: 1fr; }
          .mgr-mid       { grid-template-columns: 1fr; }
          .mgr-bottom    { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="mgr-page">
        <p className="mgr-subtitle">
          Monitor your team, track performance, and take smart decisions.
        </p>

        {/* ── quick actions ── */}
        <div className="mgr-actions">
          <div
            className="mgr-action-card"
            style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
            onClick={() => navigate("/manager/taskManagement")}
          >
            <div className="mgr-action-icon">📋</div>
            <h4>Assign Task</h4>
            <p>Create and assign new tasks to your team</p>
          </div>
          <div
            className="mgr-action-card"
            style={{ background: "linear-gradient(135deg,#10b981,#34d399)" }}
            onClick={() => navigate("/manager/reports")}
          >
            <div className="mgr-action-icon">📊</div>
            <h4>View Reports</h4>
            <p>Analyze team performance and progress</p>
          </div>
        </div>

        {/* ── stat cards ── */}
        <div className="mgr-cards">
          {[
            {
              icon: "👥",
              bg: "#e3f2fd",
              label: "Total Staff",
              val: totalStaff,
              sub: `${activeStaff} active`,
            },
            {
              icon: "✅",
              bg: "#e8f5e9",
              label: "Active Staff",
              val: activeStaff,
              sub: `${totalStaff - activeStaff} inactive`,
            },
            {
              icon: "📌",
              bg: "#fff3e0",
              label: "Total Tasks",
              val: totalTasks,
              sub: "all assigned tasks",
            },
            {
              icon: "🏁",
              bg: "#e8f5e9",
              label: "Completed",
              val: completed,
              sub: `${completionPct}% completion rate`,
            },
          ].map(({ icon, bg, label, val, sub }) => (
            <div className="mgr-card" key={label}>
              <div className="mgr-card-icon" style={{ background: bg }}>
                {icon}
              </div>
              <h4>{label}</h4>
              <h1>{val}</h1>
              <span className="mgr-card-sub">{sub}</span>
            </div>
          ))}
        </div>

        {/* ── insights row ── */}
        <div className="mgr-insights">
          <div className="mgr-insight" style={{ borderLeftColor: "#F44336" }}>
            <h4>⚠️ Overdue Tasks</h4>
            <p>{overdueTasks.length}</p>
            <span>tasks past their deadline</span>
          </div>
          <div className="mgr-insight" style={{ borderLeftColor: "#FF9800" }}>
            <h4>🔥 High Priority</h4>
            <p>{highPriority.length}</p>
            <span>urgent tasks need attention</span>
          </div>
          <div className="mgr-insight" style={{ borderLeftColor: "#90A4AE" }}>
            <h4>😴 Idle Staff</h4>
            <p>{idleStaff.length}</p>
            <span>staff have no tasks assigned</span>
          </div>
        </div>

        {/* ── chart + completion ring ── */}
        <div className="mgr-mid">
          <div className="mgr-widget">
            <h3>📊 Task Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={taskChartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {taskChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mgr-widget">
            <h3>🎯 Completion Rate</h3>
            <div className="mgr-ring-wrap">
              <div className="mgr-ring">
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
                    stroke="#4CAF50"
                    strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - completionPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset .8s ease" }}
                  />
                </svg>
                <div className="mgr-ring-label">
                  {completionPct}%<span>done</span>
                </div>
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: "#555" }}>
                {completed} of {totalTasks} tasks completed
              </div>
            </div>
          </div>
        </div>

        {/* ── recent tasks ── */}
        <div className="mgr-widget">
          <h3>📋 Recent Tasks</h3>
          <div className="mgr-task-list">
            {recentTasks.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: 13 }}>No tasks yet.</p>
            ) : (
              recentTasks.map((task) => {
                const assignee = task.assignedTo;
                const name = assignee?.firstName
                  ? `${assignee.firstName} ${assignee.lastName}`
                  : assignee || "—";
                const isOverdue =
                  new Date(task.due) < new Date() &&
                  task.status !== "Completed";
                return (
                  <div className="mgr-task-item" key={task._id}>
                    <div
                      className="mgr-status-dot"
                      style={{
                        background:
                          task.status === "Completed"
                            ? "#4CAF50"
                            : task.status === "In Progress"
                              ? "#FF9800"
                              : "#90A4AE",
                      }}
                    />
                    <div className="mgr-task-info">
                      <div className="mgr-task-title">{task.title}</div>
                      <div className="mgr-task-meta">
                        {name} · Due {task.due}
                        {isOverdue && (
                          <span style={{ color: "#F44336", marginLeft: 6 }}>
                            ⚠ Overdue
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`mgr-badge mgr-badge--${
                        task.priority === "High"
                          ? "high"
                          : task.priority === "Medium"
                            ? "medium"
                            : "low"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;
