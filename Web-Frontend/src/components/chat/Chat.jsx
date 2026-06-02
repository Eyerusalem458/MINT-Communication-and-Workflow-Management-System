import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { createPortal } from "react-dom";
import Button from "../../components/ui/Button";
import {
  SearchIcon,
  SendIcon,
  MicIcon,
  FilterIcon,
  EditIcon,
  PlusIcon,
  VideoIcon,
  PhoneIcon,
} from "../../pages/shared/icon";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { getRelativeTime } from "../../utils/formatDate";
import "../../assets/styles/Chat.css";
import { AuthContext } from "../../context/AuthContext";
import {
  getConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  updateGroupConversation,
  getMessages,
  getSharedMedia,
  sendMessage as apiSendMessage,
  deleteMessage as apiDeleteMessage,
  getChatUsers,
} from "../../api/messageApi";
import { socket } from "../../utils/socket";

const BASE_URL = "http://localhost:5000";

// ── Reusable Avatar ───────────────────────────────────────────────────────────
const Avatar = ({ firstName, lastName, avatar, size = 38, fontSize = 14 }) => {
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  const base = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize,
    fontWeight: 600,
  };
  if (avatar) {
    return (
      <div style={{ ...base, background: "#dbeafe", color: "#1d4ed8" }}>
        <img
          src={`${BASE_URL}${avatar}`}
          alt={initials}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        ...base,
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      }}
    >
      {initials}
    </div>
  );
};

