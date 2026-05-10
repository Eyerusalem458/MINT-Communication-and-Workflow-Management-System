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
  // const staffList = users;
  const { user: currentUser } = useContext(AuthContext);

  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [taskToReject, setTaskToReject] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  // Form state for creating or editing tasks
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    due: "",
    priority: "Medium",
    project: "",
  });

  // ✅ only staff in the same department as the logged-in manager
  const staffList = useMemo(
    () =>
      users.filter(
        (u) => u.role === "staff" && u.department === currentUser?.department,
      ),
    [users, currentUser],
  );

  // Filter tasks based on search query
  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.title?.toLowerCase().includes(query.toLowerCase()) ||
          (task.assignedTo?.firstName || " ")
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [query, tasks],
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

  // Save or update task
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge pending";
      case "In Progress":
        return "status-badge in-progress";
      case "Approved":
        return "status-badge approved";
      case "Rejected":
        return "status-badge rejected";
      case "Completed":
        return "status-badge completed";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <p className="staff-card-subtitle">
          Create, assign, and monitor tasks for your team.
        </p>
        <Button variant="primary" onClick={openCreate}>
          + New Task
        </Button>
      </div>

      <div className="staff-search-wrapper">
        <input
          type="search"
          className="staff-input"
          placeholder="Search tasks or staff..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="staff-table-scroll">
        <table className="staff-table">
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
            {paginatedTasks.map((task) => {
              const isFinal = ["Approved", "Rejected", "Cancelled"].includes(
                task.status,
              );
              const canAct = task.status === "In Progress";
              const assignee = task.assignedTo;
              const name = assignee?.firstName
                ? `${assignee.firstName} ${assignee.lastName}`
                : "—";

              return (
                <tr key={task._id}>
                  <td
                    className="staff-table-title"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedTask(task);
                      setOpenModal(true);
                    }}
                  >
                    {task.title}
                  </td>
                  <td>{name}</td>
                  <td>{task.due}</td>
                  <td>{task.priority}</td>
                  <td>
                    <span className={getStatusClass(task.status)}>
                      {task.status}
                    </span>
                  </td>

                  <td>
                    {task.file ? (
                      <a
                        href={`http://localhost:5000${task.file}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📎 View File
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div className="staff-table-actions">
                      <Button
                        size="xs"
                        variant="approve"
                        onClick={() => handleApprove(task._id)}
                        disabled={isFinal || !canAct}
                      >
                        Approve
                      </Button>

                      <Button
                        size="xs"
                        variant="reject"
                        onClick={() => handleReject(task)}
                        disabled={isFinal || !canAct}
                      >
                        Reject
                      </Button>

                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleCancel(task._id)}
                        disabled={isFinal}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
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
          setCurrentPage(1); // reset page
        }}
      />

      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>
          <h3>{selectedTask ? "Task Details" : "New Task"}</h3>
          {!selectedTask && (
            <>
              {[
                { label: "Title", name: "title", type: "text" },
                { label: "Description", name: "description", type: "textarea" },
                { label: "Due Date", name: "due", type: "date" },
              ].map(({ label, name, type }) => (
                <div className="staff-form-group" key={name}>
                  <label>{label}</label>
                  {type === "textarea" ? (
                    <textarea
                      name={name}
                      className="staff-input"
                      value={taskForm[name]}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, [name]: e.target.value })
                      }
                    />
                  ) : (
                    <input
                      type={type}
                      name={name}
                      className="staff-input"
                      value={taskForm[name]}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, [name]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}

              <div className="staff-form-group">
                <label>Project</label>
                <input
                  type="text"
                  name="project"
                  className="staff-input"
                  value={taskForm.project}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, project: e.target.value })
                  }
                />
              </div>

              <div className="staff-form-group">
                <label>Assign To</label>
                <select
                  name="assignedTo"
                  className="staff-input"
                  value={taskForm.assignedTo}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, assignedTo: e.target.value })
                  }
                >
                  <option value="">
                    {" "}
                    {users.length === 0 ? "Loading staff..." : "Select Staff"}
                  </option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} — {s.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="staff-form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  className="staff-input"
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
          {selectedTask && (
            <>
              <p>
                <strong>Title:</strong> {selectedTask.title}
              </p>
              <p>
                <strong>Description:</strong> {selectedTask.description || "—"}
              </p>
              <p>
                <strong>Due:</strong> {selectedTask.due}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusClass(selectedTask.status)}>
                  {selectedTask.status}
                </span>
              </p>
              {selectedTask.comment && (
                <p>
                  💬 <strong>Comment:</strong> {selectedTask.comment}
                </p>
              )}

              {selectedTask.file && (
                <p>
                  📎 <strong>Submitted File:</strong>{" "}
                  <a
                    href={`http://localhost:5000${selectedTask.file}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View File
                  </a>
                </p>
              )}
            </>
          )}

          <div className="staff-modal-footer">
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

      {rejectModal && (
        <Modal onClose={() => setRejectModal(false)}>
          <h3>Reject Task</h3>

          <textarea
            className="staff-input"
            placeholder="Write what should be fixed..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />

          <div className="staff-modal-footer">
            <Button variant="ghost" onClick={() => setRejectModal(false)}>
              Cancel
            </Button>

            <Button variant="reject" onClick={submitRejection}>
              Submit Rejection
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};;
export default TaskManagement;
