import { useState } from "react";
import Button from "../../components/ui/Button";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useProjects } from "../../context/ProjectContext";

const ProjectRequest = () => {
  const { projects, approveProject, rejectProject, loading } = useProjects();

  const [selectedProject, setSelectedProject] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [rejectComment, setRejectComment] = useState(""); // 🔥 NEW
  const [showRejectModal, setShowRejectModal] = useState(false); // 🔥 NEW
  const [busy, setBusy] = useState(false);

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
    setRejectComment(""); // prefill existing comment if any
    setShowRejectModal(true); // open reject modal
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

  const openDetails = (project) => {
    setSelectedProject(project);
    setOpenModal(true);
  };

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

  //Helper to get "Created By" display from populated object or string
  const getCreatedBy = (project) => {
    const cb = project.createdBy;
    if (!cb) return "Staff";
    if (typeof cb === "object")
      return `${cb.firstName || ""} ${cb.lastName || ""}`.trim();
    return cb;
  };

  // File URL helper — backend stores path like /uploads/files/abc.pdf
  const getFileUrl = (file) => {
    if (!file) return null;
    if (typeof file === "string" && file.startsWith("http")) return file;
    if (typeof file === "string" && file.startsWith("/"))
      return `http://localhost:5000${file}`;
    return null;
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
        <p className="staff-card-subtitle">
          Review and approve submitted projects.
        </p>
      </div>

      <div className="staff-table-scroll">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Created By</th>
              <th>Department</th>
              <th>Status</th>
              <th>File</th>
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
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No projects found
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const fileUrl = getFileUrl(project.file);
                return (
                  <tr key={project._id}>
                    <td
                      className="staff-table-title"
                      style={{ cursor: "pointer" }}
                      onClick={() => openDetails(project)}
                    >
                      {project.title}
                    </td>
                    <td>{getCreatedBy(project)}</td>
                    <td>{project.department || "N/A"}</td>
                    <td>
                      <span className={getStatusClass(project.status)}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      {fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          download
                        >
                          📎 Download
                        </a>
                      ) : (
                        "No file"
                      )}
                    </td>
                    <td>{project.createdAt?.slice(0, 10)}</td>
                    <td>
                      <div className="staff-table-actions">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => openDetails(project)}
                        >
                          View
                        </Button>
                        {project.status === "Pending" && (
                          <>
                            <Button
                              size="xs"
                              variant="approve"
                              onClick={() => handleApprove(project._id)}
                              disabled={busy}
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="reject"
                              onClick={() => handleReject(project)}
                            >
                              Reject
                            </Button>
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

      {/* Details modal */}
      {openModal && selectedProject && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setOpenModal(false)}
        >
          <div
            className="staff-modal staff-modal--clean"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header">
              <h3>{selectedProject.title}</h3>
              <span
                className="staff-modal-close"
                onClick={() => setOpenModal(false)}
              >
                ✕
              </span>
            </div>
            <div className="staff-modal-body">
              <p>
                <strong>Created By:</strong> {getCreatedBy(selectedProject)}
              </p>
              <p>
                <strong>Department:</strong> {selectedProject.department}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={getStatusClass(selectedProject.status)}>
                  {selectedProject.status}
                </span>
              </p>
              <p>
                <strong>Description:</strong>
              </p>
              <p>{selectedProject.description}</p>
              {selectedProject.comment && (
                <p>
                  <strong>Comment:</strong> {selectedProject.comment}
                </p>
              )}
              <p>
                <strong>File:</strong>
              </p>
              {getFileUrl(selectedProject.file) ? (
                <a
                  href={getFileUrl(selectedProject.file)}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  📄 Download File ⬇️
                </a>
              ) : (
                <p>No file uploaded</p>
              )}
            </div>
            <div className="staff-modal-footer">
              {selectedProject.status === "Pending" && (
                <>
                  <Button
                    variant="approve"
                    onClick={() => handleApprove(selectedProject._id)}
                    disabled={busy}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="reject"
                    onClick={() => handleReject(selectedProject)}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={() => setOpenModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject comment modal */}
      {showRejectModal && selectedProject && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="staff-modal staff-modal--clean"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header">
              <h3>Reject: {selectedProject.title}</h3>
              <span
                className="staff-modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </span>
            </div>
            <div className="staff-modal-body">
              <p>Please provide a reason for rejecting this project:</p>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  boxSizing: "border-box",
                }}
                placeholder="Enter rejection reason..."
              />
            </div>
            <div className="staff-modal-footer">
              <Button
                variant="reject"
                onClick={confirmReject}
                disabled={busy || !rejectComment.trim()}
              >
                {busy ? "Rejecting..." : "Confirm Reject"}
              </Button>
              <Button variant="ghost" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRequest;
