import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../assets/styles/staff.css";
import { TABS, getPageTitle } from "../../utils/constants";
import { mockActivity, mockNotifications, mockTasks } from "../../utils/data";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import DashboardHome from "../../components/DashboardHome";
import MyTasks from "../../components/MyTasks";
import Chat from "../../components/Chat";
import NotificationsPage from "../../components/NotificationsPage";
import ActivityLog from "../../components/ActivityLog";
import ProfilePage from "../../components/ProfilePage";

const StaffDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(() => localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="staff-shell" data-theme={theme}>
      <div
        className={`staff-backdrop ${isSidebarOpen ? "staff-backdrop--open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <Sidebar
        activeTab={activeTab}
        isOpen={isSidebarOpen}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      <main className="staff-main">
        <Topbar
          pageTitle={getPageTitle(activeTab)}
          theme={theme}
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          onToggleLanguage={() => setLanguage((l) => (l === "en" ? "am" : "en"))}
          onOpenNotifications={setActiveTab}
        />

        <section className="staff-content">
          {activeTab === TABS.DASHBOARD && (
            <DashboardHome tasks={mockTasks} notifications={mockNotifications} />
          )}
          {activeTab === TABS.TASKS && <MyTasks tasks={mockTasks} />}
          {activeTab === TABS.CHAT && <Chat />}
          {activeTab === TABS.NOTIFICATIONS && (
            <NotificationsPage notifications={mockNotifications} />
          )}
          {activeTab === TABS.ACTIVITY && <ActivityLog activity={mockActivity} />}
          {activeTab === TABS.PROFILE && <ProfilePage />}
        </section>
      </main>
    </div>
  );
};

export default StaffDashboard;
