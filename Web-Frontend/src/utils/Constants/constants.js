// 🔥 ROLES
export const ROLES = {
  STAFF: "staff",
  MANAGER: "manager",
  ADMIN: "admin",
};

// 🔥 ALL TABS (central definition)
export const TABS = {
  DASHBOARD: "dashboard",
  TASKS: "tasks",
  CHAT: "chat",
  NOTIFICATIONS: "notifications",
  ACTIVITY: "activity",
  PROFILE: "profile",

  // Manager
  STAFF_MANAGEMENT: "staff_management",
  REPORTS: "reports",
  SYSTEM_SETTINGS: "system_settings",
  PROJECT_REQUESTS: "project_requests",

  // Admin
  USER_MANAGEMENT: "user_management",
  CREATE_USER: "create_user",
  ADMIN_CHAT: "admin_chat",
  ADMIN_NOTIFICATIONS: "admin_notifications",
  ADMIN_SETTINGS: "admin_settings",
  ADMIN_ACTIVITY: "admin_activity",
};

// 🔥 ROLE-BASED ACCESS (what each role can see)
export const ROLE_TABS = {
  staff: [
    "STAFF_DASHBOARD",
    "STAFF_TASKS",
    "STAFF_CHAT",
    "STAFF_NOTIFICATIONS",
    "STAFF_ACTIVITY",
    "STAFF_PROFILE",
  ],
  manager: [
    "MANAGER_DASHBOARD",
    "MANAGER_TASKS",
    "MANAGER_STAFF_MANAGEMENT",
    "MANAGER_CHAT",
    "MANAGER_REPORTS",
    "MANAGER_PROJECT_REQUESTS",
    "MANAGER_NOTIFICATIONS",
    "MANAGER_ACTIVITY",
    "MANAGER_SETTINGS",
  ],
  admin: [
    "ADMIN_DASHBOARD",
    "ADMIN_USER_MANAGEMENT",
    "ADMIN_CREATE_USER",
    "ADMIN_CHAT",
    "ADMIN_NOTIFICATIONS",
    "ADMIN_ACTIVITY",
    "ADMIN_SETTINGS",
  ],
};

// 🔥 PAGE TITLES
export const getPageTitle = (activeTab) => {
  switch (activeTab) {
    case TABS.DASHBOARD:
      return "Dashboard";

    case TABS.TASKS:
      return "My Tasks";

    case TABS.CHAT:
    case TABS.ADMIN_CHAT:
      return "Chat";

    case TABS.NOTIFICATIONS:
    case TABS.ADMIN_NOTIFICATIONS:
      return "Notifications";

    case TABS.ACTIVITY:
    case TABS.ADMIN_ACTIVITY:
      return "Activity Log";

    case TABS.PROFILE:
      return "Profile";

    case TABS.STAFF_MANAGEMENT:
      return "Staff Management";

    case TABS.USER_MANAGEMENT:
      return "User Management";

    case TABS.CREATE_USER:
      return "Create User";

    case TABS.REPORTS:
      return "Reports";

    case TABS.SYSTEM_SETTINGS:
    case TABS.ADMIN_SETTINGS:
      return "Settings";

    case TABS.PROJECT_REQUESTS:
      return "Project Requests";

    default:
      return "Dashboard";
  }
};
