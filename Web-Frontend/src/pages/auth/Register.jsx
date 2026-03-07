import { useState } from "react";
import { toast } from "react-toastify";
import "../../assets/styles/login.css";
import Logo from "../../assets/images/Logo.jpg";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Registration successful!");
    // call API to register user
  };

  return (
    <div className="auth-container">
      <div className="auth-overlay"></div>
      <div className="form-wrapper">
        <img src={Logo} alt="MINT Logo" className="form-logo" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Name</label>
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Email address</label>
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Password</label>
          </div>
          <div className="form-group">
            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Role</label>
          </div>
          <div className="form-group checkbox-group">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">I agree to the terms & policy</label>
          </div>
          <button type="submit">Signup</button>
        </form>
        <div className="or">or</div>
        {/* <div className="social-login">
          <button className="google">Sign in with Google</button>
          <button className="apple">Sign in with Apple</button>
        </div> */}
        <div className="login-footer">
          Already have an account? <a href="/login">Sign In</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
