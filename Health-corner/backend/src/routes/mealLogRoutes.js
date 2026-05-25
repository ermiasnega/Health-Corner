const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  logMeal, getMeals, deleteMeal,
  getDailySummary, getWeeklySummary,
} = require("../controllers/mealLogController");

const router = express.Router();
router.use(protect);

router.get("/summary/daily", getDailySummary);   // GET /api/meals/summary/daily (?date=2025-01-01)
router.get("/summary/weekly", getWeeklySummary); // GET /api/meals/summary/weekly

router.route("/")
  .post(logMeal)  // POST /api/meals
  .get(getMeals); // GET  /api/meals

router.delete("/:id", deleteMeal); // DELETE /api/meals/:id

module.exports = router;