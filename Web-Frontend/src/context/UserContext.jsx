import { createContext, useState, useEffect, useCallback } from "react";
import {
  getAllUsers,
  getStaff,
  updateUser,
  toggleUserStatus,
} from "../api/userApi";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ ADD THIS (mock logged-in user for now)
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("user");
    }
  }, [currentUser]);

  // ─── Fetch all users from DB ───────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // add this extra check too
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user._id) return;

  // ✅ Staff don't need the users list at all
  if (user.role === "staff") return;


    try {
      setLoading(true);
      // const user = JSON.parse(localStorage.getItem("user"));
      const res =
        user?.role === "admin" ? await getAllUsers() : await getStaff();

      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ─── Edit user ─────────────────────────────────────────────────────────────
  const editUser = useCallback(async (id, updatedData) => {
    const res = await updateUser(id, updatedData);
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, ...res.data } : u)),
    );
  }, []);

  // ─── Toggle active/inactive status ────────────────────────────────────────
  const toggleStatus = useCallback(async (id) => {
    const res = await toggleUserStatus(id);
   const updated = res.data.user; // ✅ extract user from { message, user }
   setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)));
  }, []);

  return (
    <UserContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers,
        editUser,
        toggleStatus,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
