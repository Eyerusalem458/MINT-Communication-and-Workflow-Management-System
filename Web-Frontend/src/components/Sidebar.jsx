import {
  LogoutIcon,
  NavActivityIcon,
  NavBellIcon,
  NavChatIcon,
  NavHomeIcon,
  NavProfileIcon,
  NavTasksIcon,
} from "./icons";
import { TABS } from "../utils/Constants/constants";

const Sidebar = ({ activeTab, isOpen, onTabChange, onLogout }) => {
  const navItems = [
    { key: TABS.DASHBOARD, label: "Dashboard", icon: <NavHomeIcon /> },
    { key: TABS.TASKS, label: "My Tasks", icon: <NavTasksIcon /> },
    { key: TABS.CHAT, label: "Chat", icon: <NavChatIcon /> },
    { key: TABS.NOTIFICATIONS, label: "Notifications", icon: <NavBellIcon /> },
    { key: TABS.ACTIVITY, label: "Activity Log", icon: <NavActivityIcon /> },
    { key: TABS.PROFILE, label: "Profile", icon: <NavProfileIcon /> },
  ];

  return (
    <aside className={`staff-sidebar ${isOpen ? "staff-sidebar--open" : ""}`}>
      <div className="staff-sidebar__brand">
        <div className="staff-logo-circle">M</div>
        <div>
          <div className="staff-brand-title">MINT Staff Portal</div>
          <div className="staff-brand-subtitle">
            Ministry of Innovation & Technology
          </div>
        </div>
      </div>

      <nav className="staff-nav">
        {navItems.map((item, index) => (
          <div key={item.key}>
            {index === 3 && <div className="staff-nav-divider" />}
            <button
              className={`staff-nav-item ${
                activeTab === item.key ? "staff-nav-item--active" : ""
              }`}
              onClick={() => onTabChange(item.key)}
            >
              <span className="staff-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          </div>
        ))}
      </nav>

      <div className="staff-sidebar__footer">
        <button
          className="staff-logout"
          title="logout"
          type="button"
          onClick={onLogout}
        >
          <LogoutIcon />
        </button>
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
      </div>
    </aside>
  );
};

export default Sidebar;
