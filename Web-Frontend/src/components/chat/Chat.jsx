// --- FULL LOGIC FROM ADMIN/CHAT.JSX MOVED HERE ---
import { useMemo, useState, useRef } from "react";
import {
    CameraIcon,
    MicIcon,
    SendIcon,
    SearchIcon,
} from "../../pages/shared/icon";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import { FaComments, FaFolder } from "react-icons/fa";

function SidebarSection({ label, type, count, active, onClick, extraButton }) {
    let icon;
    if (type === 'all') icon = <FaComments size={22} color={active ? '#60a5fa' : '#64748b'} />;
    else if (type === 'personal') icon = <FaFolder size={22} color={active ? '#60a5fa' : '#64748b'} />;
    else if (type === 'unread') icon = <FaComments size={22} color={active ? '#60a5fa' : '#64748b'} />;
    else if (type === 'groups') icon = <FaFolder size={22} color={active ? '#60a5fa' : '#64748b'} />;

    return (
        <div
            style={{
                display: 'flex', alignItems: 'center', padding: '12px 18px', cursor: 'pointer', background: active ? '#232f3e' : 'transparent', color: active ? '#fff' : '#cbd5e1', fontWeight: 500, position: 'relative', transition: 'background 0.2s', minHeight: 48
            }}
            onClick={onClick}
        >
            <span style={{ marginRight: 14, display: 'flex', alignItems: 'center' }}>{icon}</span>
            <span style={{ flex: 1, fontSize: 16 }}>{label}</span>
            <span style={{
                background: '#60a5fa',
                color: '#fff',
                borderRadius: 16,
                padding: '2px 12px',
                fontSize: 15,
                fontWeight: 700,
                marginLeft: 8,
                minWidth: 28,
                textAlign: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>{count}</span>
            {extraButton && <span style={{ marginLeft: 8 }}>{extraButton}</span>}
        </div>
    );
}

function Chat({
    conversations: propConversations,
    userRole = "User",
    ...props
}) {
    // If no conversations are passed, use a default mock
    const mockConversations = [
        {
            person: "Staff · John Doe",
            messages: [
                {
                    author: "Staff",
                    en: "Hello Admin, I need access to the new project.",
                    am: "ሰላም አድሚን፣ አዲሱን ፕሮጀክት ለማግኘት ፈቃድ እፈልጋለሁ።",
                    direction: "incoming",
                },
                {
                    author: "You",
                    en: "Hi John, I will grant you access shortly.",
                    am: "ሰላም ጆን፣ በቅርቡ ፈቃድ እሰጥሃለሁ።",
                    direction: "outgoing",
                },
            ],
        },
        {
            person: "Manager · Jane Smith",
            messages: [
                {
                    author: "Manager",
                    en: "Please review the latest report.",
                    am: "እባክህ የቅርብ ጊዜ ሪፖርቱን አረጋግጥ።",
                    direction: "incoming",
                },
                {
                    author: "You",
                    en: "Received, I will check and respond soon.",
                    am: "ተቀብያለሁ፣ በቅርቡ እመልሳለሁ።",
                    direction: "outgoing",
                },
            ],
        },
    ];
    const conversations = propConversations || mockConversations;

    // State and hooks
    const [sidebarFilter, setSidebarFilter] = useState('all');
    const [activePerson, setActivePerson] = useState(conversations[0]?.person || "");
    const [language, setLanguage] = useState("en");
    const [topQuery, setTopQuery] = useState("");
    const [messageQuery, setMessageQuery] = useState("");
    const [input, setInput] = useState("");
    const [attachMenu, setAttachMenu] = useState(false);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [showMessageSearch, setShowMessageSearch] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [newGroupMembers, setNewGroupMembers] = useState([]);
    const [showProfileInfo, setShowProfileInfo] = useState(false);
    const fileInputRef = useRef();
    const messagesEndRef = useRef();
    const languageFlag = language === "en" ? "EN" : "AM";
    const demoUsers = ["Staff · John Doe", "Manager · Jane Smith", "Staff · Alice", "Manager · Bob"];

    function isGroup(convo) {
        return convo.person.startsWith("Group · ");
    }

    const filteredPeople = useMemo(() => {
        return conversations.filter((c) =>
            c.person.toLowerCase().includes(topQuery.toLowerCase())
        );
    }, [conversations, topQuery]);

    const filteredMessages = useMemo(() => {
        const convo = conversations.find((c) => c.person === activePerson);
        if (!convo) return [];
        if (!messageQuery) return convo.messages;
        return convo.messages.filter((m) =>
            m[language].toLowerCase().includes(messageQuery.toLowerCase())
        );
    }, [conversations, activePerson, messageQuery, language]);

    function handleSend(e) { e.preventDefault(); /* ... */ }
    function addAttachment(type) { /* ... */ }
    function handleFileSelect() { /* ... */ }
    function handleCreateGroup(e) { e.preventDefault(); /* ... */ }

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
                        Stay connected with your staff and managers.
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
                <div className="staff-chat-sidebar staff-chat-sidebar--scroll" style={{ padding: 0 }}>
                    {/* Chat dashboard sections */}
                    <div style={{ padding: '8px 0' }}>
                        <SidebarSection
                            label="All chats"
                            type="all"
                            count={conversations.length}
                            active={sidebarFilter === 'all'}
                            onClick={() => setSidebarFilter('all')}
                        />
                        <SidebarSection
                            label="Personal"
                            type="personal"
                            count={conversations.filter(c => !isGroup(c)).length}
                            active={sidebarFilter === 'personal'}
                            onClick={() => setSidebarFilter('personal')}
                        />
                        <SidebarSection
                            label="Unread"
                            type="unread"
                            count={conversations.reduce((acc, c) => acc + (c.messages.length), 0)}
                            active={sidebarFilter === 'unread'}
                            onClick={() => setSidebarFilter('unread')}
                        />
                        <SidebarSection
                            label="Groups"
                            type="groups"
                            count={conversations.filter(isGroup).length}
                            active={sidebarFilter === 'groups'}
                            onClick={() => setSidebarFilter('groups')}
                            extraButton={<Button size="xs" variant="ghost" style={{ fontSize: 18, padding: '2px 8px' }} onClick={e => { e.stopPropagation(); setShowGroupModal(true); }} title="Create Group">+</Button>}
                        />
                    </div>
                    {/* Filtered conversation list */}
                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 4 }}>
                        {filteredPeople
                            .filter(c => {
                                if (sidebarFilter === 'personal') return !isGroup(c);
                                if (sidebarFilter === 'groups') return isGroup(c);
                                return true;
                            })
                            .map((c) => (
                                <button
                                    key={c.person}
                                    className={`staff-chat-thread ${c.person === activePerson ? "staff-chat-thread--active" : ""}`}
                                    onClick={() => {
                                        setActivePerson(c.person);
                                        setMessageQuery("");
                                    }}
                                >
                                    {c.person}
                                    {isGroup(c) && (
                                        <span style={{ marginLeft: 6, fontSize: 12, color: '#1976d2' }}>👥</span>
                                    )}
                                </button>
                            ))}
                    </div>
                </div>

                <div className="staff-chat-divider" />

                {/* Main chat */}
                <div className="staff-chat-main">
                    {/* Profile/Info Card for selected person, shown on avatar click */}
                    {activePerson && !isGroup(conversations.find(c => c.person === activePerson) || {}) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                            {/* Avatar with two-letter initials */}
                            <div
                                style={{
                                    width: 54, height: 54, borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700, cursor: 'pointer', border: showProfileInfo ? '2px solid #60a5fa' : 'none', transition: 'border 0.2s', letterSpacing: 1
                                }}
                                onClick={() => setShowProfileInfo((v) => !v)}
                                title="Show profile info"
                            >
                                {(() => {
                                    const name = activePerson.split('·')[1]?.trim() || activePerson;
                                    const parts = name.split(' ');
                                    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
                                    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
                                })()}
                            </div>
                            {/* Always show name/role, info card toggles */}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>{activePerson.split('·')[1]?.trim() || activePerson}</div>
                                <div style={{ fontSize: 14, color: '#60a5fa', marginTop: 2 }}>{activePerson.split('·')[0]?.trim()}</div>
                                {showProfileInfo && (
                                    <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 6, background: '#19202a', borderRadius: 10, padding: '14px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', minWidth: 240 }}>
                                        <div style={{ marginBottom: 8, textAlign: 'center', fontSize: 15, color: '#cbd5e1' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                                <input
                                                    type="email"
                                                    className="staff-input"
                                                    value={"admin@mint.gov.et"}
                                                    readOnly
                                                    style={{ maxWidth: 220, marginBottom: 2, textAlign: 'center' }}
                                                />
                                                <input
                                                    type="tel"
                                                    className="staff-input"
                                                    value={"+251-900-000-000"}
                                                    readOnly
                                                    style={{ maxWidth: 180, textAlign: 'center' }}
                                                />
                                            </div>
                                        </div>
                                        {/* Action buttons row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 16px 0' }}>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #26313f', borderRadius: 12, marginRight: 8, padding: '10px 0', background: '#181f29', cursor: 'pointer' }}>
                                                <span style={{ color: '#2563eb', fontSize: 20, marginBottom: 2 }}>
                                                    {/* Search Icon */}
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                                </span>
                                                <span style={{ color: '#cbd5e1', fontSize: 13 }}>Search</span>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #26313f', borderRadius: 12, marginRight: 8, padding: '10px 0', background: '#181f29', cursor: 'pointer' }}>
                                                <span style={{ color: '#2563eb', fontSize: 20, marginBottom: 2 }}>
                                                    {/* Video Icon */}
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="15" height="10" rx="2" /><polygon points="23 7 16 12 23 17 23 7" /></svg>
                                                </span>
                                                <span style={{ color: '#cbd5e1', fontSize: 13 }}>Video</span>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #26313f', borderRadius: 12, padding: '10px 0', background: '#181f29', cursor: 'pointer' }}>
                                                <span style={{ color: '#2563eb', fontSize: 20, marginBottom: 2 }}>
                                                    {/* Voice/Phone Icon */}
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.16 8.81 19.79 19.79 0 0 1 .11 2.18 2 2 0 0 1 2.09 0h3a2 2 0 0 1 2 1.72c.13.81.37 1.6.7 2.34a2 2 0 0 1-.45 2.11L6.13 7.09a16 16 0 0 0 6.88 6.88l1.92-1.21a2 2 0 0 1 2.11-.45c.74.33 1.53.57 2.34.7A2 2 0 0 1 22 16.92z" /></svg>
                                                </span>
                                                <span style={{ color: '#cbd5e1', fontSize: 13 }}>Voice</span>
                                            </div>
                                        </div>
                                        {/* Shared files */}
                                        <div style={{ marginBottom: 8 }}>
                                            <b>Files Shared:</b>
                                            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                                {(() => {
                                                    const convo = conversations.find(c => c.person === activePerson);
                                                    const files = convo?.messages?.filter(m => m.en?.toLowerCase().includes('file') || m.am?.includes('ፋይል')) || [];
                                                    if (files.length === 0) return <li style={{ color: '#64748b' }}>No files shared</li>;
                                                    return files.map((m, idx) => <li key={idx}>{m.en || m.am}</li>);
                                                })()}
                                            </ul>
                                        </div>
                                        {/* Chat history summary */}
                                        <div>
                                            <b>Chat History:</b>
                                            <div style={{ marginTop: 4 }}>
                                                {(() => {
                                                    const convo = conversations.find(c => c.person === activePerson);
                                                    if (!convo) return <span style={{ color: '#64748b' }}>No history</span>;
                                                    return <span>{convo.messages.length} messages</span>;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input row */}
                    <form
                        className="staff-chat-input-row"
                        onSubmit={handleSend}
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
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <Button variant="primary" size="sm" type="submit">
                            <SendIcon />
                        </Button>
                    </form>
                </div>
            </div>

            {/* Group creation modal */}
            {showGroupModal && (
                <Modal onClose={() => setShowGroupModal(false)}>
                    <form onSubmit={handleCreateGroup} style={{ minWidth: 320, padding: 12 }}>
                        <h3 style={{ marginBottom: 10 }}>Create Group</h3>
                        <label style={{ fontWeight: 500 }}>Group Name</label>
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            required
                            style={{ width: '100%', marginBottom: 12, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
                            placeholder="Enter group name"
                        />
                        <label style={{ fontWeight: 500 }}>Add Members</label>
                        <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 12 }}>
                            {demoUsers.map(u => (
                                <div key={u} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <input
                                        type="checkbox"
                                        checked={newGroupMembers.includes(u)}
                                        onChange={e => {
                                            setNewGroupMembers(m => e.target.checked ? [...m, u] : m.filter(x => x !== u));
                                        }}
                                        disabled={u === newGroupName}
                                    />
                                    <span style={{ marginLeft: 8 }}>{u}</span>
                                </div>
                            ))}
                        </div>
                        <Button type="submit" variant="primary" size="sm" style={{ marginTop: 8 }}>
                            Create Group
                        </Button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default Chat;
