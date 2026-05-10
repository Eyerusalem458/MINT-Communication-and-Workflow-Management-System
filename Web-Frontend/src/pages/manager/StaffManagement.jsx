import { useState, useMemo, useContext } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { UserContext } from "../../context/UserContext";
import { useTasks } from "../../context/TaskContext";
import Pagination from "../../components/ui/Pagination";
import { AuthContext } from "../../context/AuthContext";

const StaffManagement = () => {
  const { users, loading } = useContext(UserContext);
  const { user: currentUser } = useContext(AuthContext);
  const { tasks } = useTasks();

  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  // 🆕 VIEW TASK MODAL STATE
  const [viewTasksModal, setViewTasksModal] = useState(false);
  const [selectedStaffTasks, setSelectedStaffTasks] = useState([]);
  const [staffName, setStaffName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ✅ ONLY STAFF
  const staffOnly = useMemo(
    () =>
      users.filter(
        (user) =>
          user.role === "staff" && user.department === currentUser?.department,
      ),
    [users, currentUser],
  );

  // 🔍 FILTER (Search + Department + Gender)
  const filteredStaff = useMemo(() => {
    return staffOnly.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.middleName || ""} ${user.lastName || ""}`;

      const matchesSearch =
        fullName.toLowerCase().includes(query.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(query.toLowerCase());

      const matchesGender = genderFilter === "" || user.gender === genderFilter;

      return matchesSearch && matchesGender;
    });
  }, [query, staffOnly, genderFilter]);

  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // 👁️ View Profile
  const openStaffModal = (staff) => {
    setSelectedStaff(staff);
    setOpenModal(true);
  };

  // 📌 VIEW TASKS
  const handleViewTasks = (staff) => {
    // Match by MongoDB _id (assignedTo is a populated object from backend)
    const staffTasks = tasks.filter((task) => {
      const assignedId = task.assignedTo?._id || task.assignedTo;
      return assignedId?.toString() === staff._id?.toString();
    });
    setSelectedStaffTasks(staffTasks);
    setStaffName(`${staff.firstName} ${staff.lastName}`);
    setViewTasksModal(true);
  };

  return (
    <div className="staff-card staff-card--full">
      {/* HEADER */}
      <div className="staff-card-header staff-card-header--with-actions">
        <p className="staff-card-subtitle">
          Manage staff, view profiles, and assign tasks.
        </p>
      </div>

      {/* 🔍 SEARCH + FILTERS */}
      <div
        className="staff-search-wrapper"
        style={{ display: "flex", gap: "10px" }}
      >
        <input
          type="search"
          className="staff-input"
          placeholder="Search staff..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Gender Filter */}
        <select
          className="staff-input"
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
        >
          <option value="">All Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="staff-table-scroll">
        <table className="staff-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
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
                <td colSpan="9" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : paginatedStaff.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No staff found
                </td>
              </tr>
            ) : (
              paginatedStaff.map((staff) => (
                <tr key={staff._id}>
                  <td>{staff.firstName}</td>
                  <td>{staff.middleName}</td>
                  <td>{staff.lastName}</td>
                  <td>{staff.phone || "—"}</td>
                  <td>{staff.email}</td>
                  <td>{staff.department}</td>
                  <td>{staff.gender}</td>

                  <td>
                    <span
                      className={
                        staff.status === "Active"
                          ? "status-badge completed"
                          : "status-badge pending"
                      }
                    >
                      {staff.status}
                    </span>
                  </td>

                  <td>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => openStaffModal(staff)}
                    >
                      View Profile
                    </Button>

                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => handleViewTasks(staff)}
                    >
                      View Tasks
                    </Button>
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

      {/* 👁️ PROFILE MODAL */}
      {openModal && selectedStaff && (
        <Modal onClose={() => setOpenModal(false)}>
          <h3>Staff Profile</h3>

          <p>
            <strong>Name:</strong> {selectedStaff.firstName}
            {selectedStaff.middleName} {selectedStaff.lastName}
          </p>

          <p>
            <strong>Phone:</strong> {selectedStaff.phone || "—"}
          </p>

          <p>
            <strong>Email:</strong> {selectedStaff.email}
          </p>

          <p>
            <strong>Department:</strong> {selectedStaff.department}
          </p>

          <p>
            <strong>Gender:</strong> {selectedStaff.gender}
          </p>

          <p>
            <strong>Position:</strong> {selectedStaff.position || "—"}
          </p>

          <p>
            <strong>Status:</strong> {selectedStaff.status}
          </p>

          <div className="staff-modal-footer">
            <Button variant="ghost" onClick={() => setOpenModal(false)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* 📌 VIEW TASKS MODAL */}
      {viewTasksModal && (
        <Modal onClose={() => setViewTasksModal(false)}>
          <h3>📌 Tasks for: {staffName}</h3>

          {selectedStaffTasks.length === 0 ? (
            <p>No tasks assigned to this staff member.</p>
          ) : (
            selectedStaffTasks.map((task) => (
              <div key={task._id} style={{ marginBottom: "10px" }}>
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <p>📅 Due: {task.due}</p>
                <p>Status: {task.status}</p>
                <hr />
              </div>
            ))
          )}

          <div className="staff-modal-footer">
            <Button onClick={() => setViewTasksModal(false)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StaffManagement;
