import { useState } from "react";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useProjects } from "../../context/ProjectContext";

const STATUS_STYLE = {
  Pending: { bg: "#fff3e0", color: "#e67e22" },
  Approved: { bg: "#e8f5e9", color: "#27ae60" },
  Rejected: { bg: "#fde8e8", color: "#c0392b" },
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

const ProjectRequest = () => {
  const { projects, approveProject, rejectProject, loading } = useProjects();

  const [selectedProject, setSelectedProject] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const handleApprove = async (id) => {
    setBusy(true);
    try {
      await approveProject(id);
      showSuccessToast("Project approved ✅");
      setOpenModal(false);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to approve");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = (project) => {
    setSelectedProject(project);
    setRejectComment("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedProject) return;
    setBusy(true);
    try {
      await rejectProject(selectedProject._id, rejectComment);
      showSuccessToast("Project rejected");
      setShowRejectModal(false);
      setSelectedProject(null);
      setRejectComment("");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to reject project");
    } finally {
      setBusy(false);
    }
  };

  const getCreatedBy = (project) => {
    const cb = project.createdBy;
    if (!cb) return "Staff";
    if (typeof cb === "object")
      return `${cb.firstName || ""} ${cb.lastName || ""}`.trim();
    return cb;
  };

  const getFileUrl = (file) => {
    if (!file) return null;
    if (typeof file === "string" && file.startsWith("http")) return file;
    if (typeof file === "string" && file.startsWith("/"))
      return `http://localhost:5000${file}`;
    return null;
  };

  const filtered = projects.filter((p) => {
    const matchQ =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      getCreatedBy(p).toLowerCase().includes(search.toLowerCase());
    const matchS = !statusFilter || p.status === statusFilter;
    return matchQ && matchS;
  });

  const pendingCount = projects.filter((p) => p.status === "Pending").length;
  const approvedCount = projects.filter((p) => p.status === "Approved").length;
  const rejectedCount = projects.filter((p) => p.status === "Rejected").length;

  return (
    <>
      <style>{`
        .pr-page { font-family: 'Segoe UI', sans-serif; box-sizing: border-box; }
        .pr-subtitle { margin: 0 0 20px; color: #555; font-size: 14px; }

        /* stats */
        .pr-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .pr-stat {
          background: #fff; border-radius: 10px; padding: 12px 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          display: flex; align-items: center; gap: 10px;
        }
        .pr-stat-dot { width: 10px; height: 10px; border-radius: 50%; }
        .pr-stat-val { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .pr-stat-label { font-size: 12px; color: #666; }

        /* toolbar */
        .pr-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .pr-input {
          padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
          font-size: 13px; background: #f8f9fb; color: #333; outline: none;
          transition: border-color .2s;
        }
        .pr-input:focus { border-color: #90CAF9; background: #fff; }
        .pr-search { flex: 1; min-width: 180px; }

        /* table */
        .pr-table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
        .pr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .pr-table th {
          text-align: left; padding: 11px 14px;
          background: #f4f6f8; color: #555;
          font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px;
          border-bottom: 1px solid #e8eaed; white-space: nowrap;
        }
        .pr-table td { padding: 12px 14px; border-bottom: 1px solid #f0f2f5; color: #333; vertical-align: middle; }
        .pr-table tbody tr:hover { background: #f8f9fb; }
        .pr-table tbody tr:last-child td { border-bottom: none; }
        .pr-title { font-weight: 500; color: #1976D2; cursor: pointer; }
        .pr-title:hover { text-decoration: underline; }
        .pr-file-link { color: #1976D2; font-size: 12px; text-decoration: none; }
        .pr-file-link:hover { text-decoration: underline; }
        .pr-actions { display: flex; gap: 6px; }
        .pr-action-btn {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
          cursor: pointer; border: 1px solid transparent; transition: all .15s;
        }
        .pr-action-btn:disabled { opacity: .38; cursor: not-allowed; }
        .pr-action-btn--view    { background: #f0f4ff; color: #3b5bdb; border-color: #b2c0f8; }
        .pr-action-btn--view:hover    { background: #3b5bdb; color: #fff; }
        .pr-action-btn--approve { background: #e8f5e9; color: #27ae60; border-color: #a5d6a7; }
        .pr-action-btn--approve:hover:not(:disabled) { background: #27ae60; color: #fff; }
        .pr-action-btn--reject  { background: #fde8e8; color: #c0392b; border-color: #ef9a9a; }
        .pr-action-btn--reject:hover  { background: #c0392b; color: #fff; }
        .pr-empty { text-align: center; padding: 40px; color: #aaa; font-size: 13px; }

        /* modal */
        .pr-modal-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,.4);
          display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .pr-modal {
          background: #fff; border-radius: 14px; padding: 24px;
          width: 90%; max-width: 520px; box-shadow: 0 8px 32px rgba(0,0,0,.18);
          max-height: 85vh; overflow-y: auto;
        }
        .pr-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .pr-modal-title  { margin: 0; font-size: 16px; font-weight: 700; color: #1a1a2e; }
        .pr-modal-close  { cursor: pointer; font-size: 18px; color: #aaa; }
        .pr-modal-close:hover { color: #333; }
        .pr-detail-row   { display: flex; gap: 8px; margin-bottom: 10px; font-size: 13px; }
        .pr-detail-label { font-weight: 600; color: #444; min-width: 100px; flex-shrink: 0; }
        .pr-detail-val   { color: #555; flex: 1; }
        .pr-desc-box { background: #f8f9fb; border-radius: 8px; padding: 12px; font-size: 13px; color: #444; margin: 8px 0 14px; line-height: 1.6; }
        .pr-modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #f0f2f5; }
        .pr-textarea {
          width: 100%; min-height: 80px; padding: 10px 12px;
          border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px;
          font-family: inherit; resize: vertical; outline: none; box-sizing: border-box;
        }
        .pr-textarea:focus { border-color: #90CAF9; }
        .pr-modal-btn {
          padding: 8px 18px; border-radius: 8px; border: none;
          font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s;
        }
        .pr-modal-btn:disabled { opacity: .5; cursor: not-allowed; }
        .pr-modal-btn--approve { background: #4CAF50; color: #fff; }
        .pr-modal-btn--approve:hover:not(:disabled) { background: #388E3C; }
        .pr-modal-btn--reject  { background: #F44336; color: #fff; }
        .pr-modal-btn--reject:hover:not(:disabled)  { background: #c0392b; }
        .pr-modal-btn--ghost   { background: #f0f2f5; color: #555; }
        .pr-modal-btn--ghost:hover { background: #e0e0e0; }
      `}</style>

      <div className="pr-page">
        <p className="pr-subtitle">
          Review and approve submitted project proposals.
        </p>

        {/* stats */}
        <div className="pr-stats">
          {[
            { label: "Total", val: projects.length, color: "#2196F3" },
            { label: "Pending", val: pendingCount, color: "#FF9800" },
            { label: "Approved", val: approvedCount, color: "#4CAF50" },
            { label: "Rejected", val: rejectedCount, color: "#F44336" },
          ].map(({ label, val, color }) => (
            <div className="pr-stat" key={label}>
              <div className="pr-stat-dot" style={{ background: color }} />
              <div>
                <div className="pr-stat-val">{val}</div>
                <div className="pr-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* toolbar */}
        <div className="pr-toolbar">
          <input
            type="search"
            className="pr-input pr-search"
            placeholder="Search projects or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="pr-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* table */}
        <div className="pr-table-wrap">
          <table className="pr-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Created By</th>
                <th>Department</th>
                <th>Status</th>
                <th>File</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="pr-empty">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="pr-empty">
                    No projects found.
                  </td>
                </tr>
              ) : (
                filtered.map((project) => {
                  const fileUrl = getFileUrl(project.file);
                  return (
                    <tr key={project._id}>
                      <td>
                        <span
                          className="pr-title"
                          onClick={() => {
                            setSelectedProject(project);
                            setOpenModal(true);
                          }}
                        >
                          {project.title}
                        </span>
                      </td>
                      <td style={{ color: "#666" }}>{getCreatedBy(project)}</td>
                      <td
                        style={{
                          color: "#666",
                          fontSize: 12,
                          maxWidth: 140,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project.department || "N/A"}
                      </td>
                      <td>
                        <StatusBadge status={project.status} />
                      </td>
                      <td>
                        {fileUrl ? (
                          <a
                            className="pr-file-link"
                            href={fileUrl}
                            onClick={async (e) => {
                              e.preventDefault();
                              const res = await fetch(fileUrl);
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = fileUrl.split("/").pop();
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            📎 Download
                          </a>
                        ) : (
                          <span style={{ color: "#bbb" }}>No file</span>
                        )}
                      </td>
                      <td style={{ color: "#888", whiteSpace: "nowrap" }}>
                        {project.createdAt?.slice(0, 10)}
                      </td>
                      <td>
                        <div className="pr-actions">
                          <button
                            className="pr-action-btn pr-action-btn--view"
                            onClick={() => {
                              setSelectedProject(project);
                              setOpenModal(true);
                            }}
                          >
                            View
                          </button>
                          {project.status === "Pending" && (
                            <>
                              <button
                                className="pr-action-btn pr-action-btn--approve"
                                onClick={() => handleApprove(project._id)}
                                disabled={busy}
                              >
                                Approve
                              </button>
                              <button
                                className="pr-action-btn pr-action-btn--reject"
                                onClick={() => handleReject(project)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* details modal */}
      {openModal && selectedProject && (
        <div className="pr-modal-backdrop" onClick={() => setOpenModal(false)}>
          <div className="pr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-header">
              <h3 className="pr-modal-title">{selectedProject.title}</h3>
              <span
                className="pr-modal-close"
                onClick={() => setOpenModal(false)}
              >
                ✕
              </span>
            </div>
            {[
              ["Created By", getCreatedBy(selectedProject)],
              ["Department", selectedProject.department],
            ].map(([label, val]) => (
              <div className="pr-detail-row" key={label}>
                <span className="pr-detail-label">{label}</span>
                <span className="pr-detail-val">{val}</span>
              </div>
            ))}
            <div className="pr-detail-row">
              <span className="pr-detail-label">Status</span>
              <span className="pr-detail-val">
                <StatusBadge status={selectedProject.status} />
              </span>
            </div>
            <div
              style={{
                marginTop: 10,
                marginBottom: 4,
                fontSize: 12,
                fontWeight: 600,
                color: "#555",
              }}
            >
              Description
            </div>
            <div className="pr-desc-box">
              {selectedProject.description || "—"}
            </div>
            {selectedProject.comment && (
              <div className="pr-detail-row">
                <span className="pr-detail-label">Comment</span>
                <span className="pr-detail-val" style={{ color: "#c0392b" }}>
                  💬 {selectedProject.comment}
                </span>
              </div>
            )}
            {getFileUrl(selectedProject.file) && (
              <div className="pr-detail-row">
                <span className="pr-detail-label">File</span>
                <a
                  className="pr-file-link"
                  href={getFileUrl(selectedProject.file)}
                  onClick={async (e) => {
                    e.preventDefault();
                    const url = getFileUrl(selectedProject.file);
                    const res = await fetch(url);
                    const blob = await res.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = url.split("/").pop();
                    a.click();
                    URL.revokeObjectURL(blobUrl);
                  }}
                >
                  📄 Download File ⬇
                </a>
              </div>
            )}
            <div className="pr-modal-footer">
              {selectedProject.status === "Pending" && (
                <>
                  <button
                    className="pr-modal-btn pr-modal-btn--approve"
                    onClick={() => handleApprove(selectedProject._id)}
                    disabled={busy}
                  >
                    Approve
                  </button>
                  <button
                    className="pr-modal-btn pr-modal-btn--reject"
                    onClick={() => handleReject(selectedProject)}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                className="pr-modal-btn pr-modal-btn--ghost"
                onClick={() => setOpenModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* reject modal */}
      {showRejectModal && selectedProject && (
        <div
          className="pr-modal-backdrop"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="pr-modal"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pr-modal-header">
              <h3 className="pr-modal-title">Reject Project</h3>
              <span
                className="pr-modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 10px" }}>
              Provide a reason for rejecting{" "}
              <strong>{selectedProject.title}</strong>:
            </p>
            <textarea
              className="pr-textarea"
              rows={4}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Enter rejection reason..."
            />
            <div className="pr-modal-footer">
              <button
                className="pr-modal-btn pr-modal-btn--ghost"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="pr-modal-btn pr-modal-btn--reject"
                onClick={confirmReject}
                disabled={busy || !rejectComment.trim()}
              >
                {busy ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectRequest;
