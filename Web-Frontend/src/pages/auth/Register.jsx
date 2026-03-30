import React, { useState } from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";

import "../../assets/styles/Register.css"; // Adjust path as needed

import {
  isEmailValid,
  checkPasswordRules,
  getPasswordMessage,
  checkEmailRules,
  getEmailMessage,
} from "../../utils/validators";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountType: "",
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    symbol: false,
  });
  const [emailRules, setEmailRules] = useState({
    hasAt: false,
    hasDot: false,
    noSpaces: true,
  });

  // handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "email") {
      const rules = checkEmailRules(value);
      setEmailRules(rules);
    }

    // use validator.js
    if (name === "password") {
      const rules = checkPasswordRules(value);
      setPasswordRules(rules);
    }
  };

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const rules = checkPasswordRules(formData.password);
    setPasswordRules(rules);

    // email validation
    if (!isEmailValid(formData.email)) {
      showErrorToast("Please enter a valid email!");
      return;
    }

    // password validation
    if (!rules.length || !rules.uppercase || !rules.number || !rules.symbol) {
      showErrorToast("Password does not meet requirements");
      return;
    }

    // confirm password
    if (formData.password !== formData.confirmPassword) {
      showErrorToast("Passwords do not match!");
      return;
    }

    // Success
    showSuccessToast("Account Created Successfully!", () => navigate("/login"));
  };
  // State for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("privacy"); // "privacy" or "terms"

  // Modal content based on type
  const getModalContent = () => {
    if (modalType === "privacy") {
      return {
        title: "Privacy Notice",
        body: "The Ministry of Innovation and Technology values your privacy. We collect only the information necessary to provide our services and do not share your personal data with third parties without your consent. For more details, please contact our data protection officer.",
      };
    } else {
      return {
        title: "Terms of Use",
        body: "By using this platform, you agree to comply with the Ministry of Innovation and Technology's terms of service. Unauthorized access or misuse of the system may result in legal action. These terms are governed by the laws of Ethiopia.",
      };
    }
  };

  return (
    <div className="register-page">
      {/* Logo Card - Positioned top right */}
      <div className="logo-wrapper">
        <div className="logo-card logo-card-plain">
          <img src={logo} alt="Ministry Logo" className="logo-card-img" />
          <div className="logo-card-text">
            <span className="english-text">Streamlined Collaboration</span>
          </div>
        </div>
      </div>

      <div className="register-container">
        <div className="robot-wrapper">
          {/* Register Box */}
          <div className="register-box">
            <h2>Create Account</h2>

            <form onSubmit={handleSubmit}>
              {/* Account Type */}
              <label>Account Type</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="select-input"
              >
                <option value="" disabled>
                  Select account type
                </option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>

              {/* Email */}
              <label>
                Email <span className="required">*</span>
              </label>
              <div className="password-wrapper">
                {" "}
                {/* reuse wrapper to position hint */}
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {formData.email && (
                  <div className="email-hint">
                    {getEmailMessage(emailRules)}
                  </div>
                )}
              </div>
              {/* Name Row */}
              <div className="row">
                <div>
                  <label>
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter your first name"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter your last name"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Middle + Phone */}
              <div className="row">
                <div>
                  <label>
                    Middle Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    placeholder="Enter your middle name"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    placeholder="+251 Enter your phone number"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="row">
                <div className="password-field">
                  <label>
                    Password <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      onChange={handleChange}
                      required
                    />

                    <span
                      className="eye-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                    {/* Inline real-time password hint */}
                    {formData.password && (
                      <div className="password-hint">
                        {getPasswordMessage(passwordRules)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="password-field">
                  <label>
                    Confirm Password <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      onChange={handleChange}
                      required
                    />
                    <span
                      className="eye-icon"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="terms">
                <label>
                  <input type="checkbox" required />I agree to all the{" "}
                  <a href="#">Terms</a> and <a href="#">Privacy policy </a>
                </label>
              </div>

              <button type="submit" className="btn-register">
                Create Account
              </button>

              <p className="login-link">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer with modal-trigger links */}
      <footer className="login-footer">
        <div className="footer-links">
          <Link to="http://www.mint.gov.et/vision-mission-values">
            About Us
          </Link>{" "}
          |<Link to="http://www.mint.gov.et/contact-us">Contact</Link> |
          {/* Privacy link – opens modal instead of navigating */}
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              setModalType("privacy");
              setModalOpen(true);
            }}
          >
            Privacy
          </Link>{" "}
          |
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              setModalType("terms");
              setModalOpen(true);
            }}
          >
            Terms
          </Link>
        </div>
        <p>© 2026 Ministry of Innovation and Technology, Ethiopia</p>
      </footer>

      {/* Modal overlay */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{getModalContent().title}</h3>
            <p>{getModalContent().body}</p>
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
