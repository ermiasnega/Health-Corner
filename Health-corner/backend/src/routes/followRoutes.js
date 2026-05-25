const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { toggleFollow, getUserProfile, getMyFollowCounts } = require("../controllers/followController");

const router = express.Router();
router.use(protect);

router.get("/counts", getMyFollowCounts);              // GET /api/follow/counts
router.get("/profile/:userId", getUserProfile);        // GET /api/follow/profile/:userId
router.post("/:userId", toggleFollow);                 // POST /api/follow/:userId

module.exports = router;