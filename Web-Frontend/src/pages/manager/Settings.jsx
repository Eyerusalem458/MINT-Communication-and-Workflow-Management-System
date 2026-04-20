// File: Settings.jsx
import { useState } from "react";
import { showSuccessToast } from "../../utils/toast";
import Button from "../../components/ui/Button";
import {
  isEmailValid,
  checkEmailRules,
  getEmailMessage,
  checkPasswordRules,
  getPasswordMessage,
} from "../../utils/validators.js";

const Settings = () => {
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");

  const [errors, setErrors] = useState({});

  // helper to clear field error when user interacts again
  const clearError = (field) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    clearError("email");

    const rules = checkEmailRules(value);
    setEmailMsg(getEmailMessage(rules));
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);

    const rules = checkPasswordRules(value);
    setPasswordMsg(getPasswordMessage(rules));
  };

  const onSave = () => {
    const newErrors = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!position.trim()) newErrors.position = "Position is required";
    if (!department.trim()) newErrors.department = "Department is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!isEmailValid(email)) newErrors.email = "Invalid email";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    showSuccessToast("Settings updated successfully");
  };

  const onPasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showSuccessToast("Please fill all password fields first");
      return;
    }

    if (newPassword !== confirmPassword) {
      showSuccessToast("Passwords do not match!");
      return;
    }

    const rules = checkPasswordRules(newPassword);
    if (!Object.values(rules).every(Boolean)) {
      showSuccessToast("Password does not meet requirements!");
      return;
    }

    showSuccessToast("Password changed successfully");
  };

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">
        <p className="staff-card-subtitle">
          Update your personal information and account security.
        </p>
      </div>

      <div className="staff-grid staff-grid--cols-2 staff-grid--stack">
        {/* Personal Information */}
        <div className="staff-profile-block">
          <h3>Personal Information</h3>

          <div className="staff-profile-avatar">
            <div className="staff-profile-avatar-circle">MG</div>
            <label className="staff-upload staff-upload--inline">
              <input type="file" className="staff-upload-input" />
              <span>Upload new picture</span>
            </label>
          </div>

          <form className="staff-form-grid" onSubmit={(e) => e.preventDefault()}>
            <div className="staff-form-field">
              <label>Full name</label>
              <input
                type="text"
                className="staff-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearError("fullName");
                }}
              />
              {errors.fullName && (
                <p className="staff-input-message">{errors.fullName}</p>
              )}
            </div>

            <div className="staff-form-field">
              <label>Position</label>
              <input
                type="text"
                className="staff-input"
                placeholder="e.g. Department Manager"
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                  clearError("position");
                }}
              />
              {errors.position && (
                <p className="staff-input-message">{errors.position}</p>
              )}
            </div>

            <div className="staff-form-field">
              <label>Department</label>
              <input
                type="text"
                className="staff-input"
                placeholder="e.g. Operations"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  clearError("department");
                }}
              />
              {errors.department && (
                <p className="staff-input-message">{errors.department}</p>
              )}
            </div>

            <div className="staff-form-field">
              <label>Work email</label>
              <input
                type="email"
                className="staff-input"
                placeholder="name@mint.gov"
                value={email}
                onChange={handleEmailChange}
              />
              <p className="staff-input-message">
                {errors.email ? errors.email : emailMsg}
              </p>
            </div>

            <div className="staff-form-actions">
              <Button variant="primary" onClick={onSave}>
                Save changes
              </Button>
            </div>
          </form>
        </div>

        {/* Security */}
        <div className="staff-profile-block">
          <h3>Security</h3>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="staff-form-field">
              <label>Current password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="staff-form-field">
              <label>New password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={handleNewPasswordChange}
              />
              <p className="staff-input-message">{passwordMsg}</p>
            </div>

            <div className="staff-form-field">
              <label>Confirm new password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="staff-form-actions">
              <Button variant="primary" onClick={onPasswordChange}>
                Change password
              </Button>
            </div>
          </form>

          <div className="staff-profile-divider" />

          <h3>Account</h3>
          <p className="staff-card-subtitle">
            Keep your account information up to date to receive important
            updates from MINT.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;