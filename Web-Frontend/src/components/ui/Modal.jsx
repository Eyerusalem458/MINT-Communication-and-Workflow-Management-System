/*
Modal
File: Modal.jsx
Purpose: A pop-up dialog box for confirmation, forms, alerts, etc.
Use cases:
Confirm deletion of a task or project
Display a form without navigating away from the page
Show detailed information like a user profile or message
Why use it:
Keeps the user in the same context
Can be reused with different content
*/

import React from "react";

const Modal = ({ onClose, children, style = {} }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={style}>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
