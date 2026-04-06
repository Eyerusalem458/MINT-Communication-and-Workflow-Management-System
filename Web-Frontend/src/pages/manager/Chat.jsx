import { useMemo, useState, useRef, useEffect } from "react";
import { CameraIcon, MicIcon, SendIcon, SearchIcon } from "../../pages/shared/icon";
import Button from "../../components/ui/Button";

const mockConversations = [
  {
    person: "Staff · Innovation Team",
    messages: [
      { author: "Staff", en: "I've completed the weekly report.", am: "ሳምንታዊ ሪፖርትን አስጨረስሁ።", direction: "incoming" },
      { author: "Manager", en: "Great! Please upload it to My Tasks.", am: "ጥሩ ነው። እባክህ በMy Tasks እስከሚገኝ አስገባ።", direction: "outgoing" },
    ],
  },
  {
    person: "Project Team",
    messages: [
      { author: "Team", en: "Next sprint planning is scheduled for tomorrow.", am: "ሚቀጥለው ስፕሪንት እቅድ ነገ ነው።", direction: "incoming" },
      { author: "Manager", en: "Noted. I will attend.", am: "ተገናኝቷል። እኔ እሰቀል።", direction: "outgoing" },
    ],
  },
  ...Array.from({ length: 5 }, (_, i) => ({
    person: `Staff Member ${i + 1}`,
    messages: [
      { author: `Member ${i + 1}`, en: `Hello Manager`, am: `ሰላም እባክህ`, direction: "incoming" },
      { author: "Manager", en: "Got it!", am: "አረጋግጠሁ!", direction: "outgoing" },
    ],
  })),
];

