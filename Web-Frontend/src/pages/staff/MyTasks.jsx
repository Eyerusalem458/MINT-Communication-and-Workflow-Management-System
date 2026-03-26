import { useMemo, useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import { showSuccessToast } from "../../utils/toast";

const MyTasks = ({ tasks }) => {
  const [query, setQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const fallbackTasks = Array.from({ length: 26 }, (_, i) => ({
    id: i + 1,
    title: `Task ${i + 1}`,
    project: `Project ${((i % 4) + 1)}`,
    due: `2025-12-${((i % 20) + 1).toString().padStart(2, "0")}`,
    status: ["Pending", "In Progress", "Completed"][i % 3],
    description: `This is a description for Task ${i + 1}. It shows extended details in the popup.`,
  }));

  const renderedTasks = (tasks && tasks.length > 0) ? tasks : fallbackTasks;

  useEffect(() => {
    const handleScroll = () => {
      const tableWrapper = document.querySelector('.staff-table-wrapper');
      if (tableWrapper) {
        setShowScrollTop(tableWrapper.scrollTop > 200);
      }
    };

    const tableWrapper = document.querySelector('.staff-table-wrapper');
    if (tableWrapper) {
      tableWrapper.addEventListener('scroll', handleScroll);
      return () => tableWrapper.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const tableWrapper = document.querySelector('.staff-table-wrapper');
    if (tableWrapper) {
      tableWrapper.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredTasks = useMemo(() => {
    return renderedTasks.filter((task) =>
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.project.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, renderedTasks]);

  const openTask = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  const submitTask = (task) => {
    showSuccessToast(`Submitted work for ${task.title}`);
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <div>
          <h2>My Tasks</h2>
          <p className="staff-card-subtitle">
            View assigned tasks, upload work files, and update your progress.
          </p>
        </div>
        <div className="staff-header-actions">
          <Button variant="primary" onClick={() => showSuccessToast("New task created")}>New Task</Button>
          <Button variant="ghost" onClick={() => showSuccessToast("Message sent to manager")}>Message manager</Button>
        </div>
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

      <div className="staff-table-wrapper staff-table-scroll">
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
                <td>
                  <div className="staff-table-title" onClick={() => openTask(task)} style={{ cursor: "pointer" }}>{task.title}</div>
                </td>
                <td>{task.project}</td>
                <td>{task.due}</td>
                <td>
                  <select className="staff-select" defaultValue={task.status}>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </td>
                <td>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); }}>Upload</Button>
                </td>
                <td>
                  <div className="staff-table-actions">
                    <Button size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); showSuccessToast(`${task.title} marked completed`); }}>Mark completed</Button>
                    <Button size="xs" variant="primary" onClick={(e) => { e.stopPropagation(); submitTask(task); }}>Submit work</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showScrollTop && (
          <button className="staff-scroll-top" onClick={scrollToTop} title="Scroll to top">
            ↑
          </button>
        )}
      </div>

      {openModal && selectedTask && (
        <div className="staff-modal-backdrop" onClick={() => setOpenModal(false)}>
          <div className="staff-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedTask.title}</h3>
            <p><strong>Project:</strong> {selectedTask.project}</p>
            <p><strong>Due:</strong> {selectedTask.due}</p>
            <p><strong>Status:</strong> {selectedTask.status}</p>
            <p>{selectedTask.description || "No description available."}</p>
            <Button variant="primary" onClick={() => setOpenModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
