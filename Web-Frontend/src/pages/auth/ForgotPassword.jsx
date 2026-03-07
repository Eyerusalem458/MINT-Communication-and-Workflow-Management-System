import { useState } from "react";
import { toast } from "react-toastify";
import "../../assets/styles/login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(`Password reset link sent to ${email}`);
    // call API to send reset link
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
          <button type="submit">Send Reset Link</button>
        </form>
        <div className="login-footer">
          Remembered your password? <a href="/login">Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
