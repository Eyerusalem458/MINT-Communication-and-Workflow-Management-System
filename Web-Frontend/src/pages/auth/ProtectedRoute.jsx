import { Navigate } from "react-router-dom";
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" />;
  }

  // ✅ inactive user → clear and redirect
  if (user.status === "Inactive") {
    localStorage.clear();
    return <Navigate to="/login" />;
  }

  if (role && role !== userRole) {
    return <Navigate to="/login" />;
  }

  return children;
};;

export default ProtectedRoute;
