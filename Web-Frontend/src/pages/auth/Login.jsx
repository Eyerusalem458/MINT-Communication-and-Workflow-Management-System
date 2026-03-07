import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/login.css";
import Logo from "../../assets/images/Logo.jpg";

const Login = () => {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      toast.success("Login successful!");
      if (user.role === "manager") navigate("/manager/dashboard");
      else navigate("/staff/dashboard");
    } catch {
      toast.error("Invalid credentials!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-overlay"></div>
      <div className="form-wrapper">
        <img src={Logo} alt="MINT Logo" className="form-logo" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Email</label>
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
          <button type="submit">{loading ? "Loading..." : "Login"}</button>
        </form>
        <div className="login-footer">
          <a href="/forgot-password">Forgot password?</a> |{" "}
          <a href="/register">Create account</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
