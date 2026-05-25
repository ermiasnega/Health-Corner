const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    // Screen A1 — "Chest & Triceps" shown in Today's Focus card
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Screen A1 — used in Browse Categories grid
    category: {
      type: String,
      enum: [
        "Chest",
        "Back",
        "Shoulders",
        "Arms",
        "Legs",
        "Core & Waist",
        "Cardio",
        "Neck & Mobility",
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // Screen A1 — "45 Min" shown in Today's Focus card
    duration: {
      type: Number, // minutes
      required: true,
    },

    // Screen A1 — "400 kcal" shown in Today's Focus card
    caloriesBurned: {
      type: Number,
      required: true,
    },

    // Screen A2 — difficulty badge
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },

    // Screen A2 — "Dumbbells, Bench" shown under workout name
    equipment: {
      type: [String],
      default: [],
    },

    // Screen A2 — list of exercises with custom sets/reps/rest per workout
    exercises: [
      {
        exercise: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        sets: Number,
        reps: String,       // e.g "8-10"
        restTime: Number,   // seconds
        order: Number,      // position in the workout
      },
    ],

    // Screen A1 — background image on Today's Focus card
    imageUrl: {
      type: String,
    },

    // Screen A2 — "6 Movements" count (derived from exercises.length)
    // no need to store — computed on the fly

    isPublic: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);