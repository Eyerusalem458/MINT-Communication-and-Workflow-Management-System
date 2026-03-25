import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SplashScreen from "../pages/SplashScreen";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ProtectedRoute from "../pages/auth/ProtectedRoute";

import ManagerDashboard from "../pages/manager/Dashboard";
import Dashboard from "../pages/staff/Dashboard";
import MyTasks from "../pages/staff/MyTasks";
import Profile from "../pages/staff/Profile";
import Chat from "../pages/staff/Chat";
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
          path="/manager/dashboard"
          element={
            <ProtectedRoute role="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Staff Routes with Layout */}
        <Route
          path="/staff/"
          element={
            <ProtectedRoute role="staff">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="chat" element={<Chat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="activity" element={<ActivityLog />} />
          {/* Show NotFound for unknown nested staff routes */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Show NotFound for any other  unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
