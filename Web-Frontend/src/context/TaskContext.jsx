import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useNotifications } from "./NotificationContext";
import {
  getTasks,
  createTask,
  updateTaskStatus as apiUpdateStatus,
  deleteTask as apiDeleteTask,
} from "../api/taskApi";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fetchNotifications } = useNotifications();

  //─── Fetch all tasks from DB
  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    // const interval = setInterval(fetchTasks, 15000); // refetch every 15s
    // return () => clearInterval(interval);
  }, [fetchTasks]);

  // update task status
  const updateTaskStatus = useCallback(
    async (id, status, comment = "") => {
      await apiUpdateStatus(id, status, comment);
      await fetchTasks(); // ✅ refetch real data from backend
      fetchNotifications();
    },
    [fetchTasks, fetchNotifications],
  );

  // ─── 🆕 Assign task  / create a new task ────────────────────────────────────────────
  const assignTask = useCallback(
    async (formData) => {
      const res = await createTask(formData);
      await fetchTasks(); // ✅ refetch instead of prepending
      fetchNotifications();
      return res.data;
    },
    [fetchTasks, fetchNotifications],
  );

  // ─── Delete a task ─────────────────────────────────────────────────────────
  const deleteTask = useCallback(async (id) => {
    await apiDeleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  // submit work
  const submitTask = useCallback(
    (id) => updateTaskStatus(id, "Completed"),
    [updateTaskStatus],
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        updateTaskStatus,
        assignTask,
        deleteTask,
        submitTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
