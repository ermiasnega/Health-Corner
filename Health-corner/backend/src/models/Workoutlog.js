const mongoose = require("mongoose");

const workoutLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Screen A4 — the workout being performed
    // optional — user can log a custom session without a template
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workout",
    },

    // fallback name if no workout template used
    name: {
      type: String,
      trim: true,
    },

    // Screen A4 — what the user actually completed
    exercisesCompleted: [
      {
        exercise: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
        },
        setsCompleted: Number,
        repsCompleted: String,
        notes: String,
      },
    ],

    // Screen A3 — actual duration (may differ from template)
    duration: {
      type: Number, // minutes
      required: true,
    },

    // Screen A3 — active calories card
    caloriesBurned: {
      type: Number,
      required: true,
    },

    // Screen A3 — intensity chart (High/Med/Low per day)
    intensity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // Screen A3 — "Morning Run — Today 6:30 AM"
    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutLog", workoutLogSchema);