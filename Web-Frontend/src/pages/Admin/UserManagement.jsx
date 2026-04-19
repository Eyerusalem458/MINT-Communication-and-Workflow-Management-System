import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

export default function UserManagement() {
  const navigate = useNavigate();

  // Mock user data
  const users = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@mint.gov",
      role: "Admin",
      department: "Innovation & Technology",
      status: "Active"
    },
    {
      id: 2,
      name: "Manager One",
      email: "manager1@mint.gov",
      role: "Manager",
      department: "Digital Economy",
      status: "Active"
    },
    {
      id: 3,
      name: "Staff Member",
      email: "staff@mint.gov",
      role: "Staff",
      department: "Cyber Security",
      status: "Inactive"
    }
  ];

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
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate("/admin/create-user")}
        >
          + Create New User
        </Button>
      </div>

      <div className="admin-table">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f4f7fb" }}>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Name</th>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Email</th>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Role</th>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Department</th>
              <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ background: user.status === "Inactive" ? "#fef2f2" : "#fff" }}>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>{user.name}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>{user.email}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>{user.role}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>{user.department}</td>
                <td style={{ padding: 10, borderBottom: "1px solid #e5e7eb", color: user.status === "Inactive" ? "#dc2626" : "#16a34a" }}>{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}