import { useState, useContext } from "react";
import { showSuccessToast,showErrorToast } from "../../utils/toast";
import Button from "../../components/ui/Button";
import { AuthContext } from "../../context/AuthContext";
import { updateMyProfile, changeMyPassword } from "../../api/userApi";
import { isEmailValid } from "../../utils/validators";

const settings = () => {
  const { user, setUser } = useContext(AuthContext);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    middleName: user?.middleName || "",
    position: user?.position || "",
    department: user?.department || "",
    phone: user?.phone || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwBusy, setPwBusy] = useState(false);

  const handleProfileSave = async () => {
    setProfileBusy(true);
    try {
      const fd = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append("avatar", avatarFile);
      const res = await updateMyProfile(fd);
      setUser(res.data);
      showSuccessToast("Profile updated successfully");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Update failed");
    } finally {
      setProfileBusy(false);
    }
  };

  const handlePasswordChange = async () => {
    if (
      !pwForm.currentPassword ||
      !pwForm.newPassword ||
      !pwForm.confirmPassword
    ) {
      showErrorToast("Please fill all password fields");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showErrorToast("New passwords do not match");
      return;
    }
    setPwBusy(true);
    try {
      await changeMyPassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showSuccessToast("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Password change failed");
    } finally {
      setPwBusy(false);
    }
  };

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : "U";

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
            {user?.avatar ? (
              <img
                src={`http://localhost:5000${user.avatar}`}
                alt="avatar"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div className="staff-profile-avatar-circle">{initials}</div>
            )}
            <label className="staff-upload staff-upload--inline">
              <input
                type="file"
                className="staff-upload-input"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
              <span>{avatarFile ? avatarFile.name : "Upload new picture"}</span>
            </label>
          </div>

          <div className="staff-form-grid">
            {[
              { label: "First Name", key: "firstName" },
              { label: "Last Name", key: "lastName" },
              { label: "Middle Name", key: "middleName" },
              { label: "Position", key: "position" },
              { label: "Department", key: "department" },
              { label: "Phone", key: "phone" },
            ].map(({ label, key }) => (
              <div className="staff-form-field" key={key}>
                <label>{label}</label>
                <input
                  type="text"
                  className="staff-input"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={profileForm[key]}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, [key]: e.target.value })
                  }
                />
              </div>
            ))}



            <div className="staff-form-actions">
              <Button
                variant="primary"
                onClick={handleProfileSave}
                disabled={profileBusy}
              >
                {profileBusy ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="staff-profile-block">
          <h3>Security</h3>
          <div
            className="staff-form-grid"
            style={{ gridTemplateColumns: "1fr" }}
          >
             {[
              { label: "Current Password", key: "currentPassword" },
              { label: "New Password", key: "newPassword" },
              { label: "Confirm Password", key: "confirmPassword" },
            ].map(({ label, key }) => (
            <div className="staff-form-field" key={key}>
              <label>{label}</label>
              <input
                type="password"
                className="staff-input"
                placeholder={`Enter ${label.toLowerCase()}`}
                value={pwForm[key]}
                onChange={(e) =>
                  setPwForm({ ...pwForm, [key]: e.target.value })
                }
              />
            </div>
            ))}
            
            <div className="staff-form-actions">
              <Button
                variant="primary"
                onClick={handlePasswordChange}
                disabled={pwBusy}
              >
                {pwBusy ? "Changing..." : "Change password"}
              </Button>
            </div>
          </div>

          <div className="staff-profile-divider" />
          <h3>Account Info</h3>
          <p className="staff-card-subtitle">
            <strong>Email:</strong> {user?.email}
            <br />
            <strong>Role:</strong> {user?.role?.toUpperCase()}
            <br />
            <strong>Status:</strong> {user?.status}
          </p>
        </div>
      </div>
    </div>
  );
};
export default settings;
