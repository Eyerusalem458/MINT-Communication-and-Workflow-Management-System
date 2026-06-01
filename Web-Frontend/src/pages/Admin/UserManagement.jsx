import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import Modal from "../../components/ui/Modal";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { UserContext } from "../../context/UserContext";
import { useContext } from "react";

const DEPARTMENTS = [
  "Minister's Office (ሚኒስትር ፅህፈት ቤት)",
  "Legal Affairs (ህግ ጉዳዮች)",
  "Public Relations and Communications (የህዝብ ግንኙነትና ኮሙኒኬሽን)",
  "Audit Service (ኦዲት አገልግሎት)",
  "Ethics and Anti-Corruption (ስነምግባርና ፀረሙስና)",
  "Strategy Affairs (ትራቴጂ ጉዳዮች)",
  "Procurement and Finance (ግዥና ፋይናንስ)",
  "Human Resource Administration (የቃትና ሰው ሃብት አስተዳደር)",
  "Basic Services (ሰረታዊ አገልግሎት)",
  "ICT and Digital Economy Sector (አይሲቲ እና ዲጂታል ኢኮኖሚ ዘርፍ)",
  "Innovation and Research Sector (ኢኖቬሽንና ምርምር ዘርፍ)",
  "National Research and Development (ሀገራዊ የምርምር ልማት)",
  "Technology Transfer and Development (የቴክኖሎጂ ሽግግርና ልማት)",
  "Innovation and Startup Development (የኢኖቬሽንና ስታርትአፕ ልማት)",
  "Government ICT Infrastructure (የመንግስት አይሲቲ መሰረተልማት ግንባታ እና አስተዳደር)",
  "Digital Economy Development (የዲጂታል ኢኮኖሚ ልማት)",
  "E-Government Development (ኤሌክትሮኒክስ መንግስት ልማት)",
  "Digital Infrastructure (ዲጂታል መሰረተልማት ግንባታ)",
  "Digital Standards and Regulation (ዲጂታል ስታንዳርድ እና ሬጉሌሽን)",
  "Innovation and Technology Data Management (የኢኖቬሽንና ቴክኖሎጂ መረጃ ልማትና አስተዳደር)",
  "Innovation Development (ኢኖቬሽን ልማት)",
  "National Research Infrastructure (የሀገራዊ ምርምር መሰረተልማት ግንባታ)",
  "Technology Transfer and Linkage (የቴክኖሎጂ ሽግግርና ትስስር)",
  "Indigenous Technology Development (ሀገር በቀል ቴክኖሎጂ ልማት)",
  "Innovation Infrastructure (ኢኖቬሽን መሰረተልማት)",
  "National E-Government Plan Coordination (የብሄራዊ የኤ-መንግስት ዕቅድ ማስተባበሪያ)",
  "Government Digital Services Development (መንግስታዊ ዲጂታል አገልግሎቶች ልማት እና አስተዳደር)",
  "National Data Resource Development (ብሄራዊ ዳታ ሃብት ልማት ቅንጅት)",
  "Data Center Administration (የዳታ ማዕክል አስተዳደር)",
  "Quality and Security Management (የጥራት እና ደህንነት አስተዳደር)",
  "Digital Community Development (የዲጂታል ማሕበረስብ ልማት)",
  "Digital Industry Development (የዲጂታል ኢንዱስትሪ ልማት)",
  "Startup and Innovative Enterprise Development (የስታርፕ እና ኢኖቫቲቭ ኢንተርፕራይዝ ልማት)",
  "National Research Ethics and Science Culture (ሀገራዊ የምርምር ስነምግባርና የሳይንስ ባህል ግንባታ)",
  "International Relations and Cooperation (የዓለም አቀፍ ግንኙነትና ትብብር)",
  "Regional and Council Affairs (የክልሎች እና ካውንስል ጉዳዮች)",
  "Private Sector (የግል ዘርፍ)",
  "Innovation Fund Office (የኢኖቬሽን ፈንድ ፅህፈት ቤት)",
  "Collaboration and Partnership (የትብብር እና ትስስር)",
];
export default function UserManagement() {
  const navigate = useNavigate();
  const { users, editUser, toggleUserStatus, loading } =
    useContext(UserContext);
  // Mock user data with gender and detailed hierarchy

  const [busy, setBusy] = useState(false);
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



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // 🚨 VALIDATION
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.role
    ) {
      showErrorToast("Please fill all required fields");
      return;
    }
    setBusy(true);
    try {
      await editUser(selectedUser._id, formData);
      setEditModal(false);
      showSuccessToast("User updated successfully");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const u = await toggleUserStatus(id);
      showSuccessToast(`User ${u.status}`);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed");
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const name = `${u.firstName || ""} ${u.lastName || ""}`;
        const matchSearch =
          name.toLowerCase().includes(query.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(query.toLowerCase());
        return (
          matchSearch &&
          (roleFilter === "" || u.role === roleFilter) &&
          (genderFilter === "" || u.gender === genderFilter) &&
          (deptFilter === "" || u.department === deptFilter)
        );
      }),
    [query, roleFilter, genderFilter, deptFilter, users],
  );

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
          <option value="admin">Admin</option>
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
          {DEPARTMENTS.map((d) => (
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
          <option>Male</option>
          <option>Female</option>
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
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
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
                        setFormData({ ...user });
                        setEditModal(true);
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="xs"
                      variant={
                        user.status === "Inactive" ? "danger" : "approve"
                      }
                      onClick={() => handleToggle(user._id)}
                    >
                      {user.status === "Active" ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
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

          {[
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone", type: "text" },
          ].map(({ label, name, type }) => (
            <div className="staff-form-group" key={name}>
              <label>{label}</label>
              <input
                type={type}
                name={name}
                className="staff-input"
                value={formData[name] || ""}
                onChange={handleChange}
              />
            </div>
          ))}
          {[
            {
              label: "Role",
              name: "role",
              opts: ["admin", "manager", "staff"],
            },
            { label: "Gender", name: "gender", opts: ["Male", "Female"] },
            { label: "Status", name: "status", opts: ["Active", "Inactive"] },
          ].map(({ label, name, opts }) => (
            <div className="staff-form-group" key={name}>
              <label>{label}</label>
              <select
                name={name}
                className="staff-input"
                value={formData[name] || ""}
                onChange={handleChange}
              >
                {opts.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <div className="staff-form-group">
            <label>Department</label>
            <select
              name="department"
              className="staff-input"
              value={formData.department || ""}
              onChange={handleChange}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="staff-modal-footer">
            <Button variant="ghost" onClick={() => setEditModal(false)}>
              Cancel
            </Button>

            <Button variant="primary" onClick={handleSave} disabled={busy}>
              {busy ? "Saving..." : "Update User"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
