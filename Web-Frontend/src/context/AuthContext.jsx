// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { loginUser, getMe } from "../api/authApi";
import { connectSocket, disconnectSocket } from "../utils/socket";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading until user is initialized

  // Initialize user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then((res) => {
          // ✅ if user is inactive, log them out immediately
          if (res.data.status === "Inactive") {
            localStorage.clear();
            setUser(null);
            return;
          }
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
          // Fix #2: reconnect socket on page refresh
          connectSocket(res.data._id);
        })
        .catch(() => {
          // localStorage.removeItem("token");
          // localStorage.removeItem("role"); 
          //   localStorage.removeItem("user");
            localStorage.clear();// Fix #1: clean up role too
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
const login = async (credentials) => {
  try {
    const res = await loginUser(credentials);
    const { token, user } = res.data;

    if (user.status === "Inactive") {
      throw new Error("Your account is deactivated. Contact admin.");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
    connectSocket(user._id);

    return user;
  } catch (err) {
    // ✅ convert 403 axios error to readable message
    if (err.response?.status === 403) {
      throw new Error("Your account is deactivated. Contact admin.");
    }
    throw err; // re-throw other errors
  }
};

  const logout = () => {
    // localStorage.removeItem("token");
    // localStorage.removeItem("role");
    // localStorage.removeItem("user");
    localStorage.clear(); // Clear all localStorage data on logout
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
