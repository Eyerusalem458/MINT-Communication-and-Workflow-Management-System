import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getProjects,
  createProject,
  updateProject,
  cancelProject as cancelProjectAPI,
  approveProject as approveProjectAPI,
  rejectProject as rejectProjectAPI,
} from "../api/projectApi";
import { useNotifications } from "./NotificationContext";
import { AuthContext } from "./AuthContext";

const ProjectContext = createContext();

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchNotifications } = useNotifications();

  // 🔄 Fetch all projects from backend
  const fetchProjects = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchProjects(); // ← only fetch when user is ready
  }, [user, fetchProjects]);

  // ➕ Add project (Staff)
  const addProject = async (formData) => {
    const res = await createProject(formData);
    const newProject = res.data;
    setProjects((prev) => [newProject, ...prev]);
   fetchNotifications();
  };

  // ✏️ Edit project (Staff)
  const editProject = async (id, formData) => {
    const res = await updateProject(id, formData);
    const updated = res.data;
    setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)));
  };

  // ❌ Cancel project (Staff)
  const cancelProject = async (id) => {
    const res = await cancelProjectAPI(id);
    const updated = res.data.project;
    setProjects((prev) => prev.map((p) => (p._id === id ? updated : p)));
  };

  // ✅ Approve (Manager)
  const approveProject = async (id) => {
    const res = await approveProjectAPI(id);
    const updated = res.data.project;
    setProjects((prev) =>
       prev.map((p) => (p._id === id ? updated : p))
   );
  fetchNotifications();
  };

  // ❌ Reject (Manager)
  const rejectProject = async (id, comment) => {
    const res = await rejectProjectAPI(id, comment);
    const updatedProject = res.data.project;
    setProjects((prev) =>
       prev.map((p) => (p._id === id ? updatedProject : p))
  );
   fetchNotifications();
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        addProject,
        editProject,
        cancelProject,
        approveProject,
        rejectProject,
        fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
