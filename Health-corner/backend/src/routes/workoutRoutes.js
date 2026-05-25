const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createWorkout, getWorkouts, getWorkout,
  updateWorkout, deleteWorkout, getTodaysFocus,
} = require("../controllers/workoutController");

const router = express.Router();

router.use(protect);

router.get("/today", getTodaysFocus);     // GET /api/workouts/today  (Screen A1)

router.route("/")
  .get(getWorkouts)        // GET  /api/workouts  (?category=Chest)
  .post(createWorkout);    // POST /api/workouts

router.route("/:id")
  .get(getWorkout)         // GET    /api/workouts/:id  (Screen A2)
  .put(updateWorkout)      // PUT    /api/workouts/:id
  .delete(deleteWorkout);  // DELETE /api/workouts/:id

module.exports = router;const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createWorkout, getWorkouts, getWorkout,
  updateWorkout, deleteWorkout, getTodaysFocus,
} = require("../controllers/workoutController");

const router = express.Router();

router.use(protect);

router.get("/today", getTodaysFocus);     // GET /api/workouts/today  (Screen A1)

router.route("/")
  .get(getWorkouts)        // GET  /api/workouts  (?category=Chest)
  .post(createWorkout);    // POST /api/workouts

router.route("/:id")
  .get(getWorkout)         // GET    /api/workouts/:id  (Screen A2)
  .put(updateWorkout)      // PUT    /api/workouts/:id
  .delete(deleteWorkout);  // DELETE /api/workouts/:id

module.exports = router;