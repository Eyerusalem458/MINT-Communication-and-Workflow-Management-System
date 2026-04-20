import { useMemo, useState, useRef } from "react";
import {
  CameraIcon,
  MicIcon,
  SendIcon,
  SearchIcon,
} from "../../pages/shared/icon";
import Button from "../../components/ui/Button";

// Mock conversations with English + Amharic
const mockConversations = [
  {
    person: "Manager · Innovation Directorate",
    messages: [
      {
        author: "Manager",
        en: "Please share the updated innovation grant summary before 4 PM.",
        am: "እባክህ ከ4 ሰዓት በፊት የኢኖቬሽን ግራንት ማጠቃለያን አስገባ።",
        direction: "incoming",
      },
      {
        author: "You",
        en: "Working on it now. I will upload the file under My Tasks once completed.",
        am: "እስካሁን በሥራ ላይ ነኝ። በተጨማሪ ሲጨርስ ፋይሉን በMy Tasks እሰቀል።",
        direction: "outgoing",
      },
      {
        author: "Manager",
        en: "Can you include the weekly progress and blocker details?",
        am: "ሳምንታዊ እድገትና መከላከያ ዝርዝሮችን መያዝ ትችላለህ?",
        direction: "incoming",
      },
      {
        author: "You",
        en: "Yes, I'll attach the document in the next message.",
        am: "አዎን፣ ቀጣዩ መልዕክት ውስጥ ሰነዱን እከፍታለሁ።",
        direction: "outgoing",
      },
    ],
  },
  {
    person: "Innovation Team",
    messages: [
      {
        author: "Team",
        en: "Let's schedule the next sprint planning.",
        am: "እንግዲኛ የሚቀጥለውን ስፕሪንት እቅድ እንደምን እንቀይር?",
        direction: "incoming",
      },
      {
        author: "You",
        en: "Sure, I can set up a call for tomorrow.",
        am: "እሺ፣ እኔ ነገ ስልክ እከፍታለሁ።",
        direction: "outgoing",
      },
    ],
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    person: `Team Member ${i + 1}`,
    messages: [
      {
        author: `Member ${i + 1}`,
        en: `Hello from member ${i + 1}`,
        am: `ሰላም ከአባል ${i + 1}`,
        direction: "incoming",
      },
      { author: "You", en: "Got it!", am: "አረጋግጠሁ!", direction: "outgoing" },
    ],
  })),
];

