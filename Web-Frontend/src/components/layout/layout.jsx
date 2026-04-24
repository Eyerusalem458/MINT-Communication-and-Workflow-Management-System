import { useState, useContext, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AuthContext } from "../../context/AuthContext";
import { ROLE_TABS, TABS, getPageTitle } from "../../utils/Constants/constants";
import { TAB_CONFIG } from "../../utils/Constants/tabConfig";

export default function Layout() {
  const { user, logout, loading } = useContext(AuthContext);
  const location = useLocation(); // ✅ track current URL
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("lang") || "en",
  );

  // Map roles to base paths
  const roleBasePaths = {
    staff: "/staff",
    manager: "/manager",
    admin: "/admin",
  };

  // persist theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme; // global theme for CSS
  }, [theme]);

  // persist language
  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  const handleLogout = () => logout();
  const handleToggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const handleToggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  const handleToggleLanguage = (lang) => setLanguage(lang || "en");
  // to open notification tab from header
  const handleOpenNotifications = () => {
    const basePath = roleBasePaths[user?.role] || "";
    navigate(`${basePath}/notifications`);
  };

  // compute tabs based on user role
  const tabs = user
    ? (ROLE_TABS[user.role] || [])
        .map((tabKey) => TAB_CONFIG[tabKey])
        .filter(Boolean)
    : [];

  // ✅ derive activeTab from URL (NO STATE)
  const basePath = roleBasePaths[user?.role] || "";
  const currentTab = tabs.find((tab) =>
    location.pathname.startsWith(basePath + tab.path),
  );

  const activeTab = currentTab?.path?.replace("/", "") || TABS.DASHBOARD;

const roleLabel = user?.role
  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
  : "";

const pageLabel = currentTab?.label || "Dashboard";

const breadcrumb = `${roleLabel} / ${pageLabel}`;

  if (loading) return <div style={{ padding: 20 }}>Loading User...</div>; // optional: loading screen

  return (
    <div
      className="layout staff-shell"
      data-theme={theme}
      style={{ display: "flex", minHeight: "100vh" }}
    >
      <Sidebar
        tabs={tabs}
        isOpen={isSidebarOpen}
        onLogout={handleLogout}
        basePath={roleBasePaths[user?.role] || "/"}
      />

      <div className="staff-main">
        <Header
          pageTitle={breadcrumb}
          theme={theme}
          onToggleSidebar={handleToggleSidebar}
          onToggleTheme={handleToggleTheme}
          onToggleLanguage={handleToggleLanguage}
          onOpenNotifications={handleOpenNotifications}
        />

        <div className="content">
          <Outlet context={{ activeTab }} />
        </div>
      </div>
    </div>
  );
}
