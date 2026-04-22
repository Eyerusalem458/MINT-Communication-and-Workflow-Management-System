import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { useTasks } from "../../context/TaskContext";

const ManagerDashboard = () => {
  const { users } = useContext(UserContext);
  const { tasks } = useTasks();
  const navigate = useNavigate();

  // 👥 STAFF ONLY
  const staff = useMemo(() => {
    return users.filter((u) => u.role === "Staff");
  }, [users]);

  // 📊 STAFF STATS
  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.status === "Active").length;
  const inactiveStaff = totalStaff - activeStaff;

  // 📊 TASK STATS
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;

  // ⚠️ SMART INSIGHTS
  const overdueTasks = tasks.filter(
    (t) => new Date(t.due) < new Date() && t.status !== "Completed",
  );

  const highPriority = tasks.filter((t) => t.priority === "High");

  const idleStaff = staff.filter(
    (s) => !tasks.some((t) => t.assignedTo === `${s.firstName} ${s.lastName}`),
  );

  // 🥇 TOP PERFORMER
  const topPerformer = useMemo(() => {
    const performance = {};

    tasks.forEach((t) => {
      if (t.status === "Completed") {
        performance[t.assignedTo] = (performance[t.assignedTo] || 0) + 1;
      }
    });

    let top = null;
    let max = 0;

    for (let person in performance) {
      if (performance[person] > max) {
        max = performance[person];
        top = person;
      }
    }

    return { name: top, count: max };
  }, [tasks]);

  // ⏰ DEADLINE FILTERS
  const todayTasks = tasks.filter(
    (t) => new Date(t.due).toDateString() === new Date().toDateString(),
  );

  return (
    <>
      {/* 🟣 WELCOME */}
      <div className="staff-welcome">
        <p className="staff-welcome-subtitle">
          Monitor your team, track performance, and take smart decisions.
        </p>
      </div>

      {/* ⚡ QUICK ACTIONS */}
      <div className="staff-grid staff-grid--cols-2">
        <div
          className="staff-card staff-card--metric"
          style={{ cursor: "pointer", background: "#6366f1", color: "#fff" }}
          onClick={() => navigate("/manager/taskManagement")}
        >
          <div className="staff-card-label">Assign Task</div>
          <div className="staff-card-value">+</div>
          <div className="staff-card-caption">Create and assign new tasks</div>
        </div>

        <div
          className="staff-card staff-card--metric"
          style={{ cursor: "pointer", background: "#10b981", color: "#fff" }}
          onClick={() => navigate("/manager/reports")}
        >
          <div className="staff-card-label">View Reports</div>
          <div className="staff-card-value">📊</div>
          <div className="staff-card-caption">Analyze team performance</div>
        </div>
      </div>

      {/* 📊 TOP METRICS */}
      <div className="staff-grid staff-grid--cols-2">
        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">Total Staff</div>
          <div className="staff-card-value">{totalStaff}</div>
        </div>

        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">Active Staff</div>
          <div className="staff-card-value staff-card-value--success">
            {activeStaff}
          </div>
        </div>

        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">Total Tasks</div>
          <div className="staff-card-value">{totalTasks}</div>
        </div>

        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">Completed</div>
          <div className="staff-card-value staff-card-value--success">
            {completed}
          </div>
        </div>
      </div>

      {/* ⚠️ SMART INSIGHTS */}
      <div className="staff-grid staff-grid--cols-3">
        <div className="staff-card">
          <h3>⚠️ Overdue Tasks</h3>
          <p>{overdueTasks.length} tasks need attention</p>
        </div>

        <div className="staff-card">
          <h3>🔥 High Priority</h3>
          <p>{highPriority.length} urgent tasks</p>
        </div>

        <div className="staff-card">
          <h3>😴 Idle Staff</h3>
          <p>{idleStaff.length} staff have no tasks</p>
        </div>
      </div>

      {/* 📊 TASK OVERVIEW */}
      <div className="staff-grid staff-grid--cols-2">
        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Task Overview</h2>
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
                <span>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🥇 PERFORMANCE */}
        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Top Performer</h2>
          </div>

          <p>
            {topPerformer.name
              ? `${topPerformer.name} (${topPerformer.count} completed tasks)`
              : "No completed tasks yet"}
          </p>
        </div>
      </div>

      {/* ⏰ DEADLINE PANEL */}
      <div className="staff-grid staff-grid--cols-2">
        <div className="staff-card">
          <h2>📅 Due Today</h2>
          <ul className="staff-list">
            {todayTasks.map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
        </div>

        <div className="staff-card">
          <h2>⚠️ Overdue Tasks</h2>
          <ul className="staff-list">
            {overdueTasks.map((t) => (
              <li key={t.id}>{t.title}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 📋 RECENT TASKS */}
      <div className="staff-card">
        <div className="staff-card-header">
          <h2>Recent Tasks</h2>
        </div>

        <ul className="staff-list">
          {tasks.slice(0, 5).map((task) => (
            <li key={task.id} className="staff-list-item">
              <div>
                <div className="staff-list-title">{task.title}</div>
                <div className="staff-list-meta">
                  {task.assignedTo} · {task.due}
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
                {task.priority}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ManagerDashboard;
