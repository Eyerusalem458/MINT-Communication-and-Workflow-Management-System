export const mockTasks = [
  {
    id: 1,
    title: "Prepare innovation grant summary",
    project: "Digital Transformation Program",
    assignedTo: "John Doe",
    due: "2026-04-05",
    status: "In Progress",
    priority: "High",
    createdAt: "2026-04-01",
    completedAt: null,
    file: "https://via.placeholder.com/150",
    comment: "please fix the ui", // 🔥 NEW
    description:
      "Analyze grant requirements and provide recommendations in the final report.",
  },
  {
    id: 2,
    title: "Review startup incubation report",
    project: "National Innovation Lab",
    assignedTo: "Sara Ali",
    due: "2026-04-06",
    status: "Pending",
    priority: "Medium",
    createdAt: "2026-04-02",
    completedAt: null,
    file: "report.pdf",
    comment: "", // 🔥 NEW
    description:
      "Check KPIs and compliance before sharing with the project's steering committee.",
  },
  {
    id: 3,
    title: "Submit monthly performance metrics",
    project: "MINT KPIs",
    assignedTo: "John Doe",
    due: "2026-04-07",
    status: "Completed",
    priority: "High",
    createdAt: "2026-04-01",
    completedAt: "2026-04-03",
    file: "metrics.docx",
    comment: "", // 🔥 NEW
    description:
      "Compile work progress and highlight priorities for the next cycle.",
  },

  // others
  ...Array.from({ length: 9 }, (_, i) => ({
    id: i + 4,
    title: "Update project documentation",
    project: "GovTech Portal",
    assignedTo: "Sara Ali",
    due: "2026-04-09",
    status: "Pending",
    priority: "Low",
    createdAt: "2026-04-03",
    completedAt: null,
    file: null,
    comment: "", // 🔥 NEW
    description: "Ensure all documents are up to date.",
  })),
];

export const mockNotifications = [
  {
    id: 1,
    type: "Deadline",
    message: "Task “Prepare innovation grant summary” is due today.",
    time: "10 min ago",
    unseen: true,
  },
  {
    id: 2,
    type: "System",
    message:
      "Your project “GovTech Innovation Portal” is awaiting director review.",
    time: "1 hr ago",
    unseen: false,
  },
  {
    id: 3,
    type: "System",
    message: "Your password was updated successfully.",
    time: "Yesterday",
  },
  {
    id: 4,
    type: "Personal",
    message: "New message from Manager: Please review the draft report.",
    time: "5 min ago",
    unseen: true,
  },
  {
    id: 5,
    type: "Personal",
    message: "John sent you a message in chat.",
    time: "20 min ago",
    unseen: false,
  },
  {
    id: 6,
    type: "task",
    message: "Prepare innovation grant summary.",
    time: "5 min ago",
    unseen: true,
  },
];

export const mockActivity = [
  {
    id: 1,
    time: "Today · 09:24",
    action: "Marked task “Innovation grant summary” as In Progress",
  },
  {
    id: 2,
    time: "Yesterday · 16:10",
    action: "Submitted project update for “GovTech Innovation Portal”",
  },
  {
    id: 3,
    time: "Mar 12 · 11:03",
    action: "Uploaded work file to “Digital Skills Training Rollout”",
  },
];

export const mockProjects = [
  {
    id: 1,
    title: "AI-based Agriculture System",
    description: "Using AI to improve farming decisions",
    createdBy: "John Doe",
    department: "IT",
    status: "Pending",
    createdAt: "2026-04-01",
    file: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: 2,
    title: "E-Government Portal",
    description: "Digital service delivery platform",
    createdBy: "Sara Ali",
    department: "Software",
    status: "Pending",
    createdAt: "2026-04-02",
    file: "https://via.placeholder.com/300", // image preview
  },
  {
    id: 3,
    title: "Website Redesign",
    description: "Improve UI/UX of company website",
    createdBy: "John Doe",
    department: "IT",
    status: "Pending",
    createdAt: "2026-03-20",
    file: null,
  },
  {
    id: 4,
    title: "Mobile App",
    description: "Build mobile application",
    createdBy: "Jane Smith",
    department: "Development",
    status: "Approved",
    createdAt: "2026-03-18",
    file: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: 5,
    title: "E-Government Portal",
    description: "Digital service delivery platform",
    createdBy: "Sara Ali",
    department: "Software",
    status: "Pending",
    createdAt: "2026-04-02",
    file: null,
  },
  {
    id: 6,
    title: "E-Government Portal",
    description: "Digital service delivery platform",
    createdBy: "Sara Ali",
    department: "Software",
    status: "Pending",
    createdAt: "2026-04-02",
    file: null,
  },
  {
    id: 7,
    title: "E-Government Portal",
    description: "Digital service delivery platform",
    createdBy: "Sara Ali",
    department: "Software",
    status: "Pending",
    createdAt: "2026-04-02",
    file: null,
  },
  {
    id: 8,
    title: "E-Government Portal",
    description: "Digital service delivery platform",
    createdBy: "Sara Ali",
    department: "Software",
    status: "Pending",
    createdAt: "2026-04-02",
    file: null,
  },
  {
    id: 9,
    title: "E-Government Portal",
    description: "Digital service delivery platform",
    createdBy: "Sara Ali",
    department: "Software",
    status: "Pending",
    createdAt: "2026-04-02",
    file: null,
  },
  {
    id: 10,
    title: "E-Government Portal",
    description: "Digital service delivery platform",
    createdBy: "Sara Ali",
    department: "Software",
    status: "Pending",
    createdAt: "2026-04-02",
    file: null,
  },
];
