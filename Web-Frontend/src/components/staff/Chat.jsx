import { CameraIcon, MicIcon, SendIcon } from "./icons";

const Chat = () => {
  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
        <h2>Team Chat</h2>
        <p className="staff-card-subtitle">
          Stay connected with your manager and colleagues.
        </p>
      </div>
      <div className="staff-chat">
        <div className="staff-chat-sidebar">
          <div className="staff-chat-section-title">Conversations</div>
          <button className="staff-chat-thread staff-chat-thread--active">
            Manager · Innovation Directorate
          </button>
          <button className="staff-chat-thread">Innovation Team</button>
        </div>
        <div className="staff-chat-main">
          <div className="staff-chat-messages">
            <div className="staff-chat-message staff-chat-message--incoming">
              <div className="staff-chat-message-meta">Manager · 09:15</div>
              <div className="staff-chat-message-bubble">
                Please share the updated innovation grant summary before 4 PM.
              </div>
            </div>
            <div className="staff-chat-message staff-chat-message--outgoing">
              <div className="staff-chat-message-meta">You · 09:18</div>
              <div className="staff-chat-message-bubble">
                Working on it now. I will upload the file under “My Tasks” once completed.
              </div>
            </div>
          </div>
          <form className="staff-chat-input-row" onSubmit={(e) => e.preventDefault()}>
            <div className="staff-chat-tools">
              <label className="staff-chat-tool staff-chat-tool--file" title="file">
                <input type="file" className="staff-upload-input" />+
              </label>
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
            <button
              className="staff-btn staff-btn--primary staff-btn--sm staff-chat-send"
              title="send"
              type="submit"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
