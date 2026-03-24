import { useEffect, useMemo, useState } from "react";
import "../../assets/styles/staff.css";

const TABS = {
  DASHBOARD: "dashboard",
  TASKS: "tasks",
  CHAT: "chat",
  NOTIFICATIONS: "notifications",
  ACTIVITY: "activity",
  PROFILE: "profile",
};

const mockTasks = [
  {
    id: 1,
    title: "Prepare innovation grant summary",
    project: "Digital Transformation Program",
    due: "Today",
    status: "In Progress",
    priority: "High",
  },
  {
    id: 2,
    title: "Review startup incubation report",
    project: "National Innovation Lab",
    due: "Tomorrow",
    status: "Pending",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Submit monthly performance metrics",
    project: "MINT KPIs",
    due: "In 3 days",
    status: "In Progress",
    priority: "High",
  },
];

const mockNotifications = [
  {
    id: 1,
    type: "Deadline",
    message: "Task “Prepare innovation grant summary” is due today.",
    time: "10 min ago",
  },
  {
    id: 2,
    type: "Project",
    message: "Your project “GovTech Innovation Portal” is awaiting director review.",
    time: "1 hr ago",
  },
  {
    id: 3,
    type: "System",
    message: "Your password was updated successfully.",
    time: "Yesterday",
  },
];

