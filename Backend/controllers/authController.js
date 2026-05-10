import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import logActivity from "../utils/logActivity.js";
import bcrypt from "bcryptjs";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    console.log("User found:", user ? "YES" : "NO");
    console.log("Password from DB:", user?.password);
    console.log("Password entered:", password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.status === "Inactive")
      return res.status(403).json({ message: "Account deactivated" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    await logActivity({
      user: user._id,
      action: "Logged in",
      entity: "Auth",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (!user) return res.json({ message: "If email exists, reset link sent" });

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "MINT - Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your MINT account.</p>
        <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
        <a href="${resetUrl}" style="background:#0b63ce;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
          Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({ message: "Reset link sent" });
  } catch {
    console.error("FORGOT PASSWORD ERROR:", err); // 🔥 ADD THIS
    res.status(500).json({ message: "Email failed" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const hashed = crypto
      .createHash("sha256")
      .update(req.body.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await logActivity({
      user: user._id,
      action: "Password reset",
      entity: "Auth",
    });

    res.json({ message: "Password reset successful. Please log in" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

export { login, forgotPassword, resetPassword, getMe };
