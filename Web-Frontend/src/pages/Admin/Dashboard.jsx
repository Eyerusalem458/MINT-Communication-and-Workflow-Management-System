import { useState, useEffect } from "react";
import { FaUsers, FaUserTie, FaUserShield, FaUserCheck } from "react-icons/fa";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ComposedChart,
} from "recharts";
import { getUserStats, getAllUsers } from "../../api/userApi";
import API from "../../api/axios";

// ── colour helpers ────────────────────────────────────────────────────────
const DEPT_COLORS = [
  "#2196F3",
  "#4CAF50",
  "#FF9800",
  "#F44336",
  "#9C27B0",
  "#00BCD4",
  "#FF5722",
  "#607D8B",
];

const ENTITY_DOT = {
  User: "#4CAF50",
  Auth: "#607D8B",
  Conversation: "#9C27B0",
  Message: "#2196F3",
  Group: "#FF9800",
  default: "#90A4AE",
};

function dotColor(entity) {
  return ENTITY_DOT[entity] ?? ENTITY_DOT.default;
}

// ── build last-6-months skeleton ─────────────────────────────────────────
function buildMonthSlots() {
  const slots = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      month: d.toLocaleString("en-US", { month: "short" }),
      newUsers: 0,
      active: 0,
    });
  }
  return slots;
}

