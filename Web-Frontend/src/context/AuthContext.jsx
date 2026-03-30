// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import { loginUser } from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading until user is initialized

  // Initialize user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setUser({ token, role }); // we only need role and token for tabs
    }

    setLoading(false); // finished loading
  }, []);

  const login = async (data) => {
    setLoading(true);
    try {
      const res = await loginUser(data);
      const { user: loggedUser, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", loggedUser.role);

      setUser(loggedUser);

      return loggedUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
