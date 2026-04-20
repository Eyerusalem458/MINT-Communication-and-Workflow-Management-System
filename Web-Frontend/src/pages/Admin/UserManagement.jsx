import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

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
      status: "Active"
    },
    {
      id: 2,
      name: "Manager One",
      email: "manager1@mint.gov",
      role: "Manager",
      department: "Digital Economy",
      gender: "Female",
      status: "Active"
    },
    {
      id: 3,
      name: "Staff Member",
      email: "staff@mint.gov",
      role: "Staff",
      department: "Cyber Security",
      gender: "Male",
      status: "Inactive"
    },
    {
      id: 4,
      name: "Manager Two",
      email: "manager2@mint.gov",
      role: "Manager",
      department: "Innovation Hub Management",
      gender: "Male",
      status: "Active"
    },
    {
      id: 5,
      name: "Staff Jane",
      email: "jane.staff@mint.gov",
      role: "Staff",
      department: "Creative Works Development",
      gender: "Female",
      status: "Active"
    }
  ];

  const [roleFilter, setRoleFilter] = React.useState("");
  const [genderFilter, setGenderFilter] = React.useState("");
  const [deptFilter, setDeptFilter] = React.useState("");
  const [search, setSearch] = React.useState("");

  // Unique departments for dropdown
  const departments = Array.from(new Set(users.map(u => u.department)));
  const genders = ["Male", "Female"];

  const filteredUsers = users.filter(user => {
    return (
      (!roleFilter || user.role.toLowerCase() === roleFilter) &&
      (!genderFilter || user.gender === genderFilter) &&
      (!deptFilter || user.department === deptFilter) &&
      (!search || user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="user-management-container">
      <h2>User Management</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
          <option value="">All Genders</option>
          {genders.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate("/admin/create-user")}
        >
          + Create New User
        </Button>
      </div>
      <table className="user-table">
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
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.department}</td>
              <td>{user.gender}</td>
              <td>{user.status}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}