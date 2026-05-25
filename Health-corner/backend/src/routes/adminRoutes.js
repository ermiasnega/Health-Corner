const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { adminMiddleware } = require("../middleware/adminMiddleware");
const {
  getSystemOverview,
  getUsers,
  updateUserStatus,
  updateUserRole,
  reportContent,
  getModerationQueue,
  resolveReport,
  getSystemStatus,
} = require("../controllers/adminController");

const router = express.Router();

// all admin routes require auth + admin role
router.use(protect);

// report content — any authenticated user can report
router.post("/reports", reportContent); // POST /api/admin/reports

// everything below is admin-only
router.use(adminMiddleware);

// Screen 1 — System Overview
router.get("/overview", getSystemOverview);

// Screen 2 — User Management
router.get("/users", getUsers);                                    // GET  /api/admin/users
router.patch("/users/:userId/status", updateUserStatus);           // PATCH /api/admin/users/:id/status
router.patch("/users/:userId/role", updateUserRole);               // PATCH /api/admin/users/:id/role

// Screen 3 — Moderation
router.get("/moderation", getModerationQueue);                     // GET  /api/admin/moderation
router.patch("/moderation/:reportId/resolve", resolveReport);      // PATCH /api/admin/moderation/:id/resolve

// Screen 4 — System Status
router.get("/status", getSystemStatus);                            // GET  /api/admin/status

module.exports = router;