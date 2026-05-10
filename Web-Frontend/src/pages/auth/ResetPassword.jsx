import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../api/authApi";
import "../../assets/styles/login.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });

  const [busy, setBusy] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (busy) return;
    setBusy(true);

    try {
      await resetPassword({
        token,
        password: form.password,
      });

      toast.success("Password reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Reset failed. Link may have expired.",
      );
    } finally {
      setBusy(false);
    }
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
          <button type="submit" disabled={busy}>
            {busy ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <div className="login-footer">
          Remembered your password? <a href="/login">Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
