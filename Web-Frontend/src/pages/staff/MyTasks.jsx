import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useTasks } from "../../context/TaskContext";
import Pagination from "../../components/ui/Pagination";
import { updateTask } from "../../api/taskApi";

const STATUS_STYLE = {
  Pending: { bg: "#fff3e0", color: "#e67e22" },
  "In Progress": { bg: "#e3f2fd", color: "#1976D2" },
  Approved: { bg: "#e8f5e9", color: "#27ae60" },
  Rejected: { bg: "#fde8e8", color: "#c0392b" },
  Completed: { bg: "#e8f5e9", color: "#27ae60" },
};

const PRIORITY_COLOR = { High: "#F44336", Medium: "#FF9800", Low: "#4CAF50" };

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || { bg: "#f0f0f0", color: "#888" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
};

const MyTasks = () => {
  const navigate = useNavigate();
  const { tasks, updateTaskStatus, fetchTasks } = useTasks();
  const [files, setFiles] = useState({});
  const [busy, setBusy] = useState({});
  const fileInputRefs = useRef({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const matchQ =
          t.title?.toLowerCase().includes(query.toLowerCase()) ||
          (t.project || "").toLowerCase().includes(query.toLowerCase());
        const matchS = statusFilter === "" || t.status === statusFilter;
        return matchQ && matchS;
      }),
    [query, statusFilter, tasks],
  );

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleFileChange = (taskId, file) =>
    setFiles((p) => ({ ...p, [taskId]: file }));
  const handleFileClick = (taskId) => fileInputRefs.current[taskId]?.click();

  const handleSubmitWork = async (task) => {
    setBusy((p) => ({ ...p, [task._id]: true }));
    try {
      const fd = new FormData();
      fd.append("status", "In Progress");
      if (files[task._id]) fd.append("file", files[task._id]);
      await updateTask(task._id, fd);
      await fetchTasks();
      showSuccessToast(
        task.status === "Rejected"
          ? `Resubmitted "${task.title}"`
          : `Submitted "${task.title}"`,
      );
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Submission failed");
    } finally {
      setBusy((p) => ({ ...p, [task._id]: false }));
    }
  };

  const handleMarkCompleted = async (task) => {
    if (task.status !== "Approved") {
      showErrorToast("Task must be approved by manager first");
      return;
    }
    try {
      await updateTaskStatus(task._id, "Completed");
      showSuccessToast(`"${task.title}" marked as completed`);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed");
    }
  };

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;
  const rejected = tasks.filter((t) => t.status === "Rejected").length;

  return (
    <>
      <style>{`
        .mt-page { font-family: 'Segoe UI', sans-serif; box-sizing: border-box; }
        .mt-subtitle { margin: 0 0 20px; color: #555; font-size: 14px; }

        /* stat pills */
        .mt-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .mt-stat {
          background: #fff; border-radius: 10px; padding: 12px 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          display: flex; align-items: center; gap: 10px;
        }
        .mt-stat-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mt-stat-val { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .mt-stat-label { font-size: 12px; color: #666; }

        /* toolbar */
        .mt-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .mt-input {
          padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
          font-size: 13px; background: #f8f9fb; color: #333; outline: none;
          transition: border-color .2s;
        }
        .mt-input:focus { border-color: #90CAF9; background: #fff; }
        .mt-search { flex: 1; min-width: 180px; }

        /* table */
        .mt-table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
        .mt-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .mt-table th {
          text-align: left; padding: 11px 14px;
          background: #f4f6f8; color: #555;
          font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px;
          border-bottom: 1px solid #e8eaed; white-space: nowrap;
        }
        .mt-table td { padding: 12px 14px; border-bottom: 1px solid #f0f2f5; color: #333; vertical-align: middle; }
        .mt-table tbody tr:hover { background: #f8f9fb; }
        .mt-table tbody tr:last-child td { border-bottom: none; }
        .mt-task-title { font-weight: 500; color: #1976D2; cursor: pointer; }
        .mt-task-title:hover { text-decoration: underline; }
        .mt-comment { margin-top: 4px; font-size: 11px; color: #888; }
        .mt-file-wrap { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .mt-file-name { font-size: 11px; color: #888; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mt-file-btn {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid #e0e0e0; background: #f8f9fb; color: #555;
          transition: all .15s;
        }
        .mt-file-btn:hover { background: #e3f2fd; border-color: #90CAF9; color: #1976D2; }
        .mt-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .mt-action-btn {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid transparent; transition: all .15s;
        }
        .mt-action-btn:disabled { opacity: .38; cursor: not-allowed; }
        .mt-action-btn--submit   { background: #e3f2fd; color: #1976D2; border-color: #90CAF9; }
        .mt-action-btn--submit:hover:not(:disabled)   { background: #1976D2; color: #fff; }
        .mt-action-btn--complete { background: #e8f5e9; color: #27ae60; border-color: #a5d6a7; }
        .mt-action-btn--complete:hover:not(:disabled) { background: #27ae60; color: #fff; }
        .mt-empty { text-align: center; padding: 40px; color: #aaa; font-size: 13px; }

        /* detail modal */
        .mt-detail-row { display: flex; gap: 8px; margin-bottom: 10px; font-size: 13px; }
        .mt-detail-label { font-weight: 600; color: #444; min-width: 90px; }
        .mt-detail-val { color: #555; flex: 1; }
        .mt-modal-footer { display: flex; justify-content: flex-end; margin-top: 16px; }

        .mt-priority { display: flex; align-items: center; gap: 6px; }
        .mt-priority-dot { width: 8px; height: 8px; border-radius: 50%; }
      `}</style>

      <div className="mt-page">
        <p className="mt-subtitle">
          View assigned tasks, upload work files, and update your progress.
        </p>

        {/* stat pills */}
        <div className="mt-stats">
          {[
            { label: "Total", val: tasks.length, color: "#2196F3" },
            { label: "In Progress", val: inProgress, color: "#FF9800" },
            { label: "Pending", val: pending, color: "#90A4AE" },
            { label: "Completed", val: completed, color: "#4CAF50" },
            { label: "Rejected", val: rejected, color: "#F44336" },
          ].map(({ label, val, color }) => (
            <div className="mt-stat" key={label}>
              <div className="mt-stat-dot" style={{ background: color }} />
              <div>
                <div className="mt-stat-val">{val}</div>
                <div className="mt-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* toolbar */}
        <div className="mt-toolbar">
          <input
            type="search"
            className="mt-input mt-search"
            placeholder="Search tasks or project..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="mt-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {[
              "Pending",
              "In Progress",
              "Approved",
              "Rejected",
              "Completed",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* table */}
        <div className="mt-table-wrap">
          <table className="mt-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Due</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Upload File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="mt-empty">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <span
                        className="mt-task-title"
                        onClick={() => {
                          setSelectedTask(task);
                          setOpenModal(true);
                        }}
                      >
                        {task.title}
                      </span>
                    </td>
                    <td style={{ color: "#666" }}>{task.project || "—"}</td>
                    <td style={{ color: "#888", whiteSpace: "nowrap" }}>
                      {task.due}
                    </td>
                    <td>
                      <div className="mt-priority">
                        <span
                          className="mt-priority-dot"
                          style={{
                            background:
                              PRIORITY_COLOR[task.priority] || "#90A4AE",
                          }}
                        />
                        {task.priority}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                      {task.comment && (
                        <div className="mt-comment">💬 {task.comment}</div>
                      )}
                    </td>
                    <td>
                      <div className="mt-file-wrap">
                        <input
                          type="file"
                          ref={(el) => (fileInputRefs.current[task._id] = el)}
                          style={{ display: "none" }}
                          onChange={(e) =>
                            handleFileChange(task._id, e.target.files[0])
                          }
                        />
                        <button
                          className="mt-file-btn"
                          onClick={() => handleFileClick(task._id)}
                        >
                          📎 Choose
                        </button>
                        {files[task._id] && (
                          <span className="mt-file-name">
                            {files[task._id].name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="mt-actions">
                        <button
                          className="mt-action-btn mt-action-btn--submit"
                          onClick={() => handleSubmitWork(task)}
                          disabled={
                            busy[task._id] ||
                            task.status === "Completed" ||
                            task.status === "Approved"
                          }
                        >
                          {busy[task._id]
                            ? "..."
                            : task.status === "Rejected"
                              ? "Resubmit"
                              : "Submit"}
                        </button>
                        <button
                          className="mt-action-btn mt-action-btn--complete"
                          onClick={() => handleMarkCompleted(task)}
                          disabled={task.status !== "Approved"}
                        >
                          ✓ Done
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={filteredTasks.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* detail modal */}
      {openModal && selectedTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setOpenModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: 24,
              width: "90%",
              maxWidth: 460,
              boxShadow: "0 8px 32px rgba(0,0,0,.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 16, color: "#1a1a2e" }}>
              {selectedTask.title}
            </h3>
            {[
              ["Project", selectedTask.project || "—"],
              ["Due Date", selectedTask.due],
              ["Priority", selectedTask.priority],
              [
                "Description",
                selectedTask.description || "No description available.",
              ],
            ].map(([label, val]) => (
              <div className="mt-detail-row" key={label}>
                <span className="mt-detail-label">{label}</span>
                <span className="mt-detail-val">{val}</span>
              </div>
            ))}
            <div className="mt-detail-row">
              <span className="mt-detail-label">Status</span>
              <span className="mt-detail-val">
                <StatusBadge status={selectedTask.status} />
              </span>
            </div>
            {selectedTask.comment && (
              <div className="mt-detail-row">
                <span className="mt-detail-label">Comment</span>
                <span className="mt-detail-val">💬 {selectedTask.comment}</span>
              </div>
            )}
            <div className="mt-modal-footer">
              <Button variant="primary" onClick={() => setOpenModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyTasks;
