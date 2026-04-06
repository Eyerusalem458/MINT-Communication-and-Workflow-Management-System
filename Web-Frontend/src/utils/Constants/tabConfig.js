// src/utils/Constants/tabConfig.js
import {
  NavHomeIcon,
  NavTasksIcon,
  NavChatIcon,
  NavBellIcon,
  NavActivityIcon,
  NavProfileIcon,
  NavStaffIcon,
  NavReportsIcon,
  NavSettingsIcon,
  NavProjectIcon,
  NavCreateUserIcon,
} from "../../pages/shared/icon"; // correct path

import { TABS } from "./constants";

export const TAB_CONFIG = {
  // Staff tabs
  STAFF_DASHBOARD: {
    key: "STAFF_DASHBOARD",
    label: "Dashboard",
    icon: NavHomeIcon,
    path: "/dashboard",
  },
  STAFF_TASKS: {
    key: "STAFF_TASKS",
    label: "My Tasks",
    icon: NavTasksIcon,
    path: "/tasks",
  },
  STAFF_PROJECTS: {
    key: "STAFF_PROJECTS",
    label: "My Projects",
    icon: NavProjectIcon,
    path: "/projects",
  },
  STAFF_CHAT: {
    key: "STAFF_CHAT",
    label: "Chat",
    icon: NavChatIcon,
    path: "/chat",
  },
  STAFF_NOTIFICATIONS: {
    key: "STAFF_NOTIFICATIONS",
    label: "Notifications",
    icon: NavBellIcon,
    path: "/notifications",
  },
  STAFF_ACTIVITY: {
    key: "STAFF_ACTIVITY",
    label: "Activity Log",
    icon: NavActivityIcon,
    path: "/activity",
  },
  STAFF_PROFILE: {
    key: "STAFF_PROFILE",
    label: "Profile",
    icon: NavProfileIcon,
    path: "/profile",
  },

  // Manager tabs
  MANAGER_DASHBOARD: {
    key: "MANAGER_DASHBOARD",
    label: "Dashboard",
    icon: NavHomeIcon,
    path: "/dashboard",
  },
  MANAGER_TASKS: {
    key: "MANAGER_TASKS",
    label: "Task Management",
    icon: NavTasksIcon,
    path: "/taskManagement",
  },
  MANAGER_STAFF_MANAGEMENT: {
    key: "MANAGER_STAFF_MANAGEMENT",
    label: "Staff Management",
    icon: NavStaffIcon,
    path: "/staffManagement",
  },
  MANAGER_CHAT: {
    key: "MANAGER_CHAT",
    label: "Chat",
    icon: NavChatIcon,
    path: "/chat",
  },
  MANAGER_REPORTS: {
    key: "MANAGER_REPORTS",
    label: "Reports",
    icon: NavReportsIcon,
    path: "/reports",
  },
  MANAGER_NOTIFICATIONS: {
    key: "MANAGER_NOTIFICATIONS",
    label: "Notifications",
    icon: NavBellIcon,
    path: "/notifications",
  },
  MANAGER_PROJECT_REQUESTS: {
    key: "MANAGER_PROJECT_REQUESTS",
    label: "Project Requests",
    icon: NavProjectIcon,
    path: "/projectRequests",
  },
  MANAGER_ACTIVITY: {
    key: "MANAGER_ACTIVITY",
    label: "Activity Log",
    icon: NavActivityIcon,
    path: "/activity",
  },
  MANAGER_SETTINGS: {
    key: "MANAGER_SETTINGS",
    label: "Settings",
    icon: NavSettingsIcon,
    path: "/settings",
  },

  // Admin tabs
  ADMIN_DASHBOARD: {
    key: "ADMIN_DASHBOARD",
    label: "Dashboard",
    icon: NavHomeIcon,
    path: "/dashboard",
  },
  ADMIN_USER_MANAGEMENT: {
    key: "ADMIN_USER_MANAGEMENT",
    label: "User Management",
    icon: NavStaffIcon,
    path: "/users",
  },
  ADMIN_CREATE_USER: {
    key: "ADMIN_CREATE_USER",
    label: "Create User",
    icon: NavCreateUserIcon,
    path: "/create-user",
  },
  ADMIN_CHAT: {
    key: "ADMIN_CHAT",
    label: "Chat",
    icon: NavChatIcon,
    path: "/chat",
  },
  ADMIN_NOTIFICATIONS: {
    key: "ADMIN_NOTIFICATIONS",
    label: "Notifications",
    icon: NavBellIcon,
    path: "/notifications",
  },
  ADMIN_ACTIVITY: {
    key: "ADMIN_ACTIVITY",
    label: "Activity Log",
    icon: NavActivityIcon,
    path: "/activity",
  },
  ADMIN_SETTINGS: {
    key: "ADMIN_SETTINGS",
    label: "Settings",
    icon: NavSettingsIcon,
    path: "/settings",
  },
};
