import { createContext, useContext, useState } from "react";
import { mockProjects } from "../utils/data";
import { useNotifications } from "./NotificationContext";

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(mockProjects);
  const { addNotification } = useNotifications();

  // ➕ Add project (Staff)
  const addProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);

    addNotification({
      type: "Project",
      message: `Project "${project.title}" submitted and waiting approval ⏳`,
    });
  };

  // ✏️ Edit project (Staff)
  const editProject = (id, updatedData) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p)),
    );
  };

  // ❌ Cancel project (Staff)
  const cancelProject = (id) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Cancelled" } : p)),
    );
  };

  // ✅ Approve (Manager)
 const approveProject = (id) => {
   setProjects((prev) =>
     prev.map((p) => {
       if (p.id === id) {
         addNotification(`Your project "${p.title}" was approved ✅`, "System");
         return { ...p, status: "Approved" };
       }
       return p;
     }),
   );
 };


  // ❌ Reject (Manager)
  const rejectProject = (id) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          addNotification(
            `Your project "${p.title}" was rejected ❌`,
            "System",
          );
          return { ...p, status: "Rejected" };
        }
        return p;
      }),
    );
  };


  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        editProject,
        cancelProject,
        approveProject,
        rejectProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};;;
