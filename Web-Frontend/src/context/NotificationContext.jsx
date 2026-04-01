import { createContext, useState } from "react";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Backend (API) ---> notificationApi.js ---> NotificationContext ---> Notifications.jsx / Header
/* Important:

Right now, if you are only doing frontend and mocking notifications, you don’t need notificationApi.js yet. You can just use NotificationContext with some dummy data to test Notifications.jsx and the bell icon.
Later, when backend is ready, you connect notificationApi.js to fetch real notifications and update the context.*/
