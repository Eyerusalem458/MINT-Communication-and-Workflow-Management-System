import { useState, useMemo } from "react";
import Button from "../../components/ui/Button";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useProjects } from "../../context/ProjectContext";
import Pagination from "../../components/ui/Pagination";

const STATUS_STYLE = {
  Pending: { bg: "#fff3e0", color: "#e67e22" },
  Approved: { bg: "#e8f5e9", color: "#27ae60" },
  Rejected: { bg: "#fde8e8", color: "#c0392b" },
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

const MyProjects = () => {
  const { projects, addProject, editProject, cancelProject, loading } =
    useProjects();

  const [openModal, setOpenModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [busy, setBusy] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [form, setForm] = useState({ title: "", description: "", file: null });

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        const matchQ =
          p.title?.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase());
        const matchS = statusFilter === "" || p.status === statusFilter;
        return matchQ && matchS;
      }),
    [query, statusFilter, projects],
  );

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleNewProject = () => {
    setEditingProject(null);
    setForm({ title: "", description: "", file: null });
    setOpenModal(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description,
      file: project.file || null,
    });
    setOpenModal(true);
  };

  const handleFileChange = (e) => setForm({ ...form, file: e.target.files[0] });

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

  const handleCancel = async (id) => {
    try {
      await cancelProject(id);
      showSuccessToast("Project cancelled");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to cancel project");
    }
  };

  const totalProjects = projects.length;
  const pendingCount = projects.filter((p) => p.status === "Pending").length;
  const approvedCount = projects.filter((p) => p.status === "Approved").length;
  const rejectedCount = projects.filter((p) => p.status === "Rejected").length;

  return (
    <>
      <style>{`
        .mp-page { font-family: 'Segoe UI', sans-serif; box-sizing: border-box; }
        .mp-subtitle { margin: 0 0 20px; color: #555; font-size: 14px; }

        /* stats */
        .mp-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .mp-stat {
          background: #fff; border-radius: 10px; padding: 12px 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          display: flex; align-items: center; gap: 10px;
        }
        .mp-stat-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mp-stat-val { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .mp-stat-label { font-size: 12px; color: #666; }

        /* toolbar */
        .mp-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; align-items: center; }
        .mp-input {
          padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
          font-size: 13px; background: #f8f9fb; color: #333; outline: none;
          transition: border-color .2s;
        }
        .mp-input:focus { border-color: #90CAF9; background: #fff; }
        .mp-search { flex: 1; min-width: 180px; }
        .mp-btn-new {
          padding: 8px 16px; border-radius: 8px; border: none;
          background: #2196F3; color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background .15s; margin-left: auto;
        }
        .mp-btn-new:hover { background: #1976D2; }

        /* table */
        .mp-table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
        .mp-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .mp-table th {
          text-align: left; padding: 11px 14px;
          background: #f4f6f8; color: #555;
          font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px;
          border-bottom: 1px solid #e8eaed; white-space: nowrap;
        }
        .mp-table td { padding: 12px 14px; border-bottom: 1px solid #f0f2f5; color: #333; vertical-align: middle; }
        .mp-table tbody tr:hover { background: #f8f9fb; }
        .mp-table tbody tr:last-child td { border-bottom: none; }
        .mp-title { font-weight: 500; color: #1a1a2e; }
        .mp-desc { color: #666; font-size: 12px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .mp-comment { margin-top: 4px; font-size: 11px; color: #888; }
        .mp-actions { display: flex; gap: 6px; }
        .mp-action-btn {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid transparent; transition: all .15s;
        }
        .mp-action-btn--edit   { background: #e3f2fd; color: #1976D2; border-color: #90CAF9; }
        .mp-action-btn--edit:hover   { background: #1976D2; color: #fff; }
        .mp-action-btn--cancel { background: #fde8e8; color: #c0392b; border-color: #ef9a9a; }
        .mp-action-btn--cancel:hover { background: #c0392b; color: #fff; }
        .mp-empty { text-align: center; padding: 40px; color: #aaa; font-size: 13px; }

        /* modal */
        .mp-modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,.4);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .mp-modal {
          background: #fff; border-radius: 14px; padding: 24px;
          width: 90%; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,.18);
        }
        .mp-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .mp-modal-title  { margin: 0; font-size: 16px; font-weight: 700; color: #1a1a2e; }
        .mp-modal-close  { cursor: pointer; font-size: 18px; color: #aaa; line-height: 1; }
        .mp-modal-close:hover { color: #333; }
        .mp-form-group { margin-bottom: 14px; }
        .mp-form-label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 5px; }
        .mp-form-input {
          width: 100%; padding: 9px 12px; border: 1px solid #e0e0e0;
          border-radius: 8px; font-size: 13px; font-family: inherit;
          background: #f8f9fb; color: #333; outline: none; box-sizing: border-box;
          transition: border-color .2s;
        }
        .mp-form-input:focus { border-color: #90CAF9; background: #fff; }
        .mp-form-textarea { min-height: 80px; resize: vertical; }
        .mp-modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
      `}</style>

      <div className="mp-page">
        <p className="mp-subtitle">Submit and manage your project proposals.</p>

        {/* stats */}
        <div className="mp-stats">
          {[
            { label: "Total", val: totalProjects, color: "#2196F3" },
            { label: "Pending", val: pendingCount, color: "#FF9800" },
            { label: "Approved", val: approvedCount, color: "#4CAF50" },
            { label: "Rejected", val: rejectedCount, color: "#F44336" },
          ].map(({ label, val, color }) => (
            <div className="mp-stat" key={label}>
              <div className="mp-stat-dot" style={{ background: color }} />
              <div>
                <div className="mp-stat-val">{val}</div>
                <div className="mp-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* toolbar */}
        <div className="mp-toolbar">
          <input
            type="search"
            className="mp-input mp-search"
            placeholder="Search projects..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="mp-input"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Cancelled</option>
          </select>
          <div style={{ marginLeft: "auto" }}>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNewProject}
              style={{ padding: "7px 16px", fontSize: "13px" }}
            >
              + New Project
            </Button>
          </div>
        </div>

        {/* table */}
        <div className="mp-table-wrap">
          <table className="mp-table">
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
                  <td colSpan={6} className="mp-empty">
                    Loading...
                  </td>
                </tr>
              ) : paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="mp-empty">
                    No projects found.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((project) => (
                  <tr key={project._id}>
                    <td>
                      <span className="mp-title">{project.title}</span>
                    </td>
                    <td>
                      <span className="mp-desc">{project.description}</span>
                    </td>
                    <td style={{ color: "#666", fontSize: 12 }}>
                      {project.file ? (
                        typeof project.file === "string" ? (
                          project.file.split("/").pop()
                        ) : (
                          project.file.name
                        )
                      ) : (
                        <span style={{ color: "#bbb" }}>No file</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={project.status} />
                      {project.comment && (
                        <div className="mp-comment">💬 {project.comment}</div>
                      )}
                    </td>
                    <td style={{ color: "#888", whiteSpace: "nowrap" }}>
                      {project.createdAt?.slice(0, 10)}
                    </td>
                    <td>
                      <div className="mp-actions">
                        {project.status === "Pending" && (
                          <button
                            className="mp-action-btn mp-action-btn--edit"
                            onClick={() => handleEdit(project)}
                          >
                            Edit
                          </button>
                        )}
                        {["Pending", "Rejected"].includes(project.status) && (
                          <button
                            className="mp-action-btn mp-action-btn--cancel"
                            onClick={() => handleCancel(project._id)}
                          >
                            Cancel
                          </button>
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
      </div>

      {/* modal */}
      {openModal && (
        <div className="mp-modal-backdrop" onClick={() => setOpenModal(false)}>
          <div className="mp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3 className="mp-modal-title">
                {editingProject ? "✏️ Edit Project" : "➕ New Project"}
              </h3>
              <span
                className="mp-modal-close"
                onClick={() => setOpenModal(false)}
              >
                ✕
              </span>
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">Project Title *</label>
              <input
                className="mp-form-input"
                placeholder="Enter project title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">Description *</label>
              <textarea
                className="mp-form-input mp-form-textarea"
                placeholder="Describe your project..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="mp-form-group">
              <label className="mp-form-label">Upload File</label>
              <input
                type="file"
                className="mp-form-input"
                onChange={handleFileChange}
              />
            </div>
            <div className="mp-modal-footer">
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
    </>
  );
};

export default MyProjects;
