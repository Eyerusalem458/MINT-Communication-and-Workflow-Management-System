import { useState, useMemo } from "react";
import { useTasks } from "../../context/TaskContext";
import { useProjects } from "../../context/ProjectContext";
import Button from "../../components/ui/Button";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Reports = () => {
  const { tasks } = useTasks();
  const { projects } = useProjects();

  const [projectPage, setProjectPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);
  const pageSize = 5;

  const [projectFilter, setProjectFilter] = useState("");
  const [taskFilter, setTaskFilter] = useState("");
  const [projectDepartment, setProjectDepartment] = useState("");
  const [projectStatus, setProjectStatus] = useState("");

  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("");

  // PROJECT STATS
  const totalProjects = projects.length;
  const approvedProjects = projects.filter(
    (p) => p.status === "Approved",
  ).length;
  const pendingProjects = projects.filter((p) => p.status === "Pending").length;
  const rejectedProjects = projects.filter(
    (p) => p.status === "Rejected",
  ).length;

  // TASK STATS
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "In Progress",
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge pending";
      case "Approved":
        return "status-badge approved";
      case "Rejected":
        return "status-badge rejected";
      case "In Progress":
        return "status-badge in-progress";
      case "Completed":
        return "status-badge completed";
      default:
        return "status-badge";
    }
  };

  // FILTERED & PAGINATED DATA
 const filteredProjects = useMemo(() => {
   return projects
     .filter((p) => {
       const matchesSearch = p.title
         .toLowerCase()
         .includes(projectFilter.toLowerCase());

       const matchesDepartment =
         projectDepartment === "" || p.department === projectDepartment;

       const matchesStatus = projectStatus === "" || p.status === projectStatus;

       return matchesSearch && matchesDepartment && matchesStatus;
     })
     .slice((projectPage - 1) * pageSize, projectPage * pageSize);
 }, [projects, projectFilter, projectDepartment, projectStatus, projectPage]);

 const filteredTasks = useMemo(() => {
   return tasks
     .filter((t) => {
       const matchesSearch = t.title
         .toLowerCase()
         .includes(taskFilter.toLowerCase());

       const matchesStatus =
         taskStatusFilter === "" || t.status === taskStatusFilter;

       const matchesPriority =
         taskPriorityFilter === "" || t.priority === taskPriorityFilter;

       return matchesSearch && matchesStatus && matchesPriority;
     })
     .slice((taskPage - 1) * pageSize, taskPage * pageSize);
 }, [tasks, taskFilter, taskStatusFilter, taskPriorityFilter, taskPage]);

  // EXPORT FUNCTIONS
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
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  // FIXED PDF EXPORT
  const exportPDF = (data, filename, columns) => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(10);

    // Map data to match columns
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

    doc.autoTable({
      head: [columns],
      body,
      startY: 20,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(filename);
  };

  return (
    <div className="manager-card manager-card--full">
      {/* HEADER */}
      <div className="manager-card-header">
        <p>System analytics and performance overview</p>
      </div>

      {/* COLORFUL CARDS */}
      <div className="staff-grid staff-grid--cols-3">
        <div
          className="staff-card staff-card--metric card-approved"
          style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}
        >
          <div className="staff-card-label">Total Projects</div>
          <div className="staff-card-value">{totalProjects}</div>
          <div className="staff-card-subtitle">
            Approved: {approvedProjects} | Pending: {pendingProjects} |
            Rejected: {rejectedProjects}
          </div>
        </div>

        <div
          className="staff-card staff-card--metric card-inprogress"
          style={{ background: "linear-gradient(135deg, #e0f2fe, #bae6fd)" }}
        >
          <div className="staff-card-label">Total Tasks</div>
          <div className="staff-card-value">{totalTasks}</div>
          <div className="staff-card-subtitle">
            Completed: {completedTasks} | In Progress: {inProgressTasks} |
            Pending: {pendingTasks}
          </div>
        </div>

        <div
          className="staff-card staff-card--metric card-completed"
          style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)" }}
        >
          <div className="staff-card-label">Completion Rate</div>
          <div className="staff-card-value">
            {totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </div>
          <div className="staff-card-subtitle">Task completion performance</div>
        </div>
      </div>

      {/* PROJECT TABLE */}
      <div className="staff-card staff-card--full">
        <div className="staff-card-header">
          <h3>Project Status Report</h3>
          <div
            className="staff-search-wrapper"
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="search"
              className="staff-input"
              placeholder="Search projects..."
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            />

            <select
              className="staff-input"
              value={projectDepartment}
              onChange={(e) => setProjectDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>

            <select
              className="staff-input"
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div style={{ marginTop: "5px" }}>
            <Button onClick={() => exportCSV(projects, "projects.csv")}>
              Export CSV
            </Button>
            <Button
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
              Export PDF
            </Button>
          </div>
        </div>

        <div className="staff-table-scroll">
          <table className="staff-table">
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
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.department}</td>
                  <td>
                    <span className={getStatusClass(project.status)}>
                      {project.status}
                    </span>
                  </td>
                  <td>{project.createdBy}</td>
                  <td>{project.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ marginTop: "10px" }}>
          <Button onClick={() => setProjectPage(Math.max(projectPage - 1, 1))}>
            &lt;&lt;
          </Button>
          <span style={{ margin: "0 10px" }}>Page {projectPage}</span>
          <Button onClick={() => setProjectPage(projectPage + 1)}>
            &gt;&gt;
          </Button>
        </div>
      </div>

      {/* TASK TABLE */}
      <div className="staff-card staff-card--full">
        <div className="staff-card-header">
          <h3>Task Status Report</h3>
          <div
            className="staff-search-wrapper"
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="search"
              className="staff-input"
              placeholder="Search tasks..."
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
            />

            <select
              className="staff-input"
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              className="staff-input"
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
            >
              <option value="">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div style={{ marginTop: "5px" }}>
            <Button onClick={() => exportCSV(tasks, "tasks.csv")}>
              Export CSV
            </Button>
            <Button
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
              Export PDF
            </Button>
          </div>
        </div>

        <div className="staff-table-scroll">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.priority}</td>
                  <td>
                    <span className={getStatusClass(task.status)}>
                      {task.status}
                    </span>
                  </td>
                  <td>{task.due || task.dueDate || "N/A"}</td>
                  <td>{task.file ? JSON.stringify(task.file) : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ marginTop: "10px" }}>
          <Button onClick={() => setTaskPage(Math.max(taskPage - 1, 1))}>
            &lt;&lt;
          </Button>
          <span style={{ margin: "0 10px" }}>Page {taskPage}</span>
          <Button onClick={() => setTaskPage(taskPage + 1)}>&gt;&gt;</Button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
