import { useState, useMemo, useContext } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { UserContext } from "../../context/UserContext";
import { useTasks } from "../../context/TaskContext";
import Pagination from "../../components/ui/Pagination";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = "http://localhost:5000";

const STATUS_STYLE = {
  Active: { bg: "#e8f5e9", color: "#27ae60" },
  Inactive: { bg: "#fde8e8", color: "#c0392b" },
};

const TASK_STATUS_STYLE = {
  Pending: { bg: "#fff3e0", color: "#e67e22" },
  "In Progress": { bg: "#e3f2fd", color: "#1976D2" },
  Approved: { bg: "#e8f5e9", color: "#27ae60" },
  Rejected: { bg: "#fde8e8", color: "#c0392b" },
  Completed: { bg: "#e8f5e9", color: "#27ae60" },
  Cancelled: { bg: "#f5f5f5", color: "#888" },
};

const Badge = ({ label, styleMap }) => {
  const s = styleMap[label] || { bg: "#f0f0f0", color: "#888" };
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
      {label}
    </span>
  );
};

// ── Avatar: shows photo if available, initials otherwise ─────────────────────
const StaffAvatar = ({ staff, size = 32, fontSize = 12, style = {} }) => {
  const initials =
    `${staff.firstName?.[0] || ""}${staff.lastName?.[0] || ""}`.toUpperCase();
  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize,
    fontWeight: 700,
    ...style,
  };

  if (staff.avatar) {
    return (
      <div style={{ ...base, background: "#e3f2fd" }}>
        <img
          src={`${BASE_URL}${staff.avatar}`}
          alt={initials}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            // If image fails, fall back to initials
            e.target.style.display = "none";
            e.target.parentElement.innerHTML = initials;
            Object.assign(e.target.parentElement.style, {
              background: "linear-gradient(135deg,#2196F3,#6366f1)",
              color: "#fff",
            });
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...base,
        background: "linear-gradient(135deg,#2196F3,#6366f1)",
        color: "#fff",
      }}
    >
      {initials}
    </div>
  );
};

