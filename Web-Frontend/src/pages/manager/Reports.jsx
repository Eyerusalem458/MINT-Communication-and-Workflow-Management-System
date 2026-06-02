import { useState, useMemo, useContext } from "react";
import { useTasks } from "../../context/TaskContext";
import { useProjects } from "../../context/ProjectContext";
import Button from "../../components/ui/Button";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/AuthContext";

const Reports = () => {
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { user: currentUser } = useContext(AuthContext);

  const [projectPage, setProjectPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);
  const pageSize = 5;

  const [projectFilter, setProjectFilter] = useState("");
  const [projectStatus, setProjectStatus] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("");

  // ── stats ──────────────────────────────────────────────────────────────
  const totalProjects = projects.length;
  const approvedProjects = projects.filter(
    (p) => p.status === "Approved",
  ).length;
  const pendingProjects = projects.filter((p) => p.status === "Pending").length;
  const rejectedProjects = projects.filter(
    (p) => p.status === "Rejected",
  ).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "In Progress",
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const completionRate = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "rpt-badge rpt-badge--pending";
      case "Approved":
        return "rpt-badge rpt-badge--approved";
      case "Rejected":
        return "rpt-badge rpt-badge--rejected";
      case "In Progress":
        return "rpt-badge rpt-badge--inprogress";
      case "Completed":
        return "rpt-badge rpt-badge--completed";
      default:
        return "rpt-badge";
    }
  };

  const getCreatedBy = (project) => {
    const cb = project.createdBy;
    if (!cb) return "—";
    if (typeof cb === "object")
      return `${cb.firstName || ""} ${cb.lastName || ""}`.trim();
    return cb;
  };

  // ── filtered data ──────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchSearch = p.title
          .toLowerCase()
          .includes(projectFilter.toLowerCase());
        const matchDept = p.department === currentUser?.department;
        const matchStatus = projectStatus === "" || p.status === projectStatus;
        return matchSearch && matchDept && matchStatus;
      })
      .slice((projectPage - 1) * pageSize, projectPage * pageSize);
  }, [projects, projectFilter, currentUser, projectStatus, projectPage]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchSearch = t.title
          .toLowerCase()
          .includes(taskFilter.toLowerCase());
        const matchStatus =
          taskStatusFilter === "" || t.status === taskStatusFilter;
        const matchPriority =
          taskPriorityFilter === "" || t.priority === taskPriorityFilter;
        return matchSearch && matchStatus && matchPriority;
      })
      .slice((taskPage - 1) * pageSize, taskPage * pageSize);
  }, [tasks, taskFilter, taskStatusFilter, taskPriorityFilter, taskPage]);

  // ── exports ────────────────────────────────────────────────────────────
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            let val = row[h];
            if (val === null || val === undefined) return "";
            if (typeof val === "object") return JSON.stringify(val);
            return val.toString();
          })
          .join(","),
      ),
    ].join("\n");
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
  };

  const exportPDF = (data, filename, columns) => {
    if (!data || data.length === 0) {
      showErrorToast("No data to export");
      return;
    }
    const doc = new jsPDF();
    const body = data.map((row) =>
      columns.map((col) => {
        switch (col) {
          case "Title":
            return row.title || "";
          case "Department":
            return row.department || "";
          case "Status":
            return row.status || "";
          case "Created By":
            return row.createdBy || "";
          case "Date":
            return row.createdAt || "";
          case "Priority":
            return row.priority || "";
          case "Due Date":
            return row.due || row.dueDate || "";
          case "File":
            return row.file ? row.file.name || JSON.stringify(row.file) : "";
          default:
            return "";
        }
      }),
    );
    autoTable(doc, {
      head: [columns],
      body,
      startY: 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(filename);
  };

  // ── mini bar helper ────────────────────────────────────────────────────
  const MiniBar = ({ value, max, color }) => (
    <div
      style={{
        flex: 1,
        height: 6,
        background: "#eee",
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 99,
          background: color,
          width: max ? `${(value / max) * 100}%` : "0%",
          transition: "width .6s ease",
        }}
      />
    </div>
  );

  return (
    <>
      <style>{`
        .rpt-page {
          padding: 24px;
          background: #f0f2f5;
          min-height: 100vh;
          font-family: 'Segoe UI', sans-serif;
          box-sizing: border-box;
        }
        .rpt-subtitle { margin: 0 0 20px; color: #555; font-size: 14px; }

        /* ── summary cards ── */
        .rpt-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .rpt-card {
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          background: #fff;
        }
        .rpt-card-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; margin-bottom: 4px;
        }
        .rpt-card h4 { margin: 0; font-size: 12px; color: #666; font-weight: 500; }
        .rpt-card h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a2e; }
        .rpt-card-breakdown {
          display: flex; flex-direction: column; gap: 5px; margin-top: 4px;
        }
        .rpt-card-stat {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; color: #555;
        }
        .rpt-card-stat-label { min-width: 64px; }
        .rpt-card-stat-val   { min-width: 18px; text-align: right; font-weight: 600; color: #333; }

        /* ── completion ring ── */
        .rpt-ring-card {
          border-radius: 12px; padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          background: #fff;
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 8px;
        }
        .rpt-ring-card h4 { margin: 0; font-size: 12px; color: #666; font-weight: 500; align-self: flex-start; }
        .rpt-ring { position: relative; width: 100px; height: 100px; }
        .rpt-ring svg { transform: rotate(-90deg); }
        .rpt-ring-label {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-weight: 700; font-size: 18px; color: #1a1a2e;
        }
        .rpt-ring-label span { font-size: 10px; color: #888; font-weight: 400; }

        /* ── section widget ── */
        .rpt-section {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          margin-bottom: 20px;
        }
        .rpt-section-header {
          display: flex; align-items: center;
          flex-wrap: wrap; gap: 10px;
          margin-bottom: 16px;
        }
        .rpt-section-header h3 {
          margin: 0; font-size: 15px; font-weight: 600; color: #222; flex: 1;
        }
        .rpt-filters {
          display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
        }
        .rpt-input {
          padding: 7px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
          background: #f8f9fb;
          color: #333;
          transition: border-color .2s;
        }
        .rpt-input:focus { border-color: #90CAF9; background: #fff; }

        .rpt-export-row { display: flex; gap: 8px; margin-top: 10px; }
        .rpt-export-btn {
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          background: #f8f9fb;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          color: #edbc6d;
          transition: background .15s, border-color .15s;
          display: flex; align-items: center; gap: 5px;
        }
        .rpt-export-btn:hover { background: #e3f2fd; border-color: #90CAF9; color: #1976D2; }

        /* ── table ── */
        .rpt-table-wrap { overflow-x: auto; }
        .rpt-table {
          width: 100%; border-collapse: collapse; font-size: 13px;
        }
        .rpt-table th {
          text-align: left; padding: 10px 14px;
          background: #f4f6f8; color: #555;
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: .5px;
          border-bottom: 1px solid #e8eaed;
          white-space: nowrap;
        }
        .rpt-table td {
          padding: 11px 14px;
          border-bottom: 1px solid #f0f2f5;
          color: #333;
          vertical-align: middle;
        }
        .rpt-table tbody tr:hover { background: #f8f9fb; }
        .rpt-table tbody tr:last-child td { border-bottom: none; }

        /* ── badges ── */
        .rpt-badge {
          display: inline-block;
          padding: 3px 10px; border-radius: 99px;
          font-size: 11px; font-weight: 600; white-space: nowrap;
        }
        .rpt-badge--pending    { background: #fff3e0; color: #e67e22; }
        .rpt-badge--approved   { background: #e8f5e9; color: #27ae60; }
        .rpt-badge--rejected   { background: #fde8e8; color: #c0392b; }
        .rpt-badge--inprogress { background: #e3f2fd; color: #1976D2; }
        .rpt-badge--completed  { background: #e8f5e9; color: #27ae60; }

        /* ── priority dot ── */
        .rpt-priority {
          display: flex; align-items: center; gap: 6px;
        }
        .rpt-priority-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }

        /* ── pagination ── */
        .rpt-pagination {
          display: flex; align-items: center; gap: 8px;
          margin-top: 16px; font-size: 13px; color: #555;
        }
        .rpt-page-btn {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid #e0e0e0; background: #f8f9fb;
          cursor: pointer; font-size: 14px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s;
        }
        .rpt-page-btn:hover:not(:disabled) { background: #e3f2fd; border-color: #90CAF9; }
        .rpt-page-btn:disabled { opacity: .4; cursor: not-allowed; }

        /* ── empty ── */
        .rpt-empty { text-align: center; padding: 32px; color: #aaa; font-size: 13px; }

        @media (max-width: 768px) {
          .rpt-cards { grid-template-columns: 1fr 1fr; }
          .rpt-section-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="rpt-page">
        <p className="rpt-subtitle">
          System analytics and performance overview
        </p>

        {/* ── summary cards ── */}
        <div className="rpt-cards">
          {/* projects card */}
          <div className="rpt-card">
            <div className="rpt-card-icon" style={{ background: "#fff8e1" }}>
              📁
            </div>
            <h4>Total Projects</h4>
            <h1>{totalProjects}</h1>
            <div className="rpt-card-breakdown">
              {[
                { label: "Approved", val: approvedProjects, color: "#4CAF50" },
                { label: "Pending", val: pendingProjects, color: "#FF9800" },
                { label: "Rejected", val: rejectedProjects, color: "#F44336" },
              ].map(({ label, val, color }) => (
                <div className="rpt-card-stat" key={label}>
                  <span className="rpt-card-stat-label">{label}</span>
                  <MiniBar value={val} max={totalProjects} color={color} />
                  <span className="rpt-card-stat-val">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* tasks card */}
          <div className="rpt-card">
            <div className="rpt-card-icon" style={{ background: "#e3f2fd" }}>
              📋
            </div>
            <h4>Total Tasks</h4>
            <h1>{totalTasks}</h1>
            <div className="rpt-card-breakdown">
              {[
                { label: "Completed", val: completedTasks, color: "#4CAF50" },
                {
                  label: "In Progress",
                  val: inProgressTasks,
                  color: "#2196F3",
                },
                { label: "Pending", val: pendingTasks, color: "#90A4AE" },
              ].map(({ label, val, color }) => (
                <div className="rpt-card-stat" key={label}>
                  <span className="rpt-card-stat-label">{label}</span>
                  <MiniBar value={val} max={totalTasks} color={color} />
                  <span className="rpt-card-stat-val">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* completion ring */}
          <div className="rpt-ring-card">
            <h4>Task Completion Rate</h4>
            <div className="rpt-ring">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionRate / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset .8s ease" }}
                />
              </svg>
              <div className="rpt-ring-label">
                {completionRate}%<span>done</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#888", textAlign: "center" }}>
              {completedTasks} of {totalTasks} tasks completed
            </div>
          </div>
        </div>

        {/* ── project table ── */}
        <div className="rpt-section">
          <div className="rpt-section-header">
            <h3>📁 Project Status Report</h3>
            <div className="rpt-filters">
              <input
                type="search"
                className="rpt-input"
                placeholder="Search projects..."
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setProjectPage(1);
                }}
              />
              <select
                className="rpt-input"
                value={projectStatus}
                onChange={(e) => {
                  setProjectStatus(e.target.value);
                  setProjectPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="rpt-export-row">
            <button
              className="rpt-export-btn"
              onClick={() => exportCSV(projects, "projects.csv")}
            >
              ⬇ Export CSV
            </button>
            <button
              className="rpt-export-btn"
              onClick={() =>
                exportPDF(projects, "projects.pdf", [
                  "Title",
                  "Department",
                  "Status",
                  "Created By",
                  "Date",
                ])
              }
            >
              ⬇ Export PDF
            </button>
          </div>

          <div className="rpt-table-wrap" style={{ marginTop: 14 }}>
            <table className="rpt-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="rpt-empty">
                      No projects found.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr key={project._id}>
                      <td style={{ fontWeight: 500 }}>{project.title}</td>
                      <td style={{ color: "#666" }}>{project.department}</td>
                      <td>
                        <span className={getStatusClass(project.status)}>
                          {project.status}
                        </span>
                      </td>
                      <td>{getCreatedBy(project)}</td>
                      <td style={{ color: "#888" }}>
                        {project.createdAt?.slice(0, 10)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="rpt-pagination">
            <button
              className="rpt-page-btn"
              onClick={() => setProjectPage(Math.max(projectPage - 1, 1))}
              disabled={projectPage === 1}
            >
              ‹
            </button>
            <span>Page {projectPage}</span>
            <button
              className="rpt-page-btn"
              onClick={() => setProjectPage(projectPage + 1)}
              disabled={filteredProjects.length < pageSize}
            >
              ›
            </button>
          </div>
        </div>

        {/* ── task table ── */}
        <div className="rpt-section">
          <div className="rpt-section-header">
            <h3>📋 Task Status Report</h3>
            <div className="rpt-filters">
              <input
                type="search"
                className="rpt-input"
                placeholder="Search tasks..."
                value={taskFilter}
                onChange={(e) => {
                  setTaskFilter(e.target.value);
                  setTaskPage(1);
                }}
              />
              <select
                className="rpt-input"
                value={taskStatusFilter}
                onChange={(e) => {
                  setTaskStatusFilter(e.target.value);
                  setTaskPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
              </select>
              <select
                className="rpt-input"
                value={taskPriorityFilter}
                onChange={(e) => {
                  setTaskPriorityFilter(e.target.value);
                  setTaskPage(1);
                }}
              >
                <option value="">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="rpt-export-row">
            <button
              className="rpt-export-btn"
              onClick={() => exportCSV(tasks, "tasks.csv")}
            >
              ⬇ Export CSV
            </button>
            <button
              className="rpt-export-btn"
              onClick={() =>
                exportPDF(tasks, "tasks.pdf", [
                  "Title",
                  "Priority",
                  "Status",
                  "Due Date",
                  "File",
                ])
              }
            >
              ⬇ Export PDF
            </button>
          </div>

          <div className="rpt-table-wrap" style={{ marginTop: 14 }}>
            <table className="rpt-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="rpt-empty">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task._id}>
                      <td style={{ fontWeight: 500 }}>{task.title}</td>
                      <td>
                        <div className="rpt-priority">
                          <span
                            className="rpt-priority-dot"
                            style={{
                              background:
                                task.priority === "High"
                                  ? "#F44336"
                                  : task.priority === "Medium"
                                    ? "#FF9800"
                                    : "#4CAF50",
                            }}
                          />
                          {task.priority}
                        </div>
                      </td>
                      <td>
                        <span className={getStatusClass(task.status)}>
                          {task.status}
                        </span>
                      </td>
                      <td style={{ color: "#888" }}>
                        {task.due || task.dueDate || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="rpt-pagination">
            <button
              className="rpt-page-btn"
              onClick={() => setTaskPage(Math.max(taskPage - 1, 1))}
              disabled={taskPage === 1}
            >
              ‹
            </button>
            <span>Page {taskPage}</span>
            <button
              className="rpt-page-btn"
              onClick={() => setTaskPage(taskPage + 1)}
              disabled={filteredTasks.length < pageSize}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
