import { FaUsers, FaUserTie, FaUserShield, FaUserCheck } from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className="admin-page">
      <div className="admin-top">
        <h2>Dashboard</h2>
        <p>Overview of admin activity and user statistics</p>
      </div>

      <div className="admin-cards">
        <div className="admin-card">
          <div className="admin-card-icon" style={{ backgroundColor: "#4CAF50" }}>
            <FaUsers color="white" size={24} />
          </div>
          <h4>Total Users</h4>
          <h1>1</h1>
        </div>

        <div className="admin-card">
          <div className="admin-card-icon" style={{ backgroundColor: "#2196F3" }}>
            <FaUserTie color="white" size={24} />
          </div>
          <h4>Total Managers</h4>
          <h1>0</h1>
        </div>

        <div className="admin-card">
          <div className="admin-card-icon" style={{ backgroundColor: "#FF9800" }}>
            <FaUserShield color="white" size={24} />
          </div>
          <h4>Total Staff</h4>
          <h1>0</h1>
        </div>

        <div className="admin-card">
          <div className="admin-card-icon" style={{ backgroundColor: "#F44336" }}>
            <FaUserCheck color="white" size={24} />
          </div>
          <h4>Active Users</h4>
          <h1>1</h1>
        </div>
      </div>

      <div className="admin-activity">
        <h3>Recent Activity</h3>
        <div className="admin-activity-item">
          <div className="admin-avatar">A</div>
          <div>
            <p>Admin User</p>
            <span>admin@example.com</span>
          </div>
          <span className="admin-role">Admin</span>
        </div>
      </div>
    </div>
  );
}