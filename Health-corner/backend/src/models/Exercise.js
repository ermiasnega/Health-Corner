const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Screen A5 — category matches the browse categories exactly
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

    // Screen A2 — shown under each exercise in the workout detail
    muscleGroups: {
      type: [String], // e.g ["Chest", "Front Delts"]
      default: [],
    },

    // Screen A2 — sets/reps/rest shown per exercise
    defaultSets: {
      type: Number,
      default: 3,
    },
    defaultReps: {
      type: String, // string because it can be a range e.g "8-10"
      default: "10",
    },
    defaultRestTime: {
      type: Number, // seconds — Screen A4 shows countdown timer
      default: 60,
    },

    // Screen A2 — difficulty badge shown on workout detail
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },

    // Screen A2 — equipment shown under workout name
    equipment: {
      type: [String], // e.g ["Dumbbells", "Bench"]
      default: [],
    },

    // Screen A4 — exercise video/image shown during active session
    videoUrl: {
      type: String,
    },
    imageUrl: {
      type: String,
    },

    description: {
      type: String,
      trim: true,
    },

    // admin-created exercises vs user-created
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// text index for search
exerciseSchema.index({ name: "text", muscleGroups: "text" });

module.exports = mongoose.model("Exercise", exerciseSchema);