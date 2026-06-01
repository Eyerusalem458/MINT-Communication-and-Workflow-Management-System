import { useState, useMemo } from "react";
import Button from "../../components/ui/Button";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useProjects } from "../../context/ProjectContext";
import Pagination from "../../components/ui/Pagination";

const MyProjects = () => {
  const { projects, addProject, editProject, cancelProject, loading } =
    useProjects();

  const [openModal, setOpenModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [busy, setBusy] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    title: "",
    description: "",
    file: null,
  });

  // 🔥 SEARCH STATE
  const [query, setQuery] = useState("");

  // 🔥 FILTERED PROJECTS
  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.title?.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, projects],
  );

  // Open create modal
  const handleNewProject = () => {
    setEditingProject(null);
    setForm({ title: "", description: "", file: null });
    setOpenModal(true);
  };

  // Open edit modal
  const handleEdit = (project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description,
      file: project.file || null,
    });
    setOpenModal(true);
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, file: file });
  };

  // Save / Update project
  const handleSubmit = async () => {
    if (!form.title || !form.description) return;
    setBusy(true);

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      if (form.file) fd.append("file", form.file);

      if (editingProject) {
        await editProject(editingProject._id, fd);
        showSuccessToast("Project updated");
      } else {
        await addProject(fd);
        showSuccessToast("Project submitted");
      }
      setOpenModal(false);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to save project");
    } finally {
      setBusy(false);
    }
  };

  // Cancel project
  const handleCancel = async (id) => {
    try {
      await cancelProject(id);
      showSuccessToast("Project cancelled");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to cancel project");
    }
  };

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-badge pending";
      case "Approved":
        return "status-badge approved";
      case "Rejected":
        return "status-badge rejected";
      case "Cancelled":
        return "status-badge pending";
      default:
        return "status-badge";
    }
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <p className="staff-card-subtitle">
          Submit and manage your project proposals.
        </p>
        <Button variant="primary" onClick={handleNewProject}>
          + New Project
        </Button>
      </div>

      {/* 🔥 SEARCH BAR */}
      <div className="staff-search-wrapper">
        <input
          type="search"
          className="staff-input"
          placeholder="Search projects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="staff-table-scroll">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>File</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : paginatedProjects.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No projects found
                </td>
              </tr>
            ) : (
              paginatedProjects.map((project) => (
                <tr key={project._id}>
                  <td>{project.title}</td>
                  <td>{project.description}</td>
                  <td>
                    {project.file
                      ? typeof project.file === "string"
                        ? project.file.split("/").pop()
                        : project.file.name
                      : "No file"}
                  </td>
                  <td>
                    <span className={getStatusClass(project.status)}>
                      {project.status}
                    </span>
                    {/* show rejection comment below status badge */}
                    {project.comment && (
                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "12px",
                          color: "#555",
                        }}
                      >
                        💬 {project.comment}
                      </div>
                    )}
                  </td>
                  <td>{project.createdAt?.slice(0, 10)}</td>
                  <td>
                    <div className="staff-table-actions">
                      {project.status === "Pending" && (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </Button>
                      )}
                      {["Pending", "Rejected"].includes(project.status) && (
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() => handleCancel(project._id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredProjects.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
      />

      {/* MODAL */}
      {openModal && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="staff-modal staff-modal--clean"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="staff-modal-header">
              <h3>{editingProject ? "✏️ Edit Project" : "➕ New Project"}</h3>
              <span
                className="staff-modal-close"
                onClick={() => setOpenModal(false)}
              >
                ✕
              </span>
            </div>

            {/* FORM */}
            <div className="staff-modal-body">
              <div className="staff-form-group">
                <label>Project Title</label>
                <input
                  className="staff-input"
                  placeholder="Enter project title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="staff-form-group">
                <label>Description</label>
                <textarea
                  className="staff-input"
                  placeholder="Describe your project..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="staff-form-group">
                <label>Upload File</label>
                <input
                  type="file"
                  className="staff-input"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="staff-modal-footer">
              <Button variant="ghost" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>

              <Button variant="primary" onClick={handleSubmit} disabled={busy}>
                {busy
                  ? "Saving..."
                  : editingProject
                    ? "Update Project"
                    : "Submit Project"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;
