import { createContext, useContext, useState } from "react";
import { mockTasks } from "../utils/data";

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(mockTasks);

  // update task status
  const updateTaskStatus = (id, status, comment) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id !== id) return task;

        return {
          ...task,
          status,
          comment: comment ? comment.trim() : task.comment,
          completedAt:
            status === "Completed"
              ? new Date().toISOString()
              : task.completedAt, // ❗ IMPORTANT FIX
        };
      }),
    );
  };

  // submit work
  const submitTask = (id) => {
    updateTaskStatus(id, "Completed");
  };

  return (
    <TaskContext.Provider value={{ tasks, updateTaskStatus, submitTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
