import { useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import { showSuccessToast } from "../../utils/toast";
import { useTasks } from "../../context/TaskContext";

const MyTasks = () => {
  const navigate = useNavigate();

  const { tasks, updateTaskStatus } = useTasks();
  const [files, setFiles] = useState({});
  const fileInputRefs = useRef({});

  const [query, setQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.project.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, tasks]);

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

  // ✅ STATUS BADGE
  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge pending";
      case "In Progress":
        return "status-badge in-progress";
      case "Approved":
        return "status-badge approved";
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
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td
                  className="staff-table-title"
                  onClick={() => openTask(task)}
                  style={{ cursor: "pointer" }}
                >
                  {task.title}
                </td>

                <td>{task.project}</td>
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
                      ref={(el) => (fileInputRefs.current[task.id] = el)}
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handleFileChange(task.id, e.target.files[0])
                      }
                    />

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleFileClick(task.id)}
                    >
                      📎 Choose File
                    </Button>

                    {files[task.id] && (
                      <div className="file-name">{files[task.id].name}</div>
                    )}
                  </div>
                </td>

                <td>
                  <div className="staff-table-actions">
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => {
                        updateTaskStatus(task.id, "In Progress");
                        showSuccessToast(`Submitted ${task.title}`);
                      }}
                    >
                      Submit work
                    </Button>

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        if (task.status !== "Approved") {
                          showSuccessToast("Task must be approved first");
                          return;
                        }

                        updateTaskStatus(task.id, "Completed");
                        showSuccessToast(`${task.title} marked completed`);
                      }}
                    >
                      Mark completed
                    </Button>

                    {task.status === "Rejected" && (
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => {
                          updateTaskStatus(task.id, "In Progress");
                          showSuccessToast(`Resubmitted ${task.title}`);
                        }}
                      >
                        Resubmit
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
