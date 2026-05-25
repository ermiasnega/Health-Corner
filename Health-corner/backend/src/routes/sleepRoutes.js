const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  logSleep, getSleepLogs, deleteSleepLog,
  getSleepAnalysis, getSchedule, updateSchedule,
} = require("../controllers/sleepController");

const router = express.Router();
router.use(protect);

// analysis — Screen S1
router.get("/analysis", getSleepAnalysis); // GET /api/sleep/analysis (?period=week)

// schedule — Screen S2
router.route("/schedule")
  .get(getSchedule)       // GET /api/sleep/schedule
  .put(updateSchedule);   // PUT /api/sleep/schedule

// logs
router.route("/")
  .post(logSleep)         // POST /api/sleep
  .get(getSleepLogs);     // GET  /api/sleep

router.delete("/:id", deleteSleepLog); // DELETE /api/sleep/:id

module.exports = router;