import User from "../models/User.js";
import logActivity from "../utils/logActivity.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, department, gender, status, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (gender) filter.gender = gender;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff (manager view)
// @route   GET /api/users/staff
// @access  Manager, Admin
const getStaff = async (req, res) => {
  try {
    const { department, gender, search } = req.query;

    const filter = { role: "staff" };

    // ✅ STEP 1: Restrict manager to their own department
    if (req.user.role === "manager") {
      filter.department = req.user.department;
    }

    // ⚠️ STEP 2: Apply query filters carefully
    // Only allow department override if ADMIN
    if (department && req.user.role === "admin") {
      filter.department = department;
    }

    if (gender) filter.gender = gender;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const staff = await User.find(filter).sort({ createdAt: -1 });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin, Manager
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new user (admin only)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      password,
      role,
      department,
      gender,
    } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.create({
      firstName,
      middleName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password,
      role,
      department,
      gender,
    });

    // ✅ Send welcome email with credentials
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to MINT - Your Account Has Been Created",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0b63ce;">Welcome to MINT Communication System</h2>
            <p>Hello <strong>${firstName} ${lastName}</strong>,</p>
            <p>Your account has been created by the system administrator. Here are your login credentials:</p>
            <div style="background: #f4f4f4; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Role:</strong> ${role}</p>
              <p><strong>Department:</strong> ${department}</p>
            </div>
            <p>Please log in and change your password immediately.</p>
            <a href="${process.env.CLIENT_URL}/login" 
               style="background:#0b63ce; color:white; padding:12px 24px; border-radius:6px; text-decoration:none; display:inline-block; margin-top:8px;">
              Login to MINT
            </a>
            <p style="margin-top: 24px; color: #888; font-size: 12px;">
              This is an automated message from the MINT system. Do not reply to this email.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      // ⚠️ Don't fail the request if email fails — user is already created
      console.error("Welcome email failed:", emailErr.message);
    }

    await logActivity({
      user: req.user._id,
      action: `Created user ${user.firstName} ${user.lastName} (${user.role})`,
      entity: "User",
      entityId: user._id.toString(),
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      role,
      department,
      gender,
      status,
      position,
    } = req.body;

    if (firstName) user.firstName = firstName;
    if (middleName !== undefined) user.middleName = middleName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (gender !== undefined) user.gender = gender;
    if (status) user.status = status;
    if (position !== undefined) user.position = position;

    const updated = await user.save();

    await logActivity({
      user: req.user._id,
      action: `Updated user ${updated.firstName} ${updated.lastName}`,
      entity: "User",
      entityId: updated._id.toString(),
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user status (activate/deactivate)
// @route   PATCH /api/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "Active" ? "Inactive" : "Active";
    await user.save();

    await logActivity({
      user: req.user._id,
      action: `Set user ${user.firstName} ${user.lastName} to ${user.status}`,
      entity: "User",
      entityId: user._id.toString(),
    });

    res.json({ message: `User ${user.status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own profile
// @route   PUT /api/users/profile/me
// @access  Private (any role)
const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { firstName, middleName, lastName, phone, position, department } =
      req.body;

    if (firstName) user.firstName = firstName;
    if (middleName !== undefined) user.middleName = middleName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (position !== undefined) user.position = position;
    if (department !== undefined) user.department = department;

    // Avatar upload
    if (req.file) {
      user.avatar = `/uploads/media/${req.file.filename}`;
    }

    const updated = await user.save();

    await logActivity({
      user: user._id,
      action: "Updated profile",
      entity: "User",
      entityId: user._id.toString(),
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change own password
// @route   PUT /api/users/password/me
// @access  Private
const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log("currentPassword received:", currentPassword);
    const user = await User.findById(req.user._id).select("+password");

    console.log("user.password hash:", user.password); // ← add this
    console.log("password exists:", !!user.password); // ← add this

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("isMatch:", isMatch); // ← add this
    
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    await logActivity({
      user: user._id,
      action: "Changed password",
      entity: "Auth",
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin stats for dashboard
// @route   GET /api/users/stats
// @access  Admin
const getUserStats = async (req, res) => {
  try {
    const [total, managers, staff, activeUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "manager" }),
      User.countDocuments({ role: "staff" }),
      User.countDocuments({ status: "Active" }),
    ]);
    res.json({ total, managers, staff, activeUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllUsers,
  getStaff,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  updateMyProfile,
  changeMyPassword,
  getUserStats,
};
