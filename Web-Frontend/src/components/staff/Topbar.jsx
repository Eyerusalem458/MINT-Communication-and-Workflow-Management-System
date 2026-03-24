import {
  BellIcon,
  HamburgerIcon,
  LanguageIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "./icons";
import { TABS } from "../../utils/staff/constants";

const Topbar = ({
  pageTitle,
  theme,
  onToggleSidebar,
  onToggleTheme,
  onToggleLanguage,
  onOpenNotifications,
}) => {
  return (
    <header className="staff-topbar">
      <button className="staff-icon-btn" title="menu" type="button" onClick={onToggleSidebar}>
        <HamburgerIcon />
      </button>

      <div className="staff-topbar-search">
        <SearchIcon />
        <input type="text" className="staff-topbar-search-input" placeholder="Search..." />
      </div>

      <div className="staff-topbar-title">{pageTitle}</div>

      <div className="staff-topbar-actions">
        <button
          className="staff-icon-btn"
          title="notifications"
          type="button"
          onClick={() => onOpenNotifications(TABS.NOTIFICATIONS)}
        >
          <BellIcon />
        </button>

        <button
          className="staff-icon-btn"
          title={theme === "light" ? "dark mode" : "light mode"}
          type="button"
          onClick={onToggleTheme}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>

        <button className="staff-icon-btn staff-lang" title="language" type="button" onClick={onToggleLanguage}>
          <LanguageIcon />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
