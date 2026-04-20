import React from "react";
import { FaComments, FaFolder } from "react-icons/fa";
import Button from "../ui/Button";

// Shared sidebar section for chat dashboards
export default function ChatSidebarSection({ label, type, count, active, onClick, extraButton }) {
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
