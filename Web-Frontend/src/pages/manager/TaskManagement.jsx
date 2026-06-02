import { useState, useMemo, useContext } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useTasks } from "../../context/TaskContext";
import { UserContext } from "../../context/UserContext";
import Pagination from "../../components/ui/Pagination";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/AuthContext";

const TaskManagement = () => {
  const { tasks, assignTask, updateTaskStatus, deleteTask } = useTasks();
  const { users, loading } = useContext(UserContext);
  const { user: currentUser } = useContext(AuthContext);

  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [taskToReject, setTaskToReject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [busy, setBusy] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    due: "",
    priority: "Medium",
    project: "",
  });

  const staffList = useMemo(
    () =>
      users.filter(
        (u) => u.role === "staff" && u.department === currentUser?.department,
      ),
    [users, currentUser],
  );

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchQ =
          task.title?.toLowerCase().includes(query.toLowerCase()) ||
          (task.assignedTo?.firstName || "")
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchS = statusFilter === "" || task.status === statusFilter;
        const matchP =
          priorityFilter === "" || task.priority === priorityFilter;
        return matchQ && matchS && matchP;
      }),
    [query, statusFilter, priorityFilter, tasks],
  );

  const openCreate = () => {
    setSelectedTask(null);
    setTaskForm({
      title: "",
      description: "",
      assignedTo: "",
      due: "",
      priority: "Medium",
      project: "",
    });
    setOpenModal(true);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title || !taskForm.assignedTo || !taskForm.due) {
      showErrorToast("Title, assignee, and due date are required.");
      return;
    }
    setBusy(true);
    try {
      await assignTask(taskForm);
      showSuccessToast("Task created and assigned!");
      setOpenModal(false);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to create task");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = (task) => {
    setTaskToReject(task);
    setRejectModal(true);
  };

  const submitRejection = async () => {
    if (!rejectComment) return;
    try {
      await updateTaskStatus(taskToReject._id, "Rejected", rejectComment);
      showSuccessToast("Task rejected");
      setRejectModal(false);
      setRejectComment("");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed");
    }
  };

  const handleApprove = async (taskId) => {
    try {
      await updateTaskStatus(taskId, "Approved");
      showSuccessToast("Task approved ✅");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed");
    }
  };

  const handleCancel = async (taskId) => {
    try {
      await updateTaskStatus(taskId, "Cancelled");
      showSuccessToast("Task cancelled");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed");
    }
  };

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const PRIORITY_COLOR = { High: "#F44336", Medium: "#FF9800", Low: "#4CAF50" };
  const STATUS_STYLE = {
    Pending: { bg: "#fff3e0", color: "#e67e22" },
    "In Progress": { bg: "#e3f2fd", color: "#1976D2" },
    Approved: { bg: "#e8f5e9", color: "#27ae60" },
    Rejected: { bg: "#fde8e8", color: "#c0392b" },
    Completed: { bg: "#e8f5e9", color: "#27ae60" },
    Cancelled: { bg: "#f5f5f5", color: "#888" },
  };

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

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;

  return (
    <>
      <style>{`
        .tm-page { padding: 0; font-family: 'Segoe UI', sans-serif; box-sizing: border-box; }
        .tm-subtitle { margin: 0 0 20px; color: #555; font-size: 14px; }

        /* ── stat pills ── */
        .tm-stats {
          display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .tm-stat {
          background: #fff; border-radius: 10px; padding: 12px 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          display: flex; align-items: center; gap: 10px; font-size: 13px;
        }
        .tm-stat-dot { width: 10px; height: 10px; border-radius: 50%; }
        .tm-stat-val { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .tm-stat-label { color: #666; font-size: 12px; }

        /* ── toolbar ── */
        .tm-toolbar {
          display: flex; align-items: center; gap: 10px;
          flex-wrap: wrap; margin-bottom: 16px;
        }
        .tm-input {
          padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
          font-size: 13px; background: #f8f9fb; color: #333; outline: none;
          transition: border-color .2s;
        }
        .tm-input:focus { border-color: #90CAF9; background: #fff; }
        .tm-search { flex: 1; min-width: 180px;  }
        .tm-btn-new {
          padding: 8px 16px; border-radius: 8px; border: none;
          background: #2196F3; color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background .15s; margin-left: auto;
        }
        .tm-btn-new:hover { background: #1976D2; }

        /* ── table ── */
        .tm-table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
        .tm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .tm-table th {
          text-align: left; padding: 11px 14px;
          background: #f4f6f8; color: #555;
          font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px;
          border-bottom: 1px solid #e8eaed; white-space: nowrap;
        }
        .tm-table td { padding: 12px 14px; border-bottom: 1px solid #f0f2f5; color: #333; vertical-align: middle; }
        .tm-table tbody tr:hover { background: #f8f9fb; }
        .tm-table tbody tr:last-child td { border-bottom: none; }
        .tm-task-title { font-weight: 500; color: #1976D2; cursor: pointer; }
        .tm-task-title:hover { text-decoration: underline; }
        .tm-priority { display: flex; align-items: center; gap: 6px; }
        .tm-priority-dot { width: 8px; height: 8px; border-radius: 50%; }
        .tm-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .tm-action-btn {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid transparent; transition: all .15s;
        }
        .tm-action-btn:disabled { opacity: .38; cursor: not-allowed; }
        .tm-action-btn--approve { background: #e8f5e9; color: #27ae60; border-color: #a5d6a7; }
        .tm-action-btn--approve:hover:not(:disabled) { background: #27ae60; color: #fff; }
        .tm-action-btn--reject { background: #fde8e8; color: #c0392b; border-color: #ef9a9a; }
        .tm-action-btn--reject:hover:not(:disabled) { background: #c0392b; color: #fff; }
        .tm-action-btn--cancel { background: #f5f5f5; color: #666; border-color: #e0e0e0; }
        .tm-action-btn--cancel:hover:not(:disabled) { background: #e0e0e0; color: #333; }
        .tm-file-link { color: #1976D2; font-size: 12px; text-decoration: none; }
        .tm-file-link:hover { text-decoration: underline; }
        .tm-empty { text-align: center; padding: 40px; color: #aaa; font-size: 13px; }

        /* ── modal detail ── */
        .tm-detail-row { display: flex; gap: 8px; margin-bottom: 10px; font-size: 13px; }
        .tm-detail-label { font-weight: 600; color: #444; min-width: 90px; }
        .tm-detail-val { color: #555; flex: 1; }
        .tm-textarea {
          width: 100%; min-height: 80px; padding: 10px 12px;
          border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px;
          font-family: inherit; resize: vertical; outline: none; box-sizing: border-box;
        }
        .tm-textarea:focus { border-color: #90CAF9; }
        .tm-modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
        .tm-form-group { margin-bottom: 14px; }
        .tm-form-group label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 5px; }
        .tm-select { width: 100%; }
      `}</style>

      <div className="tm-page">
        <p className="tm-subtitle">
          Create, assign, and monitor tasks for your team.
        </p>

        {/* ── stat pills ── */}
        <div className="tm-stats">
          {[
            { label: "Total", val: tasks.length, color: "#2196F3" },
            { label: "In Progress", val: inProgress, color: "#FF9800" },
            { label: "Pending", val: pending, color: "#90A4AE" },
            { label: "Completed", val: completed, color: "#4CAF50" },
          ].map(({ label, val, color }) => (
            <div className="tm-stat" key={label}>
              <div className="tm-stat-dot" style={{ background: color }} />
              <div>
                <div className="tm-stat-val">{val}</div>
                <div className="tm-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── toolbar ── */}
        <div className="tm-toolbar">
          <input
            type="search"
            className="tm-input tm-search"
            placeholder="Search tasks or staff..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="tm-input"
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
              "Cancelled",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="tm-input"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <div style={{ marginLeft: "auto" }}>
            <Button
              variant="primary"
              size="sm"
              onClick={openCreate}
              style={{ padding: "7px 16px", fontSize: "13px" }}
            >
              + New Task
            </Button>
          </div>
        </div>

        {/* ── table ── */}
        <div className="tm-table-wrap">
          <table className="tm-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Assigned To</th>
                <th>Due</th>
                <th>Priority</th>
                <th>Status</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="tm-empty">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task) => {
                  const isFinal = [
                    "Approved",
                    "Rejected",
                    "Cancelled",
                  ].includes(task.status);
                  const canAct = task.status === "In Progress";
                  const assignee = task.assignedTo;
                  const name = assignee?.firstName
                    ? `${assignee.firstName} ${assignee.lastName}`
                    : "—";
                  return (
                    <tr key={task._id}>
                      <td>
                        <span
                          className="tm-task-title"
                          onClick={() => {
                            setSelectedTask(task);
                            setOpenModal(true);
                          }}
                        >
                          {task.title}
                        </span>
                      </td>
                      <td>{name}</td>
                      <td style={{ color: "#888", whiteSpace: "nowrap" }}>
                        {task.due}
                      </td>
                      <td>
                        <div className="tm-priority">
                          <span
                            className="tm-priority-dot"
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
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: "#888" ,
                            }}
                          >
                            💬 {task.comment}
                          </div>
                        )}
                      </td>
                      <td>
                        {task.file ? (
                          <a
                            className="tm-file-link"
                            href={`http://localhost:5000${task.file}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            📎 View
                          </a>
                        ) : (
                          <span style={{ color: "#bbb" }}>—</span>
                        )}
                      </td>
                      <td>
                        <div className="tm-actions">
                          <button
                            className="tm-action-btn tm-action-btn--approve"
                            onClick={() => handleApprove(task._id)}
                            disabled={isFinal || !canAct}
                          >
                            Approve
                          </button>
                          <button
                            className="tm-action-btn tm-action-btn--reject"
                            onClick={() => handleReject(task)}
                            disabled={isFinal || !canAct}
                          >
                            Reject
                          </button>
                          <button
                            className="tm-action-btn tm-action-btn--cancel"
                            onClick={() => handleCancel(task._id)}
                            disabled={isFinal}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* ── create / view modal ── */}
      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>
            {selectedTask ? "Task Details" : "New Task"}
          </h3>
          {selectedTask ? (
            <>
              {[
                ["Title", selectedTask.title],
                ["Description", selectedTask.description || "—"],
                ["Due Date", selectedTask.due],
                ["Priority", selectedTask.priority],
              ].map(([label, val]) => (
                <div className="tm-detail-row" key={label}>
                  <span className="tm-detail-label">{label}</span>
                  <span className="tm-detail-val">{val}</span>
                </div>
              ))}
              <div className="tm-detail-row">
                <span className="tm-detail-label">Status</span>
                <span className="tm-detail-val">
                  <StatusBadge status={selectedTask.status} />
                </span>
              </div>
              {selectedTask.comment && (
                <div className="tm-detail-row">
                  <span className="tm-detail-label">Comment</span>
                  <span className="tm-detail-val">
                    💬 {selectedTask.comment}
                  </span>
                </div>
              )}
              {selectedTask.file && (
                <div className="tm-detail-row">
                  <span className="tm-detail-label">File</span>
                  <a
                    className="tm-file-link"
                    href={`http://localhost:5000${selectedTask.file}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📎 View File
                  </a>
                </div>
              )}
            </>
          ) : (
            <>
              {[
                { label: "Title", name: "title", type: "text" },
                { label: "Description", name: "description", type: "textarea" },
                { label: "Due Date", name: "due", type: "date" },
                { label: "Project", name: "project", type: "text" },
              ].map(({ label, name, type }) => (
                <div className="tm-form-group" key={name}>
                  <label>{label}</label>
                  {type === "textarea" ? (
                    <textarea
                      className="tm-textarea"
                      value={taskForm[name]}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, [name]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      type={type}
                      className="tm-input"
                      style={{ width: "100%", boxSizing: "border-box" }}
                      value={taskForm[name]}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, [name]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
              <div className="tm-form-group">
                <label>Assign To</label>
                <select
                  className="tm-input tm-select"
                  value={taskForm.assignedTo}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, assignedTo: e.target.value })
                  }
                >
                  <option value="">
                    {users.length === 0 ? "Loading staff..." : "Select Staff"}
                  </option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} — {s.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tm-form-group">
                <label>Priority</label>
                <select
                  className="tm-input tm-select"
                  value={taskForm.priority}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, priority: e.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </>
          )}
          <div className="tm-modal-footer">
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              {selectedTask ? "Close" : "Cancel"}
            </Button>
            {!selectedTask && (
              <Button
                variant="primary"
                onClick={handleSaveTask}
                disabled={busy}
              >
                {busy ? "Creating..." : "Create Task"}
              </Button>
            )}
          </div>
        </Modal>
      )}

      {/* ── reject modal ── */}
      {rejectModal && (
        <Modal onClose={() => setRejectModal(false)}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Reject Task</h3>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 10px" }}>
            Describe what needs to be fixed:
          </p>
          <textarea
            className="tm-textarea"
            placeholder="Write your feedback..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />
          <div className="tm-modal-footer">
            <Button variant="ghost" onClick={() => setRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="reject" onClick={submitRejection}>
              Submit Rejection
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TaskManagement;
