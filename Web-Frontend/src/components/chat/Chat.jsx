import { useState, useEffect, useRef } from "react";
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
import { formatDateTime, getRelativeTime } from "../../utils/formatDate";
import "../../assets/styles/Chat.css";

const ChatPage = () => {
  const initialChats = [
    {
      name: "Innovation Team",
      last: "I will upload file",
      type: "team",
      unread: true,
    },
    { name: "HR Team", last: "New policy added", type: "team", unread: false },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
    {
      name: "John Doe",
      last: "Hey, are you free?",
      type: "direct",
      unread: true,
    },
  ];

  const users = [
    { name: "A" },
    { name: "Beti" },
    { name: "Abe " },
    { name: "Abel Hair" },
    { name: "Abela" },
    { name: "Kebede" },
    { name: "Abebech" },
    { name: "Zelalem" },
    { name: "Kalkidan" },
  ];
  // for group
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [selectedChatUser, setSelectedChatUser] = useState(null);
  // for user search
  const [userSearch, setUserSearch] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [callType, setCallType] = useState(null); // "voice" | "video" | null
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeChat, setActiveChat] = useState(initialChats[0]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
  // for filter
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  // for new conversation
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [chatList, setChatList] = useState(initialChats);
  // for emoji
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  // { x, y, msgIndex }

  const [replyTo, setReplyTo] = useState(null);

  // DEFAULT MESSAGES (instead of hardcoded JSX)
  const defaultMessages = [
    {
      text: "Please share the updated innovation grant summary before 4 PM.",
      type: "incoming",
    },
    {
      text: "Working on it now. I will upload the file.",
      type: "outgoing",
    },
    {
      text: "Thanks! Let us know if you need anything.",
      type: "incoming",
    },
  ];
  const allMessages = [...defaultMessages, ...messages];

  const filteredMessages = allMessages.filter((msg) => {
    if (msg.audio) return true; // always show audio
    return (msg.text || "").toLowerCase().includes(chatSearch.toLowerCase());
  });
  const filteredChats = chatList
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => {
      if (activeTab === "all") return true;
      if (activeTab === "direct") return c.type === "direct";
      if (activeTab === "teams") return c.type === "team";
      if (activeTab === "unread") return c.unread;
      return true;
    });

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const handleSend = () => {
    if (!message.trim()) return;

    const newMsg = {
      text: message,
      type: "outgoing",
      time: new Date(),
      replyTo: replyTo ? replyTo.text : null,
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessage("");
    setReplyTo(null);
  };

  const handleAttachment = (type) => {
    setShowAttachments(false);

    if (type === "document") {
      fileInputRef.current.click();
    }

    if (type === "media") {
      imageInputRef.current.click();
    }

    if (type === "camera") {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const video = document.createElement("video");
          video.srcObject = stream;
          video.play();

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          setTimeout(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            const imageUrl = canvas.toDataURL("image/png");

            setMessages((prev) => [
              ...prev,
              {
                type: "outgoing",
                media: imageUrl,
                fileType: "image/png",
              },
            ]);

            stream.getTracks().forEach((track) => track.stop());
          }, 1500);
        })
        .catch(() => {
          showErrorToast("Camera access denied");
        });
    }

    if (type === "audio") {
      audioInputRef.current.click();
    }
  };

  const toggleUser = (user) => {
    const exists = selectedUsers.find((u) => u.name === user.name);

    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u.name !== user.name));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const getFileMeta = (name = "") => {
    const ext = name.split(".").pop().toLowerCase();

    if (ext === "pdf") {
      return { label: "PDF", color: "#e53935" };
    }
    if (ext === "doc" || ext === "docx") {
      return { label: "W", color: "#2b579a" };
    }
    if (ext === "ppt" || ext === "pptx") {
      return { label: "P", color: "#d24726" };
    }
    return { label: "FILE", color: "#6b7280" };
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-chat">
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const url = URL.createObjectURL(file);

            if (file.type.startsWith("audio")) {
              setMessages((prev) => [
                ...prev,
                {
                  type: "outgoing",
                  audio: url,
                },
              ]);
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  type: "outgoing",
                  file: {
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + " KB",
                    url,
                  },
                },
              ]);
            }
          }}
        />

        <input
          type="file"
          accept="image/*,video/*"
          ref={imageInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const url = URL.createObjectURL(file);

            setMessages((prev) => [
              ...prev,
              {
                type: "outgoing",
                media: url,
                fileType: file.type,
              },
            ]);
          }}
        />

        <input
          type="file"
          accept="audio/*"
          ref={audioInputRef}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const url = URL.createObjectURL(file);

            setMessages((prev) => [
              ...prev,
              {
                type: "outgoing",
                audio: url,
              },
            ]);
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
                // variant="ghost"
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
            {filteredChats.map((chat, i) => (
              <div
                key={i}
                className="staff-chat-thread chat-item-fixed"
                onClick={() => {
                  setActiveChat(chat);
                  setShowDetails(false);
                }}
              >
                <div className="chat-avatar">
                  {chat.avatar ? (
                    <img src={chat.avatar} alt={chat.name} />
                  ) : (
                    <span>{chat.name[0]}</span>
                  )}
                </div>

                <div className="chat-info">
                  <p>{chat.name}</p>
                  <span>{chat.last}</span>
                </div>
              </div>
            ))}
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
          <div className="staff-chat-header">
            {/* LEFT */}
            <div
              className="chat-header-left"
              onClick={() => setShowDetails(true)}
            >
              <div className="staff-avatar">
                {activeChat?.avatar ? (
                  <img src={activeChat.avatar} alt={activeChat.name} />
                ) : (
                  <NavProfileIcon />
                )}
              </div>

              <div className="chat-header-text">
                <h4>{activeChat?.name}</h4>
                <span>{activeChat?.members || "8 members"}</span>
              </div>
            </div>

            {/* RIGHT */}
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

          {/* MESSAGES */}
          <div className="staff-chat-messages staff-chat-messages--scroll">
            <div className="chat-date">{getRelativeTime(new Date())}</div>

            {(chatSearch ? filteredMessages : allMessages).map((msg, i) => (
              <div
                key={i}
                className={`msg-bubble
                   ${msg.type === "outgoing" ? "outgoing" : "incoming"}
                 ${msg.media || msg.audio || msg.file ? "no-bg" : ""}`}
                onContextMenu={(e) => {
                  e.preventDefault();

                  setContextMenu({
                    x: e.clientX,
                    y: e.clientY,
                    msgIndex: i,
                  });
                }}
              >
                {msg.replyTo && (
                  <div className="reply-preview">{msg.replyTo}</div>
                )}

                {msg.audio ? (
                  <audio controls src={msg.audio} />
                ) : msg.media ? (
                  msg.fileType.startsWith("image") ? (
                    <img
                      src={msg.media}
                      alt="media"
                      className="chat-media"
                      onClick={() => setPreview(msg.media)}
                    />
                  ) : (
                    <video controls src={msg.media} className="chat-media" />
                  )
                ) : msg.file ? (
                  (() => {
                    const meta = getFileMeta(msg.file.name);
                    const isMe = msg.type === "outgoing";

                    return (
                      <div className={`file-card ${isMe ? "me" : "other"}`}>
                        {/* TOP */}
                        <div className="file-top">
                          <div
                            className="file-icon"
                            style={{ background: meta.color }}
                          >
                            {meta.label}
                          </div>

                          <div className="file-info">
                            <p className="file-name">{msg.file.name}</p>
                            <span className="file-size">
                              {meta.label} • {msg.file.size}
                            </span>
                          </div>

                          {/* Receiver gets download icon */}
                          {!isMe && (
                            <div
                              className="file-download"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(msg.file.url);
                              }}
                            >
                              ⬇
                            </div>
                          )}
                        </div>

                        {/* Sender gets actions */}
                        {isMe && (
                          <div className="file-actions">
                            {/* OPEN */}
                            <span onClick={() => window.open(msg.file.url)}>
                              Open
                            </span>

                            {/* SAVE AS (REAL DOWNLOAD) */}
                            <a
                              href={msg.file.url}
                              download={msg.file.name} // 👈 THIS sets filename automatically
                              className="download-link"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Save as…
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : chatSearch ? (
                  msg.text
                    .split(new RegExp(`(${chatSearch})`, "gi"))
                    .map((part, index) =>
                      part.toLowerCase() === chatSearch.toLowerCase() ? (
                        <span key={index} className="highlight">
                          {part}
                        </span>
                      ) : (
                        part
                      ),
                    )
                ) : (
                  msg.text
                )}
              </div>
            ))}
          </div>

          {contextMenu && (
            <div
              className="context-menu"
              style={{
                top: contextMenu.y,
                left: contextMenu.x,
              }}
              onMouseLeave={() => setContextMenu(null)}
            >
              <div
                onClick={() => {
                  const msg = allMessages[contextMenu.msgIndex];
                  if (msg.text) {
                    navigator.clipboard.writeText(msg.text);
                  }
                  setContextMenu(null);
                }}
              >
                📋 Copy
              </div>

              <div
                onClick={() => {
                  const msg = allMessages[contextMenu.msgIndex];
                  setReplyTo(msg);
                  setContextMenu(null);
                }}
              >
                ↩ Reply
              </div>

              <div
                onClick={() => {
                  const updated = [...messages];
                  const realIndex =
                    contextMenu.msgIndex - defaultMessages.length;

                  if (realIndex >= 0) {
                    updated.splice(realIndex, 1);
                    setMessages(updated);
                  }

                  setContextMenu(null);
                }}
              >
                🗑 Delete
              </div>

              <div
                onClick={() => {
                  alert("Forward feature (mock)");
                  setContextMenu(null);
                }}
              >
                📤 Forward
              </div>
            </div>
          )}

          {replyTo && (
            <div className="reply-box">
              <span>{replyTo.text?.slice(0, 50)}</span>
              <button className="reply-close" onClick={() => setReplyTo(null)}>
                ✕
              </button>
            </div>
          )}

          {/* INPUT */}
          <form
            className="staff-chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="input-box">
              {/* LEFT ICONS */}
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

                {/* Emoji button (simple fix without extra library) */}
                <div
                  className="input-icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  😊
                </div>

                {showEmojiPicker && (
                  <div className="emoji-picker">
                    {["😀", "😂", "😍", "👍", "🔥", "🎉", "😎", "😭"].map(
                      (emoji) => (
                        <span
                          key={emoji}
                          onClick={() => {
                            setMessage((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </span>
                      ),
                    )}
                  </div>
                )}

                <div
                  className={`input-icon ${isRecording ? "recording" : ""}`}
                  onClick={async () => {
                    if (!isRecording) {
                      // 🎤 START RECORDING
                      try {
                        const stream =
                          await navigator.mediaDevices.getUserMedia({
                            audio: true,
                          });

                        const recorder = new MediaRecorder(stream);
                        let chunks = [];

                        recorder.ondataavailable = (e) => {
                          if (e.data.size > 0) {
                            chunks.push(e.data);
                          }
                        };

                        recorder.onstop = () => {
                          try {
                            const audioBlob = new Blob(chunks, {
                              type: "audio/webm",
                            });
                            const audioUrl = URL.createObjectURL(audioBlob);

                            setMessages((prev) => [
                              ...prev,
                              {
                                type: "outgoing",
                                audio: audioUrl,
                              },
                            ]);

                            chunks = []; // reset
                          } catch (err) {
                            console.error("Audio processing error:", err);
                          }
                        };

                        recorder.start();
                        setMediaRecorder(recorder);
                        setIsRecording(true);
                      } catch (err) {
                        showErrorToast("Microphone access is required ...");
                      }
                    } else {
                      if (mediaRecorder) {
                        mediaRecorder.stop();
                      }
                      setIsRecording(false);
                    }
                  }}
                >
                  <MicIcon />
                </div>
              </div>

              {/* INPUT */}
              <input
                className="chat-input-field"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {/* SEND */}
              <button type="submit" className="send-btn">
                <SendIcon />
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL */}
        {showDetails && (
          <div className={`chat-details-panel ${showDetails ? "open" : ""}`}>
            {/* HEADER */}
            <div className="details-header">
              <h4>
                {activeChat.type === "direct" ? "Contact Info" : "Group Info"}
              </h4>

              <span className="close-btn" onClick={() => setShowDetails(false)}>
                ✕
              </span>
            </div>

            {/* BODY */}
            <div className="details-body">
              {/* TOP PROFILE */}
              <div className="team">
                <div className="staff-avatar large">
                  <NavProfileIcon />
                </div>

                <div className="team-name-row">
                  <h3>{activeChat.name}</h3>

                  <span
                    className="edit-icon"
                    onClick={() => {
                      setEditedName(activeChat.name); // preload current name
                      setIsEditingName(true);
                    }}
                  >
                    <EditIcon />
                  </span>
                </div>

                {isEditingName && (
                  <div className="edit-name-box">
                    <input
                      className="staff-input"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Enter new name"
                    />

                    <button
                      onClick={() => {
                        if (!editedName.trim()) return;

                        const updatedList = chatList.map((c) =>
                          c === activeChat ? { ...c, name: editedName } : c,
                        );

                        setChatList(updatedList);
                        setActiveChat({ ...activeChat, name: editedName });

                        setIsEditingName(false);
                        setEditedName("");
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}

                {/* ONLY show members count for groups */}
                {activeChat.type === "team" && <p>8 Members</p>}

                <div className="details-actions">
                  <PhoneIcon />
                  <VideoIcon />
                </div>
              </div>

              <hr />

              {/* DESCRIPTION (only for group) */}
              {activeChat.type === "team" && (
                <>
                  <div className="staff-section">
                    <h5>Description</h5>
                    <p>This channel is dedicated to innovation discussions.</p>
                  </div>
                  <hr />
                </>
              )}

              {/* MEMBERS (ONLY GROUP) */}
              {activeChat.type === "team" && (
                <>
                  <div className="staff-section">
                    <h5>Members</h5>

                    <div className="member">
                      <div className="staff-avatar small" />
                      <div>
                        <p>James Anderson</p>
                        <span>Manager</span>
                      </div>
                    </div>

                    <div className="member">
                      <div className="staff-avatar small" />
                      <div>
                        <p>Emily Davis</p>
                        <span>Project Lead</span>
                      </div>
                    </div>

                    <p className="more-members">+4 more</p>
                  </div>

                  <hr />
                </>
              )}

              {/* SHARED (FOR BOTH) */}
              <div className="staff-section">
                <h5>Shared Files</h5>
                <p>Project_Guidelines.pdf</p>
              </div>

              <div className="staff-section">
                <h5>Shared Media</h5>
                <p>Images, Videos...</p>
              </div>

              <div className="staff-section">
                <h5>Shared Links</h5>
                <p>https://example.com</p>
              </div>
            </div>
          </div>
        )}
        {showAttachments && (
          <div className="attachment-menu">
            <div onClick={() => handleAttachment("document")}>📄 Document</div>
            <div onClick={() => handleAttachment("media")}>
              🖼 Photo & Video
            </div>
            <div onClick={() => handleAttachment("camera")}>📷 Camera</div>
            <div onClick={() => handleAttachment("audio")}>🎵 Audio</div>
          </div>
        )}

        {showFilterMenu && (
          <div className="filter-menu">
            {["all", "direct", "teams", "unread"].map((type) => (
              <div
                key={type}
                onClick={() => {
                  setActiveTab(type);
                  setShowFilterMenu(false);
                }}
              >
                {type.toUpperCase()}
              </div>
            ))}
          </div>
        )}

        {isCreatingChat && (
          <div className="chat-create-panel open">
            {/* HEADER */}
            <div className="details-header">
              <h4>New Conversation</h4>

              <span
                className="close-btn"
                onClick={() => setIsCreatingChat(false)}
              >
                ✕
              </span>
            </div>

            {/* BODY */}
            <div className="details-body">
              <input
                className="staff-input"
                placeholder="Search name or number"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />

              {/* USER LIST */}
              <div className="group-user-list">
                {filteredUsers.map((user, i) => {
                  const selected = selectedChatUser?.name === user.name;

                  return (
                    <div
                      key={i}
                      className={`group-user ${selected ? "selected" : ""}`}
                      onClick={() => setSelectedChatUser(user)}
                    >
                      <div className="chat-avatar">
                        <span>{user.name[0]}</span>
                      </div>

                      <span>{user.name}</span>

                      {selected && <span className="check">✔</span>}
                    </div>
                  );
                })}
              </div>

              <button
                className="create-btn"
                onClick={() => {
                  if (!selectedChatUser) return;

                  const newChat = {
                    name: selectedChatUser.name,
                    last: "Start chatting...",
                    type: "direct",
                    unread: false,
                  };

                  setChatList([newChat, ...chatList]);
                  setActiveChat(newChat);
                  setIsCreatingChat(false);
                  setUserSearch("");
                }}
              >
                Create Chat
              </button>
            </div>
          </div>
        )}

        {callType && (
          <div className="call-overlay">
            <div className="call-box">
              <h3>{callType === "video" ? "Video Call" : "Voice Call"}</h3>

              <p>Calling {activeChat?.name}...</p>

              <div className="call-actions">
                <button onClick={() => setCallType(null)}>End Call</button>
              </div>
            </div>
          </div>
        )}

        {preview && (
          <div className="preview-overlay" onClick={() => setPreview(null)}>
            <img src={preview} className="preview-image" />
          </div>
        )}

        {isCreatingGroup && (
          <div className="chat-create-panel open">
            {/* HEADER */}
            <div className="details-header">
              <h4>Add group members</h4>

              <span
                className="close-btn"
                onClick={() => setIsCreatingGroup(false)}
              >
                ✕
              </span>
            </div>

            {/* SEARCH */}
            <div className="details-body">
              <input
                className="staff-input"
                placeholder="Search name or number"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />

              {/* USER LIST */}
              <div className="group-user-list">
                {filteredUsers.map((user, i) => {
                  const selected = selectedUsers.find(
                    (u) => u.name === user.name,
                  );

                  return (
                    <div
                      key={i}
                      className={`group-user ${selected ? "selected" : ""}`}
                      onClick={() => toggleUser(user)}
                    >
                      <div className="chat-avatar">
                        <span>{user.name[0]}</span>
                      </div>

                      <span>{user.name}</span>

                      {selected && <span className="check">✔</span>}
                    </div>
                  );
                })}
              </div>

              {/* CREATE BUTTON */}
              <button
                className="create-btn"
                onClick={() => {
                  if (selectedUsers.length === 0) return;

                  const newGroup = {
                    name: "New Group",
                    last: "Group created",
                    type: "team",
                    members: selectedUsers.length + " members",
                  };

                  setChatList([newGroup, ...chatList]);
                  setActiveChat(newGroup);

                  setIsCreatingGroup(false);
                  setSelectedUsers([]);
                }}
              >
                Create Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
