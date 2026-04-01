import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <div className="admin-top">
        <p>Track and manage users across roles.</p>
      </div>

      <div className="admin-toolbar">
        <input type="text" placeholder="Search by name or email..." />
        <select>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
        <button
          className="createBtn"
          onClick={() => navigate("/admin/create-user")}
        >
          + Create New User
        </button>
      </div>

      <div className="admin-table">
        <p className="admin-empty-state">
          No users loaded yet. Create a user to begin managing staff.
        </p>
      </div>
    </div>
  );
}