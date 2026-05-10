import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify JWT token
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (req.user.status === "Inactive") {
        return res
          .status(403)
          .json({ message: "Your account is deactivated. Contact admin." });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Role-based access
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};