const mockActivity = [
  {
    id: 1,
    time: "Today · 09:24",
    action: "Marked task “Innovation grant summary” as In Progress",
  },
  {
    id: 2,
    time: "Yesterday · 16:10",
    action: "Submitted project update for “GovTech Innovation Portal”",
  },
  {
    id: 3,
    time: "Mar 12 · 11:03",
    action: "Uploaded work file to “Digital Skills Training Rollout”",
  },
];

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(
    () => localStorage.getItem("lang") || "en"
  );

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  const pageTitle = useMemo(() => {
    switch (activeTab) {
      case TABS.DASHBOARD:
        return "Dashboard";
      case TABS.TASKS:
        return "My Tasks";
      case TABS.CHAT:
        return "Chat";
      case TABS.NOTIFICATIONS:
        return "Notifications";
      case TABS.ACTIVITY:
        return "Activity Log";
      case TABS.PROFILE:
        return "Profile";
      default:
        return "Staff";
    }
  }, [activeTab]);

  return (
    <div className="staff-shell" data-theme={theme}>
      <div
        className={`staff-backdrop ${isSidebarOpen ? "staff-backdrop--open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`staff-sidebar ${isSidebarOpen ? "staff-sidebar--open" : ""}`}>
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
          <button
            className={`staff-nav-item ${
              activeTab === TABS.DASHBOARD ? "staff-nav-item--active" : ""
            }`}
            onClick={() => {
              setActiveTab(TABS.DASHBOARD);
              setIsSidebarOpen(false);
            }}
          >
            <span className="staff-nav-icon">
              <NavHomeIcon />
            </span>
            Dashboard
          </button>
          <button
            className={`staff-nav-item ${
              activeTab === TABS.TASKS ? "staff-nav-item--active" : ""
            }`}
            onClick={() => {
              setActiveTab(TABS.TASKS);
              setIsSidebarOpen(false);
            }}
          >
            <span className="staff-nav-icon">
              <NavTasksIcon />
            </span>
            My Tasks
          </button>
          <button
            className={`staff-nav-item ${
              activeTab === TABS.CHAT ? "staff-nav-item--active" : ""
            }`}
            onClick={() => {
              setActiveTab(TABS.CHAT);
              setIsSidebarOpen(false);
            }}
          >
            <span className="staff-nav-icon">
              <NavChatIcon />
            </span>
            Chat
          </button>
          <div className="staff-nav-divider" />
          <button
            className={`staff-nav-item ${
              activeTab === TABS.NOTIFICATIONS ? "staff-nav-item--active" : ""
            }`}
            onClick={() => {
              setActiveTab(TABS.NOTIFICATIONS);
              setIsSidebarOpen(false);
            }}
          >
            <span className="staff-nav-icon">
              <NavBellIcon />
            </span>
            Notifications
          </button>
          <button
            className={`staff-nav-item ${
              activeTab === TABS.ACTIVITY ? "staff-nav-item--active" : ""
            }`}
            onClick={() => {
              setActiveTab(TABS.ACTIVITY);
              setIsSidebarOpen(false);
            }}
          >
            <span className="staff-nav-icon">
              <NavActivityIcon />
            </span>
            Activity Log
          </button>
          <button
            className={`staff-nav-item ${
              activeTab === TABS.PROFILE ? "staff-nav-item--active" : ""
            }`}
            onClick={() => {
              setActiveTab(TABS.PROFILE);
              setIsSidebarOpen(false);
            }}
          >
            <span className="staff-nav-icon">
              <NavProfileIcon />
            </span>
            Profile
          </button>
        </nav>

        <div className="staff-sidebar__footer">
          <button className="staff-logout" title="logout" type="button">
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

      <main className="staff-main">
        <header className="staff-topbar">
          <button
            className="staff-icon-btn"
            title="menu"
            type="button"
            onClick={() => setIsSidebarOpen((v) => !v)}
          >
            <HamburgerIcon />
          </button>

          <div className="staff-topbar-search">
            <SearchIcon />
            <input
              type="text"
              className="staff-topbar-search-input"
              placeholder="Search..."
            />
          </div>

          <div className="staff-topbar-title">{pageTitle}</div>

          <div className="staff-topbar-actions">
            <button
              className="staff-icon-btn"
              title="notifications"
              type="button"
              onClick={() => setActiveTab(TABS.NOTIFICATIONS)}
            >
              <BellIcon />
            </button>

            <button
              className="staff-icon-btn"
              title={theme === "light" ? "dark mode" : "light mode"}
              type="button"
              onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>

            <button
              className="staff-icon-btn staff-lang"
              title="language"
              type="button"
              onClick={() => setLanguage((l) => (l === "en" ? "am" : "en"))}
            >
              <LanguageIcon />
            </button>
          </div>
        </header>

        <section className="staff-content">
          {activeTab === TABS.DASHBOARD && (
            <DashboardHome tasks={mockTasks} notifications={mockNotifications} />
          )}
          {activeTab === TABS.TASKS && <MyTasks tasks={mockTasks} />}
          {activeTab === TABS.CHAT && <Chat />}
          {activeTab === TABS.NOTIFICATIONS && (
            <NotificationsPage notifications={mockNotifications} />
          )}
          {activeTab === TABS.ACTIVITY && (
            <ActivityLog activity={mockActivity} />
          )}
          {activeTab === TABS.PROFILE && <ProfilePage />}
        </section>
      </main>
    </div>
  );
};

const DashboardHome = ({ tasks, notifications }) => {
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const pending = tasks.filter((t) => t.status === "Pending").length;

  return (
    <>
      <div className="staff-welcome">
        <h1 className="staff-welcome-title">Welcome, Staff Member</h1>
        <p className="staff-welcome-subtitle">
          Track your tasks, collaborate with your team, and keep projects moving
          for MINT.
        </p>
      </div>
      <div className="staff-grid staff-grid--cols-3">
        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">Assigned Tasks</div>
          <div className="staff-card-value">{totalTasks}</div>
          <div className="staff-card-caption">
            Tasks assigned to you this period
          </div>
        </div>
        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">In Progress</div>
          <div className="staff-card-value staff-card-value--warning">
            {inProgress}
          </div>
          <div className="staff-card-caption">
            Stay focused on high-priority work
          </div>
        </div>
        <div className="staff-card staff-card--metric">
          <div className="staff-card-label">Completed</div>
          <div className="staff-card-value staff-card-value--success">
            {completed}
          </div>
          <div className="staff-card-caption">
            Great progress towards MINT objectives
          </div>
        </div>
      </div>

      <div className="staff-grid staff-grid--cols-2">
        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Task Completion Overview</h2>
          </div>
          <div className="staff-chart">
            <div className="staff-chart-row">
              <span>Completed</span>
              <div className="staff-chart-bar">
                <div
                  className="staff-chart-bar-fill staff-chart-bar-fill--success"
                  style={{
                    width: totalTasks
                      ? `${(completed / totalTasks) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="staff-chart-value">{completed}</span>
            </div>
            <div className="staff-chart-row">
              <span>In Progress</span>
              <div className="staff-chart-bar">
                <div
                  className="staff-chart-bar-fill staff-chart-bar-fill--warning"
                  style={{
                    width: totalTasks
                      ? `${(inProgress / totalTasks) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="staff-chart-value">{inProgress}</span>
            </div>
            <div className="staff-chart-row">
              <span>Pending</span>
              <div className="staff-chart-bar">
                <div
                  className="staff-chart-bar-fill staff-chart-bar-fill--muted"
                  style={{
                    width: totalTasks
                      ? `${(pending / totalTasks) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="staff-chart-value">{pending}</span>
            </div>
          </div>
        </div>

        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Deadline Alerts</h2>
          </div>
          <ul className="staff-list">
            {tasks.map((task) => (
              <li key={task.id} className="staff-list-item">
                <div>
                  <div className="staff-list-title">{task.title}</div>
                  <div className="staff-list-meta">
                    {task.project} · Due {task.due}
                  </div>
                </div>
                <span
                  className={`staff-badge staff-badge--${
                    task.priority === "High"
                      ? "danger"
                      : task.priority === "Medium"
                      ? "warning"
                      : "muted"
                  }`}
                >
                  {task.priority} priority
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="staff-grid staff-grid--stack staff-profile-layout">
        <div className="staff-card">
          <div className="staff-card-header">
            <h2>Recent Notifications</h2>
          </div>
          <ul className="staff-list">
            {notifications.map((n) => (
              <li key={n.id} className="staff-list-item">
                <div>
                  <div className="staff-list-title">{n.message}</div>
                  <div className="staff-list-meta">{n.time}</div>
                </div>
                <span className="staff-badge staff-badge--muted">
                  {n.type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

const MyTasks = ({ tasks }) => {
  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <div>
          <h2>My Tasks</h2>
          <p className="staff-card-subtitle">
            View assigned tasks, upload work files, and update your progress.
          </p>
        </div>
        <div className="staff-header-actions">
          <button className="staff-btn staff-btn--primary">New Task</button>
          <button className="staff-btn staff-btn--ghost">Message manager</button>
        </div>
      </div>

      <div className="staff-table-wrapper">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Due</th>
              <th>Status</th>
              <th>Upload work file</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <div className="staff-table-title">{task.title}</div>
                </td>
                <td>{task.project}</td>
                <td>{task.due}</td>
                <td>
                  <select className="staff-select" defaultValue={task.status}>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </td>
                <td>
                  <label className="staff-upload">
                    <input type="file" className="staff-upload-input" />
                    <span>Choose file</span>
                  </label>
                </td>
                <td>
                  <div className="staff-table-actions">
                    <button className="staff-btn staff-btn--ghost staff-btn--xs">
                      Mark completed
                    </button>
                    <button className="staff-btn staff-btn--primary staff-btn--xs">
                      Submit work
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

const Chat = () => {
  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
        <h2>Team Chat</h2>
        <p className="staff-card-subtitle">
          Stay connected with your manager and colleagues.
        </p>
      </div>
      <div className="staff-chat">
        <div className="staff-chat-sidebar">
          <div className="staff-chat-section-title">Conversations</div>
          <button className="staff-chat-thread staff-chat-thread--active">
            Manager · Innovation Directorate
          </button>
          <button className="staff-chat-thread">Innovation Team</button>
        </div>
        <div className="staff-chat-main">
          <div className="staff-chat-messages">
            <div className="staff-chat-message staff-chat-message--incoming">
              <div className="staff-chat-message-meta">Manager · 09:15</div>
              <div className="staff-chat-message-bubble">
                Please share the updated innovation grant summary before 4 PM.
              </div>
            </div>
            <div className="staff-chat-message staff-chat-message--outgoing">
              <div className="staff-chat-message-meta">You · 09:18</div>
              <div className="staff-chat-message-bubble">
                Working on it now. I will upload the file under “My Tasks” once
                completed.
              </div>
            </div>
          </div>
          <form
            className="staff-chat-input-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="staff-chat-tools">
              <label
                className="staff-chat-tool staff-chat-tool--file"
                title="file"
              >
                <input type="file" className="staff-upload-input" />
                +
              </label>
              <button
                type="button"
                className="staff-chat-tool staff-chat-tool--voice"
                title="voice"
              >
                <MicIcon />
              </button>
              <button
                type="button"
                className="staff-chat-tool staff-chat-tool--camera"
                title="camera"
              >
                <CameraIcon />
              </button>
            </div>
            <input
              type="text"
              placeholder="Type a message to your manager..."
              className="staff-input"
            />
            <button
              className="staff-btn staff-btn--primary staff-btn--sm staff-chat-send"
              title="send"
              type="submit"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

const HamburgerIcon = () => (
  <svg {...iconProps}>
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const BellIcon = () => (
  <svg {...iconProps}>
    <path
      d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 19a1.5 1.5 0 003 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg {...iconProps}>
    <path
      d="M21 13.2A7.6 7.6 0 1110.8 3a6.2 6.2 0 0010.2 10.2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const SunIcon = () => (
  <svg {...iconProps}>
    <path
      d="M12 18a6 6 0 100-12 6 6 0 000 12Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MicIcon = () => (
  <svg {...iconProps}>
    <path
      d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M19 11a7 7 0 11-14 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 18v3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CameraIcon = () => (
  <svg {...iconProps}>
    <path
      d="M9 7l1.2-2h3.6L15 7h3a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M12 16a3 3 0 100-6 3 3 0 000 6Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const SendIcon = () => (
  <svg {...iconProps}>
    <path
      d="M21 3L10 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21 3l-7 18-4-7-7-4 18-7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg {...iconProps}>
    <circle
      cx="11"
      cy="11"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M16 16l4 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const LanguageIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path
      d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg {...iconProps}>
    <path
      d="M10 7V6a2 2 0 012-2h7a2 2 0 012 2v12a2 2 0 01-2 2h-7a2 2 0 01-2-2v-1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M4 12h10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 9l-3 3 3 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const navIconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

const NavHomeIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5Z"
      fill="currentColor"
    />
  </svg>
);

const NavTasksIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7Z"
      fill="currentColor"
      opacity="0.35"
    />
    <path
      d="M8.5 12l2 2 5-5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NavChatIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M5 6.5A2.5 2.5 0 017.5 4h9A2.5 2.5 0 0119 6.5v6A2.5 2.5 0 0116.5 15H10l-3.5 3V15H7.5A2.5 2.5 0 015 12.5v-6Z"
      fill="currentColor"
    />
    <circle cx="9" cy="9.5" r="1" fill="#0b3f91" />
    <circle cx="12" cy="9.5" r="1" fill="#0b3f91" />
    <circle cx="15" cy="9.5" r="1" fill="#0b3f91" />
  </svg>
);

const NavBellIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M12 3.5a4.5 4.5 0 00-4.5 4.5V10c0 1.8-.8 3.4-2 4.5h13c-1.2-1.1-2-2.7-2-4.5V8A4.5 4.5 0 0012 3.5Z"
      fill="currentColor"
    />
    <path
      d="M10 17a2 2 0 004 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const NavActivityIcon = () => (
  <svg {...navIconProps}>
    <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.35" />
    <path
      d="M12 7v5l3 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NavProfileIcon = () => (
  <svg {...navIconProps}>
    <circle cx="12" cy="8" r="3.5" fill="currentColor" />
    <path
      d="M5 19a7 7 0 0114 0H5Z"
      fill="currentColor"
      opacity="0.8"
    />
  </svg>
);

const NotificationsPage = ({ notifications }) => {
  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <div>
          <h2>Notifications</h2>
          <p className="staff-card-subtitle">
            Central place for all task, project, and system updates.
          </p>
        </div>
        <button className="staff-btn staff-btn--ghost">Mark all as read</button>
      </div>

      <div className="staff-filters">
        <button className="staff-filter staff-filter--active">All</button>
        <button className="staff-filter">Tasks</button>
        <button className="staff-filter">Projects</button>
        <button className="staff-filter">System</button>
      </div>

      <ul className="staff-list staff-list--spacious">
        {notifications.map((n) => (
          <li key={n.id} className="staff-list-item">
            <div>
              <div className="staff-list-title">{n.message}</div>
              <div className="staff-list-meta">{n.time}</div>
            </div>
            <span className="staff-badge staff-badge--muted">{n.type}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ActivityLog = ({ activity }) => {
  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
        <h2>Activity Log</h2>
        <p className="staff-card-subtitle">
          Audit trail of your recent actions in the system.
        </p>
      </div>

      <ul className="staff-timeline">
        {activity.map((item) => (
          <li key={item.id} className="staff-timeline-item">
            <div className="staff-timeline-dot" />
            <div className="staff-timeline-content">
              <div className="staff-timeline-time">{item.time}</div>
              <div className="staff-timeline-action">{item.action}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ProfilePage = () => {
  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
        <h2>Profile</h2>
        <p className="staff-card-subtitle">
          Update your personal information and account security.
        </p>
      </div>

      <div className="staff-grid staff-grid--cols-2 staff-grid--stack">
        <div className="staff-profile-block">
          <h3>Personal Information</h3>
          <div className="staff-profile-avatar">
            <div className="staff-profile-avatar-circle">SM</div>
            <label className="staff-upload staff-upload--inline">
              <input type="file" className="staff-upload-input" />
              <span>Upload new picture</span>
            </label>
          </div>
          <form
            className="staff-form-grid"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="staff-form-field">
              <label>Full name</label>
              <input
                type="text"
                className="staff-input"
                placeholder="Enter your full name"
              />
            </div>
            <div className="staff-form-field">
              <label>Position</label>
              <input
                type="text"
                className="staff-input"
                placeholder="e.g. Innovation Officer"
              />
            </div>
            <div className="staff-form-field">
              <label>Department</label>
              <input
                type="text"
                className="staff-input"
                placeholder="e.g. Digital Transformation"
              />
            </div>
            <div className="staff-form-field">
              <label>Work email</label>
              <input
                type="email"
                className="staff-input"
                placeholder="name@mint.gov"
              />
            </div>
            <div className="staff-form-actions">
              <button className="staff-btn staff-btn--primary">
                Save changes
              </button>
            </div>
          </form>
        </div>

        <div className="staff-profile-block">
          <h3>Security</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="staff-form-field">
              <label>Current password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Enter current password"
              />
            </div>
            <div className="staff-form-field">
              <label>New password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Enter new password"
              />
            </div>
            <div className="staff-form-field">
              <label>Confirm new password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Re-enter new password"
              />
            </div>
            <div className="staff-form-actions">
              <button className="staff-btn staff-btn--primary">
                Change password
              </button>
            </div>
          </form>

          <div className="staff-profile-divider" />

          <h3>Account</h3>
          <p className="staff-card-subtitle">
            Keep your account information up to date to receive important
            updates from MINT.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
