import { useMemo, useState } from "react";
import { useNotifications } from "../../context/NotificationContext";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper — also used by ChatPage sidebar via import if you want
// ─────────────────────────────────────────────────────────────────────────────
export const formatMessage = (message) => {
  if (!message || typeof message !== "string") return message;

  // ── 1. Call record (broken JSON stored in DB) ─────────────────────────────
  if (message.includes("__callRecord")) {
    const prefixMatch   = message.match(/^(New message from .+?:\s*)/);
    const prefix        = prefixMatch ? prefixMatch[1] : "";
    const callTypeMatch = message.match(/"callType"\s*:\s*"([^"]+)"/);
    const callType      = callTypeMatch ? callTypeMatch[1] : "voice";
    const statusMatch   = message.match(/"status"\s*:\s*"([^"]*)"/);
    const status        = statusMatch ? statusMatch[1] : "";

    const isVideo     = callType === "video";
    const icon        = isVideo ? "📹" : "📞";
    const label       = isVideo ? "Video call" : "Voice call";
    const statusLabel = status === "missed" ? " (Missed)"
                      : status === "ended"  ? " (Ended)"
                      : "";
    return `${prefix}${icon} ${label}${statusLabel}`;
  }

  // ── 2. Audio filename patterns ────────────────────────────────────────────
  // Covers: voice-message.webm, recording.mp3, audio.ogg, etc.
  const AUDIO_EXT = /\.(webm|mp3|ogg|wav|m4a|aac|opus|flac)(\s|"|'|$)/i;

  // "🎤 voice-message.webm"  or  "🎤 file"
  if (/🎤/.test(message)) {
    const prefixMatch = message.match(/^(New message from .+?:\s*"?)/);
    const prefix      = prefixMatch ? prefixMatch[1] : message.replace(/🎤.*/,"");
    return `${prefix}🎵 Audio`;
  }

  // "📎 voice-message.webm"  or  "📎 audio" / "📎 voice"
  if (/📎\s*(audio|voice)/i.test(message)) {
    return message.replace(/📎\s*(audio|voice\S*)/gi, "🎵 Audio");
  }
  if (/📎/.test(message) && AUDIO_EXT.test(message)) {
    return message.replace(/📎[^"'\n]*/gi, "🎵 Audio");
  }

  // Bare filename (sidebar lastMessage is just the filename string)
  if (AUDIO_EXT.test(message)) {
    return "🎵 Audio";
  }

  // ── 3. Everything else unchanged ─────────────────────────────────────────
  return message;
};

// ─────────────────────────────────────────────────────────────────────────────
const Notifications = () => {
  const [filter, setFilter] = useState("All");
  const { notifications, markAllAsRead, markOneAsRead, loading } =
    useNotifications();

  const filteredNotifications = useMemo(() => {
    if (filter === "All")      return notifications;
    if (filter === "Unseen")   return notifications.filter((n) => n.unseen);
    if (filter === "Personal") return notifications.filter((n) => n.type === "Personal");
    if (filter === "Tasks")    return notifications.filter((n) =>
      ["Task", "Deadline"].includes(n.type)
    );
    return notifications.filter(
      (n) => n.type?.toLowerCase() === filter.toLowerCase()
    );
  }, [filter, notifications]);

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header staff-card-header--with-actions">
        <div>
          <p className="staff-card-subtitle">
            Central place for all task, unseen, and system updates.
          </p>
        </div>
        <button className="staff-btn staff-btn--ghost" onClick={markAllAsRead}>
          Mark all as read
        </button>
      </div>

      {/* Filters */}
      <div className="staff-filters">
        {["All", "Tasks", "Personal", "System", "Project", "Unseen"].map((f) => (
          <button
            key={f}
            className={`staff-filter ${filter === f ? "staff-filter--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <p style={{ padding: "12px" }}>Loading...</p>
      ) : filteredNotifications.length === 0 ? (
        <p style={{ padding: "12px" }}>No notifications found.</p>
      ) : (
        <ul className="staff-list staff-list--spacious">
          {filteredNotifications.map((n) => (
            <li
              key={n._id || n.id}
              className="staff-list-item"
              style={{
                cursor:     n.unseen ? "pointer" : "default",
                background: n.unseen ? "rgba(59,130,246,0.05)" : undefined,
              }}
              onClick={() => n.unseen && markOneAsRead(n._id || n.id)}
            >
              <div>
                <div className="staff-list-title">
                  {formatMessage(n.message)}
                </div>
                <div className="staff-list-meta">
                  {n.createdAt
                    ? new Date(n.createdAt).toLocaleString("en-US", {
                        month:  "short",
                        day:    "numeric",
                        hour:   "2-digit",
                        minute: "2-digit",
                      })
                    : n.time}
                </div>
              </div>
              <span className="staff-badge staff-badge--muted">
                {n.type}
                {n.unseen ? " • Unseen" : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
