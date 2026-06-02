import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";
import { UserContext } from "../../context/UserContext";
import { TAB_CONFIG } from "../../utils/Constants/tabConfig";
import { AuthContext } from "../../context/AuthContext";
import {
  BellIcon,
  HamburgerIcon,
  MoonIcon,
  SunIcon,
  RefreshIcon,
} from "../../pages/shared/icon";

const Header = ({
  pageTitle,
  theme,
  onToggleSidebar,
  onToggleTheme,
  onOpenNotifications,
}) => {
  const navigate = useNavigate();
  const { notifications, unseenCount } = useContext(NotificationContext);
  const { user } = useContext(AuthContext);

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.role?.toUpperCase() || "User";

  const role = user?.role?.toUpperCase() || "STAFF";

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user?.role?.[0]?.toUpperCase() || "U";

  const handleProfileClick = () => {
    const role = user?.role?.toLowerCase();
    if (!role) return;
    let path = "";
    if (role === "staff") path = TAB_CONFIG.STAFF_PROFILE.path;
    else if (role === "manager") path = TAB_CONFIG.MANAGER_SETTINGS.path;
    else if (role === "admin") path = TAB_CONFIG.ADMIN_SETTINGS.path;
    navigate(`/${role}${path}`);
  };

  return (
    <header className="staff-topbar">
      <button className="staff-icon-btn" title="menu" type="button" onClick={onToggleSidebar}>
        <HamburgerIcon />
      </button>

      <div className="staff-topbar-title">{pageTitle}</div>

      <div className="staff-topbar-actions">
        {/* Notifications */}
        <button className="staff-icon-btn" title="notifications" type="button" onClick={onOpenNotifications} style={{ position: "relative" }}>
          <BellIcon />
          {unseenCount > 0 && <span className="notif-badge">{unseenCount}</span>}
        </button>

        {/* Theme toggle */}
        <button className="staff-icon-btn" title={theme === "light" ? "dark mode" : "light mode"} type="button" onClick={onToggleTheme}>
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Refresh */}
        <button className="staff-icon-btn" title="refresh" type="button" onClick={() => { window.location.href = window.location.pathname; }}>
          <RefreshIcon />
        </button>

        {/* User Info */}
        <div className="staff-user-info" style={{ cursor: "pointer" }} onClick={handleProfileClick}>
          {user?.avatar ? (
            <img src={`http://localhost:5000${user.avatar}`} alt="avatar" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div className="staff-user-avatar">{initials}</div>
          )}
          <div className="staff-user-text">
            <div className="staff-user-name">{fullName}</div>
            <div className="staff-user-role">{role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
