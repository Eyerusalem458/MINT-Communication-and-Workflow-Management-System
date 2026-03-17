import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/SplashScreen.css";
import logo2 from "../assets/images/logo2.jpg";
function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login"); // go to login after animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-container">
      <div className="splash-content">
        <img src={logo2} alt="Ministry Logo" className="splash-logo" />
        <h1 className="company-name">የኢትዮጵያ ኢኖቬሽን እና ቴክኖሎጂ ሚኒስቴር</h1>
      </div>

      {/* Realistic bulbs */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`real-bulb bulb${i + 1}`}></div>
      ))}
    </div>
  );
}

export default SplashScreen;
