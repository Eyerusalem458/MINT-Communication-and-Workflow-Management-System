import { useState, useMemo } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { useTasks } from "../../context/TaskContext";

const staffMembers = ["John Doe", "Sara Ali", "Jane Smith"]; // example staff

const TaskManagement = () => {
  const { tasks, updateTaskStatus } = useTasks();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form state for creating or editing tasks
  const [taskForm, setTaskForm] = useState({
    id: null,
    title: "",
    description: "",
    assignedTo: "",
    due: "",
    priority: "Medium",
    status: "Pending",
  });

  const [query, setQuery] = useState("");

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, tasks]);

  // Open modal to create or edit task
  const openTaskModal = (task = null) => {
    if (task) {
      setTaskForm({ ...task });
      setSelectedTask(task);
    } else {
      setTaskForm({
        id: null,
        title: "",
        description: "",
        assignedTo: "",
        due: "",
        priority: "Medium",
        status: "Pending",
      });
      setSelectedTask(null);
    }
    setOpenModal(true);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save or update task
  const handleSaveTask = () => {
    if (!taskForm.title || !taskForm.assignedTo || !taskForm.due) return;

    if (taskForm.id) {
      // Update existing task
      updateTaskStatus(taskForm.id, taskForm.status, taskForm.description);
    } else {
      // Create new task
      const newTask = {
        ...taskForm,
        id: tasks.length + 1,
        completedAt: null,
      };
      tasks.push(newTask); // For simplicity using array push
    }

    setOpenModal(false);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge pending";
      case "In Progress":
        return "status-badge in-progress";
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
        <Button variant="primary" onClick={() => openTaskModal()}>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td
                  className="staff-table-title"
                  style={{ cursor: "pointer" }}
                  onClick={() => openTaskModal(task)}
                >
                  {task.title}
                </td>
                <td>{task.assignedTo}</td>
                <td>{task.due}</td>
                <td>{task.priority}</td>
                <td>
                  <span className={getStatusClass(task.status)}>
                    {task.status}
                  </span>
                </td>
                <td>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => openTaskModal(task)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() =>
                      updateTaskStatus(task.id, "Cancelled", task.description)
                    }
                  >
                    Cancel
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>
          <h3>{selectedTask ? "Edit Task" : "New Task"}</h3>

          <div className="staff-form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              className="staff-input"
              value={taskForm.title}
              onChange={handleChange}
            />
          </div>

          <div className="staff-form-group">
            <label>Description</label>
            <textarea
              name="description"
              className="staff-input"
              value={taskForm.description}
              onChange={handleChange}
            />
          </div>

          <div className="staff-form-group">
            <label>Assign To</label>
            <select
              name="assignedTo"
              className="staff-input"
              value={taskForm.assignedTo}
              onChange={handleChange}
            >
              <option value="">Select Staff</option>
              {staffMembers.map((staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
            </select>
          </div>

          <div className="staff-form-group">
            <label>Deadline</label>
            <input
              type="date"
              name="due"
              className="staff-input"
              value={taskForm.due}
              onChange={handleChange}
            />
          </div>

          <div className="staff-form-group">
            <label>Priority</label>
            <select
              name="priority"
              className="staff-input"
              value={taskForm.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="staff-form-group">
            <label>Status</label>
            <select
              name="status"
              className="staff-input"
              value={taskForm.status}
              onChange={handleChange}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="staff-modal-footer">
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveTask}>
              {selectedTask ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TaskManagement;