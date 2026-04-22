import { useState,useMemo } from "react";
import Button from "../../components/ui/Button";
import { showSuccessToast } from "../../utils/toast";
import { useProjects } from "../../context/ProjectContext";
import Pagination from "../../components/ui/Pagination";

const MyProjects = () => {
  const { projects, addProject, editProject, cancelProject } = useProjects();

  const [openModal, setOpenModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
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
  const filteredProjects = useMemo(() => {
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, projects]);

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
  const handleSubmit = () => {
    if (!form.title || !form.description) return;

    if (editingProject) {
      // EDIT
      editProject(editingProject.id, form);
      showSuccessToast("Project updated");
    } else {
      // CREATE
      addProject({
        id: Date.now(),
        ...form,
        createdBy: "Me",
        department: "Staff",
        status: "Pending",
        createdAt: new Date().toISOString(),
      });
      showSuccessToast("Project submitted");
    }

    setOpenModal(false);
  };

  // Cancel project
  const handleCancel = (id) => {
    cancelProject(id);
    showSuccessToast("Project cancelled");
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
      default:
        return "status-badge";
    }
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <Button variant="primary" onClick={handleNewProject}>
          New Project
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
            {paginatedProjects.map((project) => (
              <tr key={project.id}>
                <td>{project.title}</td>
                <td>{project.description}</td>
                <td>{project.file?.name || project.file || "No file"}</td>
                <td>
                  <span className={getStatusClass(project.status)}>
                    {project.status}
                  </span>
                </td>

                <td>{project.createdAt?.slice(0, 10)}</td>
                <td>
                  <div className="staff-table-actions">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => handleEdit(project)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleCancel(project.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
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

              <Button variant="primary" onClick={handleSubmit}>
                {editingProject ? "Update Project" : "Submit Project"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};;;

export default MyProjects;
