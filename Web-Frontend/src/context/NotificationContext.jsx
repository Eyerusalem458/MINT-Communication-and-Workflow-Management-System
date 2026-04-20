

// Backend (API) ---> notificationApi.js ---> NotificationContext ---> Notifications.jsx / Header
/* Important:

Right now, if you are only doing frontend and mocking notifications, you don’t need notificationApi.js yet. You can just use NotificationContext with some dummy data to test Notifications.jsx and the bell icon.
Later, when backend is ready, you connect notificationApi.js to fetch real notifications and update the context.*/

import { createContext, useState, useContext } from "react";
import { mockNotifications } from "../utils/data";

export const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(mockNotifications);

  // ➕ Add notification
  const addNotification = (message,type ="System") => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      time: "Just now",
      unseen: true,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  // 👁 mark as read
  // const markAsRead = (id) => {
  //   setNotifications((prev) =>
  //     prev.map((n) => (n.id === id ? { ...n, unseen: false } : n)),
  //   );
  // };

  // 🔄 mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unseen: false })));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        addNotification,
        // markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
