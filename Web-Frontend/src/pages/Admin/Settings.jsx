import { showSuccessToast } from "../../utils/toast";
import Button from "../../components/ui/Button";

const settings = () => {
  const onSave = () => showSuccessToast("Profile updated successfully");
  const onPasswordChange = () =>
    showSuccessToast("Password changed successfully");

  return (
    <div className="staff-card staff-card--full">
      <div className="staff-card-header">

        <p className="staff-card-subtitle">
          Update your personal information and account security.
        </p>
      </div>

      <div className="staff-grid staff-grid--cols-2 staff-grid--stack">
        <div className="staff-profile-block">
          <h3>Personal Information</h3>
          <div className="staff-profile-avatar">
            <div className="staff-profile-avatar-circle">SM</div>
            <label className="staff-upload staff-upload--inline">
              <input type="file" className="staff-upload-input" />
              <span>Upload new picture</span>
            </label>
          </div>
          <form
            className="staff-form-grid"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="staff-form-field">
              <label>Full name</label>
              <input
                type="text"
                className="staff-input"
                placeholder="Enter your full name"
                value="Admin User"
                readOnly
              />
            </div>
            <div className="staff-form-field">
              <label>Position</label>
              <input
                type="text"
                className="staff-input"
                placeholder="e.g. Innovation Officer"
                value="Chief Administrator"
                readOnly
              />
            </div>
            <div className="staff-form-field">
              <label>Department</label>
              <input
                type="text"
                className="staff-input"
                placeholder="e.g. Digital Transformation"
                value="Innovation & Technology"
                readOnly
              />
            </div>
            <div className="staff-form-field">
              <label>Work email</label>
              <input
                type="email"
                className="staff-input"
                placeholder="name@mint.gov"
                value="admin@mint.gov"
                readOnly
              />
            </div>
            <div className="staff-form-actions">
              <Button variant="primary" size="sm" onClick={onSave}>
                Save changes
              </Button>
            </div>
          </form>
        </div>

        <div className="staff-profile-block">
          <h3>Security</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="staff-form-field">
              <label>Current password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Enter current password"
                value="adminpass"
                readOnly
              />
            </div>
            <div className="staff-form-field">
              <label>New password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Enter new password"
                value="newpass123"
                readOnly
              />
            </div>
            <div className="staff-form-field">
              <label>Confirm new password</label>
              <input
                type="password"
                className="staff-input"
                placeholder="Re-enter new password"
                value="newpass123"
                readOnly
              />
            </div>
            <div className="staff-form-actions">
              <Button variant="primary" size="sm" onClick={onPasswordChange}>
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

export default settings;
