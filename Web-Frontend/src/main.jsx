import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./assets/styles/Global.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext.jsx"; // <-- import your context
import { ProjectProvider } from "./context/ProjectContext";
import { TaskProvider } from "./context/TaskContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <ProjectProvider>
          {" "}
          {/* Wrap App with AuthProvider */}
          <App />
          <ToastContainer /> {/* Toast notifications */}
        </ProjectProvider>
      </TaskProvider>
    </AuthProvider>
  </StrictMode>,
);
