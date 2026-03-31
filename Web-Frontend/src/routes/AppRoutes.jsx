import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashScreen from "../pages/SplashScreen";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ProtectedRoute from "../pages/auth/ProtectedRoute";
// manager Pages
import ManagerDashboard from "../pages/manager/Dashboard";
import StaffManagement from "../pages/manager/StaffManagement";
import TaskManagement from "../pages/manager/TaskManagement";
import Reports from "../pages/manager/Reports";
import Settings from "../pages/manager/Settings";
import ProjectRequest from "../pages/manager/ProjectRequests";
import ManagerChat from "../pages/manager/Chat";

//staff pages
import Dashboard from "../pages/staff/Dashboard";
import MyTasks from "../pages/staff/MyTasks";
import Profile from "../pages/staff/Profile";
import StaffChat from "../pages/staff/Chat";

// Admin pages
import AdminDashboard from "../pages/Admin/Dashboard";
import UserManagement from "../pages/Admin/UserManagement";
import CreateUser from "../pages/Admin/CreateUser";
import AdminChat from "../pages/Admin/Chat";
import AdminSettings from "../pages/Admin/Settings";

// shared pages
import Notifications from "../pages/shared/Notifications";
import ActivityLog from "../pages/shared/ActivityLog";
import NotFound from "../pages/shared/NotFound";
import Layout from "../components/layout/layout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Splash Screen */}
        <Route path="/" element={<SplashScreen />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Manager Dashboard */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute role="manager">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ManagerDashboard />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="staffManagement" element={<StaffManagement />} />
          <Route path="taskManagement" element={<TaskManagement />} />
          <Route path="chat" element={<ManagerChat />} />
          <Route path="reports" element={<Reports />} />
          <Route path="projectRequests" element={<ProjectRequest />} />
          <Route path="settings" element={<Settings />} />
          {/* Shared pages for manager */}
          <Route path="notifications" element={<Notifications />} />
          <Route path="activity" element={<ActivityLog />} />
        </Route>

        {/* Staff Routes with Layout */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="staff">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<StaffChat />} />
          <Route path="profile" element={<Profile />} />
          {/* shared pages for staff */}
          <Route path="notifications" element={<Notifications />} />
          <Route path="activity" element={<ActivityLog />} />
          {/* Show NotFound for unknown nested staff routes */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes with Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="create-user" element={<CreateUser />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* Shared pages for admin */}
          <Route path="notifications" element={<Notifications />} />
          <Route path="activity" element={<ActivityLog />} />

          {/* Show NotFound for unknown nested admin routes */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Show NotFound for any other  unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
