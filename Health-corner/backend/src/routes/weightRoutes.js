const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { logWeight, getWeightTrend } = require("../controllers/weightController");

const router = express.Router();
router.use(protect);

router.post("/", logWeight);           // POST /api/weight
router.get("/trend", getWeightTrend);  // GET  /api/weight/trend (?period=month)  Screen N4

module.exports = router;