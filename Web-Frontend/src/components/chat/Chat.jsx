import { useState, useEffect, useRef, useContext, useCallback } from "react";
import Button from "../../components/ui/Button";
import {
  SearchIcon,
  SendIcon,
  MicIcon,
  NavProfileIcon,
  FilterIcon,
  EditIcon,
  PlusIcon,
  VideoIcon,
  PhoneIcon,
} from "../../pages/shared/icon";
import { showErrorToast } from "../../utils/toast";
import { getRelativeTime } from "../../utils/formatDate";
import "../../assets/styles/Chat.css";
import { AuthContext } from "../../context/AuthContext";
import {
  getConversations,
  getOrCreateDirectConversation,
  createGroupConversation,
  getMessages,
  sendMessage as apiSendMessage,
  deleteMessage as apiDeleteMessage,
  getChatUsers,
} from "../../api/messageApi";
import { socket } from "../../utils/socket";

const BASE_URL = "http://localhost:5000";

const ChatPage = () => {
  const { user } = useContext(AuthContext);

  // conversations
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);

  // messages
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  // for group

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showDetails, setShowDetails] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [callType, setCallType] = useState(null); // "voice" | "video" | null
  const [preview, setPreview] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
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

  // ── Initial load ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [convRes, usersRes] = await Promise.all([
          getConversations(),
          getChatUsers(),
        ]);
        setConversations(convRes.data);
        setChatUsers(usersRes.data);
        if (convRes.data.length > 0) setActiveChat(convRes.data[0]);
      } catch {
        /* ignore */
      }
    };
    load();
  }, []);

  // ── Load messages when active conversation changes ─────────────
  useEffect(() => {
    if (!activeChat?._id) return;
    setLoadingMessages(true);
    getMessages(activeChat._id)
      .then((res) => setMessages(res.data))
      .catch(() => {})
      .finally(() => setLoadingMessages(false));

    // Join socket room for this conversation
    socket.emit("join_conversation", activeChat._id);

    return () => {
      socket.emit("leave_conversation", activeChat._id);
    };
  }, [activeChat?._id]);

  // ── Real-time: receive new message via socket ──────────────────
  useEffect(() => {
    const handleNewMessage = (msg) => {
      // ✅ skip if this message was sent by me — already added via API response
      const senderId = msg.sender?._id?.toString() || msg.sender?.toString();
      const myId = user?._id?.toString();
      console.log("senderId:", senderId);
      console.log("myId:", myId);
      console.log("are equal:", senderId === myId);

      console.log("senderId:", senderId);
      console.log("myId:", myId);
      console.log("are equal:", senderId === myId);

      // Update last message preview in sidebar
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? {
                ...c,
                lastMessage: msg.text || "📎 file",
                lastMessageAt: new Date(),
              }
            : c,
        ),
      );
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, text: "This message was deleted", isDeleted: true }
            : m,
        ),
      );
    };

    // Fix #12: show typing indicator
    const handleTyping = ({ userId }) => {
      if (userId !== user?._id) {
        const typingPerson = activeChat?.participants?.find(
          (p) => p._id === userId,
        );
        setTypingUser(
          typingPerson
            ? `${typingPerson.firstName} is typing…`
            : "Someone is typing…",
        );
      }
    };

    const handleStopTyping = () => setTypingUser(null);

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [activeChat?._id, activeChat?.participants, user?._id]);

  // ── Auto-scroll to bottom ──────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fix #12: emit typing events when user types
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (activeChat?._id) {
      socket.emit("typing", {
        conversationId: activeChat._id,
        userId: user?._id,
      });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", {
          conversationId: activeChat._id,
          userId: user?._id,
        });
      }, 1500);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────
  const getConversationName = (conv) => {
    if (!conv) return "";
    if (conv.type === "group") return conv.name || "Group";
    const other = conv.participants?.find((p) => p._id !== user?._id);
    return other ? `${other.firstName} ${other.lastName}` : conv.name;
  };

  const getConversationInitial = (conv) => {
    const name = getConversationName(conv);
    return name?.[0]?.toUpperCase() || "?";
  };

  const filteredConversations = conversations
    .filter((c) =>
      getConversationName(c).toLowerCase().includes(search.toLowerCase()),
    )
    .filter((c) => {
      if (activeTab === "all") return true;
      if (activeTab === "direct") return c.type === "direct";
      if (activeTab === "teams") return c.type === "group";
      return true;
    });

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

  // ── Send text message ──────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!message.trim() || !activeChat?._id || sending) return;
    setSending(true);
    // Stop typing indicator on send
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

  // ── Send file ──────────────────────────────────────────────────
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

  // ── Delete message ─────────────────────────────────────────────
  const handleDeleteMessage = useCallback(async (msgId) => {
    try {
      await apiDeleteMessage(msgId);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId
            ? { ...m, text: "This message was deleted", isDeleted: true }
            : m,
        ),
      );
    } catch {
      showErrorToast("Failed to delete message");
    }
  }, []);

  // ── Start / open direct conversation ──────────────────────────
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

  // ── Create group ───────────────────────────────────────────────
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

  const toggleGroupUser = (u) => {
    setSelectedUsers((prev) =>
      prev.find((x) => x._id === u._id)
        ? prev.filter((x) => x._id !== u._id)
        : [...prev, u],
    );
  };

  // ── File meta helper ───────────────────────────────────────────
  const getFileMeta = (name = "") => {
    const ext = name.split(".").pop().toLowerCase();
    if (ext === "pdf") return { label: "PDF", color: "#e53935" };
    if (["doc", "docx"].includes(ext)) return { label: "W", color: "#2b579a" };
    if (["ppt", "pptx"].includes(ext)) return { label: "P", color: "#d24726" };
    return { label: "FILE", color: "#6b7280" };
  };

  // ── Render a single message bubble ────────────────────────────
  const renderMessage = (msg, i) => {
    const isMe =
      msg.sender?._id?.toString() === user?._id?.toString() ||
      msg.sender?.toString() === user?._id?.toString();
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
          <audio controls src={audioUrl} />
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
                    // download={msg.fileName || "file"}
                    className="file-download"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const response = await fetch(fileUrl);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = msg.fileName || "file"; // ✅ original filename
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
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
        ) : // highlight search term
        chatSearch && msg.text ? (
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
        {/* hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) handleFileSend(f);

            e.target.value = null; // 🔥 important (allows re-selecting same file)
          }}
        />

        <input
          type="file"
          accept="image/*,video/*"
          ref={imageInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleFileSend(file);
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
          {/* HEADER */}
          <div className="staff-card-header">
            <h3>Team Chat</h3>

            <div style={{ display: "flex", gap: 8 }}>
              <div
                className="input-icon plus-style"
                onClick={() => {
                  setShowDetails(false);
                  setIsCreatingGroup(true);
                }}
              >
                <PlusIcon />
              </div>

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

          {/* SEARCH */}
          <div className="staff-search-wrapper chat-search-fixed">
            <SearchIcon className="search-icon" />
            <input
              className="staff-input"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* TABS */}
          <div className="staff-tabs chat-tabs-fixed">
            {[
              { key: "all", label: "All" },
              { key: "direct", label: "Direct" },
              { key: "teams", label: "Teams" },
              { key: "unread", label: "Unread" },
            ].map((tab) => (
              <div
                key={tab.key}
                className={`chat-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* CHAT LIST */}
          <div className="chat-list-scroll">
            {filteredConversations.length === 0 ? (
              <p style={{ padding: 12, fontSize: 12, color: "#64748b" }}>
                No conversations yet. Start one below!
              </p>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`staff-chat-thread chat-item-fixed ${activeChat?._id === conv._id ? "active" : ""}`}
                  onClick={() => {
                    setActiveChat(conv);
                    setShowDetails(false);
                  }}
                >
                  <div className="chat-avatar">
                    <span>{getConversationInitial(conv)}</span>
                  </div>
                  <div className="chat-info">
                    <p>{getConversationName(conv)}</p>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {conv.lastMessage || "No messages yet"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* NEW CHAT */}
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
          {/* HEADER */}
          {activeChat ? (
            <div className="staff-chat-header">
              {/* LEFT */}
              <div
                className="chat-header-left"
                onClick={() => setShowDetails(true)}
              >
                <div className="staff-avatar">
                  <NavProfileIcon />
                </div>
                <div className="chat-header-text">
                  <h4>{getConversationName(activeChat)}</h4>
                  <span>
                    {activeChat.type === "group"
                      ? `${activeChat.participants?.length || 0} members`
                      : activeChat.participants?.find(
                          (p) => p._id !== user?._id,
                        )?.role || ""}
                  </span>
                </div>
              </div>
              <div className="chat-header-actions">
                <span onClick={() => setShowChatSearch(!showChatSearch)}>
                  <SearchIcon />
                </span>
                <span onClick={() => setCallType("video")}>
                  <VideoIcon />
                </span>
                <span onClick={() => setCallType("voice")}>
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

          {/* Messages */}
          <div className="staff-chat-messages staff-chat-messages--scroll">
            {!activeChat ? (
              <div
                style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}
              >
                <p>No conversation selected</p>
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

          {/* Context menu */}
          {contextMenu && (
            <div
              className="context-menu"
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onMouseLeave={() => setContextMenu(null)}
            >
              <div
                onClick={() => {
                  if (contextMenu.msg.text)
                    navigator.clipboard.writeText(contextMenu.msg.text);
                  setContextMenu(null);
                }}
              >
                📋 Copy
              </div>
              <div
                onClick={() => {
                  setReplyTo(contextMenu.msg);
                  setContextMenu(null);
                }}
              >
                ↩ Reply
              </div>
              {contextMenu.msg.sender?._id === user?._id && (
                <div
                  onClick={() => {
                    handleDeleteMessage(contextMenu.msg._id);
                    setContextMenu(null);
                  }}
                >
                  🗑 Delete
                </div>
              )}
            </div>
          )}

          {/* Reply box */}
          {replyTo && (
            <div className="reply-box">
              <span>{replyTo.text?.slice(0, 50) || "📎 file"}</span>
              <button className="reply-close" onClick={() => setReplyTo(null)}>
                ✕
              </button>
            </div>
          )}

          {/* Input row */}
          {activeChat && (
            <form
              className="staff-chat-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <div className="input-box">
                <div className="input-left">
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
                            "🥹",
                            "😅",
                            "😂",
                            "🤣",
                            "🥲",
                            "☺️",
                            "😊",
                            "😇",
                            "🙂",
                            "🙃",
                            "😉",
                            "😌",
                            "😍",
                            "🥰",
                            "😘",
                            "😗",
                            "😙",
                            "😚",
                            "😋",
                            "😛",
                            "😝",
                            "😜",
                            "🤪",
                            "🤨",
                            "🧐",
                            "🤓",
                            "😎",
                            "🥸",
                            "🤩",
                            "🥳",
                            "😏",
                            "😒",
                            "😞",
                            "😔",
                            "😟",
                            "😕",
                            "🙁",
                            "☹️",
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
                            "😥",
                            "🤗",
                            "🤔",
                            "🫣",
                            "🤭",
                            "🫢",
                            "🫡",
                            "🤫",
                            "🫠",
                            "🤥",
                            "😶",
                            "🫥",
                            "😐",
                            "🫤",
                            "😑",
                            "🫨",
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
                            "😵‍💫",
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
                            "☠️",
                            "👽",
                            "👾",
                            "🤖",
                            "🎃",
                            "😺",
                            "😸",
                            "😹",
                            "😻",
                            "😼",
                            "😽",
                            "🙀",
                            "😿",
                            "😾",
                          ],
                        },
                        {
                          label: "👋 Gestures & Body",
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
                            "🫷",
                            "🫸",
                            "🤞",
                            "✌️",
                            "🫰",
                            "🤟",
                            "🤘",
                            "👌",
                            "🤌",
                            "🤏",
                            "🫳",
                            "🫴",
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
                            "🫲",
                            "🫱",
                            "💪",
                            "🦾",
                            "🖕",
                            "✍️",
                            "🙏",
                            "🫵",
                            "🦶",
                            "🦵",
                            "🦿",
                            "💄",
                            "💋",
                            "👄",
                            "🫦",
                            "🦷",
                            "👅",
                            "👂",
                            "🦻",
                            "👃",
                            "🫆",
                            "👣",
                            "👁️",
                            "👀",
                            "🫀",
                            "🫁",
                            "🧠",
                            "🗣️",
                            "👤",
                            "👥",
                            "🫂",
                          ],
                        },
                        {
                          label: "👶 People",
                          emojis: [
                            "👶",
                            "👧",
                            "🧒",
                            "👦",
                            "👩",
                            "🧑",
                            "👨",
                            "👩‍🦱",
                            "🧑‍🦱",
                            "👨‍🦱",
                            "👩‍🦰",
                            "🧑‍🦰",
                            "👨‍🦰",
                            "👱‍♀️",
                            "👱",
                            "👱‍♂️",
                            "👩‍🦳",
                            "🧑‍🦳",
                            "👨‍🦳",
                            "👩‍🦲",
                            "🧑‍🦲",
                            "👨‍🦲",
                            "🧔‍♀️",
                            "🧔",
                            "🧔‍♂️",
                            "👵",
                            "🧓",
                            "👴",
                            "👲",
                            "👳‍♀️",
                            "👳",
                            "👳‍♂️",
                            "🧕",
                          ],
                        },
                        {
                          label: "👗 Clothing",
                          emojis: [
                            "🌂",
                            "🥽",
                            "🕶️",
                            "👓",
                            "🧳",
                            "🎒",
                            "💼",
                            "👜",
                            "🧤",
                            "🧣",
                            "🎩",
                            "🧢",
                            "👒",
                            "🎓",
                            "⛑️",
                            "🪖",
                            "👑",
                            "💍",
                            "👝",
                            "👛",
                            "🧦",
                            "🥾",
                            "👟",
                            "👞",
                            "👢",
                            "👡",
                            "👠",
                            "🥿",
                            "🩴",
                            "🥻",
                            "👘",
                            "🩱",
                            "🪡",
                            "🧥",
                            "🥼",
                            "🦺",
                            "👚",
                            "👕",
                            "👖",
                            "🩲",
                            "🩳",
                            "👔",
                            "👗",
                            "👙",
                            "🧵",
                            "🧶",
                            "🪢",
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
                            "💟",
                            "☮️",
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
                        {
                          label: "⚽ Activities",
                          emojis: [
                            "⚽",
                            "🏀",
                            "🏈",
                            "⚾",
                            "🥎",
                            "🎾",
                            "🏐",
                            "🏉",
                            "🥏",
                            "🎱",
                            "🏓",
                            "🏸",
                            "🥊",
                            "🥋",
                            "🎯",
                            "🎮",
                            "🎲",
                            "🧩",
                            "🎭",
                            "🎨",
                            "🎬",
                            "🎤",
                            "🎧",
                            "🎼",
                            "🎹",
                            "🥁",
                            "🎷",
                            "🎺",
                            "🎸",
                            "🪗",
                          ],
                        },
                        {
                          label: "✈️ Travel",
                          emojis: [
                            "✈️",
                            "🚀",
                            "🛸",
                            "🚁",
                            "🛺",
                            "🚗",
                            "🚕",
                            "🚙",
                            "🚌",
                            "🚎",
                            "🏎️",
                            "🚓",
                            "🚑",
                            "🚒",
                            "🚐",
                            "🛻",
                            "🚚",
                            "🚛",
                            "🚜",
                            "🏍️",
                            "🛵",
                            "🚲",
                            "🛴",
                            "🛹",
                            "🛼",
                            "🚏",
                            "🛣️",
                            "🗺️",
                            "🧭",
                            "🌍",
                          ],
                        },
                      ].map((category) => (
                        <div key={category.label}>
                          <div className="emoji-category-label">
                            {category.label}
                          </div>
                          <div className="emoji-grid">
                            {category.emojis.map((e) => (
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
                            const file = new File(
                              [blob],
                              "voice-message.webm",
                              { type: "audio/webm" },
                            );
                            await handleFileSend(file);
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
                </div>
                <input
                  className="chat-input-field"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="send-btn" disabled={sending}>
                  <SendIcon />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        {showDetails && activeChat && (
          <div className="chat-details-panel open">
            <div className="details-header">
              <h4>
                {activeChat.type === "group" ? "Group Info" : "Contact Info"}
              </h4>
              <span className="close-btn" onClick={() => setShowDetails(false)}>
                ✕
              </span>
            </div>
            <div className="details-body">
              <div className="staff-avatar large">
                <NavProfileIcon />
              </div>
              <h3 style={{ marginTop: 8 }}>
                {getConversationName(activeChat)}
              </h3>
              {activeChat.type === "group" && (
                <div className="section">
                  <h5>Members ({activeChat.participants?.length})</h5>
                  {activeChat.participants?.map((p) => (
                    <div key={p._id} className="member">
                      <div className="staff-avatar small">
                        <NavProfileIcon />
                      </div>
                      <div>
                        <p>
                          {p.firstName} {p.lastName}
                        </p>
                        <span>{p.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attachment menu */}
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

        {/* Filter menu */}
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

        {/* New conversation panel */}
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
                      <div className="chat-avatar">
                        <span>{u.firstName?.[0]}</span>
                      </div>
                      <div>
                        <span>
                          {u.firstName} {u.lastName}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#94a3b8",
                            display: "block",
                          }}
                        >
                          {u.role} • {u.department}
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

        {/* New group panel */}
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
                  const selected = selectedUsers.find((x) => x._id === u._id);
                  return (
                    <div
                      key={u._id}
                      className={`group-user ${selected ? "selected" : ""}`}
                      onClick={() => toggleGroupUser(u)}
                    >
                      <div className="chat-avatar">
                        <span>{u.firstName?.[0]}</span>
                      </div>
                      <span>
                        {u.firstName} {u.lastName}
                      </span>
                      {selected && <span className="check">✔</span>}
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

        {/* Call overlay */}
        {callType && (
          <div className="call-overlay">
            <div className="call-box">
              <h3>{callType === "video" ? "Video Call" : "Voice Call"}</h3>
              <p>Calling {getConversationName(activeChat)}...</p>
              <div className="call-actions">
                <button onClick={() => setCallType(null)}>End Call</button>
              </div>
            </div>
          </div>
        )}

        {/* Image preview */}
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
