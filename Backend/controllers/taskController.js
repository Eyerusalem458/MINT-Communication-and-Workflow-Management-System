import Task from "../models/Task.js";
import User from "../models/User.js";
import createNotification  from "../utils/createNotification.js";
import logActivity from "../utils/logActivity.js";

// Get tasks
const getTasks = async (req, res) => {
  try {
    const { status, priority, search, assignedTo } = req.query;
    let filter = {};

    // Staff: only see their own tasks
    if (req.user.role === "staff") {
      filter.assignedTo = req.user._id;
    }

    // Manager: see tasks they assigned
    if (req.user.role === "manager") {
      if (assignedTo) filter.assignedTo = assignedTo;
      else filter.assignedBy = req.user._id;
    }

    // Admin: see all tasks
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "firstName middleName lastName email department")
      .populate("assignedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "firstName lastName email")
      .populate("assignedBy", "firstName lastName");

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create task (manager/admin only)
// @route   POST /api/tasks
// @access  Manager, Admin
const createTask = async (req, res, io) => {
  try {
    const { title, description, assignedTo, due, priority, project } = req.body;

    if (!title || !assignedTo || !due) {
      return res
        .status(400)
        .json({ message: "Title, assignedTo, and due date are required" });
    }

    const assignee = await User.findById(assignedTo);
    if (!assignee)
      return res.status(404).json({ message: "Assigned user not found" });

    const task = await Task.create({
      title,
      description,
      assignedTo,
      due,
      priority,
      project: project || "",
      assignedBy: req.user._id,
      status: "Pending",
    });

    // Notify the assigned staff member
    await createNotification(
      {
        recipient: assignedTo,
        sender: req.user._id,
        type: "Task",
        message: `New task assigned to you: "${title}" 🛠`,
      },
      req.io,
    );

    // ✅ Notify the manager themselves (confirmation)
    await createNotification(
      {
        recipient: req.user._id,
        sender: req.user._id,
        type: "Task",
        message: `You assigned task "${title}" to ${assignee.firstName} ${assignee.lastName} 🛠`,
      },
      req.io,
    );

    await logActivity({
      user: req.user._id,
      action: `Created task "${title}" and assigned to ${assignee.firstName} ${assignee.lastName}`,
      entity: "Task",
      entityId: task._id.toString(),
    });

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "firstName lastName email")
      .populate("assignedBy", "firstName lastName");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task (manager/admin can update all fields; staff can only update status/file)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isStaff = req.user.role === "staff";
    const isOwner = task.assignedTo.toString() === req.user._id.toString();
    const isManagerOrAdmin = ["manager", "admin"].includes(req.user.role);

    // Staff can only update their own task status and file
    if (isStaff && !isOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    const { title, description, assignedTo, due, priority, status, comment } =
      req.body;

    if (isManagerOrAdmin) {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo) task.assignedTo = assignedTo;
      if (due) task.due = due;
      if (priority) task.priority = priority;
      if (comment !== undefined) task.comment = comment;
    }

    if (status) {
      task.status = status;
      if (status === "Completed") task.completedAt = new Date();
    }

    // File upload (staff submitting work)
    if (req.file) {
      task.file = `/uploads/files/${req.file.filename}`;
    }

    const updated = await task.save();

    // Notifications based on status change
    if (status) {
      const staffId = task.assignedTo;
      const managerId = task.assignedBy;

      if (status === "In Progress") {
        // Notify manager that staff submitted work
        await createNotification(
          {
            recipient: managerId,
            sender: staffId,
            type: "Task",
            message: `Task "${task.title}" has been submitted for review 🛠`,
          },
          req.io,
        );
      }

      if (status === "Approved") {
        await createNotification(
          {
            recipient: staffId,
            sender: req.user._id,
            type: "Task",
            message: `Your task "${task.title}" was approved ✅`,
          },
          req.io,
        );
      }

      if (status === "Rejected") {
        await createNotification(
          {
            recipient: staffId,
            sender: req.user._id,
            type: "Task",
            message: `Your task "${task.title}" was rejected ❌. Reason: ${comment || "See comments"}`,
          },
          req.io,
        );
      }

      if (status === "Completed") {
        await createNotification(
          {
            recipient: managerId,
            sender: staffId,
            type: "Task",
            message: `Task "${task.title}" marked as completed 🎉`,
          },
          req.io,
        );
      }
    }

    await logActivity({
      user: req.user._id,
      action: `Updated task "${task.title}" → status: ${task.status}`,
      entity: "Task",
      entityId: task._id.toString(),
    });

    const populated = await Task.findById(updated._id)
      .populate("assignedTo", "firstName lastName email")
      .populate("assignedBy", "firstName lastName");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Manager, Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await logActivity({
      user: req.user._id,
      action: `Deleted task "${task.title}"`,
      entity: "Task",
      entityId: task._id.toString(),
    });

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Task stats for dashboard
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "staff") filter.assignedTo = req.user._id;
    if (req.user.role === "manager") filter.assignedBy = req.user._id;

    const [total, completed, inProgress, pending, overdue] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: "Completed" }),
      Task.countDocuments({ ...filter, status: "In Progress" }),
      Task.countDocuments({ ...filter, status: "Pending" }),
      Task.countDocuments({
        ...filter,
        status: { $nin: ["Completed", "Approved"] },
        due: { $lt: new Date().toISOString().split("T")[0] },
      }),
    ]);

    res.json({ total, completed, inProgress, pending, overdue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export{
 getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
}