const StaffManagement = () => {
  const { users, loading } = useContext(UserContext);
  const { user: currentUser } = useContext(AuthContext);
  const { tasks } = useTasks();

  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [viewTasksModal, setViewTasksModal] = useState(false);
  const [selectedStaffTasks, setSelectedStaffTasks] = useState([]);
  const [staffName, setStaffName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const staffOnly = useMemo(
    () =>
      users.filter(
        (u) => u.role === "staff" && u.department === currentUser?.department,
      ),
    [users, currentUser],
  );

  const filteredStaff = useMemo(() => {
    return staffOnly.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`;
      const matchSearch =
        fullName.toLowerCase().includes(query.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(query.toLowerCase());
      const matchGender = genderFilter === "" || user.gender === genderFilter;
      const matchStatus = statusFilter === "" || user.status === statusFilter;
      return matchSearch && matchGender && matchStatus;
    });
  }, [query, staffOnly, genderFilter, statusFilter]);

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const openStaffModal = (staff) => {
    setSelectedStaff(staff);
    setOpenModal(true);
  };

  const handleViewTasks = (staff) => {
    const staffTasks = tasks.filter((task) => {
      const assignedId = task.assignedTo?._id || task.assignedTo;
      return assignedId?.toString() === staff._id?.toString();
    });
    setSelectedStaffTasks(staffTasks);
    setStaffName(`${staff.firstName} ${staff.lastName}`);
    setViewTasksModal(true);
  };

  const activeCount = staffOnly.filter((s) => s.status === "Active").length;
  const inactiveCount = staffOnly.length - activeCount;

  return (
    <>
      <style>{`
        .sm-page { font-family: 'Segoe UI', sans-serif; box-sizing: border-box; }
        .sm-subtitle { margin: 0 0 20px; color: #555; font-size: 14px; }

        .sm-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .sm-stat { background: #fff; border-radius: 10px; padding: 12px 18px; box-shadow: 0 1px 4px rgba(0,0,0,.07); display: flex; align-items: center; gap: 10px; }
        .sm-stat-dot { width: 10px; height: 10px; border-radius: 50%; }
        .sm-stat-val { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .sm-stat-label { font-size: 12px; color: #666; }

        .sm-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .sm-input { padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; background: #f8f9fb; color: #333; outline: none; transition: border-color .2s; }
        .sm-input:focus { border-color: #90CAF9; background: #fff; }
        .sm-search { flex: 1; min-width: 180px; }

        .sm-table-wrap { overflow-x: auto; background: #fff; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
        .sm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .sm-table th { text-align: left; padding: 11px 14px; background: #f4f6f8; color: #555; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #e8eaed; white-space: nowrap; }
        .sm-table td { padding: 12px 14px; border-bottom: 1px solid #f0f2f5; color: #333; vertical-align: middle; }
        .sm-table tbody tr:hover { background: #f8f9fb; }
        .sm-table tbody tr:last-child td { border-bottom: none; }
        .sm-name-cell { display: flex; align-items: center; gap: 10px; }
        .sm-actions { display: flex; gap: 6px; }
        .sm-action-btn { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all .15s; }
        .sm-action-btn--view  { background: #f0f4ff; color: #3b5bdb; border-color: #b2c0f8; }
        .sm-action-btn--view:hover  { background: #3b5bdb; color: #fff; }
        .sm-action-btn--tasks { background: #e8f5e9; color: #27ae60; border-color: #a5d6a7; }
        .sm-action-btn--tasks:hover { background: #27ae60; color: #fff; }
        .sm-empty { text-align: center; padding: 40px; color: #aaa; font-size: 13px; }

        /* profile modal */
        .sm-profile-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #f0f2f5; }
        .sm-profile-name { font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
        .sm-profile-role { font-size: 12px; color: #888; margin: 0; }
        .sm-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .sm-profile-field { display: flex; flex-direction: column; gap: 3px; }
        .sm-profile-label { font-size: 11px; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: .5px; }
        .sm-profile-val   { font-size: 13px; color: #333; font-weight: 500; }

        /* task cards */
        .sm-task-card { background: #f8f9fb; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; border-left: 3px solid #2196F3; }
        .sm-task-card-title { font-weight: 600; font-size: 13px; color: #222; margin-bottom: 4px; }
        .sm-task-card-meta  { font-size: 11px; color: #888; display: flex; gap: 12px; margin-top: 6px; }
      `}</style>

      <div className="sm-page">
        <p className="sm-subtitle">
          Manage staff, view profiles, and assign tasks.
        </p>

        {/* stats */}
        <div className="sm-stats">
          {[
            { label: "Total Staff", val: staffOnly.length, color: "#2196F3" },
            { label: "Active", val: activeCount, color: "#4CAF50" },
            { label: "Inactive", val: inactiveCount, color: "#F44336" },
          ].map(({ label, val, color }) => (
            <div className="sm-stat" key={label}>
              <div className="sm-stat-dot" style={{ background: color }} />
              <div>
                <div className="sm-stat-val">{val}</div>
                <div className="sm-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* toolbar */}
        <div className="sm-toolbar">
          <input
            type="search"
            className="sm-input sm-search"
            placeholder="Search staff..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="sm-input"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">All Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
          <select
            className="sm-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* table */}
        <div className="sm-table-wrap">
          <table className="sm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Department</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="sm-empty">
                    Loading...
                  </td>
                </tr>
              ) : paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="sm-empty">
                    No staff found.
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((staff) => (
                  <tr key={staff._id}>
                    <td>
                      <div className="sm-name-cell">
                        {/* ✅ Shows photo if available, initials otherwise */}
                        <StaffAvatar staff={staff} size={32} fontSize={12} />
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {staff.firstName} {staff.middleName}{" "}
                            {staff.lastName}
                          </div>
                          <div style={{ fontSize: 11, color: "#888" }}>
                            {staff.position || "Staff"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#666" }}>{staff.phone || "—"}</td>
                    <td style={{ color: "#666" }}>{staff.email}</td>
                    <td
                      style={{
                        color: "#666",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {staff.department}
                    </td>
                    <td>{staff.gender}</td>
                    <td>
                      <Badge label={staff.status} styleMap={STATUS_STYLE} />
                    </td>
                    <td>
                      <div className="sm-actions">
                        <button
                          className="sm-action-btn sm-action-btn--view"
                          onClick={() => openStaffModal(staff)}
                        >
                          View Profile
                        </button>
                        <button
                          className="sm-action-btn sm-action-btn--tasks"
                          onClick={() => handleViewTasks(staff)}
                        >
                          View Tasks
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={filteredStaff.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ── Profile Modal ──────────────────────────────────────────────────── */}
      {openModal && selectedStaff && (
        <Modal onClose={() => setOpenModal(false)}>
          <div className="sm-profile-header">
            {/* ✅ Large avatar in modal — photo or initials */}
            <StaffAvatar staff={selectedStaff} size={64} fontSize={22} />
            <div>
              <p className="sm-profile-name">
                {selectedStaff.firstName} {selectedStaff.middleName}{" "}
                {selectedStaff.lastName}
              </p>
              <p className="sm-profile-role">{selectedStaff.department}</p>
            </div>
          </div>
          <div className="sm-profile-grid">
            {[
              ["Phone", selectedStaff.phone || "—"],
              ["Email", selectedStaff.email],
              ["Gender", selectedStaff.gender],
              ["Position", selectedStaff.position || "—"],
              ["Status", selectedStaff.status],
              ["Department", selectedStaff.department],
            ].map(([label, val]) => (
              <div className="sm-profile-field" key={label}>
                <span className="sm-profile-label">{label}</span>
                <span className="sm-profile-val">{val}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 16,
            }}
          >
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* ── Tasks Modal ────────────────────────────────────────────────────── */}
      {viewTasksModal && (
        <Modal onClose={() => setViewTasksModal(false)}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15 }}>
            📌 Tasks — {staffName}
          </h3>
          {selectedStaffTasks.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: 13 }}>
              No tasks assigned to this staff member.
            </p>
          ) : (
            selectedStaffTasks.map((task) => (
              <div
                className="sm-task-card"
                key={task._id}
                style={{
                  borderLeftColor:
                    task.status === "Completed"
                      ? "#4CAF50"
                      : task.status === "Rejected"
                        ? "#F44336"
                        : "#2196F3",
                }}
              >
                <div className="sm-task-card-title">{task.title}</div>
                {task.description && (
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                    {task.description}
                  </div>
                )}
                <div className="sm-task-card-meta">
                  <span>📅 Due: {task.due}</span>
                  <Badge label={task.status} styleMap={TASK_STATUS_STYLE} />
                </div>
              </div>
            ))
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 12,
            }}
          >
            <Button variant="ghost" onClick={() => setViewTasksModal(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default StaffManagement;
