import { useState } from "react";
import Button from "../../components/ui/Button";
import { showSuccessToast } from "../../utils/toast";
import { useProjects } from "../../context/ProjectContext";

const ProjectRequest = () => {
  const { projects, approveProject, rejectProject } = useProjects();

  const [selectedProject, setSelectedProject] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [rejectComment, setRejectComment] = useState(""); // 🔥 NEW
  const [showRejectModal, setShowRejectModal] = useState(false); // 🔥 NEW

  const handleApprove = (id) => {
    approveProject(id);
    showSuccessToast("Project approved");
  };

  const handleReject = (project) => {
    setSelectedProject(project);
    setRejectComment(project.comment || ""); // prefill existing comment if any
    setShowRejectModal(true); // open reject modal
  };

  const confirmReject = () => {
    if (!selectedProject) return;
    rejectProject(selectedProject.id, rejectComment); // pass comment to context
    showSuccessToast("Project rejected");
    setShowRejectModal(false);
    setSelectedProject(null);
    setRejectComment("");
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
            {projects.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No data found
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td
                    className="staff-table-title"
                    onClick={() => openDetails(project)}
                  >
                    {project.title}
                  </td>

                  <td>{project.createdBy || "Staff"}</td>
                  <td>{project.department || "N/A"}</td>

                  <td>
                    <span className={getStatusClass(project.status)}>
                      {project.status}
                    </span>
                  </td>

                  <td>
                    {project.file ? (
                      <div className="file-actions">
                        <span>📎 {project.file?.name || "File attached"}</span>
                        <a
                          href={
                            project.file instanceof File
                              ? URL.createObjectURL(project.file)
                              : project.file
                          }
                          download
                          style={{ marginLeft: "8px", textDecoration: "none" }}
                        >
                          ⬇️
                        </a>
                      </div>
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

                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => handleApprove(project.id)}
                      >
                        Approve
                      </Button>

                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleReject(project)}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
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
                <strong>Created By:</strong> {selectedProject.createdBy}
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
              <p>
                <strong>File:</strong>
              </p>

              {selectedProject.file ? (
                <div>
                  {selectedProject.file.type?.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedProject.file)}
                      alt="preview"
                      style={{ width: "200px", borderRadius: "8px" }}
                    />
                  ) : (
                    <p>📄 {selectedProject.file?.name || "Attached file"}</p>
                  )}
                  <div style={{ marginTop: "10px" }}>
                    <a
                      href={
                        selectedProject.file instanceof File
                          ? URL.createObjectURL(selectedProject.file)
                          : selectedProject.file
                      }
                      download
                    >
                      Download File ⬇️
                    </a>
                  </div>
                </div>
              ) : (
                <p>No file uploaded</p>
              )}
            </div>

            <div className="staff-modal-footer">
              <Button
                variant="primary"
                onClick={() => handleApprove(selectedProject.id)}
              >
                Approve
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleReject(selectedProject)}
              >
                Reject
              </Button>

              <Button variant="ghost" onClick={() => setOpenModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT COMMENT MODAL */}
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
              <h3>Reject Project: {selectedProject.title}</h3>
              <span
                className="staff-modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </span>
            </div>

            <div className="staff-modal-body">
              <p>Please enter a comment for rejecting this project:</p>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
                placeholder="Enter rejection reason..."
              />
            </div>

            <div className="staff-modal-footer">
              <Button variant="primary" onClick={confirmReject}>
                Confirm Reject
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowRejectModal(false)}
              >
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