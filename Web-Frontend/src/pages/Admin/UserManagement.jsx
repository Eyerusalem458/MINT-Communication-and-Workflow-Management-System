import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function UserManagement() {
  const navigate = useNavigate();

  // Mock user data with gender and detailed hierarchy
  const users = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@mint.gov",
      role: "Admin",
      department: "Innovation & Technology",
      gender: "Male",
      status: "Active",
    },
    {
      id: 2,
      name: "Manager One",
      email: "manager1@mint.gov",
      role: "Manager",
      department: "Digital Economy",
      gender: "Female",
      status: "Active",
    },
    {
      id: 3,
      name: "Staff Member",
      email: "staff@mint.gov",
      role: "Staff",
      department: "Cyber Security",
      gender: "Male",
      status: "Inactive",
    },
    {
      id: 4,
      name: "Manager Two",
      email: "manager2@mint.gov",
      role: "Manager",
      department: "Innovation Hub Management",
      gender: "Male",
      status: "Active",
    },
    {
      id: 5,
      name: "Staff Jane",
      email: "jane.staff@mint.gov",
      role: "Staff",
      department: "Creative Works Development",
      gender: "Female",
      status: "Active",
    },
    {
      id: 6,
      name: "Staff Jane",
      email: "jane.staff@mint.gov",
      role: "Staff",
      department: "Creative Works Development",
      gender: "Female",
      status: "Active",
    },
    {
      id: 7,
      name: "Staff Jane",
      email: "jane.staff@mint.gov",
      role: "Staff",
      department: "Creative Works Development",
      gender: "Female",
      status: "Active",
    },
    {
      id: 8,
      name: "Staff Jane",
      email: "jane.staff@mint.gov",
      role: "Staff",
      department: "Creative Works Development",
      gender: "Female",
      status: "Active",
    },
    {
      id: 9,
      name: "Staff Jane",
      email: "jane.staff@mint.gov",
      role: "Staff",
      department: "Creative Works Development",
      gender: "Female",
      status: "Active",
    },
    {
      id: 10,
      name: "Staff Jane",
      email: "jane.staff@mint.gov",
      role: "Staff",
      department: "Creative Works Development",
      gender: "Female",
      status: "Active",
    },
    {
      id: 11,
      name: "Staff Jane",
      email: "jane.staff@mint.gov",
      role: "Staff",
      department: "Creative Works Development",
      gender: "Female",
      status: "Active",
    },
    {
      id: 12,
      name: "Staff Jane",
      email: "jane.staff@mint.gov",
      role: "Staff",
      department: "Creative Works Development",
      gender: "Female",
      status: "Active",
    },
  ];

  const [userList, setUserList] = useState(users);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});

  // Unique departments for dropdown
  const departments = Array.from(new Set(users.map((u) => u.department)));
  const genders = ["Male", "Female"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // 🚨 VALIDATION
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.department ||
      !formData.gender ||
      !formData.status
    ) {
      showErrorToast("Please fill all fields before updating");
      return;
    }

    const updated = userList.map((u) =>
      u.id === selectedUser.id ? formData : u,
    );

    setUserList(updated);
    setEditModal(false);

    showSuccessToast("User updated successfully");
  };

  const handleDelete = (id) => {
    const updatedUsers = userList.map((u) =>
      u.id === id
        ? {
            ...u,
            status: u.status === "Inactive" ? "Active" : "Inactive",
          }
        : u,
    );

    setUserList(updatedUsers);

    const user = userList.find((u) => u.id === id);

    if (user.status === "Inactive") {
      showSuccessToast("User restored successfully");
    } else {
      showSuccessToast("User set to inactive");
    }
  };

  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase());

      const matchesRole = roleFilter === "" || user.role === roleFilter;

      const matchesGender = genderFilter === "" || user.gender === genderFilter;

      const matchesDept = deptFilter === "" || user.department === deptFilter;

      return matchesSearch && matchesRole && matchesGender && matchesDept;
    });
  }, [query, roleFilter, genderFilter, deptFilter, users]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="staff-card staff-card--full">
      {/* HEADER */}
      <div className="staff-card-header staff-card-header--with-actions">
        <p className="staff-card-subtitle">
          Manage system users, roles, and access.
        </p>

        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate("/admin/create-user")}
        >
          + Create New User
        </Button>
      </div>

      {/* 🔍 SEARCH + FILTERS (MATCHED STYLE) */}
      <div
        className="staff-search-wrapper"
        style={{ display: "flex", gap: "10px" }}
      >
        <input
          type="search"
          className="staff-input"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Role Filter */}
        <select
          className="staff-input"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Staff">Staff</option>
        </select>

        {/* Department Filter */}
        <select
          className="staff-input"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Gender Filter */}
        <select
          className="staff-input"
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
        >
          <option value="">All Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      {/* TABLE (MATCHED STYLE) */}
      <div className="staff-table-scroll">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Gender</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.department}</td>
                <td>{user.gender}</td>

                <td>
                  <span
                    className={`status ${
                      user.status === "Active"
                        ? "status-active"
                        : "status-inactive"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      setSelectedUser(user);
                      setFormData(user);
                      setEditModal(true);
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => handleDelete(user.id)}
                  >
                    {user.status === "Inactive" ? "Restore" : "Deactivate"}
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
      />

      {editModal && (
        <Modal onClose={() => setEditModal(false)}>
          <h3>Edit User</h3>

          <div className="staff-form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              className="staff-input"
              value={formData.name || ""}
              onChange={handleChange}
            />
          </div>

          <div className="staff-form-group">
            <label>Email</label>
            <input
              type="text"
              name="email"
              className="staff-input"
              value={formData.email || ""}
              onChange={handleChange}
            />
          </div>

          <div className="staff-form-group">
            <label>Role</label>
            <select
              name="role"
              className="staff-input"
              value={formData.role || ""}
              onChange={handleChange}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          <div className="staff-form-group">
            <label>Department</label>
            <select
              name="department"
              className="staff-input"
              value={formData.department || ""}
              onChange={handleChange}
            >
              <option value="">Select department</option>

              <optgroup label="Top Level">
                <option value="Minister's Support Staff Unit">
                  Minister's Support Staff Unit
                </option>
                <option value="Public Relations and Communications">
                  Public Relations and Communications
                </option>
              </optgroup>

              <optgroup label="Middle Management">
                <option value="Innovation and Technology Sector">
                  Innovation and Technology Sector
                </option>
                <option value="Digital Economy Sector">
                  Digital Economy Sector
                </option>
              </optgroup>

              <optgroup label="Innovation & Technology Cluster">
                <option value="Innovation and Technology Research">
                  Innovation and Technology Research
                </option>
                <option value="Creative Works Development">
                  Creative Works Development
                </option>
                <option value="Technology Transfer">Technology Transfer</option>
                <option value="Innovation Hub Management">
                  Innovation Hub Management
                </option>
                <option value="Standardization and Quality Control">
                  Standardization and Quality Control
                </option>
              </optgroup>

              <optgroup label="Digital Economy Cluster">
                <option value="Digital Infrastructure">
                  Digital Infrastructure
                </option>
                <option value="Digital Services Development">
                  Digital Services Development
                </option>
                <option value="Cyber Security">Cyber Security</option>
                <option value="E-Commerce Development">
                  E-Commerce Development
                </option>
                <option value="Data Management and Analysis">
                  Data Management and Analysis
                </option>
              </optgroup>
            </select>
          </div>

          <div className="staff-form-group">
            <label>Gender</label>
            <select
              name="gender"
              className="staff-input"
              value={formData.gender || ""}
              onChange={handleChange}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="staff-form-group">
            <label>Status</label>
            <select
              name="status"
              className="staff-input"
              value={formData.status || ""}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="staff-modal-footer">
            <Button variant="ghost" onClick={() => setEditModal(false)}>
              Cancel
            </Button>

            <Button variant="primary" onClick={handleSave}>
              Update User
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
