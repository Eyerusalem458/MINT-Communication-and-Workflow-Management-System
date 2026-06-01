import { NavLink, useNavigate } from "react-router-dom";
import { LogoutIcon } from "../../pages/shared/icon";
import logo from "../../assets/images/logo.png";

const Sidebar = ({
  isOpen,
  tabs,
  basePath,
  onTabChange,
  onLogout,
}) => {
  
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <aside
      className={`staff-sidebar ${isOpen ? "staff-sidebar--open" : ""}`}
      style={{
        width: isOpen ? "250px" : "60px",
        transition: "width 0.3s ease",
      }}
    >
      <div className="staff-sidebar__brand">
        <img src={logo} alt="Logo" className="staff-logo" />
        {isOpen && (
          <div>
            <div className="staff-brand-title">STREAMLINED COLLABORATION</div>
          </div>
        )}
      </div>

      <nav className="staff-nav">
        {tabs.map((item, index) => (
          <div key={item.key}>
            <NavLink
              to={`${basePath}${item.path}`}
              className={({ isActive }) =>
                isActive
                  ? "staff-nav-item staff-nav-item--active"
                  : "staff-nav-item"
              }
            >
              <span className="staff-nav-icon">
                {item.icon && <item.icon />}
              </span>
              {isOpen && <span>{item.label}</span>}
            </NavLink>
            {/* 👇 divider after every 3 items */}
            {(index + 1) % 3 === 0 && index !== tabs.length - 1 && (
              <div className="staff-nav-divider" />
            )}
          </div>
        ))}
      </nav>

      <div className="staff-sidebar__footer">
        <button
          className="staff-logout"
          title="logout"
          type="button"
          onClick={handleLogout}
        >
          <LogoutIcon />
        </button>
        <div className="staff-sidebar__meta-block">
          <div className="staff-sidebar-meta">
            <div className="staff-sidebar-meta-label">Today</div>
            <div className="staff-sidebar-meta-value">
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
          <div className="staff-sidebar-meta">
            <div className="staff-sidebar-meta-label">Focus</div>
            <div className="staff-sidebar-meta-value">
              Innovation & Service Excellence
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
