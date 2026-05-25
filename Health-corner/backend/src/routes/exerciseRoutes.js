const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createExercise, getExercises, getExercise,
  updateExercise, deleteExercise, getCategories,
} = require("../controllers/exerciseController");

const router = express.Router();

router.use(protect);

router.get("/categories", getCategories);   // GET /api/exercises/categories

router.route("/")
  .get(getExercises)       // GET  /api/exercises  (?category=Chest &search=lunges)
  .post(createExercise);   // POST /api/exercises

router.route("/:id")
  .get(getExercise)        // GET    /api/exercises/:id
  .put(updateExercise)     // PUT    /api/exercises/:id
  .delete(deleteExercise); // DELETE /api/exercises/:id

module.exports = router;