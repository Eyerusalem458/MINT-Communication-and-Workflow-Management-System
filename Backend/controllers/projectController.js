import Project from "../models/Project.js";
import User from "../models/User.js";
import createNotification from "../utils/createNotification.js";
import logActivity from "../utils/logActivity.js";

const getProjects = async (req, res) => {
  try {
    const { status, department, search } = req.query;
    let filter = {};

    // Staff sees only their own projects
    if (req.user.role === "staff") {
      filter.createdBy = req.user._id;
    }

    if (status) filter.status = status;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(filter)
      .populate("createdBy", "firstName lastName department")
      .populate("reviewedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "firstName lastName department")
      .populate("reviewedBy", "firstName lastName");

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create project (staff only)
// @route   POST /api/projects
// @access  Staff
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      department: req.user.department || "",
      file: req.file ? `/uploads/files/${req.file.filename}` : "",
      status: "Pending",
    });

    // Notify all managers
    const managers = await User.find({
      role: "manager",
      status: "Active",
      department: req.user.department,
    });
    if (managers.length > 0) {
      await createNotification(
        {
          recipient: managers.map((m) => m._id),
          sender: req.user._id,
          type: "Project",
          message: `New project submitted by ${req.user.firstName} ${req.user.lastName}: "${title}" ⏳`,
        },
        req.io,
      );
    }

    // ✅ Notify the staff who created it
    await createNotification(
      {
        recipient: req.user._id,
        sender: req.user._id,
        type: "Project",
        message: `You submitted project "${title}" ⏳`,
      },
      req.io,
    );

    await logActivity({
      user: req.user._id,
      action: `Submitted project "${title}"`,
      entity: "Project",
      entityId: project._id.toString(),
    });

    const populated = await Project.findById(project._id).populate(
      "createdBy",
      "firstName lastName department",
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project (staff can edit Pending projects only)
// @route   PUT /api/projects/:id
// @access  Staff
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isOwner = project.createdBy.toString() === req.user._id.toString();
    if (req.user.role === "staff" && !isOwner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (req.user.role === "staff" && project.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only Pending projects can be edited" });
    }

    const { title, description } = req.body;
    if (title) project.title = title;
    if (description) project.description = description;
    if (req.file) project.file = `/uploads/files/${req.file.filename}`;

    const updated = await project.save();

    await logActivity({
      user: req.user._id,
      action: `Updated project "${project.title}"`,
      entity: "Project",
      entityId: project._id.toString(),
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel project (staff)
// @route   PATCH /api/projects/:id/cancel
// @access  Staff
const cancelProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isOwner = project.createdBy.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: "Not authorized" });

    project.status = "Cancelled";
    await project.save();

    await logActivity({
      user: req.user._id,
      action: `Cancelled project "${project.title}"`,
      entity: "Project",
      entityId: project._id.toString(),
    });

    res.json({ message: "Project cancelled", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve project (manager/admin)
// @route   PATCH /api/projects/:id/approve
// @access  Manager, Admin
const approveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("createdBy");
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.status = "Approved";
    project.reviewedBy = req.user._id;
    project.reviewedAt = new Date();
    project.comment = "";
    await project.save();

    await createNotification(
      {
        recipient: project.createdBy._id,
        sender: req.user._id,
        type: "Project",
        message: `Your project "${project.title}" was approved ✅`,
      },
      req.io,
    );

    await logActivity({
      user: req.user._id,
      action: `Approved project "${project.title}"`,
      entity: "Project",
      entityId: project._id.toString(),
    });

    res.json({ message: "Project approved", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject project (manager/admin)
// @route   PATCH /api/projects/:id/reject
// @access  Manager, Admin
const rejectProject = async (req, res) => {
  try {
    const { comment } = req.body;
    const project = await Project.findById(req.params.id).populate("createdBy");
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.status = "Rejected";
    project.reviewedBy = req.user._id;
    project.reviewedAt = new Date();
    project.comment = comment || "";
    await project.save();

    await createNotification(
      {
        recipient: project.createdBy._id,
        sender: req.user._id,
        type: "Project",
        message: `Your project "${project.title}" was rejected ❌. ${comment ? "Reason: " + comment : ""}`,
      },
      req.io,
    );

    await logActivity({
      user: req.user._id,
      action: `Rejected project "${project.title}"`,
      entity: "Project",
      entityId: project._id.toString(),
    });

    res.json({ message: "Project rejected", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Project stats
// @route   GET /api/projects/stats
// @access  Private
const getProjectStats = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "staff") filter.createdBy = req.user._id;

    const [total, approved, pending, rejected] = await Promise.all([
      Project.countDocuments(filter),
      Project.countDocuments({ ...filter, status: "Approved" }),
      Project.countDocuments({ ...filter, status: "Pending" }),
      Project.countDocuments({ ...filter, status: "Rejected" }),
    ]);

    res.json({ total, approved, pending, rejected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  cancelProject,
  approveProject,
  rejectProject,
  getProjectStats,
};
