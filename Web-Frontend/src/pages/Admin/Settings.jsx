import React, { useState } from "react";
import "../../assets/styles/settings.css";

function Settings() {

  const [profile, setProfile] = useState({
    name: "",
    email: ""
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value
    });
  };

  const updateProfile = (e) => {
    e.preventDefault();
    console.log("Updating profile:", profile);

    // API call example
    // axios.put("/api/admin/profile", profile)

    alert("Profile updated successfully!");
  };

  const changePassword = (e) => {
    e.preventDefault();

    if (password.newPassword !== password.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Changing password:", password);

    // API call example
    // axios.put("/api/admin/change-password", password)

    alert("Password changed successfully!");
  };

  return (
    <div className="admin-settings">


      {/* Profile Section */}
      <div className="settings-card">
        <h3>Profile Information</h3>

        <form onSubmit={updateProfile}>


          <div className="form-group">
            <label style={{ marginBottom: 6, fontWeight: 500 }}></label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              placeholder="Enter your name"
              style={{ marginBottom: 2 }}
            />
          </div>

          <div className="form-group">
            <label style={{ marginBottom: 6, fontWeight: 500 }}></label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              placeholder="Enter your email"
              style={{ marginBottom: 2 }}
            />
          </div>

          <button type="submit" className="btn-primary">
            Update Profile
          </button>

        </form>
      </div>


      {/* Password Section */}
      <div className="settings-card">
        <h3>Change Password</h3>

        <form onSubmit={changePassword}>

          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={password.currentPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={password.newPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={password.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <button type="submit" className="btn-primary">
            Change Password
          </button>

        </form>
      </div>

    </div>
  );
}

export default Settings;