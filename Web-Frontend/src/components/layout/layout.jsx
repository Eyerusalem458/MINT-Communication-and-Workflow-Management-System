import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="layout" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main content area */}
      <div
        className="main"
        style={{
          flex: 1,
          transition: "margin-left 0.3s ease",
          marginLeft: isSidebarOpen ? "250px" : "60px", // adjust widths
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header onToggleSidebar={handleToggleSidebar} />

        <div className="content" style={{ padding: "20px", flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
