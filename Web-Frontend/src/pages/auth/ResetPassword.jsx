import { useState } from "react";
import { toast } from "react-toastify";
import "../../assets/styles/login.css";

const ResetPassword = () => {
  const [form, setForm] = useState({ password: "", confirm: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    toast.success("Password reset successfully!");
    // call API to reset password
  };

  return (
    <div className="auth-container">
      <div className="auth-overlay"></div>
      <div className="form-wrapper">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>New Password</label>
          </div>
          <div className="form-group">
            <input
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Confirm Password</label>
          </div>
          <button type="submit">Reset Password</button>
        </form>
        <div className="login-footer">
          Remembered your password? <a href="/login">Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
