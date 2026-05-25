const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { logWater, getTodayWater } = require("../controllers/waterController");

const router = express.Router();
router.use(protect);

router.get("/today", getTodayWater); // GET  /api/water/today  (Screen N1)
router.post("/", logWater);          // POST /api/water

module.exports = router;