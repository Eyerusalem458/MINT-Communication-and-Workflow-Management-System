import { useMemo, useState, useEffect } from "react";
import { CameraIcon, MicIcon, SendIcon } from "../../components/icons";
import Button from "../../components/ui/Button";

const Chat = () => {
  const [query, setQuery] = useState("");
  const [activePerson, setActivePerson] = useState("Manager · Innovation Directorate");
  const [attachMenu, setAttachMenu] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const messagesContainer = document.querySelector('.staff-chat-messages');
      if (messagesContainer) {
        setShowScrollTop(messagesContainer.scrollTop > 200);
      }
    };

    const messagesContainer = document.querySelector('.staff-chat-messages');
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll);
      return () => messagesContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const messagesContainer = document.querySelector('.staff-chat-messages');
    if (messagesContainer) {
      messagesContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const messages = useMemo(() => {
    const base = [
      { author: "Manager", text: "Please share the updated innovation grant summary before 4 PM.", direction: "incoming" },
      { author: "You", text: "Working on it now. I will upload the file under My Tasks once completed.", direction: "outgoing" },
      { author: "Manager", text: "Can you include the weekly progress and blocker details?", direction: "incoming" },
      { author: "You", text: "Yes, I'll attach the document in the next message.", direction: "outgoing" },
    ];

    return Array.from({ length: 28 }, (_, i) => {
      const entry = base[i % base.length];
      return {
        id: i + 1,
        author: entry.author,
        text: `${entry.text} (message ${i + 1})`,
        direction: entry.direction,
      };
    });
  }, []);


  const addAttachment = (type) => {
    setAttachMenu(false);
    alert(`Selected attachment: ${type}`);
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
        <h2>Team Chat</h2>
        <p className="staff-card-subtitle">
          Stay connected with your manager and colleagues.
        </p>
      </div>

      <div className="staff-search-wrapper">
        <input
          type="search"
          className="staff-input"
          placeholder="Search chat..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="staff-chat">
        <div className="staff-chat-sidebar staff-chat-sidebar--scroll">
          <div className="staff-chat-section-title">Conversations</div>
          <button className="staff-chat-thread staff-chat-thread--active" onClick={() => setActivePerson("Manager · Innovation Directorate")}>Manager · Innovation Directorate</button>
          <button className="staff-chat-thread" onClick={() => setActivePerson("Innovation Team")}>Innovation Team</button>
        </div>
        <div className="staff-chat-divider" />
        <div className="staff-chat-main">
          <div className="staff-chat-messages staff-chat-messages--scroll">
            {messages
              .filter((m) => m.text.toLowerCase().includes(query.toLowerCase()) || activePerson.toLowerCase().includes(query.toLowerCase()))
              .map((message) => (
                <div key={message.id} className={`staff-chat-message staff-chat-message--${message.direction}`}>
                  <div className="staff-chat-message-meta">{message.author} · 09:15</div>
                  <div className="staff-chat-message-bubble">{message.text}</div>
                </div>
              ))}
            {showScrollTop && (
              <button className="staff-scroll-top" onClick={scrollToTop} title="Scroll to top">
                ↑
              </button>
            )}
          </div>

          <form className="staff-chat-input-row" onSubmit={(e) => e.preventDefault()}>
            <div className="staff-chat-tools">
              <div className="staff-attach-container">
                <Button variant="ghost" className="staff-attach-toggle" onClick={() => setAttachMenu((v) => !v)} title="Attach">
                  +
                </Button>
                {attachMenu && (
                  <div className="staff-attach-menu staff-attach-menu--compact">
                    <button type="button" onClick={() => addAttachment("Document")}>📄 Document</button>
                    <button type="button" onClick={() => addAttachment("Gallery")}>🖼️ Photos</button>
                    <button type="button" onClick={() => addAttachment("Camera")}>📷 Camera</button>
                    <button type="button" onClick={() => addAttachment("Audio")}>🎵 Audio</button>
                  </div>
                )}
              </div>
              <button type="button" className="staff-chat-tool staff-chat-tool--voice" title="voice">
                <MicIcon />
              </button>
              <button type="button" className="staff-chat-tool staff-chat-tool--camera" title="camera">
                <CameraIcon />
              </button>
            </div>
            <input
              type="text"
              placeholder="Type a message to your manager..."
              className="staff-input"
            />
            <Button variant="primary" size="sm" type="submit" title="send">
              <SendIcon />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
