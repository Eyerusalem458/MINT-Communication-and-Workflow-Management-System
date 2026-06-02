import { useState, useContext, useEffect } from "react";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/AuthContext";
import { updateMyProfile, changeMyPassword } from "../../api/userApi";

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    department: "",
    phone: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwBusy, setPwBusy] = useState(false);
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        middleName: user.middleName || "",
        department: user.department || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : "?";

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    setProfileBusy(true);
    try {
      const fd = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append("avatar", avatarFile);
      const res = await updateMyProfile(fd);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      showSuccessToast("Profile updated successfully");
      setAvatarFile(null);
      setAvatarPreview(null);
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

  const ROLE_COLOR = { admin: "#3949ab", manager: "#1976D2", staff: "#7b1fa2" };
  const roleColor = ROLE_COLOR[user?.role] || "#555";

  return (
    <>
      <style>{`
        .st-page { font-family: 'Segoe UI', sans-serif; box-sizing: border-box; }

        /* profile hero */
        .st-hero {
          background: linear-gradient(135deg, #1976D2, #6366f1);
          border-radius: 14px; padding: 28px 24px;
          display: flex; align-items: center; gap: 20px;
          margin-bottom: 24px; color: #fff;
          box-shadow: 0 4px 16px rgba(25,118,210,.25);
        }
        .st-avatar-wrap { position: relative; flex-shrink: 0; }
        .st-avatar {
          width: 72px; height: 72px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,.5);
          object-fit: cover; display: block;
        }
        .st-avatar-placeholder {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(255,255,255,.2); border: 3px solid rgba(255,255,255,.5);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 700; color: #fff;
        }
        .st-avatar-edit {
          position: absolute; bottom: 0; right: 0;
          width: 24px; height: 24px; border-radius: 50%;
          background: #fff; color: #1976D2; border: 2px solid #1976D2;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; cursor: pointer;
        }
        .st-hero-info h3 { margin: 0 0 4px; font-size: 18px; font-weight: 700; }
        .st-hero-info p  { margin: 0 0 8px; font-size: 13px; opacity: .85; }
        .st-role-badge {
          display: inline-block; padding: 3px 12px; border-radius: 99px;
          background: rgba(255,255,255,.2); font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .5px;
        }
        .st-hero-stats { margin-left: auto; display: flex; gap: 24px; }
        .st-hero-stat { text-align: center; }
        .st-hero-stat-val { font-size: 20px; font-weight: 700; }
        .st-hero-stat-label { font-size: 11px; opacity: .8; }

        /* tabs */
        .st-tabs { display: flex; gap: 4px; margin-bottom: 20px; }
        .st-tab {
          padding: 8px 18px; border-radius: 8px; border: 1px solid #e0e0e0;
          background: #f8f9fb; font-size: 13px; font-weight: 600; color: #666;
          cursor: pointer; transition: all .15s;
        }
        .st-tab:hover { border-color: #90CAF9; color: #1976D2; }
        .st-tab--active { background: #2196F3; color: #fff; border-color: #2196F3; }

        /* sections */
        .st-section {
          background: #fff; border-radius: 12px; padding: 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,.07); margin-bottom: 20px;
        }
        .st-section h4 { margin: 0 0 18px; font-size: 14px; font-weight: 700; color: #333; }
        .st-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .st-field { display: flex; flex-direction: column; gap: 5px; }
        .st-field label { font-size: 12px; font-weight: 600; color: #555; }
        .st-input {
          padding: 9px 12px; border: 1px solid #e0e0e0; border-radius: 8px;
          font-size: 13px; font-family: inherit; background: #f8f9fb; color: #333;
          outline: none; transition: border-color .2s;
        }
        .st-input:focus { border-color: #90CAF9; background: #fff; }

        /* upload area */
        .st-upload-area {
          border: 2px dashed #e0e0e0; border-radius: 10px; padding: 16px;
          text-align: center; cursor: pointer; transition: border-color .2s;
          margin-bottom: 20px;
        }
        .st-upload-area:hover { border-color: #90CAF9; }
        .st-upload-area input { display: none; }
        .st-upload-label { font-size: 13px; color: #666; }
        .st-upload-label strong { color: #1976D2; }

        /* pw field */
        .st-pw-wrap { position: relative; }
        .st-pw-wrap .st-input { padding-right: 36px; width: 100%; box-sizing: border-box; }
        .st-pw-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; font-size: 16px; color: #aaa; }

        /* account info */
        .st-info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-top: 4px; }
        .st-info-item { background: #f8f9fb; border-radius: 8px; padding: 12px 14px; }
        .st-info-label { font-size: 11px; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
        .st-info-val   { font-size: 13px; font-weight: 600; color: #333; }

        /* footer */
        .st-footer { display: flex; justify-content: flex-end; margin-top: 18px; }
        .st-save-btn {
          padding: 9px 22px; border-radius: 8px; border: none;
          background: #2196F3; color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: background .15s;
        }
        .st-save-btn:hover:not(:disabled) { background: #1976D2; }
        .st-save-btn:disabled { opacity: .5; cursor: not-allowed; }

        .st-divider { border: none; border-top: 1px solid #f0f2f5; margin: 20px 0; }

        @media (max-width: 768px) {
          .st-grid { grid-template-columns: 1fr; }
          .st-info-grid { grid-template-columns: 1fr 1fr; }
          .st-hero-stats { display: none; }
        }
      `}</style>

      <div className="st-page">
        {/* hero */}
        <div className="st-hero">
          <div className="st-avatar-wrap">
            {avatarPreview || user?.avatar ? (
              <img
                className="st-avatar"
                src={avatarPreview || `http://localhost:5000${user.avatar}`}
                alt="avatar"
              />
            ) : (
              <div className="st-avatar-placeholder">{initials}</div>
            )}
            <label className="st-avatar-edit" title="Change photo">
              ✏️
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div className="st-hero-info">
            <h3>
              {user?.firstName} {user?.lastName}
            </h3>
            <p>{user?.email}</p>
            <span className="st-role-badge">{user?.role}</span>
          </div>
          <div className="st-hero-stats">
            <div className="st-hero-stat">
              <div className="st-hero-stat-val">
                {user?.department || "—"}
              </div>
              <div className="st-hero-stat-label">Department</div>
            </div>
            <div className="st-hero-stat">
              <div className="st-hero-stat-val">{user?.status}</div>
              <div className="st-hero-stat-label">Status</div>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="st-tabs">
          {["profile", "security", "account"].map((t) => (
            <button
              key={t}
              className={`st-tab ${activeTab === t ? "st-tab--active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t === "profile"
                ? "👤 Profile"
                : t === "security"
                  ? "🔒 Security"
                  : "ℹ️ Account"}
            </button>
          ))}
        </div>

        {/* profile tab */}
        {activeTab === "profile" && (
          <div className="st-section">
            <h4>Personal Information</h4>
            {avatarFile && (
              <div style={{ marginBottom: 14, fontSize: 13, color: "#27ae60" }}>
                ✅ New photo selected: <strong>{avatarFile.name}</strong>
              </div>
            )}
            <div className="st-grid">
              {[
                { label: "First Name", key: "firstName" },
                { label: "Last Name", key: "lastName" },
                { label: "Middle Name", key: "middleName" },
                { label: "Department", key: "department" },
                { label: "Phone", key: "phone" },
              ].map(({ label, key }) => (
                <div className="st-field" key={key}>
                  <label>{label}</label>
                  <input
                    className="st-input"
                    type="text"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={profileForm[key]}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="st-footer">
              <button
                className="st-save-btn"
                onClick={handleProfileSave}
                disabled={profileBusy}
              >
                {profileBusy ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* security tab */}
        {activeTab === "security" && (
          <div className="st-section">
            <h4>Change Password</h4>
            <div
              style={{
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {[
                {
                  label: "Current Password",
                  key: "currentPassword",
                  show: showPw.current,
                  toggle: () =>
                    setShowPw((p) => ({ ...p, current: !p.current })),
                },
                {
                  label: "New Password",
                  key: "newPassword",
                  show: showPw.new,
                  toggle: () => setShowPw((p) => ({ ...p, new: !p.new })),
                },
                {
                  label: "Confirm Password",
                  key: "confirmPassword",
                  show: showPw.confirm,
                  toggle: () =>
                    setShowPw((p) => ({ ...p, confirm: !p.confirm })),
                },
              ].map(({ label, key, show, toggle }) => (
                <div className="st-field" key={key}>
                  <label>{label}</label>
                  <div className="st-pw-wrap">
                    <input
                      className="st-input"
                      type={show ? "text" : "password"}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      value={pwForm[key]}
                      onChange={(e) =>
                        setPwForm({ ...pwForm, [key]: e.target.value })
                      }
                    />
                    <span className="st-pw-eye" onClick={toggle}>
                      {show ? "🙈" : "👁"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {pwForm.newPassword &&
              pwForm.confirmPassword &&
              pwForm.newPassword !== pwForm.confirmPassword && (
                <div style={{ color: "#c0392b", fontSize: 12, marginTop: 8 }}>
                  ⚠ Passwords do not match
                </div>
              )}
            <div className="st-footer" style={{ maxWidth: 400 }}>
              <button
                className="st-save-btn"
                onClick={handlePasswordChange}
                disabled={pwBusy}
              >
                {pwBusy ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        )}

        {/* account tab */}
        {activeTab === "account" && (
          <div className="st-section">
            <h4>Account Information</h4>
            <div className="st-info-grid">
              {[
                { label: "Email", val: user?.email },
                { label: "Role", val: user?.role?.toUpperCase() },
                { label: "Status", val: user?.status },
                { label: "Department", val: user?.department || "—" },
                { label: "Phone", val: user?.phone || "—" },
              ].map(({ label, val }) => (
                <div className="st-info-item" key={label}>
                  <div className="st-info-label">{label}</div>
                  <div className="st-info-val">{val}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Settings;
