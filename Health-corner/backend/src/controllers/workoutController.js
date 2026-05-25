const Workout = require("../models/Workout");

// CREATE WORKOUT TEMPLATE
const createWorkout = async (req, res) => {
  try {
    const {
      name, category, description, duration,
      caloriesBurned, difficulty, equipment,
      exercises, imageUrl, isPublic,
    } = req.body;

    if (!name || !category || !duration || !caloriesBurned) {
      return res.status(400).json({
        message: "Name, category, duration and caloriesBurned are required",
      });
    }

    const workout = await Workout.create({
      name, category, description, duration,
      caloriesBurned, difficulty, equipment,
      exercises, imageUrl,
      isPublic: isPublic ?? true,
      createdBy: req.user._id,
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL WORKOUTS
// Supports: ?category=Chest
// Screen A1 — Browse Categories grid
const getWorkouts = async (req, res) => {
  try {
    const filter = { isPublic: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const workouts = await Workout.find(filter)
      .populate("exercises.exercise", "name imageUrl muscleGroups")
      .sort({ createdAt: -1 });

    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE WORKOUT WITH FULL EXERCISE DETAILS
// Screen A2 — Workout detail page
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id).populate(
      "exercises.exercise",
      "name imageUrl muscleGroups defaultSets defaultReps defaultRestTime videoUrl description"
    );

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // add movementCount for Screen A2 "6 Movements" label
    const response = workout.toObject();
    response.movementCount = workout.exercises.length;

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE WORKOUT
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    workout.name           = req.body.name           ?? workout.name;
    workout.category       = req.body.category       ?? workout.category;
    workout.description    = req.body.description    ?? workout.description;
    workout.duration       = req.body.duration       ?? workout.duration;
    workout.caloriesBurned = req.body.caloriesBurned ?? workout.caloriesBurned;
    workout.difficulty     = req.body.difficulty     ?? workout.difficulty;
    workout.equipment      = req.body.equipment      ?? workout.equipment;
    workout.imageUrl       = req.body.imageUrl       ?? workout.imageUrl;
    workout.isPublic       = req.body.isPublic       ?? workout.isPublic;

    if (req.body.exercises) {
      workout.exercises = req.body.exercises;
    }

    const updated = await workout.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE WORKOUT
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(200).json({ message: "Workout deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TODAY'S FOCUS WORKOUT
// Screen A1 — "Today's Focus" card at the top
// Returns the most recently created public workout as a simple placeholder.
// Later this can be AI-generated based on user's goals and history.
const getTodaysFocus = async (req, res) => {
  try {
    const workout = await Workout.findOne({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate("exercises.exercise", "name muscleGroups");

    if (!workout) {
      return res.status(404).json({ message: "No workout available" });
    }

    res.status(200).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  getWorkout,
  updateWorkout,
  deleteWorkout,
  getTodaysFocus,
};