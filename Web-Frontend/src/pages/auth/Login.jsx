import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import robot from "../../assets/images/robot.png";
import { LockIcon, MailIcon } from "../shared/icon";
import "../../assets/styles/Login.css";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { AuthContext } from "../../context/AuthContext";

const SLIDES = [
  {
    tag: "Digital Innovation",
    icon: "🚀",
    title: "Ethiopia's national digital transformation hub",
    body: "MiNT leads the country's shift to a knowledge-based economy — developing smart infrastructure, e-government services, and digital public platforms used by millions of citizens.",
    stats: [
      { num: "47+", lbl: "e-services live" },
      { num: "12M+", lbl: "citizens served" },
    ],
    color: "#e6f1fb",
    textColor: "#185fa5",
  },
  {
    tag: "Partnerships",
    icon: "🤝",
    title: "Building bridges between public and private sectors",
    body: "Through strategic public-private partnerships, MiNT connects startups, enterprises, and international organizations to co-create solutions that accelerate Ethiopia's digital economy.",
    stats: [
      { num: "130+", lbl: "partner orgs" },
      { num: "28", lbl: "countries engaged" },
    ],
    color: "#e1f5ee",
    textColor: "#0f6e56",
  },
  {
    tag: "Policy & Strategy",
    icon: "🎯",
    title: "Shaping national technology policy and regulation",
    body: "MiNT drafts and enforces technology policy frameworks that ensure ethical AI adoption, data protection, and equitable access to digital tools across all regions of Ethiopia.",
    stats: [
      { num: "19", lbl: "active policies" },
      { num: "6", lbl: "regulatory acts" },
    ],
    color: "#faeeda",
    textColor: "#854f0b",
  },
  {
    tag: "SDG Alignment",
    icon: "🌍",
    title: "Technology as a driver of sustainable development",
    body: "Every MiNT initiative is mapped to Ethiopia's SDG commitments — from digital agriculture tools boosting food security to telemedicine platforms expanding healthcare access in rural areas.",
    stats: [
      { num: "9 SDGs", lbl: "directly supported" },
      { num: "2030", lbl: "target horizon" },
    ],
    color: "#eaf3de",
    textColor: "#3b6d11",
  },
];

const SLIDE_DURATION = 3500;

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("privacy");
  const [showPassword, setShowPassword] = useState(false);

  // ── Carousel state ──────────────────────────────────────────
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const goToSlide = (index) => {
    if (animating || index === activeSlide) return;
    setAnimating(true);
    setPrevSlide(activeSlide);
    setActiveSlide(index);
    setTimeout(() => {
      setPrevSlide(null);
      setAnimating(false);
    }, 450);
  };

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % SLIDES.length;
        setPrevSlide(prev);
        setAnimating(true);
        setTimeout(() => {
          setPrevSlide(null);
          setAnimating(false);
        }, 450);
        return next;
      });
    }, SLIDE_DURATION);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleDotClick = (i) => {
    goToSlide(i);
    startTimer();
  };
  // ────────────────────────────────────────────────────────────

 const handleSignIn = async (e) => {
  e.preventDefault();

  try {
    const user = await login({ email, password });

    showSuccessToast("Login successful!");

    if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "manager") {
      navigate("/manager/dashboard");
    } else {
      navigate("/staff/dashboard");
    }
  } catch (err) {
    showErrorToast(
      err.message ||
        err.response?.data?.message ||
        "Login failed"
    );
  }
};

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

        {/* Ministry Description — Auto-sliding Carousel */}
        <div className="ministry-description">
          <div className="description-content">
            <div className="carousel-track">
              {SLIDES.map((slide, i) => {
                let cls = "ministry-slide";
                if (i === activeSlide) cls += " active";
                else if (i === prevSlide) cls += " exit";
                return (
                  <div className={cls} key={i}>
                    <div className="slide-icon-row">
                      <div
                        className="slide-icon-circle"
                        style={{ background: slide.color }}
                      >
                        <span>{slide.icon}</span>
                      </div>
                      <span
                        className="slide-tag"
                        style={{
                          background: slide.color,
                          color: slide.textColor,
                        }}
                      >
                        {slide.tag}
                      </span>
                    </div>
                    <p className="slide-title">{slide.title}</p>
                    <p className="slide-body">{slide.body}</p>
                    <div className="slide-stats">
                      {slide.stats.map((s, j) => (
                        <div
                          key={j}
                          className="slide-stat"
                          style={{ background: slide.color }}
                        >
                          <span
                            className="stat-num"
                            style={{ color: slide.textColor }}
                          >
                            {s.num}
                          </span>
                          <span
                            className="stat-lbl"
                            style={{ color: slide.textColor }}
                          >
                            {s.lbl}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            <div className="slide-dots">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`slide-dot ${i === activeSlide ? "active" : ""}`}
                  onClick={() => handleDotClick(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Progress bar — key forces remount to restart animation */}
            <div className="slide-progress" key={activeSlide} />
          </div>
        </div>

        {/* Robot + Login */}
        <div className="robot-wrapper">
          {/* Robot */}
          <img src={robot} alt="robot" className="robot-image" />
          <div className="welcome-words">
            <span>Welcome</span>
            <span>to</span>
            <span>MiNT</span>
            <span className="accent">Platform</span>
          </div>
          <p className="welcome-sub">
            Ministry of Innovation &amp; Technology, Ethiopia
          </p>

          {/* Login Box */}
          <div className="login-box">
            <form className="login-form" onSubmit={handleSignIn}>
              {/* Email */}
              <div className="input-group">
                <MailIcon className="login-input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="input-group" style={{ position: "relative" }}>
                <LockIcon className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  role="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    fontSize: 18,
                    userSelect: "none",
                    color: "#64748b",
                  }}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>

              {/* Forgot Password */}
              <div className="forgot-link">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              {/* Button */}
              <button type="submit" className="btn-signin" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer with modal-trigger links */}
      <footer className="login-footer">
        <div className="footer-links">
          <a
            href="http://www.mint.gov.et/vision-mission-values"
            target="_blank"
            rel="noreferrer"
          >
            About Us
          </a>{" "}
          |{" "}
          <a
            href="http://www.mint.gov.et/contact-us"
            target="_blank"
            rel="noreferrer"
          >
            Contact
          </a>{" "}
          |
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