const ManagerChat = () => {
  const [topQuery, setTopQuery] = useState("");
  const [messageQuery, setMessageQuery] = useState("");
  const [activePerson, setActivePerson] = useState(mockConversations[0].person);
  const [attachMenu, setAttachMenu] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const [conversations, setConversations] = useState(mockConversations);
  const [typedMessage, setTypedMessage] = useState("");

  const [actionMenuIndex, setActionMenuIndex] = useState(null);
  const [actionMenuPosition, setActionMenuPosition] = useState({ top: 0, left: 0 });
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  const activeConversationIndex = useMemo(() => {
    return conversations.findIndex(c => c.person === activePerson);
  }, [conversations, activePerson]);

  const activeConversation = useMemo(() => {
    return conversations[activeConversationIndex] || { messages: [] };
  }, [conversations, activeConversationIndex]);

  const filteredPeople = useMemo(() => {
    return conversations.filter(c =>
      c.person.toLowerCase().includes(topQuery.toLowerCase())
    );
  }, [topQuery, conversations]);

  const filteredMessages = useMemo(() => {
    return activeConversation.messages.filter(
      m =>
        (m.en && m.en.toLowerCase().includes(messageQuery.toLowerCase())) ||
        (m.am && m.am.toLowerCase().includes(messageQuery.toLowerCase()))
    );
  }, [activeConversation, messageQuery]);

  const languageFlag = language.toUpperCase();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation.messages, previewFiles]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".staff-chat-message-bubble")) {
        setActionMenuIndex(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const addAttachment = (type) => {
    setAttachMenu(false);
    if (type === "Camera") {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = document.createElement("video");
          video.srcObject = stream;
          video.play();
          const canvas = document.createElement("canvas");
          setTimeout(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL();
            setPreviewFiles(prev => [...prev, { type: "Camera", src: dataUrl }]);
            stream.getTracks().forEach(track => track.stop());
          }, 500);
        })
        .catch(() => alert("Camera access denied"));
    } else if (type === "Audio") {
      if (!recording) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];
          recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const url = URL.createObjectURL(blob);
            setPreviewFiles(prev => [...prev, { type: "Audio", src: url }]);
          };
          recorder.start();
          setRecording(true);
        });
      } else {
        mediaRecorderRef.current.stop();
        setRecording(false);
      }
    } else {
      fileInputRef.current.accept =
        type === "Document" ? ".pdf,.doc,.docx,.txt" :
        type === "Gallery" ? "image/*" : "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => ({
      type: file.type.includes("image") ? "Gallery" : "Document",
      src: URL.createObjectURL(file),
    }));
    setPreviewFiles(prev => [...prev, ...previews]);
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMessage = {
      author: "Manager",
      en: typedMessage,
      am: typedMessage,
      direction: "outgoing",
    };

    setConversations(prev => {
      const updated = [...prev];
      updated[activeConversationIndex] = {
        ...updated[activeConversationIndex],
        messages: [...updated[activeConversationIndex].messages, newMessage]
      };
      return updated;
    });

    setTypedMessage("");
  };

  const handleCopy = (msg) => {
    navigator.clipboard.writeText(msg[language]);
    setActionMenuIndex(null);
  };

  const handleDelete = (index) => {
    setConversations(prev => {
      const updated = [...prev];
      updated[activeConversationIndex].messages.splice(index, 1);
      return updated;
    });
    setActionMenuIndex(null);
  };

  const handleForward = (msg) => {
    alert(`Forwarding: ${msg[language]}`);
    setActionMenuIndex(null);
  };

  const handleEdit = (index, msg) => {
    setEditingMessageIndex(index);
    setEditingText(msg[language]);
    setActionMenuIndex(null);
  };

  const handleSaveEdit = (index) => {
    setConversations(prev => {
      const updated = [...prev];
      updated[activeConversationIndex].messages[index] = {
        ...updated[activeConversationIndex].messages[index],
        en: editingText,
        am: editingText
      };
      return updated;
    });
    setEditingMessageIndex(null);
    setEditingText("");
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p className="staff-card-subtitle">Stay connected with your team and staff.</p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setLanguage(language === "en" ? "am" : "en")}>
          {languageFlag}
        </Button>
      </div>

      <div className="staff-search-wrapper">
        <input type="search" className="staff-input" placeholder="Search threads..." value={topQuery} onChange={e => setTopQuery(e.target.value)} />
      </div>

      <div className="staff-chat">
        <div className="staff-chat-sidebar staff-chat-sidebar--scroll">
          <div className="staff-chat-section-title">Conversations</div>
          {filteredPeople.map(c => (
            <button
              key={c.person}
              className={`staff-chat-thread ${c.person === activePerson ? "staff-chat-thread--active" : ""}`}
              onClick={() => { setActivePerson(c.person); setMessageQuery(""); }}
            >
              {c.person}
            </button>
          ))}
        </div>

        <div className="staff-chat-divider" />

        <div className="staff-chat-main">
          <div className="staff-chat-messages staff-chat-messages--scroll">
            {filteredMessages.map((m, i) => (
              <div key={i} className={`staff-chat-message staff-chat-message--${m.direction}`}>
                <div className="staff-chat-message-meta">{m.author} · 09:15</div>

                {editingMessageIndex === i ? (
                  <div>
                    <input
                      className="staff-input"
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                    />
                    <button onClick={() => handleSaveEdit(i)}>Save</button>
                  </div>
                ) : (
                  <div
                    className="staff-chat-message-bubble"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActionMenuIndex(actionMenuIndex === i ? null : i);
                      setActionMenuPosition({ 
                        top: rect.top + window.scrollY - 50, 
                        left: rect.left + rect.width / 2
                      });
                    }}
                  >
                    {m[language]}
                    {actionMenuIndex === i && (
                      <div className="message-action-menu-floating" style={{ top: actionMenuPosition.top, left: actionMenuPosition.left }}>
                        <div onClick={() => handleCopy(m)}>Copy</div>
                        <div onClick={() => handleDelete(i)}>Delete</div>
                        <div onClick={() => handleForward(m)}>Forward</div>
                        {m.direction === "outgoing" && <div onClick={() => handleEdit(i, m)}>Edit</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {previewFiles.map((f, i) => (
              <div key={`preview-${i}`} className="staff-chat-message staff-chat-message--outgoing">
                <div className="staff-chat-message-meta">Manager · 09:15</div>
                <div className="staff-chat-message-bubble">
                  {f.type === "Audio" ? <audio controls src={f.src} /> : <img src={f.src} alt={f.type} style={{ maxWidth: "200px" }} />}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <form className="staff-chat-input-row" onSubmit={handleSendMessage}>
            <div className="staff-chat-tools">
              <div className="staff-attach-container">
                <Button variant="ghost" className="staff-attach-toggle" onClick={() => setAttachMenu(v => !v)} title="Attach">+</Button>
                {attachMenu && (
                  <div className="staff-attach-menu staff-attach-menu--compact">
                    <button type="button" onClick={() => addAttachment("Document")}>📄 Document</button>
                    <button type="button" onClick={() => addAttachment("Gallery")}>🖼️ Photos</button>
                    <button type="button" onClick={() => addAttachment("Camera")}>📷 Camera</button>
                    <button type="button" onClick={() => addAttachment("Audio")}>🎵 Audio</button>
                  </div>
                )}
                <input type="file" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileSelect} multiple />
              </div>
              <button type="button" className="staff-chat-tool staff-chat-tool--voice" onClick={() => addAttachment("Audio")}><MicIcon /></button>
              <button type="button" className="staff-chat-tool staff-chat-tool--camera" onClick={() => addAttachment("Camera")}><CameraIcon /></button>
              <button type="button" className="staff-chat-tool staff-chat-tool--search" title="Search messages" onClick={() => setShowMessageSearch(v => !v)}><SearchIcon /></button>
            </div>

            {showMessageSearch && (
              <input type="text" className="staff-input staff-input--message-search" placeholder="Search in this conversation..." value={messageQuery} onChange={e => setMessageQuery(e.target.value)} />
            )}

            <input
              type="text"
              placeholder="Type a message..."
              className="staff-input"
              value={typedMessage}
              onChange={e => setTypedMessage(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSendMessage(e); }}
            />
            <Button variant="primary" size="sm" type="submit"><SendIcon /></Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagerChat;