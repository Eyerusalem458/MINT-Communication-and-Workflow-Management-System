import { NavLink, useNavigate } from "react-router-dom";
import {
  LogoutIcon,
  NavActivityIcon,
  NavBellIcon,
  NavChatIcon,
  NavHomeIcon,
  NavProfileIcon,
  NavTasksIcon,
} from "../../pages/shared/icon";

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();

  const navItems = [
    { path: "/staff/dashboard", label: "Dashboard", icon: <NavHomeIcon /> },
    { path: "/staff/tasks", label: "My Tasks", icon: <NavTasksIcon /> },
    { path: "/staff/chat", label: "Chat", icon: <NavChatIcon /> },
    {
      path: "/staff/notifications",
      label: "Notifications",
      icon: <NavBellIcon />,
    },
    {
      path: "/staff/activity",
      label: "Activity Log",
      icon: <NavActivityIcon />,
    },
    { path: "/staff/profile", label: "Profile", icon: <NavProfileIcon /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <aside
      className={`staff-sidebar ${isOpen ? "staff-sidebar--open" : "staff-sidebar--collapsed"}`}
      style={{
        width: isOpen ? "250px" : "60px",
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Brand */}
      <div className="staff-sidebar__brand">
        <div className="staff-logo-circle">M</div>
        {isOpen && (
          <div>
            <div className="staff-brand-title">MINT Staff Portal</div>
            <div className="staff-brand-subtitle">
              Ministry of Innovation & Technology
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="staff-nav">
        {navItems.map((item, index) => (
          <div key={item.path}>
            {index === 3 && <div className="staff-nav-divider" />}
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "staff-nav-item staff-nav-item--active"
                  : "staff-nav-item"
              }
            >
              <span className="staff-nav-icon">{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="staff-sidebar__footer">
        <button
          className="staff-logout"
          title="logout"
          type="button"
          onClick={handleLogout}
        >
          <LogoutIcon />
        </button>

        {isOpen && (
          <div className="staff-sidebar__meta-block">
            <div className="staff-sidebar-meta">
              <div className="staff-sidebar-meta-label">Today</div>
              <div className="staff-sidebar-meta-value">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="staff-sidebar-meta">
              <div className="staff-sidebar-meta-label">Focus</div>
              <div className="staff-sidebar-meta-value">
                Innovation & Service Excellence
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