// ── relative time ─────────────────────────────────────────────────────────
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// ─────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    managers: 0,
    staff: 0,
    activeUsers: 0,
  });
  const [activity, setActivity] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [chartData, setChartData] = useState(buildMonthSlots());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // 1. stats
        const statsRes = await getUserStats();
        setStats(statsRes.data);

        // 2. activity logs  (GET /api/activity)
        const actRes = await API.get("/activity");
        setActivity(actRes.data.slice(0, 8));

        // 3. all users → departments + registration chart
        const usersRes = await getAllUsers();
        const users = usersRes.data;

        // departments
        const deptMap = {};
        users.forEach((u) => {
          const dept = u.department || "Unassigned";
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });
        const deptArr = Object.entries(deptMap)
          .map(([name, count], i) => ({
            name,
            count,
            color: DEPT_COLORS[i % DEPT_COLORS.length],
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setDeptData(deptArr);

        // registration chart
        const slots = buildMonthSlots();
        users.forEach((u) => {
          const d = new Date(u.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const slot = slots.find((s) => s.key === key);
          if (slot) {
            slot.newUsers += 1;
            if (u.status === "Active") slot.active += 1;
          }
        });
        setChartData(slots);
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── derived role distribution ─────────────────────────────────────────
  const adminCount = Math.max(0, stats.total - stats.managers - stats.staff);
  const roleDist =
    stats.total > 0
      ? [
          {
            name: "Admin",
            value: Math.round((adminCount / stats.total) * 100),
            color: "#4CAF50",
          },
          {
            name: "Manager",
            value: Math.round((stats.managers / stats.total) * 100),
            color: "#2196F3",
          },
          {
            name: "Staff",
            value: Math.round((stats.staff / stats.total) * 100),
            color: "#FF9800",
          },
        ]
      : [
          { name: "Admin", value: 0, color: "#4CAF50" },
          { name: "Manager", value: 0, color: "#2196F3" },
          { name: "Staff", value: 0, color: "#FF9800" },
        ];

  const maxDept = deptData.length
    ? Math.max(...deptData.map((d) => d.count))
    : 1;

  const activeRate =
    stats.total > 0 ? Math.round((stats.activeUsers / stats.total) * 100) : 0;

  const cards = [
    {
      icon: <FaUsers color="white" size={24} />,
      bg: "#4CAF50",
      label: "Total Users",
      val: stats.total,
      sub: `${activeRate}% active rate`,
    },
    {
      icon: <FaUserTie color="white" size={24} />,
      bg: "#2196F3",
      label: "Total Managers",
      val: stats.managers,
      sub: "Across departments",
    },
    {
      icon: <FaUserShield color="white" size={24} />,
      bg: "#FF9800",
      label: "Total Staff",
      val: stats.staff,
      sub: "Departments covered",
    },
    {
      icon: <FaUserCheck color="white" size={24} />,
      bg: "#F44336",
      label: "Active Users",
      val: stats.activeUsers,
      sub: `${stats.total - stats.activeUsers} inactive`,
    },
  ];

  return (
    <>
      <style>{`
        .db-page {
          padding: 24px;
          background: #f0f2f5;
          min-height: 100vh;
          font-family: 'Segoe UI', sans-serif;
          box-sizing: border-box;
        }
        .db-top { margin-bottom: 20px; }
        .db-top p { margin: 0; color: #555; font-size: 14px; }

        /* cards */
        .db-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        .db-card {
          background: #fff;
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .db-card-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .db-card h4 { margin: 0; font-size: 13px; color: #666; font-weight: 500; }
        .db-card h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a2e; }
        .db-card-sub { font-size: 11px; color: #888; }

        /* middle */
        .db-mid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        /* widget */
        .db-widget {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
        }
        .db-widget h3 {
          margin: 0 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        /* role */
        .role-legend { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .role-item   { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #444; }
        .role-dot    { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .role-bar-wrap { flex: 1; height: 6px; background: #eee; border-radius: 99px; overflow: hidden; }
        .role-bar-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }
        .role-pct    { font-size: 12px; color: #888; min-width: 32px; text-align: right; }

        /* bottom */
        .db-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* dept */
        .dept-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 13px; color: #444; }
        .dept-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dept-bar-wrap { width: 110px; height: 6px; background: #eee; border-radius: 99px; overflow: hidden; }
        .dept-bar-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }
        .dept-count { min-width: 14px; text-align: right; font-weight: 600; color: #333; }

        /* activity */
        .activity-list { display: flex; flex-direction: column; gap: 14px; }
        .activity-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #444; }
        .activity-dot  { width: 10px; height: 10px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
        .activity-time { font-size: 11px; color: #aaa; margin-top: 2px; }

        /* loading skeleton */
        .db-skeleton { background: #e8eaed; border-radius: 8px; animation: pulse 1.4s ease infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        @media (max-width: 768px) {
          .db-mid    { grid-template-columns: 1fr; }
          .db-bottom { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="db-page">
        <div className="db-top">
          <p>Overview of admin activity and user statistics</p>
        </div>

        {/* stat cards */}
        <div className="db-cards">
          {cards.map(({ icon, bg, label, val, sub }) => (
            <div className="db-card" key={label}>
              <div className="db-card-icon" style={{ backgroundColor: bg }}>
                {icon}
              </div>
              <h4>{label}</h4>
              {loading ? (
                <div
                  className="db-skeleton"
                  style={{ height: 36, width: 60 }}
                />
              ) : (
                <h1>{val}</h1>
              )}
              <span className="db-card-sub">{sub}</span>
            </div>
          ))}
        </div>

        {/* chart + role dist */}
        <div className="db-mid">
          <div className="db-widget">
            <h3>📊 User registrations — last 6 months</h3>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="newUsers"
                  name="New users"
                  fill="#90CAF9"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  name="Active"
                  stroke="#4CAF50"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="db-widget">
            <h3>🥧 Role distribution</h3>
            <div className="role-legend">
              {roleDist.map(({ name, value, color }) => (
                <div className="role-item" key={name}>
                  <span className="role-dot" style={{ background: color }} />
                  <span style={{ minWidth: 64 }}>{name}</span>
                  <div className="role-bar-wrap">
                    <div
                      className="role-bar-fill"
                      style={{ width: `${value}%`, background: color }}
                    />
                  </div>
                  <span className="role-pct">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* departments + activity */}
        <div className="db-bottom">
          <div className="db-widget">
            <h3>🏢 Top departments by users</h3>
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="db-skeleton"
                  style={{ height: 14, marginBottom: 16, borderRadius: 6 }}
                />
              ))
            ) : deptData.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: 13 }}>
                No department data yet.
              </p>
            ) : (
              deptData.map(({ name, count, color }) => (
                <div className="dept-row" key={name}>
                  <span className="dept-name">{name}</span>
                  <div className="dept-bar-wrap">
                    <div
                      className="dept-bar-fill"
                      style={{
                        width: `${(count / maxDept) * 100}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <span className="dept-count">{count}</span>
                </div>
              ))
            )}
          </div>

          <div className="db-widget">
            <h3>🕐 Recent activity</h3>
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="db-skeleton"
                  style={{ height: 36, marginBottom: 14, borderRadius: 6 }}
                />
              ))
            ) : activity.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: 13 }}>No activity yet.</p>
            ) : (
              <div className="activity-list">
                {activity.map((log) => (
                  <div className="activity-item" key={log.id}>
                    <span
                      className="activity-dot"
                      style={{ background: dotColor(log.entity) }}
                    />
                    <div>
                      <div>
                        {log.user ? (
                          <>
                            <strong>
                              {log.user.firstName} {log.user.lastName}
                            </strong>
                            {" — "}
                          </>
                        ) : null}
                        {log.action}
                      </div>
                      <div className="activity-time">
                        {relativeTime(log.time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