// ── Shared Media Section ──────────────────────────────────────────────────────
const SharedMediaSection = ({ conversationId }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("media");

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    getSharedMedia(conversationId)
      .then((res) => setMedia(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [conversationId]);

  const images = media.filter(
    (m) => m.media && m.fileType?.startsWith("image"),
  );
  const videos = media.filter(
    (m) => m.media && m.fileType?.startsWith("video"),
  );
  const files = media.filter((m) => m.file);
  const audios = media.filter((m) => m.audio);

  const getFileMeta = (name = "") => {
    const ext = name.split(".").pop().toLowerCase();
    if (ext === "pdf") return { label: "PDF", color: "#e53935" };
    if (["doc", "docx"].includes(ext)) return { label: "W", color: "#2b579a" };
    if (["ppt", "pptx"].includes(ext)) return { label: "P", color: "#d24726" };
    return { label: "FILE", color: "#6b7280" };
  };

  const tabs = [
    { key: "media", label: "Media", count: images.length + videos.length },
    { key: "files", label: "Files", count: files.length },
    { key: "audio", label: "Audio", count: audios.length },
  ];

  return (
    <div style={{ marginTop: 20 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Shared
      </p>
      <div
        style={{
          display: "flex",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          marginBottom: 10,
        }}
      >
        {tabs.map((t) => (
          <div
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "6px 0",
              fontSize: 12,
              cursor: "pointer",
              color:
                tab === t.key
                  ? "var(--color-text-info)"
                  : "var(--color-text-secondary)",
              borderBottom:
                tab === t.key
                  ? "2px solid var(--color-border-info)"
                  : "2px solid transparent",
              fontWeight: tab === t.key ? 500 : 400,
            }}
          >
            {t.label}
            {t.count > 0 ? ` (${t.count})` : ""}
          </div>
        ))}
      </div>

      {loading ? (
        <p
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary)",
            textAlign: "center",
            padding: "8px 0",
          }}
        >
          Loading...
        </p>
      ) : (
        <>
          {tab === "media" &&
            (images.length + videos.length === 0 ? (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  textAlign: "center",
                  padding: "8px 0",
                }}
              >
                No media shared yet
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 4,
                }}
              >
                {[...images, ...videos].map((m) => (
                  <div
                    key={m._id}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 6,
                      overflow: "hidden",
                      background: "var(--color-background-secondary)",
                    }}
                  >
                    {m.fileType?.startsWith("image") ? (
                      <img
                        src={`${BASE_URL}${m.media}`}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          window.open(`${BASE_URL}${m.media}`, "_blank")
                        }
                      />
                    ) : (
                      <video
                        src={`${BASE_URL}${m.media}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          {tab === "files" &&
            (files.length === 0 ? (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  textAlign: "center",
                  padding: "8px 0",
                }}
              >
                No files shared yet
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {files.map((m) => {
                  const meta = getFileMeta(m.fileName || "");
                  return (
                    <a
                      key={m._id}
                      href={`${BASE_URL}${m.file}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "var(--color-background-secondary)",
                        textDecoration: "none",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          background: meta.color,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {meta.label}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            fontWeight: 500,
                            color: "var(--color-text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {m.fileName || "file"}
                        </p>
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {m.fileSize || ""}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        ⬇
                      </span>
                    </a>
                  );
                })}
              </div>
            ))}
          {tab === "audio" &&
            (audios.length === 0 ? (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  textAlign: "center",
                  padding: "8px 0",
                }}
              >
                No audio shared yet
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {audios.map((m) => (
                  <div key={m._id} style={{ padding: "6px 0" }}>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {m.sender?.firstName} ·{" "}
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                    <audio
                      controls
                      src={`${BASE_URL}${m.audio}`}
                      style={{ width: "100%", height: 32 }}
                    />
                  </div>
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
};

// ── Shared portal backdrop ────────────────────────────────────────────────────
const ModalBackdrop = ({ onClose, children }) =>
  createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>,
    document.body,
  );

// ── Modal card shell — always white, never inherits CSS vars ──────────────────
const ModalCard = ({ children, width = 420 }) => (
  <div
    style={{
      background: "#ffffff",
      borderRadius: 16,
      padding: 24,
      width,
      maxWidth: "calc(100vw - 32px)",
      maxHeight: "88vh",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
      overflowY: "auto",
    }}
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

// ── Modal header row ──────────────────────────────────────────────────────────
const ModalHeader = ({ title, icon, accent = "#2563eb", onClose }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: `${accent}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        {icon}
      </div>
      <h4
        style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}
      >
        {title}
      </h4>
    </div>
    <button
      onClick={onClose}
      style={{
        background: "#f1f5f9",
        border: "none",
        borderRadius: "50%",
        width: 32,
        height: 32,
        cursor: "pointer",
        fontSize: 14,
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
    >
      ✕
    </button>
  </div>
);

// ── MODAL 1: Edit Group Name ──────────────────────────────────────────────────
const EditGroupModal = ({ conversation, onClose, onUpdated }) => {
  const [name, setName] = useState(conversation.name || "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = async () => {
    if (!name.trim() || name.trim() === conversation.name) return;
    setBusy(true);
    try {
      const res = await updateGroupConversation(conversation._id, {
        name: name.trim(),
      });
      showSuccessToast("Group name updated");
      onUpdated(res.data);
    } catch {
      showErrorToast("Failed to update group name");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalCard width={380}>
        <ModalHeader
          title="Edit Group Name"
          icon="✏️"
          accent="#2563eb"
          onClose={onClose}
        />

        {/* Divider */}
        <div style={{ height: 1, background: "#f1f5f9", margin: "0 -24px" }} />

        {/* Group name input */}
        <div>
          <label
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              display: "block",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            Group Name
          </label>
          <input
            className="staff-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
            autoFocus
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 14px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              background: "#f8fafc",
              color: "#0f172a",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />
        </div>

        {/* Current Members preview */}
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#94a3b8",
              margin: "0 0 10px",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            Members ({conversation.participants?.length})
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {conversation.participants?.map((p) => (
              <div
                key={p._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 20,
                  padding: "4px 10px 4px 5px",
                  fontSize: 12,
                  color: "#334155",
                  fontWeight: 500,
                }}
              >
                <Avatar
                  firstName={p.firstName}
                  lastName={p.lastName}
                  avatar={p.avatar}
                  size={22}
                  fontSize={10}
                />
                {p.firstName}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f1f5f9", margin: "0 -24px" }} />

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={busy}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              color: "#64748b",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={busy || !name.trim() || name.trim() === conversation.name}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: "none",
              background:
                busy || !name.trim() || name.trim() === conversation.name
                  ? "#93c5fd"
                  : "#2563eb",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: busy || !name.trim() ? "not-allowed" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {busy ? "Saving..." : "Save Name"}
          </button>
        </div>
      </ModalCard>
    </ModalBackdrop>
  );
};

// ── MODAL 2: Add Members ──────────────────────────────────────────────────────
const AddMemberModal = ({ conversation, chatUsers, onClose, onUpdated }) => {
  const [userSearch, setUserSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const existingIds = conversation.participants?.map((p) => p._id) || [];
  const available = chatUsers.filter(
    (u) =>
      !existingIds.includes(u._id) &&
      `${u.firstName} ${u.lastName}`
        .toLowerCase()
        .includes(userSearch.toLowerCase()),
  );

  const toggle = (u) =>
    setSelected((prev) =>
      prev.find((x) => x._id === u._id)
        ? prev.filter((x) => x._id !== u._id)
        : [...prev, u],
    );

  const handleAdd = async () => {
    if (selected.length === 0) return;
    setBusy(true);
    try {
      const res = await updateGroupConversation(conversation._id, {
        name: conversation.name,
        addParticipants: selected.map((u) => u._id),
      });
      showSuccessToast(
        `${selected.length} member${selected.length > 1 ? "s" : ""} added`,
      );
      onUpdated(res.data);
    } catch {
      showErrorToast("Failed to add members");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalCard width={440}>
        <ModalHeader
          title="Add Members"
          icon="👥"
          accent="#10b981"
          onClose={onClose}
        />

        {/* Divider */}
        <div style={{ height: 1, background: "#f1f5f9", margin: "0 -24px" }} />

        {/* Selected chips */}
        {selected.length > 0 && (
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
            >
              Selected ({selected.length})
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {selected.map((u) => (
                <div
                  key={u._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "#d1fae5",
                    border: "1px solid #6ee7b7",
                    borderRadius: 20,
                    padding: "4px 10px 4px 5px",
                    fontSize: 12,
                    color: "#065f46",
                    fontWeight: 600,
                  }}
                >
                  <Avatar
                    firstName={u.firstName}
                    lastName={u.lastName}
                    avatar={u.avatar}
                    size={20}
                    fontSize={9}
                  />
                  {u.firstName}
                  <span
                    style={{
                      cursor: "pointer",
                      marginLeft: 3,
                      opacity: 0.6,
                      fontSize: 11,
                    }}
                    onClick={() => toggle(u)}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              color: "#94a3b8",
            }}
          >
            🔍
          </span>
          <input
            autoFocus
            placeholder="Search users to add..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 14px 10px 36px",
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              fontSize: 14,
              outline: "none",
              background: "#f8fafc",
              color: "#0f172a",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#10b981")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>

        {/* User list */}
        <div
          style={{
            overflowY: "auto",
            maxHeight: 280,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#fafafa",
          }}
        >
          {available.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                {userSearch
                  ? "No users match your search"
                  : "All users are already members"}
              </p>
            </div>
          ) : (
            available.map((u, idx) => {
              const sel = !!selected.find((x) => x._id === u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => toggle(u)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 14px",
                    cursor: "pointer",
                    background: sel
                      ? "#ecfdf5"
                      : idx % 2 === 0
                        ? "#fff"
                        : "#fafafa",
                    borderBottom:
                      idx < available.length - 1 ? "1px solid #f1f5f9" : "none",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    if (!sel) e.currentTarget.style.background = "#f0fdf4";
                  }}
                  onMouseLeave={(e) => {
                    if (!sel)
                      e.currentTarget.style.background =
                        idx % 2 === 0 ? "#fff" : "#fafafa";
                  }}
                >
                  <Avatar
                    firstName={u.firstName}
                    lastName={u.lastName}
                    avatar={u.avatar}
                    size={36}
                    fontSize={13}
                  />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      {u.firstName} {u.lastName}
                    </p>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        textTransform: "capitalize",
                      }}
                    >
                      {u.role}
                      {u.department
                        ? ` · ${u.department.split("(")[0].trim()}`
                        : ""}
                    </span>
                  </div>
                  {/* Checkbox */}
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: sel ? "none" : "2px solid #cbd5e1",
                      background: sel ? "#10b981" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 12,
                      color: "#fff",
                      transition: "all 0.15s",
                    }}
                  >
                    {sel && "✔"}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f1f5f9", margin: "0 -24px" }} />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {selected.length > 0
              ? `${selected.length} selected`
              : "Select members to add"}
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              disabled={busy}
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                color: "#64748b",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={busy || selected.length === 0}
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                border: "none",
                background:
                  busy || selected.length === 0 ? "#6ee7b7" : "#10b981",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor:
                  busy || selected.length === 0 ? "not-allowed" : "pointer",
                transition: "background 0.15s",
              }}
            >
              {busy
                ? "Adding..."
                : `Add${selected.length > 0 ? ` (${selected.length})` : ""}`}
            </button>
          </div>
        </div>
      </ModalCard>
    </ModalBackdrop>
  );
};

// ── Details Panel ─────────────────────────────────────────────────────────────
const DetailsPanel = ({
  activeChat,
  currentUserId,
  currentUserRole,
  chatUsers,
  onClose,
  onGroupUpdated,
}) => {
  const [showEditName, setShowEditName] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  if (!activeChat) return null;

  const isGroup = activeChat.type === "group";
  const otherUser = !isGroup
    ? activeChat.participants?.find((p) => p._id !== currentUserId)
    : null;

  // Admin can always edit any group.
  // Manager can edit any group (since only admin/manager can create groups).
  const role = currentUserRole?.toLowerCase();
  const canEditGroup = isGroup && (role === "admin" || role === "manager");

  const InfoRow = ({ label, value }) =>
    value ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "8px 0",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--color-text-secondary)",
            marginBottom: 2,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 13,
            color: "var(--color-text-primary)",
            fontWeight: 500,
          }}
        >
          {value}
        </span>
      </div>
    ) : null;

  return (
    <>
      <div className="chat-details-panel open">
        <div className="details-header">
          <h4>{isGroup ? "Group Info" : "Contact Info"}</h4>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Edit button — admin/manager who created the group only */}
            {canEditGroup && (
              <button
                title="Edit group name"
                onClick={() => setShowEditName(true)}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "5px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#475569",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontWeight: 600,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#dbeafe")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f1f5f9")
                }
              >
                ✏️ Edit
              </button>
            )}
            <span
              className="close-btn"
              onClick={onClose}
              style={{
                cursor: "pointer",
                fontSize: 18,
                color: "var(--color-text-secondary)",
              }}
            >
              ✕
            </span>
          </div>
        </div>

        <div className="details-body">
          {/* Large avatar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {isGroup ? (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "#dbeafe",
                  border: "2px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#1d4ed8",
                  flexShrink: 0,
                }}
              >
                {(activeChat.name?.[0] || "G").toUpperCase()}
              </div>
            ) : (
              <Avatar
                firstName={otherUser?.firstName}
                lastName={otherUser?.lastName}
                avatar={otherUser?.avatar}
                size={72}
                fontSize={26}
              />
            )}
          </div>

          <h3
            style={{
              textAlign: "center",
              margin: "0 0 4px",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {isGroup
              ? activeChat.name || "Group"
              : `${otherUser?.firstName || ""} ${otherUser?.lastName || ""}`}
          </h3>

          {!isGroup && otherUser?.role && (
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 16,
                textTransform: "capitalize",
              }}
            >
              {otherUser.role}
            </p>
          )}

          {!isGroup && otherUser && (
            <div style={{ marginTop: 8 }}>
              <InfoRow label="Email" value={otherUser.email} />
              <InfoRow label="Phone" value={otherUser.phone} />
              <InfoRow
                label="Department"
                value={otherUser.department?.split("(")[0].trim()}
              />
              <InfoRow label="Gender" value={otherUser.gender} />
              <InfoRow
                label="Status"
                value={
                  otherUser.status && (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        background:
                          otherUser.status === "Active"
                            ? "var(--color-background-success)"
                            : "var(--color-background-danger)",
                        color:
                          otherUser.status === "Active"
                            ? "var(--color-text-success)"
                            : "var(--color-text-danger)",
                      }}
                    >
                      {otherUser.status}
                    </span>
                  )
                }
              />
            </div>
          )}

          {isGroup && (
            <div style={{ marginTop: 12 }}>
              {/* Members header with inline Add button for admin/manager */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <h5
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary)",
                    margin: 0,
                  }}
                >
                  Members ({activeChat.participants?.length})
                </h5>
                {canEditGroup && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    style={{
                      background: "#ecfdf5",
                      color: "#065f46",
                      border: "1px solid #6ee7b7",
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#d1fae5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#ecfdf5")
                    }
                  >
                    + Add Member
                  </button>
                )}
              </div>

              {activeChat.participants?.map((p) => (
                <div
                  key={p._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "6px 0",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                  }}
                >
                  <Avatar
                    firstName={p.firstName}
                    lastName={p.lastName}
                    avatar={p.avatar}
                    size={34}
                    fontSize={13}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                      {p.firstName} {p.lastName}
                    </p>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                        textTransform: "capitalize",
                      }}
                    >
                      {p.role}
                      {p.department
                        ? ` · ${p.department.split("(")[0].trim()}`
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <SharedMediaSection conversationId={activeChat._id} />
        </div>
      </div>

      {/* Edit Group Name modal */}
      {showEditName && (
        <EditGroupModal
          conversation={activeChat}
          onClose={() => setShowEditName(false)}
          onUpdated={(updated) => {
            onGroupUpdated(updated);
            setShowEditName(false);
          }}
        />
      )}

      {/* Add Member modal */}
      {showAddMember && (
        <AddMemberModal
          conversation={activeChat}
          chatUsers={chatUsers}
          onClose={() => setShowAddMember(false)}
          onUpdated={(updated) => {
            onGroupUpdated(updated);
            setShowAddMember(false);
          }}
        />
      )}
    </>
  );
};

// ── Main ChatPage ─────────────────────────────────────────────────────────────
const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const canCreateGroup = ["admin", "manager"].includes(
    user?.role?.toLowerCase(),
  );

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [callType, setCallType] = useState(null); // null | "video" | "voice"
  const [callState, setCallState] = useState("idle"); // idle | outgoing | incoming | active
  const [incomingCall, setIncomingCall] = useState(null); // { from, callType, offer }
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const ringbackRef = useRef(null);
  const pcRef = useRef(null); // RTCPeerConnection
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const callTypeRef = useRef(null);
  const callDurationRef = useRef(0);
  const [preview, setPreview] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const peerLeftTimerRef = useRef(null);
  const [forwardMsg, setForwardMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [convRes, usersRes] = await Promise.all([
          getConversations(),
          getChatUsers(),
        ]);
        const AUDIO_EXT = /\.(webm|mp3|ogg|wav|m4a|aac|opus|flac)(\s|$)/i;

        setConversations(
          convRes.data.map((c) => {
            const lm = c.lastMessage || "";
            if (lm.includes('"__callRecord"')) {
              const isVideo =
                lm.includes('"callType":"video"') ||
                lm.includes('"callType": "video"');
              c.lastMessage = isVideo ? "📹 Video call" : "📞 Voice call";
            } else if (/🎤/.test(lm) || AUDIO_EXT.test(lm)) {
              c.lastMessage = "🎵 Audio";
            }
            return c;
          }),
        );
        setChatUsers(usersRes.data);
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeChat?._id) return;
    setLoadingMessages(true);
    getMessages(activeChat._id)
      .then((res) => setMessages(res.data))
      .catch(() => {})
      .finally(() => setLoadingMessages(false));
    socket.emit("join_conversation", activeChat._id);
    return () => socket.emit("leave_conversation", activeChat._id);
  }, [activeChat?._id]);

  useEffect(() => {
    const onMsg = (msg) =>
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id !== msg.conversationId) return c;

          let lastMessage;
          if (msg.audio) {
            lastMessage = "🎵 Audio";
          } else if (msg.media) {
            lastMessage = msg.fileType?.startsWith("video")
              ? "🎬 Video"
              : "🖼 Photo";
          } else if (msg.file) {
            lastMessage = "📎 File";
          } else if (msg.text?.includes('"__callRecord"')) {
            const isVideo =
              msg.text.includes('"callType":"video"') ||
              msg.text.includes('"callType": "video"');
            lastMessage = isVideo ? "📹 Video call" : "📞 Voice call";
          } else {
            lastMessage = msg.text || "";
          }

          return { ...c, lastMessage, lastMessageAt: new Date() };
        }),
      );
    const onDel = ({ messageId }) =>
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, text: "This message was deleted", isDeleted: true }
            : m,
        ),
      );
    const onTyping = ({ userId }) => {
      if (userId !== user?._id) {
        const p = activeChat?.participants?.find((p) => p._id === userId);
        setTypingUser(p ? `${p.firstName} is typing…` : "Someone is typing…");
      }
    };
    const onStop = () => setTypingUser(null);
    const onEdit = ({ messageId, newText }) =>
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, text: newText, isEdited: true } : m,
        ),
      );
    socket.on("newMessage", onMsg);
    socket.on("messageDeleted", onDel);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStop);
    socket.on("messageEdited", onEdit);
    return () => {
      socket.off("newMessage", onMsg);
      socket.off("messageDeleted", onDel);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStop);
      socket.off("messageEdited", onEdit);
    };
  }, [activeChat?._id, activeChat?.participants, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── WebRTC refs ────────────────────────────────────────────────────────────

  const cleanupCallRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  // ── Socket: call signaling (registered once, uses refs for freshness) ──────
  useEffect(() => {
    const onIncomingCall = ({ from, callType, offer, conversationId }) => {
      socket.emit("join_conversation", conversationId);
      setIncomingCall({ from, callType, offer, conversationId });
      setCallState("incoming");
    };
    const onCallAnswered = async ({ answer }) => {
      ringbackFns.current.stop();
      try {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(answer),
          );
          for (const c of pendingCandidatesRef.current) {
            await pcRef.current
              .addIceCandidate(new RTCIceCandidate(c))
              .catch(() => {});
          }
          pendingCandidatesRef.current = [];
        }
      } catch (e) {
        console.warn("call_answered err", e);
      }
    };
    const onIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      try {
        if (pcRef.current?.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidatesRef.current.push(candidate);
        }
      } catch (e) {
        console.warn("ice_candidate err", e);
      }
    };
    const onCallEnded = () => {
      const dur = callDurationRef.current;
      const ct = callTypeRef.current;
      setTimeout(() => {
        cleanupCallRef.current?.({
          saveRecord: true,
          callType: ct,
          status: dur > 0 ? "ended" : "missed",
          duration: dur,
        });
      }, 300);
    };

    const onPeerLeft = () => {
      // Debounce: collapse multiple rapid firings into one toast
      if (peerLeftTimerRef.current) return;
      peerLeftTimerRef.current = setTimeout(() => {
        showErrorToast("A participant left the call");
        peerLeftTimerRef.current = null;
      }, 300);
    };

    const onCallDeclined = () => {
      ringbackFns.current.stop();
      showErrorToast("Call was declined");
      cleanupCallRef.current?.({
        saveRecord: true,
        callType: callTypeRef.current,
        status: "missed",
        duration: 0,
      });
    };

    socket.on("incoming_call", onIncomingCall);
    socket.on("call_answered", onCallAnswered);
    socket.on("ice_candidate", onIceCandidate);
    socket.on("call_ended", onCallEnded);
    socket.on("call_declined", onCallDeclined);
    socket.on("peer_left", onPeerLeft);
    return () => {
      socket.off("incoming_call", onIncomingCall);
      socket.off("call_answered", onCallAnswered);
      socket.off("ice_candidate", onIceCandidate);
      socket.off("call_ended", onCallEnded);
      socket.off("call_declined", onCallDeclined);
      socket.off("peer_left", onPeerLeft);
    };
  }, []);

  const saveCallMessage = useCallback(
    async (type, status, duration = 0) => {
      if (!activeChat?._id) return;
      try {
        const text = JSON.stringify({
          __callRecord: true,
          callType: type, // "video" | "voice"
          status, // "ended" | "missed"
          duration, // seconds
        });
        const fd = new FormData();
        fd.append("text", text);
        const res = await apiSendMessage(activeChat._id, fd);
        setMessages((prev) => [...prev, res.data]);
      } catch {}
    },
    [activeChat],
  );

  // ── Ringback tone (plays on caller side while waiting) ────────────────────
  // ── Ringback — plain ref-based, no useCallback to avoid TDZ dependency chain
  const ringbackFns = useRef(null);
  if (!ringbackFns.current) {
    ringbackFns.current = {
      start: () => {
        if (ringbackRef.current) {
          try {
            ringbackRef.current.stop();
          } catch {}
          ringbackRef.current = null;
        }
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          let stopped = false;
          const scheduleRing = (startTime) => {
            if (stopped) return;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.type = "sine";
            osc1.frequency.setValueAtTime(440, startTime);
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(480, startTime);
            gain.gain.setValueAtTime(0.18, startTime);
            gain.gain.linearRampToValueAtTime(0.18, startTime + 1.9);
            gain.gain.linearRampToValueAtTime(0, startTime + 2.0);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.start(startTime);
            osc1.stop(startTime + 2.0);
            osc2.start(startTime);
            osc2.stop(startTime + 2.0);
            const tid = setTimeout(() => scheduleRing(ctx.currentTime), 6000);
            ringbackRef.current = {
              stop: () => {
                stopped = true;
                clearTimeout(tid);
                try {
                  osc1.stop();
                } catch {}
                try {
                  osc2.stop();
                } catch {}
                ctx.close().catch(() => {});
              },
            };
          };
          scheduleRing(ctx.currentTime);
        } catch (e) {
          console.warn("Ringback failed:", e);
        }
      },
      stop: () => {
        if (ringbackRef.current) {
          try {
            ringbackRef.current.stop();
          } catch {}
          ringbackRef.current = null;
        }
      },
    };
  }

  // ── cleanupCall (defined first so other callbacks can depend on it) ─────────
  const cleanupCall = useCallback(
    (opts = {}) => {
      const { saveRecord = false, callType: ct, status, duration: dur } = opts;
      if (saveRecord && ct) {
        saveCallMessage(ct, status, dur);
      }
      ringbackFns.current.stop();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
      clearInterval(callTimerRef.current);
      pendingCandidatesRef.current = [];
      setCallState("idle");
      setCallType(null);
      setIncomingCall(null);
      setIsMuted(false);
      setIsCamOff(false);
      setCallDuration(0);
    },
    [saveCallMessage],
  );

  useEffect(() => {
    cleanupCallRef.current = cleanupCall;
  }, [cleanupCall]);
  useEffect(() => {
    callTypeRef.current = callType;
  }, [callType]);
  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);
  // ── createPeerConnection ───────────────────────────────────────────────────
  const createPeerConnection = useCallback((convId) => {
    if (pcRef.current) {
      pcRef.current.close();
    }
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });
    pc.onicecandidate = ({ candidate }) => {
      if (candidate)
        socket.emit("ice_candidate", { conversationId: convId, candidate });
    };
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      // Always attach to the hidden audio element so voice is heard
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }
      // Also attach to video element for video calls
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
    pc.onconnectionstatechange = () => {
      if (["connected", "completed"].includes(pc.connectionState)) {
        setCallState("active");
        clearInterval(callTimerRef.current);
        callTimerRef.current = setInterval(
          () => setCallDuration((d) => d + 1),
          1000,
        );
      }
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        cleanupCallRef.current?.();
      }
    };
    pcRef.current = pc;
    return pc;
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [contextMenu]);

  // ── getLocalStream ─────────────────────────────────────────────────────────
  const getLocalStream = useCallback(async (type) => {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 48000,
      },
      video: type === "video" ? { width: 1280, height: 720 } : false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    // For video calls show local preview; for voice calls no local video needed
    if (type === "video" && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  }, []);

  // ── startCall (caller) ─────────────────────────────────────────────────────
  const startCall = useCallback(
    async (type) => {
      if (!activeChat?._id) return;
      try {
        setCallType(type);
        setCallState("outgoing");
        setCallDuration(0);
        pendingCandidatesRef.current = [];
        const stream = await getLocalStream(type);
        const pc = createPeerConnection(activeChat._id);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: type === "video",
        });
        await pc.setLocalDescription(offer);
        socket.emit("start_call", {
          conversationId: activeChat._id,
          callType: type,
          offer: pc.localDescription,
          from: user?._id,
          callerName: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        });
        ringbackFns.current.start();
      } catch (err) {
        console.error("startCall:", err);
        showErrorToast("Could not access camera / microphone");
        cleanupCall();
      }
    },
    [activeChat, user, createPeerConnection, getLocalStream, cleanupCall],
  );

  // ── answerCall (callee) ────────────────────────────────────────────────────
  const answerCall = useCallback(async () => {
    if (!incomingCall) return;
    try {
      setCallType(incomingCall.callType);
      setCallDuration(0);
      pendingCandidatesRef.current = [];
      socket.emit("join_conversation", incomingCall.conversationId);
      const stream = await getLocalStream(incomingCall.callType);
      const pc = createPeerConnection(incomingCall.conversationId);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer),
      );
      for (const c of pendingCandidatesRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
      }
      pendingCandidatesRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer_call", {
        conversationId: incomingCall.conversationId,
        answer: pc.localDescription,
      });
      setCallState("active");
      clearInterval(callTimerRef.current);
      callTimerRef.current = setInterval(
        () => setCallDuration((d) => d + 1),
        1000,
      );
    } catch (err) {
      console.error("answerCall:", err);
      showErrorToast("Could not access camera / microphone");
      cleanupCall();
    }
  }, [incomingCall, createPeerConnection, getLocalStream, cleanupCall]);

  // ── declineCall / endCall ──────────────────────────────────────────────────
  const declineCall = useCallback(() => {
    if (incomingCall) {
      socket.emit("decline_call", {
        conversationId: incomingCall.conversationId,
      });
      cleanupCall({
        saveRecord: true,
        callType: incomingCall.callType,
        status: "missed",
        duration: 0,
      });
    } else {
      cleanupCall();
    }
  }, [incomingCall, cleanupCall]);

  const endCall = useCallback(() => {
    const convId = activeChat?._id || incomingCall?.conversationId;
    if (convId)
      socket.emit("end_call", {
        conversationId: convId,
        leavingUserId: user?._id,
      });
    cleanupCall({
      saveRecord: true,
      callType: callType || incomingCall?.callType,
      status: callDuration > 0 ? "ended" : "missed",
      duration: callDuration,
    });
  }, [
    activeChat,
    incomingCall,
    cleanupCall,
    callType,
    callDuration,
    user?._id,
  ]);

  // ── toggleMute / toggleCamera ──────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((m) => !m);
  }, []);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsCamOff((c) => !c);
  }, []);

  const formatDuration = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (activeChat?._id) {
      socket.emit("typing", {
        conversationId: activeChat._id,
        userId: user?._id,
      });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(
        () =>
          socket.emit("stop_typing", {
            conversationId: activeChat._id,
            userId: user?._id,
          }),
        1500,
      );
    }
  };

  const getConversationName = (conv) => {
    if (!conv) return "";
    if (conv.type === "group") return conv.name || "Group";
    const other = conv.participants?.find((p) => p._id !== user?._id);
    return other ? `${other.firstName} ${other.lastName}` : conv.name;
  };
  const getConversationInitial = (conv) =>
    getConversationName(conv)?.[0]?.toUpperCase() || "?";

  const filteredConversations = conversations
    .filter((c) =>
      getConversationName(c).toLowerCase().includes(search.toLowerCase()),
    )
    .filter((c) =>
      activeTab === "all"
        ? true
        : activeTab === "direct"
          ? c.type === "direct"
          : activeTab === "teams"
            ? c.type === "group"
            : true,
    );

  const filteredChatUsers = chatUsers.filter((u) =>
    `${u.firstName} ${u.lastName}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  );
  const filteredMessages = messages.filter((msg) =>
    chatSearch
      ? (msg.text || "").toLowerCase().includes(chatSearch.toLowerCase())
      : true,
  );

  const handleSend = useCallback(async () => {
    if (!message.trim() || !activeChat?._id || sending) return;
    setSending(true);
    socket.emit("stop_typing", {
      conversationId: activeChat._id,
      userId: user?._id,
    });
    try {
      const fd = new FormData();
      fd.append("text", message);
      if (replyTo?._id) fd.append("replyTo", replyTo._id);
      const res = await apiSendMessage(activeChat._id, fd);
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
      setReplyTo(null);
    } catch {
      showErrorToast("Failed to send message");
    } finally {
      setSending(false);
    }
  }, [message, activeChat, replyTo, sending, user?._id]);

  const handleFileSend = useCallback(
    async (file) => {
      if (!file || !activeChat?._id) return;
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await apiSendMessage(activeChat._id, fd);
        setMessages((prev) => [...prev, res.data]);
      } catch {
        showErrorToast("Failed to send file");
      }
    },
    [activeChat],
  );

  const handleEditMessage = useCallback(
    async (msgId, newText) => {
      if (!newText.trim()) return;
      try {
        // 1. Call the backend
        const res = await fetch(`${BASE_URL}/api/messages/message/${msgId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text: newText.trim() }),
        });
        if (!res.ok) throw new Error("Edit failed");
        const updated = await res.json();

        // 2. Update local state
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId
              ? { ...m, text: updated.text ?? newText.trim(), isEdited: true }
              : m,
          ),
        );

        // 3. Broadcast to others in the conversation
        if (activeChat?._id) {
          socket.emit("editMessage", {
            conversationId: activeChat._id,
            messageId: msgId,
            newText: updated.text ?? newText.trim(),
          });
        }

        setEditingMsg(null);
        setEditText("");
      } catch {
        showErrorToast("Failed to edit message");
      }
    },
    [activeChat],
  );

  // FIND AND REPLACE the entire handlePinMessage:
  const handlePinMessage = useCallback((msg) => {
    const rawText =
      typeof msg.text === "string"
        ? msg.text
        : typeof msg.message === "string"
          ? msg.message
          : typeof msg.content === "string"
            ? msg.content
            : "";

    const displayText = rawText.includes('"__callRecord"') ? "" : rawText;

    const snapshot = {
      _id: msg._id,
      text: displayText,
      media: msg.media ?? null,
      audio: msg.audio ?? null,
      file: msg.file ?? null,
      fileName: msg.fileName ?? null,
    };

    setPinnedMessages((prev) => {
      const already = prev.find((p) => p._id === snapshot._id);
      // ✅ Schedule toast OUTSIDE the updater using setTimeout
      setTimeout(() => {
        showSuccessToast(already ? "Message unpinned" : "Message pinned ✓");
      }, 0);
      if (already) return prev.filter((p) => p._id !== snapshot._id);
      return [snapshot, ...prev];
    });
  }, []);

  const handleStartDirect = useCallback(async () => {
    if (!selectedChatUser?._id) return;
    try {
      const res = await getOrCreateDirectConversation(selectedChatUser._id);
      const conv = res.data;
      setConversations((prev) =>
        prev.find((c) => c._id === conv._id) ? prev : [conv, ...prev],
      );
      setActiveChat(conv);
      setIsCreatingChat(false);
      setSelectedChatUser(null);
      setUserSearch("");
    } catch {
      showErrorToast("Failed to start conversation");
    }
  }, [selectedChatUser]);

  const handleCreateGroup = useCallback(async () => {
    if (selectedUsers.length < 1 || !groupName.trim()) return;
    try {
      const res = await createGroupConversation(
        groupName,
        selectedUsers.map((u) => u._id),
      );
      const conv = res.data;
      setConversations((prev) => [conv, ...prev]);
      setActiveChat(conv);
      setIsCreatingGroup(false);
      setSelectedUsers([]);
      setGroupName("");
    } catch {
      showErrorToast("Failed to create group");
    }
  }, [selectedUsers, groupName]);

  const toggleGroupUser = (u) =>
    setSelectedUsers((prev) =>
      prev.find((x) => x._id === u._id)
        ? prev.filter((x) => x._id !== u._id)
        : [...prev, u],
    );

  const getFileMeta = (name = "") => {
    const ext = name.split(".").pop().toLowerCase();
    if (ext === "pdf") return { label: "PDF", color: "#e53935" };
    if (["doc", "docx"].includes(ext)) return { label: "W", color: "#2b579a" };
    if (["ppt", "pptx"].includes(ext)) return { label: "P", color: "#d24726" };
    return { label: "FILE", color: "#6b7280" };
  };

  const activeChatOther =
    activeChat?.type !== "group"
      ? activeChat?.participants?.find((p) => p._id !== user?._id)
      : null;

  const renderMessage = (msg, i) => {
    const isMe =
      msg.sender?._id?.toString() === user?._id?.toString() ||
      msg.sender?.toString() === user?._id?.toString();

    // ── call record bubble ──────────────────────────────────────────────
    if (msg.text && msg.text.includes('"__callRecord"')) {
      try {
        const rec = JSON.parse(msg.text);
        const icon = rec.callType === "video" ? "📹" : "📞";
        const label = rec.callType === "video" ? "Video call" : "Voice call";
        const sub =
          rec.status === "missed"
            ? "No answer"
            : rec.duration >= 60
              ? `${Math.floor(rec.duration / 60)} minute${Math.floor(rec.duration / 60) > 1 ? "s" : ""}`
              : `${rec.duration} second${rec.duration !== 1 ? "s" : ""}`;
        return (
          <div
            key={msg._id || i}
            className={`msg-bubble ${isMe ? "outgoing" : "incoming"}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              minWidth: 180,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: rec.status === "missed" ? "#fde8e8" : "#e8f5e9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>
                {label}
              </p>
              <span
                style={{
                  fontSize: 11,
                  color:
                    rec.status === "missed"
                      ? "#c0392b"
                      : isMe
                        ? "#c8f7c5"
                        : "#27ae60",
                }}
              >
                {sub}
              </span>
            </div>
            <div style={{ fontSize: 10, opacity: 0.5, alignSelf: "flex-end" }}>
              {msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </div>
          </div>
        );
      } catch {}
    }

    const mediaUrl = msg.media ? `${BASE_URL}${msg.media}` : null;
    const audioUrl = msg.audio ? `${BASE_URL}${msg.audio}` : null;
    const fileUrl = msg.file ? `${BASE_URL}${msg.file}` : null;
    const hasFile = fileUrl || audioUrl || mediaUrl;
    return (
      <div
        key={msg._id || i}
        className={`msg-bubble ${isMe ? "outgoing" : "incoming"} ${hasFile ? "no-bg" : ""}`}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY, msg });
        }}
      >
        {msg.replyTo && (
          <div className="reply-preview">
            {msg.replyTo.text?.slice(0, 60) || "📎 file"}
          </div>
        )}
        {audioUrl ? (
          <div className={`file-card ${isMe ? "me" : "other"}`}>
            <div className="file-top">
              <div className="file-icon" style={{ background: "#6366f1" }}>
                🎵
              </div>
              <div className="file-info">
                <p className="file-name">{msg.fileName || "Voice message"}</p>
                <span className="file-size">{msg.fileSize || ""}</span>
              </div>
            </div>
            <audio
              controls
              src={audioUrl}
              style={{ width: "100%", marginTop: 6, height: 32 }}
            />
          </div>
        ) : mediaUrl ? (
          msg.fileType?.startsWith("image") ? (
            <img
              src={mediaUrl}
              alt="media"
              className="chat-media"
              onClick={() => setPreview(mediaUrl)}
            />
          ) : (
            <video controls src={mediaUrl} className="chat-media" />
          )
        ) : fileUrl ? (
          (() => {
            const meta = getFileMeta(msg.fileName || "");
            return (
              <div className={`file-card ${isMe ? "me" : "other"}`}>
                <div className="file-top">
                  <div className="file-icon" style={{ background: meta.color }}>
                    {meta.label}
                  </div>
                  <div className="file-info">
                    <p className="file-name">{msg.fileName || "file"}</p>
                    <span className="file-size">{msg.fileSize || ""}</span>
                  </div>
                  <a
                    href={fileUrl}
                    className="file-download"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const r = await fetch(fileUrl);
                        const b = await r.blob();
                        const u = window.URL.createObjectURL(b);
                        const a = document.createElement("a");
                        a.href = u;
                        a.download = msg.fileName || "file";
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(u);
                        document.body.removeChild(a);
                      } catch {
                        window.open(fileUrl, "_blank");
                      }
                    }}
                  >
                    ⬇
                  </a>
                </div>
              </div>
            );
          })()
        ) : chatSearch && msg.text ? (
          msg.text
            .split(new RegExp(`(${chatSearch})`, "gi"))
            .map((part, idx) =>
              part.toLowerCase() === chatSearch.toLowerCase() ? (
                <span key={idx} className="highlight">
                  {part}
                </span>
              ) : (
                part
              ),
            )
        ) : (
          <span
            style={{
              opacity: msg.isDeleted ? 0.5 : 1,
              fontStyle: msg.isDeleted ? "italic" : "normal",
            }}
          >
            {msg.text}
            {msg.isEdited && !msg.isDeleted && (
              <span style={{ fontSize: 10, opacity: 0.45, marginLeft: 5 }}>
                (edited)
              </span>
            )}
          </span>
        )}
        <div
          style={{
            fontSize: 10,
            opacity: 0.5,
            marginTop: 2,
            textAlign: isMe ? "right" : "left",
          }}
        >
          {msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </div>
      </div>
    );
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-chat">
        {/* Hidden audio element — always mounted so remote audio plays for both voice and video calls */}
        <audio
          ref={remoteAudioRef}
          autoPlay
          playsInline
          style={{ display: "none" }}
        />
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) handleFileSend(f);
            e.target.value = null;
          }}
        />
        <input
          type="file"
          accept="image/*,video/*"
          ref={imageInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) handleFileSend(f);
            e.target.value = null;
          }}
        />
        <input
          type="file"
          ref={audioInputRef}
          accept="audio/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) handleFileSend(f);
          }}
        />

        {/* SIDEBAR */}
        <div className="staff-chat-sidebar staff-chat-sidebar--scroll sidebar-layout">
          <div className="staff-card-header">
            <h3>Team Chat</h3>
            <div style={{ display: "flex", gap: 8 }}>
              {canCreateGroup && (
                <div
                  className="input-icon plus-style"
                  onClick={() => {
                    setShowDetails(false);
                    setIsCreatingGroup(true);
                  }}
                >
                  <PlusIcon />
                </div>
              )}
              <Button
                className="filter"
                variant="ghost"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <FilterIcon />
              </Button>
              <Button
                className="create"
                variant="ghost"
                onClick={() => {
                  setShowDetails(false);
                  setIsCreatingChat(true);
                }}
              >
                <EditIcon />
              </Button>
            </div>
          </div>

          <div className="staff-search-wrapper chat-search-fixed">
            <SearchIcon className="search-icon" />
            <input
              className="staff-input"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="staff-tabs chat-tabs-fixed">
            {[
              { key: "all", label: "All" },
              { key: "direct", label: "Direct" },
              { key: "teams", label: "Teams" },
              { key: "unread", label: "Unread" },
            ].map((t) => (
              <div
                key={t.key}
                className={`chat-tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </div>
            ))}
          </div>

          <div className="chat-list-scroll">
            {filteredConversations.length === 0 ? (
              <p style={{ padding: 12, fontSize: 12, color: "#64748b" }}>
                No conversations yet. Start one below!
              </p>
            ) : (
              filteredConversations.map((conv) => {
                const otherP =
                  conv.type !== "group"
                    ? conv.participants?.find((p) => p._id !== user?._id)
                    : null;
                return (
                  <div
                    key={conv._id}
                    className={`staff-chat-thread chat-item-fixed ${activeChat?._id === conv._id ? "active" : ""}`}
                    onClick={() => {
                      setActiveChat(conv);
                      setShowDetails(false);
                    }}
                  >
                    <div
                      className="chat-avatar"
                      style={
                        conv.type === "group"
                          ? {
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              fontWeight: 600,
                            }
                          : {}
                      }
                    >
                      {otherP?.avatar ? (
                        <img
                          src={`${BASE_URL}${otherP.avatar}`}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <span>{getConversationInitial(conv)}</span>
                      )}
                    </div>
                    <div className="chat-info">
                      <p>{getConversationName(conv)}</p>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {conv.lastMessage || "No messages yet"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div
            className="staff-new-chat new-chat-fixed"
            onClick={() => {
              setShowDetails(false);
              setIsCreatingChat(true);
            }}
          >
            <PlusIcon />
            <span>New Conversation</span>
          </div>
        </div>

        <div className="staff-chat-divider" />

        {/* MAIN */}
        <div className="staff-chat-main">
          {activeChat ? (
            <div className="staff-chat-header">
              <div
                className="chat-header-left"
                onClick={() => setShowDetails((p) => !p)}
                style={{ cursor: "pointer" }}
              >
                {activeChat.type === "group" ? (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#dbeafe",
                      border: "1.5px solid #bfdbfe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#1d4ed8",
                      flexShrink: 0,
                    }}
                  >
                    {getConversationInitial(activeChat)}
                  </div>
                ) : (
                  <Avatar
                    firstName={activeChatOther?.firstName}
                    lastName={activeChatOther?.lastName}
                    avatar={activeChatOther?.avatar}
                    size={36}
                    fontSize={13}
                  />
                )}
                <div className="chat-header-text">
                  <h4>{getConversationName(activeChat)}</h4>
                  <span>
                    {activeChat.type === "group"
                      ? `${activeChat.participants?.length || 0} members`
                      : activeChatOther?.role || ""}
                  </span>
                </div>
              </div>
              <div className="chat-header-actions">
                <span onClick={() => setShowChatSearch(!showChatSearch)}>
                  <SearchIcon />
                </span>
                <span onClick={() => startCall("video")} title="Video Call">
                  <VideoIcon />
                </span>
                <span onClick={() => startCall("voice")} title="Voice Call">
                  <PhoneIcon />
                </span>
              </div>
              {showChatSearch && (
                <div className="chat-inline-search">
                  <input
                    placeholder="Search messages..."
                    className="staff-input"
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="staff-chat-header">
              <p style={{ padding: 12, color: "#64748b" }}>
                Select a conversation or start a new one
              </p>
            </div>
          )}

          {/* ── PINNED MESSAGE BANNER ─────────────────────────── */}
          {pinnedMessages.length > 0 && activeChat && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 14px",
                // background: "var(--color-background-primary)",
                // borderBottom: "1px solid var(--color-border-tertiary)",
                background: "#eff6ff",
                borderBottom: "1px solid #bfdbfe",
                height: 38,
                flexShrink: 0,
              }}
            >
              {/* Left blue accent bar */}
              <div
                style={{
                  width: 3,
                  height: 24,
                  borderRadius: 2,
                  background: "#2563eb",
                  flexShrink: 0,
                }}
              />

              {/* Pin icon */}
              <span style={{ fontSize: 13, flexShrink: 0, color: "#2563eb" }}>
                📌
              </span>

              {/* Message text — single line, truncated */}
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  // color: "var(--color-text-primary)",
                  color: "#1e3a5f",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                {pinnedMessages[0].text
                  ? pinnedMessages[0].text
                  : pinnedMessages[0].audio
                    ? "🎵 Voice message"
                    : pinnedMessages[0].media
                      ? "🖼 Media"
                      : pinnedMessages[0].file
                        ? `📎 ${pinnedMessages[0].fileName || "File"}`
                        : "📌 Pinned message"}
              </span>
              {/* Count badge if multiple */}
              {pinnedMessages.length > 1 && (
                <span
                  style={{
                    fontSize: 10,
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    borderRadius: 10,
                    padding: "1px 6px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  +{pinnedMessages.length - 1}
                </span>
              )}

              {/* Unpin ✕ */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinMessage(pinnedMessages[0]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  padding: "2px 4px",
                  borderRadius: 4,
                  flexShrink: 0,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
                title="Unpin"
              >
                ✕
              </button>
            </div>
          )}

          <div className="staff-chat-messages staff-chat-messages--scroll">
            {!activeChat ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  color: "#94a3b8",
                  padding: 40,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 56 }}>💬</div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#64748b",
                  }}
                >
                  Team Chat
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    maxWidth: 260,
                    lineHeight: 1.6,
                  }}
                >
                  Select a conversation from the left to start chatting, or
                  create a new one.
                </p>
              </div>
            ) : loadingMessages ? (
              <div
                style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}
              >
                Loading...
              </div>
            ) : (
              <>
                <div className="chat-date">{getRelativeTime(new Date())}</div>
                {filteredMessages.map(renderMessage)}
                {typingUser && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      padding: "4px 12px",
                      fontStyle: "italic",
                    }}
                  >
                    {typingUser}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {contextMenu && (
            <div
              className="context-menu"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setReplyTo(contextMenu.msg);
                  setContextMenu(null);
                }}
              >
                ↩ Reply
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (contextMenu.msg.text)
                    navigator.clipboard.writeText(contextMenu.msg.text);
                  setContextMenu(null);
                }}
              >
                📋 Copy
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleForwardMessage(contextMenu.msg);
                  setContextMenu(null);
                }}
              >
                ➡️ Forward
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handlePinMessage(contextMenu.msg);
                  setContextMenu(null);
                }}
              >
                {pinnedMessages.find((p) => p._id === contextMenu.msg._id)
                  ? "📌 Unpin"
                  : "📌 Pin"}
              </div>

              {(() => {
                const senderId =
                  typeof contextMenu.msg.sender === "object"
                    ? contextMenu.msg.sender?._id
                    : contextMenu.msg.sender;
                return senderId?.toString() === user?._id?.toString();
              })() && (
                <>
                  {contextMenu.msg.text && !contextMenu.msg.isDeleted && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const txt = contextMenu.msg.text ?? "";
                        setEditText(txt); // set text FIRST
                        setEditingMsg(contextMenu.msg._id); // then set the ID
                        setContextMenu(null);
                      }}
                    >
                      ✏️ Edit
                    </div>
                  )}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(contextMenu.msg._id);
                      setContextMenu(null);
                    }}
                  >
                    🗑 Delete
                  </div>
                </>
              )}
            </div>
          )}

          {replyTo && (
            <div className="reply-box">
              <span>{replyTo.text?.slice(0, 50) || "📎 file"}</span>
              <button className="reply-close" onClick={() => setReplyTo(null)}>
                ✕
              </button>
            </div>
          )}

          {activeChat && (
            <form
              className="staff-chat-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (editingMsg) handleEditMessage(editingMsg, editText);
                else handleSend();
              }}
            >
              <div
                className="input-box"
                style={
                  editingMsg
                    ? {
                        border: "1.5px solid #2563eb",
                        background: "rgba(37,99,235,0.05)",
                      }
                    : {}
                }
              >
                <div className="input-left">
                  {/* hide attachment/emoji/mic when editing */}
                  {!editingMsg && (
                    <>
                      <div
                        className="input-icon"
                        onClick={() => {
                          setShowAttachments(!showAttachments);
                          setShowEmojiPicker(false);
                        }}
                      >
                        <PlusIcon />
                      </div>
                      <div
                        className="input-icon"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        😊
                      </div>
                      {showEmojiPicker && (
                        <div className="emoji-picker">
                          {[
                            {
                              label: "😊 Smileys",
                              emojis: [
                                "😀",
                                "😃",
                                "😄",
                                "😁",
                                "😆",
                                "😅",
                                "😂",
                                "🤣",
                                "😊",
                                "😇",
                                "🙂",
                                "🙃",
                                "😉",
                                "😌",
                                "😍",
                                "🥰",
                                "😘",
                                "😋",
                                "😛",
                                "😝",
                                "😜",
                                "🤪",
                                "🧐",
                                "🤓",
                                "😎",
                                "🤩",
                                "🥳",
                                "😏",
                                "😒",
                                "😞",
                                "😔",
                                "😟",
                                "😕",
                                "😣",
                                "😖",
                                "😫",
                                "😩",
                                "🥺",
                                "😢",
                                "😭",
                                "😤",
                                "😠",
                                "😡",
                                "🤬",
                                "🤯",
                                "😳",
                                "🥵",
                                "🥶",
                                "😱",
                                "😨",
                                "😰",
                                "🤗",
                                "🤔",
                                "🤥",
                                "😶",
                                "😐",
                                "😑",
                                "😬",
                                "🙄",
                                "😯",
                                "😦",
                                "😧",
                                "😲",
                                "🥱",
                                "😴",
                                "🤤",
                                "😪",
                                "😵",
                                "🤐",
                                "🥴",
                                "🤢",
                                "🤮",
                                "🤧",
                                "😷",
                                "🤒",
                                "🤕",
                                "🤑",
                                "🤠",
                                "😈",
                                "👿",
                                "👹",
                                "👺",
                                "🤡",
                                "💩",
                                "👻",
                                "💀",
                                "👽",
                                "👾",
                                "🤖",
                              ],
                            },
                            {
                              label: "👋 Gestures",
                              emojis: [
                                "🫶",
                                "🤲",
                                "👐",
                                "🙌",
                                "👏",
                                "🤝",
                                "👍",
                                "👎",
                                "👊",
                                "✊",
                                "🤛",
                                "🤜",
                                "🤞",
                                "✌️",
                                "🤟",
                                "🤘",
                                "👌",
                                "🤌",
                                "🤏",
                                "👈",
                                "👉",
                                "👆",
                                "👇",
                                "☝️",
                                "✋",
                                "🤚",
                                "🖐️",
                                "🖖",
                                "👋",
                                "🤙",
                                "💪",
                                "✍️",
                                "🙏",
                                "🫵",
                                "👀",
                                "🧠",
                              ],
                            },
                            {
                              label: "❤️ Hearts",
                              emojis: [
                                "❤️",
                                "🧡",
                                "💛",
                                "💚",
                                "💙",
                                "💜",
                                "🖤",
                                "🤍",
                                "🤎",
                                "💔",
                                "❣️",
                                "💕",
                                "💞",
                                "💓",
                                "💗",
                                "💖",
                                "💘",
                                "💝",
                                "✨",
                                "💫",
                                "⭐",
                                "🌟",
                                "🔥",
                                "💯",
                                "🎉",
                                "🎊",
                                "🎈",
                                "🏆",
                                "🥇",
                                "🎯",
                                "🚀",
                                "💡",
                              ],
                            },
                            {
                              label: "🍕 Food",
                              emojis: [
                                "🍕",
                                "🍔",
                                "🍟",
                                "🌮",
                                "🌯",
                                "🍜",
                                "🍝",
                                "🍣",
                                "🍱",
                                "🍩",
                                "🍪",
                                "🎂",
                                "🍰",
                                "☕",
                                "🍵",
                                "🧃",
                                "🥤",
                                "🍺",
                                "🥂",
                                "🍾",
                                "🍇",
                                "🍓",
                                "🍑",
                                "🍍",
                                "🥭",
                                "🍆",
                                "🥦",
                                "🥕",
                                "🌽",
                                "🍄",
                              ],
                            },
                            {
                              label: "🐶 Animals",
                              emojis: [
                                "🐶",
                                "🐱",
                                "🐭",
                                "🐹",
                                "🐰",
                                "🦊",
                                "🐻",
                                "🐼",
                                "🐨",
                                "🐯",
                                "🦁",
                                "🐮",
                                "🐷",
                                "🐸",
                                "🐵",
                                "🙈",
                                "🙉",
                                "🙊",
                                "🐔",
                                "🐧",
                                "🐦",
                                "🦆",
                                "🦅",
                                "🦉",
                                "🦇",
                                "🐺",
                                "🐗",
                                "🐴",
                                "🦄",
                                "🐝",
                              ],
                            },
                          ].map((cat) => (
                            <div key={cat.label}>
                              <div className="emoji-category-label">
                                {cat.label}
                              </div>
                              <div className="emoji-grid">
                                {cat.emojis.map((e) => (
                                  <span
                                    key={e}
                                    onClick={() => {
                                      setMessage((p) => p + e);
                                      setShowEmojiPicker(false);
                                    }}
                                  >
                                    {e}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        className={`input-icon ${isRecording ? "recording" : ""}`}
                        onClick={async () => {
                          if (!isRecording) {
                            try {
                              const stream =
                                await navigator.mediaDevices.getUserMedia({
                                  audio: true,
                                });
                              const recorder = new MediaRecorder(stream);
                              let chunks = [];
                              recorder.ondataavailable = (e) => {
                                if (e.data.size > 0) chunks.push(e.data);
                              };
                              recorder.onstop = async () => {
                                const blob = new Blob(chunks, {
                                  type: "audio/webm",
                                });
                                await handleFileSend(
                                  new File([blob], "voice-message.webm", {
                                    type: "audio/webm",
                                  }),
                                );
                                chunks = [];
                              };
                              recorder.start();
                              setMediaRecorder(recorder);
                              setIsRecording(true);
                            } catch {
                              showErrorToast("Microphone access required");
                            }
                          } else {
                            mediaRecorder?.stop();
                            setIsRecording(false);
                          }
                        }}
                      >
                        <MicIcon />
                      </div>
                    </>
                  )}
                </div>
                <input
                  className="chat-input-field"
                  placeholder={
                    editingMsg ? "Edit your message…" : "Type a message..."
                  }
                  value={editingMsg ? editText : message}
                  autoFocus={!!editingMsg}
                  onChange={(e) => {
                    if (editingMsg) setEditText(e.target.value);
                    else handleMessageChange(e);
                  }}
                  onKeyDown={(e) => {
                    if (!editingMsg) return;
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEditMessage(editingMsg, editText);
                    }
                    if (e.key === "Escape") {
                      setEditingMsg(null);
                      setEditText("");
                    }
                  }}
                />

                {/* Send / Save button */}
                <button
                  type="submit"
                  className="send-btn"
                  disabled={editingMsg ? !editText.trim() : sending}
                  title={editingMsg ? "Save edit" : "Send"}
                  style={editingMsg ? { background: "#16a34a" } : {}}
                >
                  {editingMsg ? "✔" : <SendIcon />}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* DETAILS PANEL */}
        {showDetails && activeChat && (
          <DetailsPanel
            activeChat={activeChat}
            currentUserId={user?._id}
            currentUserRole={user?.role}
            chatUsers={chatUsers}
            onClose={() => setShowDetails(false)}
            onGroupUpdated={(updated) => {
              setActiveChat(updated);
              setConversations((prev) =>
                prev.map((c) => (c._id === updated._id ? updated : c)),
              );
            }}
          />
        )}

        {showAttachments && (
          <div className="attachment-menu">
            <div
              onClick={() => {
                setShowAttachments(false);
                fileInputRef.current?.click();
              }}
            >
              📄 Document
            </div>
            <div
              onClick={() => {
                setShowAttachments(false);
                imageInputRef.current?.click();
              }}
            >
              🖼 Photo & Video
            </div>
            <div
              onClick={() => {
                setShowAttachments(false);
                audioInputRef.current?.click();
              }}
            >
              🎵 Audio
            </div>
          </div>
        )}

        {showFilterMenu && (
          <div className="filter-menu">
            {["all", "direct", "teams"].map((t) => (
              <div
                key={t}
                onClick={() => {
                  setActiveTab(t);
                  setShowFilterMenu(false);
                }}
              >
                {t.toUpperCase()}
              </div>
            ))}
          </div>
        )}

        {isCreatingChat && (
          <div className="chat-details-panel open">
            <div className="details-header">
              <h4>New Conversation</h4>
              <span
                className="close-btn"
                onClick={() => {
                  setIsCreatingChat(false);
                  setSelectedChatUser(null);
                }}
              >
                ✕
              </span>
            </div>
            <div className="details-body">
              <input
                className="staff-input"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <div className="group-user-list">
                {filteredChatUsers.map((u) => {
                  const selected = selectedChatUser?._id === u._id;
                  return (
                    <div
                      key={u._id}
                      className={`group-user ${selected ? "selected" : ""}`}
                      onClick={() => setSelectedChatUser(u)}
                    >
                      <Avatar
                        firstName={u.firstName}
                        lastName={u.lastName}
                        avatar={u.avatar}
                        size={34}
                        fontSize={13}
                      />
                      <div>
                        <span>
                          {u.firstName} {u.lastName}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            display: "block",
                            textTransform: "capitalize",
                          }}
                        >
                          {u.role} · {u.department?.split("(")[0].trim()}
                        </span>
                      </div>
                      {selected && <span className="check">✔</span>}
                    </div>
                  );
                })}
              </div>
              <button
                className="create-btn"
                onClick={handleStartDirect}
                disabled={!selectedChatUser}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px",
                  background: "#0b63ce",
                  color: "#fff",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Start Chat
              </button>
            </div>
          </div>
        )}

        {isCreatingGroup && (
          <div className="chat-details-panel open">
            <div className="details-header">
              <h4>New Group</h4>
              <span
                className="close-btn"
                onClick={() => {
                  setIsCreatingGroup(false);
                  setSelectedUsers([]);
                }}
              >
                ✕
              </span>
            </div>
            <div className="details-body">
              <input
                className="staff-input"
                placeholder="Group name"
                style={{ marginBottom: 10 }}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <input
                className="staff-input"
                placeholder="Search members..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <div className="group-user-list">
                {filteredChatUsers.map((u) => {
                  const sel = selectedUsers.find((x) => x._id === u._id);
                  return (
                    <div
                      key={u._id}
                      className={`group-user ${sel ? "selected" : ""}`}
                      onClick={() => toggleGroupUser(u)}
                    >
                      <Avatar
                        firstName={u.firstName}
                        lastName={u.lastName}
                        avatar={u.avatar}
                        size={34}
                        fontSize={13}
                      />
                      <span>
                        {u.firstName} {u.lastName}
                      </span>
                      {sel && <span className="check">✔</span>}
                    </div>
                  );
                })}
              </div>
              <button
                className="create-btn"
                onClick={handleCreateGroup}
                disabled={selectedUsers.length < 1 || !groupName.trim()}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "10px",
                  background: "#0b63ce",
                  color: "#fff",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Create Group ({selectedUsers.length} members)
              </button>
            </div>
          </div>
        )}

        {/* ── INCOMING CALL ───────────────────────────────────────────── */}
        {callState === "incoming" &&
          incomingCall &&
          createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                zIndex: 99999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#1e293b",
                  borderRadius: 24,
                  padding: 32,
                  width: 320,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
                }}
              >
                {/* Pulsing avatar */}
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: -12,
                      borderRadius: "50%",
                      background: "rgba(99,102,241,0.2)",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 30,
                      fontWeight: 700,
                      color: "#fff",
                      position: "relative",
                    }}
                  >
                    {incomingCall.callType === "video" ? "📹" : "📞"}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                    Incoming{" "}
                    {incomingCall.callType === "video" ? "Video" : "Voice"} Call
                  </p>
                  <h3
                    style={{
                      margin: "6px 0 0",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {getConversationName(activeChat) || "Unknown"}
                  </h3>
                </div>
                <div style={{ display: "flex", gap: 24 }}>
                  {/* Decline */}
                  <button
                    onClick={declineCall}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "none",
                      background: "#ef4444",
                      cursor: "pointer",
                      fontSize: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 15px rgba(239,68,68,0.4)",
                    }}
                  >
                    📵
                  </button>
                  {/* Accept */}
                  <button
                    onClick={answerCall}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "none",
                      background: "#22c55e",
                      cursor: "pointer",
                      fontSize: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 15px rgba(34,197,94,0.4)",
                    }}
                  >
                    📞
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* ── OUTGOING CALL ───────────────────────────────────────────── */}
        {callState === "outgoing" &&
          createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.7)",
                zIndex: 99999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  background: "#1e293b",
                  borderRadius: 24,
                  padding: 32,
                  width: 320,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: -12,
                      borderRadius: "50%",
                      background: "rgba(34,197,94,0.15)",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#22c55e,#16a34a)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 30,
                      position: "relative",
                    }}
                  >
                    {callType === "video" ? "📹" : "📞"}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                    Calling ({callType === "video" ? "Video" : "Voice"})…
                  </p>
                  <h3
                    style={{
                      margin: "6px 0 0",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                    }}
                  >
                    {getConversationName(activeChat)}
                  </h3>
                </div>
                {/* Local video preview for video calls */}
                {callType === "video" && (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: 160,
                      height: 100,
                      borderRadius: 12,
                      objectFit: "cover",
                      background: "#0f172a",
                      transform: "scaleX(-1)",
                    }}
                  />
                )}
                <button
                  onClick={endCall}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    border: "none",
                    background: "#ef4444",
                    cursor: "pointer",
                    fontSize: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 15px rgba(239,68,68,0.4)",
                  }}
                >
                  📵
                </button>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                  Tap to cancel
                </p>
              </div>
            </div>,
            document.body,
          )}

        {/* ── ACTIVE CALL ─────────────────────────────────────────────── */}
        {callState === "active" &&
          createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "#0f172a",
                zIndex: 99999,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Remote video (full screen) */}
              {callType === "video" ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    flex: 1,
                    width: "100%",
                    objectFit: "cover",
                    background: "#1e293b",
                  }}
                  onLoadedMetadata={(e) => e.target.play().catch(() => {})}
                />
              ) : (
                /* Voice call — show avatar instead */
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 20,
                    background: "linear-gradient(160deg,#1e293b,#0f172a)",
                  }}
                >
                  <div
                    style={{
                      width: 110,
                      height: 110,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 42,
                      boxShadow: "0 0 40px rgba(99,102,241,0.4)",
                    }}
                  >
                    📞
                  </div>
                  <h2 style={{ color: "#fff", margin: 0, fontSize: 24 }}>
                    {getConversationName(activeChat)}
                  </h2>
                  <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>
                    {isMuted ? "🔇 Muted · " : ""}
                    {formatDuration(callDuration)}
                  </p>
                </div>
              )}

              {/* Local video pip (video calls only) */}
              {callType === "video" && (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    width: 120,
                    height: 80,
                    borderRadius: 12,
                    objectFit: "cover",
                    background: "#1e293b",
                    border: "2px solid #334155",
                    transform: "scaleX(-1)",
                    zIndex: 1,
                  }}
                />
              )}

              {/* Call info bar (video only) */}
              {callType === "video" && (
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    background: "rgba(0,0,0,0.5)",
                    borderRadius: 12,
                    padding: "8px 14px",
                    color: "#fff",
                    fontSize: 13,
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {getConversationName(activeChat)}
                  </span>
                  <span style={{ marginLeft: 10, color: "#94a3b8" }}>
                    {formatDuration(callDuration)}
                  </span>
                </div>
              )}

              {/* Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 20,
                  padding: "28px 0 36px",
                  background:
                    callType === "video" ? "rgba(0,0,0,0.6)" : "transparent",
                  backdropFilter: callType === "video" ? "blur(10px)" : "none",
                }}
              >
                {/* Mute */}
                <button
                  onClick={toggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: "none",
                    background: isMuted ? "#ef4444" : "rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    fontSize: 20,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                >
                  {isMuted ? "🔇" : "🎤"}
                </button>

                {/* End call */}
                <button
                  onClick={endCall}
                  title="End Call"
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    border: "none",
                    background: "#ef4444",
                    cursor: "pointer",
                    fontSize: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 20px rgba(239,68,68,0.5)",
                  }}
                >
                  📵
                </button>

                {/* Camera toggle (video only) */}
                {callType === "video" && (
                  <button
                    onClick={toggleCamera}
                    title={isCamOff ? "Turn Camera On" : "Turn Camera Off"}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      border: "none",
                      background: isCamOff
                        ? "#ef4444"
                        : "rgba(255,255,255,0.15)",
                      cursor: "pointer",
                      fontSize: 20,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.2s",
                    }}
                  >
                    {isCamOff ? "📷" : "📹"}
                  </button>
                )}
              </div>
            </div>,
            document.body,
          )}

        {/* ── FORWARD MESSAGE MODAL ──────────────────────────── */}
        {forwardMsg && (
          <ModalBackdrop onClose={() => setForwardMsg(null)}>
            <ModalCard width={420}>
              <ModalHeader
                title="Forward message to"
                icon="➡️"
                accent="#2563eb"
                onClose={() => setForwardMsg(null)}
              />

              {/* Message preview */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#334155",
                  fontStyle: forwardMsg.text ? "normal" : "italic",
                }}
              >
                {forwardMsg.text || "📎 media"}
              </div>

              <div
                style={{ height: 1, background: "#f1f5f9", margin: "0 -24px" }}
              />

              {/* Search */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 14,
                    color: "#94a3b8",
                  }}
                >
                  🔍
                </span>
                <input
                  autoFocus
                  placeholder="Search name or number"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px 10px 36px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                    background: "#f8fafc",
                    color: "#0f172a",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  id="forward-search"
                  onChange={(e) => {
                    const val = e.target.value.toLowerCase();
                    document
                      .querySelectorAll(".forward-conv-item")
                      .forEach((el) => {
                        el.style.display = el.dataset.name.includes(val)
                          ? "flex"
                          : "none";
                      });
                  }}
                />
              </div>

              {/* Conversation list */}
              <div
                style={{
                  overflowY: "auto",
                  maxHeight: 340,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#fafafa",
                }}
              >
                {conversations.map((conv, idx) => {
                  const isGroup = conv.type === "group";
                  const otherP = !isGroup
                    ? conv.participants?.find((p) => p._id !== user?._id)
                    : null;
                  const name = getConversationName(conv);
                  const sub = isGroup
                    ? conv.participants?.map((p) => p.firstName).join(", ")
                    : otherP?.role || "";

                  return (
                    <div
                      key={conv._id}
                      className="forward-conv-item"
                      data-name={name.toLowerCase()}
                      onClick={async () => {
                        try {
                          const fd = new FormData();
                          fd.append("text", forwardMsg.text || "");
                          const res = await apiSendMessage(conv._id, fd);
                          if (conv._id === activeChat?._id) {
                            setMessages((prev) => [...prev, res.data]);
                          }
                          showSuccessToast(`Forwarded to ${name}`);
                          setForwardMsg(null);
                        } catch {
                          showErrorToast("Failed to forward message");
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "11px 14px",
                        cursor: "pointer",
                        background: idx % 2 === 0 ? "#fff" : "#fafafa",
                        borderBottom:
                          idx < conversations.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#eff6ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          idx % 2 === 0 ? "#fff" : "#fafafa")
                      }
                    >
                      {/* Avatar */}
                      {isGroup ? (
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            background: "#dbeafe",
                            border: "1.5px solid #bfdbfe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#1d4ed8",
                            flexShrink: 0,
                          }}
                        >
                          {name[0]?.toUpperCase()}
                        </div>
                      ) : (
                        <Avatar
                          firstName={otherP?.firstName}
                          lastName={otherP?.lastName}
                          avatar={otherP?.avatar}
                          size={42}
                          fontSize={15}
                        />
                      )}

                      {/* Name + sub */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#0f172a",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {name}
                        </p>
                        <span
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "block",
                            textTransform: "capitalize",
                          }}
                        >
                          {sub}
                        </span>
                      </div>

                      {/* Send arrow */}
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          flexShrink: 0,
                          color: "#2563eb",
                        }}
                      >
                        ➤
                      </div>
                    </div>
                  );
                })}
              </div>
            </ModalCard>
          </ModalBackdrop>
        )}

        {preview && (
          <div className="preview-overlay" onClick={() => setPreview(null)}>
            <img src={preview} className="preview-image" alt="preview" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
