import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/styles/staff.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext.jsx"; // <-- import your context

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      {" "}
      {/* Wrap App with AuthProvider */}
      <App />
      <ToastContainer /> {/* Toast notifications */}
    </AuthProvider>
  </StrictMode>,
);
