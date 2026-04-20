import { createContext, useState } from "react";
import { mockStaff } from "../utils/data";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(mockStaff);

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
    <UserContext.Provider value={{ users, addUser, editUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
};
