// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/NotFound.css"; // Import external CSS

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <h1>404</h1>
        <h2>Oops! Page Not Found</h2>
        <p>
          The page you are looking for might have been removed or the URL is
          incorrect.
        </p>
        <Link to="/" className="btn-home">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
