const MyTasks = ({ tasks }) => {
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
          <button className="staff-btn staff-btn--primary">New Task</button>
          <button className="staff-btn staff-btn--ghost">Message manager</button>
        </div>
      </div>

      <div className="staff-table-wrapper">
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
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <div className="staff-table-title">{task.title}</div>
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
                  <label className="staff-upload">
                    <input type="file" className="staff-upload-input" />
                    <span>Choose file</span>
                  </label>
                </td>
                <td>
                  <div className="staff-table-actions">
                    <button className="staff-btn staff-btn--ghost staff-btn--xs">
                      Mark completed
                    </button>
                    <button className="staff-btn staff-btn--primary staff-btn--xs">
                      Submit work
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTasks;
