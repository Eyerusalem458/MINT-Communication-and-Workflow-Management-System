import ActivityLog from "../models/ActivityLog.js";

const logActivity = async ({ user, action, entity = "", entityId = "" }) => {
  try {
    await ActivityLog.create({
      user,
      action,
      entity,
      entityId,
    });
  } catch (err) {
    console.error("ActivityLog error:", err.message);
  }
};

export default logActivity;
