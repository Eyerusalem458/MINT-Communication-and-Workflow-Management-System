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
  <svg
    {...navIconProps}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
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
  <svg
    {...navIconProps}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
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
  <svg
    {...navIconProps}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
    <circle cx="12" cy="12" r="3" />
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

export const RefreshIcon = () => (
  <svg {...iconProps}>
    <path
      d="M20 12a8 8 0 10-2.34 5.66M20 4v6h-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
// --- Chat Sidebar Icons ---
export const FilterIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M3 5h18M6 12h12M10 19h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const EditIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M4 20h4l10-10-4-4L4 16v4Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const PlusIcon = () => (
  <svg {...navIconProps}>
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
export const VideoIcon = ({ size = 24, color = "currentColor" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="6" width="14" height="12" rx="2" ry="2" />
      <polygon points="16 12 22 8 22 16 16 12" />
    </svg>
  );
};
export const PhoneIcon = ({ size = 18, color = "currentColor" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 
               19.79 19.79 0 0 1-8.63-3.07 
               19.5 19.5 0 0 1-6-6 
               19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 
               12.84 12.84 0 0 0 .7 2.81 
               2 2 0 0 1-.45 2.11L8.09 9.91 
               a16 16 0 0 0 6 6l1.27-1.27 
               a2 2 0 0 1 2.11-.45 
               12.84 12.84 0 0 0 2.81.7 
               A2 2 0 0 1 22 16.92z"
      />
    </svg>
  );
};
export const MailIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    width="20"
    height="20"
  >
    <path
      d="M4 6h16v12H4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M4 6l8 7 8-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export const LockIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    width="20"
    height="20"
  >
    <path
      d="M6 10V7a6 6 0 0112 0v3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect
      x="5"
      y="10"
      width="14"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);