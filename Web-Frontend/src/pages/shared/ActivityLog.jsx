import { useState, useEffect } from "react";
import API from "../../api/axios";

const ENTITY_COLOR = {
  User: "#4CAF50",
  Auth: "#607D8B",
  Conversation: "#9C27B0",
  Message: "#2196F3",
  Group: "#FF9800",
  default: "#90A4AE",
};

function relativeTime(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr; // fallback for pre-formatted strings
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const ActivityLog = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  useEffect(() => {
    API.get("/activity")
      .then((res) => setActivity(res.data || []))
      .catch((err) => console.error("Failed to fetch activity:", err))
      .finally(() => setLoading(false));
  }, []);

  const entities = [...new Set(activity.map((a) => a.entity).filter(Boolean))];

  const filtered = activity.filter((item) => {
    const matchQ =
      !search ||
      item.action?.toLowerCase().includes(search.toLowerCase()) ||
      `${item.user?.firstName || ""} ${item.user?.lastName || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchE = !entityFilter || item.entity === entityFilter;
    return matchQ && matchE;
  });

  return (
    <>
      <style>{`
        .al-page { font-family: 'Segoe UI', sans-serif; box-sizing: border-box; }

        /* header */
        .al-header { margin-bottom: 16px; }
        .al-subtitle { margin: 0; color: #555; font-size: 14px; }

        /* stats */
        .al-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .al-stat {
          background: #fff; border-radius: 10px; padding: 12px 18px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07);
          display: flex; align-items: center; gap: 10px;
        }
        .al-stat-dot { width: 10px; height: 10px; border-radius: 50%; }
        .al-stat-val { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .al-stat-label { font-size: 12px; color: #666; }

        /* toolbar */
        .al-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .al-input {
          padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
          font-size: 13px; background: #f8f9fb; color: #333; outline: none;
          transition: border-color .2s;
        }
        .al-input:focus { border-color: #90CAF9; background: #fff; }
        .al-search { flex: 1; min-width: 180px; }

        /* timeline */
        .al-timeline { position: relative; padding-left: 28px; }
        .al-timeline::before {
          content: ""; position: absolute; left: 9px; top: 0; bottom: 0;
          width: 2px; background: #e8eaed; border-radius: 99px;
        }
        .al-item {
          position: relative; margin-bottom: 16px;
          background: #fff; border-radius: 10px; padding: 14px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
          border-left: 3px solid transparent;
          transition: box-shadow .15s;
        }
        .al-item:hover { box-shadow: 0 3px 10px rgba(0,0,0,.1); }
        .al-item::before {
          content: ""; position: absolute; left: -23px; top: 18px;
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--dot-color, #90A4AE);
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px var(--dot-color, #90A4AE);
        }
        .al-item-top { display: flex; align-items: flex-start; gap: 10px; }
        .al-entity-badge {
          display: inline-block; padding: 2px 8px; border-radius: 99px;
          font-size: 10px; font-weight: 700; white-space: nowrap; flex-shrink: 0;
        }
        .al-action { font-size: 13px; color: #222; font-weight: 500; flex: 1; }
        .al-user   { font-size: 12px; color: #888; margin-top: 4px; }
        .al-time   { font-size: 11px; color: #aaa; white-space: nowrap; flex-shrink: 0; }
        .al-empty  { text-align: center; padding: 48px 24px; color: #aaa; font-size: 14px; }
        .al-empty-icon { font-size: 36px; margin-bottom: 10px; }

        /* skeleton */
        .al-skeleton { background: #e8eaed; border-radius: 10px; animation: pulse 1.4s ease infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      <div className="al-page">
        <div className="al-header">
          <p className="al-subtitle">
            Audit trail of recent actions in the system.
          </p>
        </div>

        {/* stats */}
        {!loading && (
          <div className="al-stats">
            <div className="al-stat">
              <div className="al-stat-dot" style={{ background: "#2196F3" }} />
              <div>
                <div className="al-stat-val">{activity.length}</div>
                <div className="al-stat-label">Total Events</div>
              </div>
            </div>
            {entities.slice(0, 4).map((entity) => (
              <div className="al-stat" key={entity}>
                <div
                  className="al-stat-dot"
                  style={{
                    background: ENTITY_COLOR[entity] || ENTITY_COLOR.default,
                  }}
                />
                <div>
                  <div className="al-stat-val">
                    {activity.filter((a) => a.entity === entity).length}
                  </div>
                  <div className="al-stat-label">{entity}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* toolbar */}
        <div className="al-toolbar">
          <input
            type="search"
            className="al-input al-search"
            placeholder="Search actions or users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="al-input"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {entities.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </div>

        {/* timeline */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="al-skeleton" style={{ height: 68 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="al-empty">
            <div className="al-empty-icon">📋</div>
            No activity found.
          </div>
        ) : (
          <div className="al-timeline">
            {filtered.map((item) => {
              const color = ENTITY_COLOR[item.entity] || ENTITY_COLOR.default;
              const userName = item.user
                ? `${item.user.firstName || ""} ${item.user.lastName || ""}`.trim()
                : null;
              return (
                <div
                  className="al-item"
                  key={item.id}
                  style={{
                    "--dot-color": color,
                    borderLeftColor: color + "40",
                  }}
                >
                  <div className="al-item-top">
                    <div className="al-action">{item.action}</div>
                    <span
                      className="al-entity-badge"
                      style={{ background: color + "20", color }}
                    >
                      {item.entity}
                    </span>
                    <div className="al-time">{relativeTime(item.time)}</div>
                  </div>
                  {userName && (
                    <div className="al-user">
                      👤 {userName}
                      {item.user?.role && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 10,
                            background: "#f0f2f5",
                            padding: "1px 6px",
                            borderRadius: 99,
                            color: "#888",
                          }}
                        >
                          {item.user.role}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ActivityLog;
