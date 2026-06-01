import { useState } from "react";
import { toast } from "react-toastify";
import { forgotPassword } from "../../api/authApi";
import "../../assets/styles/forgetpassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (busy) return; // prevent double click
    setBusy(true);

    try {
      await forgotPassword(email);

      toast.success(
        "If that email exists, a reset link was sent to your inbox.",
      );

      setEmail(""); // optional reset
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-overlay"></div>
      <div className="form-wrapper">
        <h2>Forgot Password?</h2>
        <p>Enter your email to receive password reset instructions.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
            />
            <label>Email address</label>
          </div>
          <button type="submit" disabled={busy}>
            {busy ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="signin-link">
          Remembered your password? <a href="/login">Sign In</a>
        </div>
      </div>

    </div>
  );
};

export default ForgotPassword;
