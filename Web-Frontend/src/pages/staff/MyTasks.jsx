import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useTasks } from "../../context/TaskContext";
import Pagination from "../../components/ui/Pagination";
import { updateTask } from "../../api/taskApi"; // ✅ add this back

const MyTasks = () => {
  const navigate = useNavigate();

  const { tasks, updateTaskStatus, fetchTasks } = useTasks();
  const [files, setFiles] = useState({});
  const [busy, setBusy] = useState({});
  const fileInputRefs = useRef({});

  const [query, setQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.title?.toLowerCase().includes(query.toLowerCase()) ||
          (t.project || "").toLowerCase().includes(query.toLowerCase()),
      ),
    [query, tasks],
  );

  const openTask = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  // handle file change
  const handleFileChange = (taskId, file) => {
    setFiles((prev) => ({
      ...prev,
      [taskId]: file,
    }));
  };

  // 🔥 trigger file input
  const handleFileClick = (taskId) => {
    fileInputRefs.current[taskId]?.click();
  };

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
      console.error("Submit error:", err.response?.data);
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

  // ✅ STATUS BADGE
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
          View assigned tasks, upload work files, and update your progress.
        </p>

        <Button
          variant="ghost"
          // onClick={() => showSuccessToast("Message sent to manager")}
          onClick={() => navigate("/staff/chat")}
        >
          Message manager
        </Button>
      </div>
      <div className="staff-search-wrapper">
        <input
          type="search"
          className="staff-input"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="staff-table-scroll">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Due</th>
              <th>Status</th>
              <th>Upload work file</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedTasks.map((task) => (
              <tr key={task._id}>
                <td
                  className="staff-table-title"
                  onClick={() => openTask(task)}
                  style={{ cursor: "pointer" }}
                >
                  {task.title}
                </td>

                <td>{task.project || "—"}</td>
                <td>{task.due}</td>

                {/* ✅ STATUS BADGE ONLY */}
                <td>
                  <span className={getStatusClass(task.status)}>
                    {task.status}
                  </span>

                  {/* 🔥 SHOW MANAGER COMMENT */}
                  {task.comment && (
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "12px",
                        color: "#555",
                      }}
                    >
                      💬 {task.comment}
                    </div>
                  )}
                </td>

                {/* 🔥 FILE UPLOAD FIXED */}
                <td>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[task._id] = el)}
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handleFileChange(task._id, e.target.files[0])
                      }
                    />

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleFileClick(task._id)}
                    >
                      📎 Choose File
                    </Button>

                    {files[task._id] && (
                      <div className="file-name">{files[task._id].name}</div>
                    )}
                  </div>
                </td>

                <td>
                  <div className="staff-table-actions">
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => handleSubmitWork(task)}
                      disabled={
                        busy[task._id] ||
                        task.status === "Completed" ||
                        task.status === "Approved"
                      }
                    >
                      {task.status === "Rejected" ? "Resubmit" : "Submit Work"}
                    </Button>

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleMarkCompleted(task)}
                      disabled={task.status !== "Approved"}
                    >
                      Mark Completed
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
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

      {openModal && selectedTask && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setOpenModal(false)}
        >
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedTask.title}</h3>

            <p>
              <strong>Project:</strong> {selectedTask.project}
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

            <p>{selectedTask.description || "No description available."}</p>

            {selectedTask.comment && (
              <p>
                💬 <strong>Manager comment:</strong> {selectedTask.comment}
              </p>
            )}

            <Button variant="primary" onClick={() => setOpenModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
