export const TABS = {
  DASHBOARD: "dashboard",
  TASKS: "tasks",
  CHAT: "chat",
  NOTIFICATIONS: "notifications",
  ACTIVITY: "activity",
  PROFILE: "profile",
};

export const getPageTitle = (activeTab) => {
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
};