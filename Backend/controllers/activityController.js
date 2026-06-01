import ActivityLog from "../models/ActivityLog.js";

const getActivityLogs = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    }

    const logs = await ActivityLog.find(filter)
      .populate("user", "firstName lastName role")
      .sort({ createdAt: -1 })
      .limit(100);

    // Format for frontend compatibility
    const formatted = logs.map((log) => ({
      id: log._id,
      time: log.createdAt.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      action: log.action,
      entity: log.entity,
      user: log.user,
    }));

    res.json(formatted);
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export  { getActivityLogs };

