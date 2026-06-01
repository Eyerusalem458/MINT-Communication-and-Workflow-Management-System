import { useState,useEffect } from "react";
import { FaUsers, FaUserTie, FaUserShield, FaUserCheck } from "react-icons/fa";
import
{getUserStats} from "../../api/userApi";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    managers: 0,
    staff: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    getUserStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-top">
        <p>Overview of admin activity and user statistics</p>
      </div>

      <div className="admin-cards">
        {[
          {
            icon: <FaUsers color="white" size={24} />,
            bg: "#4CAF50",
            label: "Total Users",
            val: stats.total,
          },
          {
            icon: <FaUserTie color="white" size={24} />,
            bg: "#2196F3",
            label: "Total Managers",
            val: stats.managers,
          },
          {
            icon: <FaUserShield color="white" size={24} />,
            bg: "#FF9800",
            label: "Total Staff",
            val: stats.staff,
          },
          {
            icon: <FaUserCheck color="white" size={24} />,
            bg: "#F44336",
            label: "Active Users",
            val: stats.activeUsers,
          },
        ].map(({ icon, bg, label, val }) => (
          <div className="admin-card" key={label}>
            <div className="admin-card-icon" style={{ backgroundColor: bg }}>
              {icon}
            </div>
            <h4>{label}</h4>
            <h1>{val}</h1>
          </div>
        ))}
      </div>
    </div>
  );
}
