const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

const navIconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
};

// --- Common Icons ---
export const HamburgerIcon = () => (
  <svg {...iconProps}>
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const BellIcon = () => (
  <svg {...iconProps}>
    <path
      d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 19a1.5 1.5 0 003 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const MoonIcon = () => (
  <svg {...iconProps}>
    <path
      d="M21 13.2A7.6 7.6 0 1110.8 3a6.2 6.2 0 0010.2 10.2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const SunIcon = () => (
  <svg {...iconProps}>
    <path
      d="M12 18a6 6 0 100-12 6 6 0 000 12Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const CameraIcon = () => (
  <svg {...iconProps}>
    <path
      d="M9 7l1.2-2h3.6L15 7h3a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M12 16a3 3 0 100-6 3 3 0 000 6Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
export const MicIcon = () => (
  <svg {...iconProps}>
    <path
      d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M19 11a7 7 0 11-14 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 18v3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
export const SearchIcon = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 16l4 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
export const SendIcon = () => (
  <svg {...iconProps}>
    <path
      d="M21 3L10 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M21 3l-7 18-4-7-7-4 18-7Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);
export const LogoutIcon = () => (
  <svg {...iconProps}>
    <path
      d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 8l6 4-6 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 12H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
export const LanguageIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path
      d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
// --- Navigation Icons ---
export const NavHomeIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5Z"
      fill="currentColor"
    />
  </svg>
);

export const NavTasksIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M4 7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7Z"
      fill="currentColor"
      opacity="0.35"
    />
    <path
      d="M8.5 12l2 2 5-5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const NavChatIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M5 6.5A2.5 2.5 0 017.5 4h9A2.5 2.5 0 0119 6.5v6A2.5 2.5 0 0116.5 15H10l-3.5 3V15H7.5A2.5 2.5 0 015 12.5v-6Z"
      fill="currentColor"
    />
    <circle cx="9" cy="9.5" r="1" fill="#0b3f91" />
    <circle cx="12" cy="9.5" r="1" fill="#0b3f91" />
    <circle cx="15" cy="9.5" r="1" fill="#0b3f91" />
  </svg>
);

export const NavBellIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M12 3.5a4.5 4.5 0 00-4.5 4.5V10c0 1.8-.8 3.4-2 4.5h13c-1.2-1.1-2-2.7-2-4.5V8A4.5 4.5 0 0012 3.5Z"
      fill="currentColor"
    />
    <path
      d="M10 17a2 2 0 004 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const NavActivityIcon = () => (
  <svg {...navIconProps}>
    <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.35" />
    <path
      d="M12 7v5l3 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const NavProfileIcon = () => (
  <svg {...navIconProps}>
    <circle cx="12" cy="8" r="3.5" fill="currentColor" />
    <path d="M5 19a7 7 0 0114 0H5Z" fill="currentColor" opacity="0.8" />
  </svg>
);

export const NavProjectIcon = () => (
  <svg {...navIconProps}>
    <path d="M3 6h18v12H3V6Z" fill="currentColor" opacity="0.35" />
    <path
      d="M3 6h18v12H3V6Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const NavReportsIcon = () => (
  <svg {...navIconProps}>
    <path d="M4 4h16v16H4V4Z" fill="currentColor" opacity="0.35" />
    <path
      d="M4 4h16v16H4V4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M8 12h8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const NavSettingsIcon = () => (
  <svg {...navIconProps}>
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    <path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H12a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V12a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const NavStaffIcon = () => (
  <svg {...navIconProps}>
    <circle cx="12" cy="7" r="3" fill="currentColor" />
    <path d="M5 19a7 7 0 0114 0H5Z" fill="currentColor" opacity="0.8" />
  </svg>
);

// --- Manager/Admin Extra Icons ---
export const NavCreateUserIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z"
      fill="currentColor"
    />
    <path
      d="M4 20v-2c0-2.67 5.33-4 8-4s8 1.33 8 4v2H4Z"
      fill="currentColor"
      opacity="0.7"
    />
    <path
      d="M20 8v4M18 10h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const NavProjectRequestIcon = () => (
  <svg {...navIconProps}>
    <path d="M4 4h16v16H4V4Z" fill="currentColor" opacity="0.35" />
    <path
      d="M4 4h16v16H4V4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M8 8h8M8 12h8M8 16h8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
