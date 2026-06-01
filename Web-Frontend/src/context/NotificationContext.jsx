import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

import {
  getNotifications as apiFetch,
  markAllAsRead as apiMarkAll,
  markAsRead as apiMarkOne,
} from "../api/notificationApi";

// import { mockNotifications } from "../utils/data";

export const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await apiFetch();

      setNotifications(res.data);
      const count = res.data.filter((n) => n.unseen).length;
      setUnseenCount(count);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ➕ Add notification
  // const addNotification = useCallback((message, type = "System") => {
  //   const newNotif = {
  //     _id: Date.now().toString(),
  //     message,
  //     type,
  //     time:"Just now",
  //     unseen: true,
  //     createdAt: new Date().toISOString(),
  //   };

  //   setNotifications((prev) => [newNotif, ...prev]);
  //   setUnseenCount((prev) => prev + 1);
  // }, []);

  // 🔄 mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiMarkAll();

      setNotifications((prev) => prev.map((n) => ({ ...n, unseen: false })));

      setUnseenCount(0);
    } catch (err) {
      console.error("Mark all failed:", err);
    }
  }, []);

  // 👁 Mark one
  const markOneAsRead = useCallback(async (id) => {
    try {
      await apiMarkOne(id);

      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, unseen: false } : n)),
      );

      setUnseenCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark one failed:", err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unseenCount,
        loading,
        // addNotification,
        markAllAsRead,
        markOneAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
