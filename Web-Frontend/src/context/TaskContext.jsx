import { createContext, useContext, useState } from "react";
import { mockTasks } from "../utils/data";
import { useNotifications } from "./NotificationContext";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(mockTasks);
  const { addNotification } = useNotifications();

  // update task status
 const updateTaskStatus = (id, status, comment) => {
   setTasks((prevTasks) =>
     prevTasks.map((task) => {
       if (task.id !== id) return task;

       if (status === "In Progress") {
         addNotification(`Task "${task.title}" started 🛠`, "Task");
       }

       if (status === "Completed") {
         addNotification(`Task "${task.title}" completed ✅`, "Task");
       }

       return {
         ...task,
         status,
         comment: comment ? comment.trim() : task.comment,
         completedAt:
           status === "Completed" ? new Date().toISOString() : task.completedAt,
       };
     }),
   );
 };


  // submit work
  const submitTask = (id) => {
    updateTaskStatus(id, "Completed");
  };

  // 🆕 Assign task (for future manager use)
  const assignTask = (task) => {
    const newTask = {
      id: Date.now(),
      ...task,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);

    addNotification({
      type: "Task",
      message: `New task assigned: "${task.title}" 🛠`,
    });
  };

  return (
    <TaskContext.Provider value={{ tasks, updateTaskStatus, submitTask, assignTask }}>
      {children}
    </TaskContext.Provider>
  );
};;

export const useTasks = () => useContext(TaskContext);