const Chat = () => {
  const [topQuery, setTopQuery] = useState(""); // Top search: threads
  const [messageQuery, setMessageQuery] = useState(""); // Bottom search: messages
  const [activePerson, setActivePerson] = useState(mockConversations[0].person);
  const [attachMenu, setAttachMenu] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const activeConversation = useMemo(() => {
    return (
      mockConversations.find((c) => c.person === activePerson) || {
        messages: [],
      }
    );
  }, [activePerson]);

  const filteredPeople = useMemo(() => {
    return mockConversations.filter((c) =>
      c.person.toLowerCase().includes(topQuery.toLowerCase()),
    );
  }, [topQuery]);

  const filteredMessages = useMemo(() => {
    return activeConversation.messages.filter(
      (m) =>
        (m.en && m.en.toLowerCase().includes(messageQuery.toLowerCase())) ||
        (m.am && m.am.toLowerCase().includes(messageQuery.toLowerCase())),
    );
  }, [activeConversation, messageQuery]);

  const languageFlag = language.toUpperCase();

  const addAttachment = (type) => {
    setAttachMenu(false);
    if (type === "Camera") {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          const video = document.createElement("video");
          video.srcObject = stream;
          video.play();
          const canvas = document.createElement("canvas");
          setTimeout(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas
              .getContext("2d")
              .drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL();
            setPreviewFiles((prev) => [
              ...prev,
              { type: "Camera", src: dataUrl },
            ]);
            stream.getTracks().forEach((track) => track.stop());
          }, 500);
        })
        .catch(() => alert("Camera access denied"));
    } else if (type === "Audio") {
      if (!recording) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];
          recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, {
              type: "audio/webm",
            });
            const url = URL.createObjectURL(blob);
            setPreviewFiles((prev) => [...prev, { type: "Audio", src: url }]);
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
        type === "Document"
          ? ".pdf,.doc,.docx,.txt"
          : type === "Gallery"
            ? "image/*"
            : "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => ({
      type: file.type.includes("image") ? "Gallery" : "Document",
      src: URL.createObjectURL(file),
    }));
    setPreviewFiles((prev) => [...prev, ...previews]);
  };

  return (
    <div className="staff-card staff-card--full">
      {/* Header */}
      <div
        className="staff-card-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          
          <p className="staff-card-subtitle">
            Stay connected with your manager and colleagues.
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setLanguage(language === "en" ? "am" : "en")}
        >
          {languageFlag}
        </Button>
      </div>

      {/* Top search for threads */}
      <div className="staff-search-wrapper">
        <input
          type="search"
          className="staff-input"
          placeholder="Search threads..."
          value={topQuery}
          onChange={(e) => setTopQuery(e.target.value)}
        />
      </div>

      <div className="staff-chat">
        {/* Sidebar */}
        <div className="staff-chat-sidebar staff-chat-sidebar--scroll">
          <div className="staff-chat-section-title">Conversations</div>
          {filteredPeople.map((c) => (
            <button
              key={c.person}
              className={`staff-chat-thread ${
                c.person === activePerson ? "staff-chat-thread--active" : ""
              }`}
              onClick={() => {
                setActivePerson(c.person);
                setMessageQuery("");
              }}
            >
              {c.person}
            </button>
          ))}
        </div>

        <div className="staff-chat-divider" />

        {/* Main chat */}
        <div className="staff-chat-main">
          <div className="staff-chat-messages staff-chat-messages--scroll">
            {filteredMessages.map((m, i) => (
              <div
                key={i}
                className={`staff-chat-message staff-chat-message--${m.direction}`}
              >
                <div className="staff-chat-message-meta">
                  {m.author} · 09:15
                </div>
                <div className="staff-chat-message-bubble">{m[language]}</div>
              </div>
            ))}

            {previewFiles.map((f, i) => (
              <div
                key={`preview-${i}`}
                className="staff-chat-message staff-chat-message--outgoing"
              >
                <div className="staff-chat-message-meta">You · 09:15</div>
                <div className="staff-chat-message-bubble">
                  {f.type === "Audio" ? (
                    <audio controls src={f.src} />
                  ) : (
                    <img
                      src={f.src}
                      alt={f.type}
                      style={{ maxWidth: "200px" }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input row */}
          <form
            className="staff-chat-input-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="staff-chat-tools">
              <div className="staff-attach-container">
                <Button
                  variant="ghost"
                  className="staff-attach-toggle"
                  onClick={() => setAttachMenu((v) => !v)}
                  title="Attach"
                >
                  +
                </Button>
                {attachMenu && (
                  <div className="staff-attach-menu staff-attach-menu--compact">
                    <button
                      type="button"
                      onClick={() => addAttachment("Document")}
                    >
                      📄 Document
                    </button>
                    <button
                      type="button"
                      onClick={() => addAttachment("Gallery")}
                    >
                      🖼️ Photos
                    </button>
                    <button
                      type="button"
                      onClick={() => addAttachment("Camera")}
                    >
                      📷 Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => addAttachment("Audio")}
                    >
                      🎵 Audio
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                />
              </div>

              <button
                type="button"
                className="staff-chat-tool staff-chat-tool--voice"
                onClick={() => addAttachment("Audio")}
              >
                <MicIcon />
              </button>
              <button
                type="button"
                className="staff-chat-tool staff-chat-tool--camera"
                onClick={() => addAttachment("Camera")}
              >
                <CameraIcon />
              </button>

              {/* Bottom search icon */}
              <button
                type="button"
                className="staff-chat-tool staff-chat-tool--search"
                title="Search messages"
                onClick={() => setShowMessageSearch((v) => !v)}
              >
                <SearchIcon />
              </button>
            </div>

            {/* Bottom message search input */}
            {showMessageSearch && (
              <input
                type="text"
                className="staff-input staff-input--message-search"
                placeholder="Search in this conversation..."
                value={messageQuery}
                onChange={(e) => setMessageQuery(e.target.value)}
              />
            )}

            <input
              type="text"
              placeholder="Type a message..."
              className="staff-input"
            />
            <Button variant="primary" size="sm" type="submit">
              <SendIcon />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
