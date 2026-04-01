import { useState } from "react";
import {
  BellIcon,
  HamburgerIcon,
  LanguageIcon,
  MoonIcon,
  SunIcon,
} from "./icons";
import { TABS } from "../utils/Constants/constants";

const Topbar = ({
  pageTitle,
  theme,
  language,
  onToggleSidebar,
  onToggleTheme,
  onToggleLanguage,
  onOpenNotifications,
}) => {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="staff-topbar">
      <button
        className="staff-icon-btn"
        title="menu"
        type="button"
        onClick={onToggleSidebar}
      >
        <HamburgerIcon />
      </button>

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

        <div style={{ position: "relative" }}>
          <button
            className="staff-icon-btn staff-lang"
            title="language"
            type="button"
            onClick={() => setLangOpen((v) => !v)}
          >
            <LanguageIcon />
          </button>
          {langOpen && (
            <div className="staff-lang-dropdown">
              <button
                onClick={() => {
                  onToggleLanguage("en");
                  setLangOpen(false);
                }}
                type="button"
              >
                English
              </button>
              <button
                onClick={() => {
                  onToggleLanguage("am");
                  setLangOpen(false);
                }}
                type="button"
              >
                Amharic
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
