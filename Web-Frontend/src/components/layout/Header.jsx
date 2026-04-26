import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";
import { UserContext } from "../../context/UserContext";
import { TAB_CONFIG } from "../../utils/Constants/tabConfig";
import { AuthContext } from "../../context/AuthContext";
import {
  
  BellIcon,
  HamburgerIcon,
  LanguageIcon,
  MoonIcon,
  SunIcon,
  RefreshIcon,
} from "../../pages/shared/icon";

const Header = ({
  pageTitle,
  theme,
  onToggleSidebar,
  onToggleTheme,
  onToggleLanguage,
  onOpenNotifications,
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications } = useContext(NotificationContext);
  const { user } = useContext(AuthContext);
// const { currentUser } = useContext(UserContext);
  const unseenCount = notifications.filter((n) => n.unseen).length;

const fullName =
  user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.role?.toUpperCase() || "User";;

const role = user?.role?.toUpperCase() || "STAFF";

const initials =
  user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.role?.[0]?.toUpperCase() || "U";

  const handleNotificationsClick = () => {
    onOpenNotifications(); // update active tab
  };

const handleProfileClick = () => {
  const role = user?.role?.toLowerCase();

  if (!role) return;

  let path = "";

  if (role === "staff") {
    path = TAB_CONFIG.STAFF_PROFILE.path; // "/profile"
  } else if (role === "manager") {
    path = TAB_CONFIG.MANAGER_SETTINGS.path; // "/settings"
  } else if (role === "admin") {
    path = TAB_CONFIG.ADMIN_SETTINGS.path; // "/settings"
  }

  // ✅ THIS IS THE FIX
  navigate(`/${role}${path}`);
};

  return (
    <header className="staff-topbar">
      <button
        className="staff-icon-btn"
        title="menu"
        type="button"
        onClick={onToggleSidebar}
      >
        <HamburgerIcon />
      </button>

      <div className="staff-topbar-title">{pageTitle}</div>

      <div className="staff-topbar-actions">
        {/* Notifications */}
        <button
          className="staff-icon-btn"
          title="notifications"
          type="button"
          onClick={handleNotificationsClick}
          style={{ position: "relative" }}
        >
          <BellIcon />
          {unseenCount > 0 && (
            <span className="notif-badge">{unseenCount}</span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          className="staff-icon-btn"
          title={theme === "light" ? "dark mode" : "light mode"}
          type="button"
          onClick={onToggleTheme} // ✅ calls Layout's theme
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Language dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="staff-icon-btn staff-lang"
            title="language"
            type="button"
            onClick={() => setLangOpen((v) => !v)}
          >
            <LanguageIcon />
          </button>

          {langOpen && (
            <div className="staff-lang-dropdown">
              <button
                onClick={() => {
                  onToggleLanguage("en");
                  setLangOpen(false);
                }}
                type="button"
              >
                English
              </button>
              <button
                onClick={() => {
                  onToggleLanguage("am");
                  setLangOpen(false);
                }}
                type="button"
              >
                Amharic
              </button>
            </div>
          )}
        </div>
        {/* 🔄 Refresh */}
        <button
          className="staff-icon-btn"
          title="refresh"
          type="button"
          onClick={() => {
            window.location.href = window.location.pathname;
          }}
        >
          <RefreshIcon />
        </button>

        {/* 👤 User Info */}
        <div
          className="staff-user-info"
          style={{ cursor: "pointer" }}
          onClick={handleProfileClick}
        >
          <div className="staff-user-avatar">{initials}</div>

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
