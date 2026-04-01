
import React from "react";

const Modal = ({ onClose, children, style = {} }) => {
    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.32)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <div style={{
                background: "#fff",
                borderRadius: 12,
                minWidth: 320,
                minHeight: 40,
                boxShadow: "0 4px 32px #0002",
                position: "relative",
                ...style,
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 12,
                        background: "none",
                        border: "none",
                        fontSize: 22,
                        color: "#888",
                        cursor: "pointer",
                        zIndex: 2,
                    }}
                    aria-label="Close"
                >
                    ×
                </button>
                <div style={{ padding: 20 }}>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
