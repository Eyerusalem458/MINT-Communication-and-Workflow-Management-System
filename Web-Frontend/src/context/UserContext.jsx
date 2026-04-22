import { createContext, useState,useEffect } from "react";
import { mockStaff } from "../utils/data";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(mockStaff);

  // ✅ ADD THIS (mock logged-in user for now)
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || mockStaff[0],
  );
  // later you will set this after login

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  // ➕ Add user
  const addUser = (user) => {
    setUsers((prev) => [...prev, user]);
  };

  // ✏️ Edit user
  const editUser = (id, updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)),
    );
  };

  // ❌ Delete user
  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <UserContext.Provider
      value={{
        users,
        addUser,
        editUser,
        deleteUser,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
