const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Report = require("../models/Report");
const AdminLog = require("../models/AdminLog");
const WorkoutLog = require("../models/WorkoutLog");
const MealLog = require("../models/MealLog");
const SleepLog = require("../models/SleepLog");

// helper — log admin action
const logAction = async (adminId, action, targetType, targetId, notes) => {
  await AdminLog.create({ admin: adminId, action, targetType, targetId, notes });
};

// ─── SCREEN 1: SYSTEM OVERVIEW ───────────────────────────────

const getSystemOverview = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      newUsersThisWeek,
      totalPosts,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Post.countDocuments({ isDraft: false }),
      Report.countDocuments({ status: "Pending" }),
    ]);

    // Screen 1 — top modules usage (based on log counts)
    const [activityCount, nutritionCount, sleepCount] = await Promise.all([
      WorkoutLog.countDocuments(),
      MealLog.countDocuments(),
      SleepLog.countDocuments(),
    ]);
    const totalLogs = activityCount + nutritionCount + sleepCount || 1;

    // Screen 1 — monthly active users (weekly buckets for chart)
    const weeklySignups = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $week: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Screen 1 — recent posts for review
    const recentPosts = await Post.find({ isDraft: false })
      .populate("author", "fullName")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("content category author createdAt");

    res.status(200).json({
      // Screen 1 — top stat cards
      totalUsers,
      newUsersThisWeek,
      totalPosts,
      activeAlerts: pendingReports,
      systemHealth: 99.9, // placeholder — real monitoring needs infra tooling

      // Screen 1 — top modules
      topModules: [
        { name: "Activity", percentage: Math.round((activityCount / totalLogs) * 100) },
        { name: "Nutrition", percentage: Math.round((nutritionCount / totalLogs) * 100) },
        { name: "Sleep", percentage: Math.round((sleepCount / totalLogs) * 100) },
      ],

      // Screen 1 — monthly active users chart
      weeklySignups,

      // Screen 1 — recent posts for review
      recentPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SCREEN 2: USER MANAGEMENT ───────────────────────────────

// GET ALL USERS
// Supports: ?search=sarah  ?status=active|inactive|flagged  ?page=1
const getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active")   filter.accountStatus = "Active";
    if (status === "inactive") filter.accountStatus = "Inactive";
    if (status === "flagged")  filter.accountStatus = "Flagged";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -passwordResetToken -passwordResetExpires")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SUSPEND / ACTIVATE USER
// Screen 2 — status badge toggle
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // "Active" | "Suspended" | "Flagged"
    const allowedStatuses = ["Active", "Suspended", "Flagged"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.accountStatus = status;
    await user.save();

    const action = status === "Suspended" ? "user_suspended" : "user_activated";
    await logAction(req.user._id, action, "User", user._id);

    res.status(200).json({ message: `User ${status.toLowerCase()}`, accountStatus: status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CHANGE USER ROLE (promote to admin / demote to user)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body; // "user" | "admin"
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    await logAction(req.user._id, "user_role_changed", "User", user._id, `Role set to ${role}`);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SCREEN 3: CONTENT MODERATION ────────────────────────────

// REPORT CONTENT (any user can report)
const reportContent = async (req, res) => {
  try {
    const { contentType, contentId, reason } = req.body;

    if (!contentType || !contentId || !reason) {
      return res.status(400).json({ message: "contentType, contentId and reason are required" });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      contentType,
      contentId,
      reason,
      source: "User",
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MODERATION QUEUE (admin only)
// Screen 3 — flagged items list with search + filter
const getModerationQueue = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = { status: "Pending" };

    if (type === "Posts")    filter.contentType = "Post";
    if (type === "Comments") filter.contentType = "Comment";

    const reports = await Report.find(filter)
      .populate("reportedBy", "fullName")
      .populate("contentId")
      .sort({ createdAt: -1 });

    // Screen 3 — stats cards
    const [pending, resolvedToday] = await Promise.all([
      Report.countDocuments({ status: "Pending" }),
      Report.countDocuments({
        status: { $in: ["Removed", "Warned", "Approved"] },
        resolvedAt: { $gte: new Date().setHours(0, 0, 0, 0) },
      }),
    ]);

    res.status(200).json({
      stats: { pending, resolvedToday },
      reports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESOLVE REPORT — Remove / Warn / Approve
// Screen 3 — action buttons
const resolveReport = async (req, res) => {
  try {
    const { action, notes } = req.body; // "Removed" | "Warned" | "Approved"
    const allowedActions = ["Removed", "Warned", "Approved"];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ message: "Report not found" });

    report.status = action;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    report.notes = notes;
    await report.save();

    // if removed — delete the content
    if (action === "Removed") {
      if (report.contentType === "Post") {
        await Post.findByIdAndDelete(report.contentId);
        await logAction(req.user._id, "post_removed", "Post", report.contentId);
      } else if (report.contentType === "Comment") {
        await Comment.findByIdAndDelete(report.contentId);
      }
    }

    // if warned — we'd send notification (placeholder for now)
    if (action === "Warned") {
      await logAction(req.user._id, "user_warned", "Report", report._id);
    }

    await logAction(req.user._id, "report_resolved", "Report", report._id, action);

    res.status(200).json({ message: `Report ${action.toLowerCase()}`, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SCREEN 4: SYSTEM STATUS ─────────────────────────────────

const getSystemStatus = async (req, res) => {
  try {
    // check DB connection
    const mongoose = require("mongoose");
    const dbStatus = mongoose.connection.readyState === 1 ? "Stable" : "Degraded";

    // recent admin actions as incidents log
    const recentActions = await AdminLog.find()
      .populate("admin", "fullName")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      // Screen 4 — service health cards
      services: [
        { name: "Database",      status: dbStatus },
        { name: "Auth Service",  status: "Stable" },
        { name: "Media Storage", status: "Stable" },
        { name: "AI Engine",     status: "Stable" },
      ],
      overallStatus: dbStatus === "Stable" ? "All Systems Operational" : "Degraded",
      // Screen 4 — recent incidents / admin log
      recentActions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSystemOverview,
  getUsers,
  updateUserStatus,
  updateUserRole,
  reportContent,
  getModerationQueue,
  resolveReport,
  getSystemStatus,
};