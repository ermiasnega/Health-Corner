const Exercise = require("../models/Exercise");

// CREATE EXERCISE
const createExercise = async (req, res) => {
  try {
    const {
      name, category, muscleGroups, defaultSets,
      defaultReps, defaultRestTime, difficulty,
      equipment, videoUrl, imageUrl, description,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    const exercise = await Exercise.create({
      name, category, muscleGroups, defaultSets,
      defaultReps, defaultRestTime, difficulty,
      equipment, videoUrl, imageUrl, description,
      createdBy: req.user._id,
    });

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL EXERCISES
// Supports: ?category=Chest  ?search=lunges
// Screen A5 — browse by category
const getExercises = async (req, res) => {
  try {
    const filter = { isPublic: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const exercises = await Exercise.find(filter).sort({ name: 1 });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE EXERCISE
// Screen A4 — exercise detail during active session
const getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE EXERCISE
const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    exercise.name           = req.body.name           ?? exercise.name;
    exercise.category       = req.body.category       ?? exercise.category;
    exercise.muscleGroups   = req.body.muscleGroups   ?? exercise.muscleGroups;
    exercise.defaultSets    = req.body.defaultSets    ?? exercise.defaultSets;
    exercise.defaultReps    = req.body.defaultReps    ?? exercise.defaultReps;
    exercise.defaultRestTime = req.body.defaultRestTime ?? exercise.defaultRestTime;
    exercise.difficulty     = req.body.difficulty     ?? exercise.difficulty;
    exercise.equipment      = req.body.equipment      ?? exercise.equipment;
    exercise.videoUrl       = req.body.videoUrl       ?? exercise.videoUrl;
    exercise.imageUrl       = req.body.imageUrl       ?? exercise.imageUrl;
    exercise.description    = req.body.description    ?? exercise.description;

    const updated = await exercise.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE EXERCISE
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    res.status(200).json({ message: "Exercise deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL CATEGORIES WITH EXERCISE COUNT
// Screen A5 — categories list with workout count per category
const getCategories = async (req, res) => {
  try {
    const categories = await Exercise.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExercise,
  getExercises,
  getExercise,
  updateExercise,
  deleteExercise,
  getCategories,
};