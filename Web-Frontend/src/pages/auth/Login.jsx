import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logo from "../../assets/images/logo.png";
import robot from "../../assets/images/robot.png";

import { FaEnvelope, FaLock, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import "../../assets/styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State for modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("privacy"); // "privacy" or "terms"

  const handleSignIn = (e) => {
    e.preventDefault();
    toast.success("Sign In clicked!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Simulate Google login (frontend-only)
  const handleGoogleLogin = () => {
    toast.success("Google login successful!", {
      position: "top-right",
      autoClose: 2000,
    });
    setTimeout(() => {
      navigate("/dashboard"); // replace with your dashboard route
    }, 2000);
  };

  // Simulate Facebook login (frontend-only)
  const handleFacebookLogin = () => {
    toast.success("Facebook login successful!", {
      position: "top-right",
      autoClose: 2000,
    });
    setTimeout(() => {
      navigate("/dashboard"); // replace with your dashboard route
    }, 2000);
  };

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
    <div className="login-page">
      <div className="login-container">
        {/* Logo Card */}
        <div className="logo-wrapper">
          <div className="logo-card logo-card-stacked">
            <img src={logo} alt="Mint Logo" className="logo-card-img" />
            <div className="logo-card-text">
              <span className="english-text">STREAMLINED COLLABORATION</span>
            </div>
          </div>
        </div>

        {/* Ministry Description */}
        <div className="ministry-description">
          <div className="description-content">
            <h2 className="ministry-title">
              Ministry of Innovation & Technology
              <span className="expand-arrow">▼</span>
            </h2>
            <p className="ministry-subtitle">
              Driving Ethiopia's Digital Transformation Through Innovation,
              Collaboration, and Technological Excellence
            </p>
            <div className="ministry-details">
              <div className="detail-item">
                <span className="detail-icon">🚀</span>
                <span className="detail-text">Digital Innovation Hub</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🤝</span>
                <span className="detail-text">Public-Private Partnerships</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🎯</span>
                <span className="detail-text">
                  Technology Policy & Strategy
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🌍</span>
                <span className="detail-text">
                  Sustainable Development Goals
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Robot + Login */}
        <div className="robot-wrapper">
          {/* Robot */}
          <img src={robot} alt="robot" className="robot-image" />

          {/* Login Box */}
          <div className="login-box">
            <form className="login-form" onSubmit={handleSignIn}>
              {/* Email */}
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {/* Forgot Password */}
              <div className="forgot-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              {/* Button */}
              <button type="submit" className="btn-signin">
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="or-divider">
              <span>OR</span>
            </div>
            {/* Social Login */}
            <div className="social-buttons">
              <button className="social-btn " onClick={handleGoogleLogin}>
                <FcGoogle className="social-icon" />
                <span>Log in with Google</span>
              </button>

              <button className="social-btn" onClick={handleFacebookLogin}>
                <FaFacebookF className="social-icon facebook-icon" />
                Log in with Facebook
              </button>
            </div>
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
    </div>
  );
}
