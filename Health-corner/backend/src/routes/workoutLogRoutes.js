const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  logWorkout, getWorkoutLogs, getProgress,
  getStreak, deleteWorkoutLog,
} = require("../controllers/workoutLogController");

const router = express.Router();

router.use(protect);

router.get("/progress", getProgress);   // GET /api/workout-logs/progress  (?period=week)
router.get("/streak", getStreak);       // GET /api/workout-logs/streak

router.route("/")
  .post(logWorkout)        // POST /api/workout-logs  (Screen A4)
  .get(getWorkoutLogs);    // GET  /api/workout-logs

router.delete("/:id", deleteWorkoutLog); // DELETE /api/workout-logs/:id

module.exports = router;