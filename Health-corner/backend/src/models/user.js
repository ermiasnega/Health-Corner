const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ─── CORE AUTH ───────────────────────────────────────────
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    accountStatus: {
      type: String,
      enum: ["Active", "Suspended", "Flagged"],
      default: "Active",
    },

    // ─── PASSWORD RESET (forgot password flow) ───────────────
    passwordResetToken: String,
    passwordResetExpires: Date,

    // ─── PROFILE ─────────────────────────────────────────────
    bio: {
      type: String,          // e.g "Fitness Coach" — shown on profile screen
      trim: true,
    },
    profileImage: {
      type: String,
    },

    // ─── BASIC HEALTH (Welcome screen 2) ─────────────────────
    age: Number,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    height: Number,          // cm
    weight: Number,          // kg

    // ─── ACTIVITY LEVEL (Welcome screen 3) ───────────────────
    // Fixed enum to match the actual screen options
    activityLevel: {
      type: String,
      enum: [
        "Sedentary",          // Desk-bound, minimal activity
        "Lightly active",     // Occasional exercise, daily walking
        "Moderately active",  // Sports 3-5 days/week
        "Very active",        // Intense exercise 6-7 days/week
      ],
    },

    // ─── WELLNESS CONTEXT (Welcome screen 4) ─────────────────
    healthConditions: {
      type: String,          // free text: "Type 2 diabetes, Hypertension..."
      trim: true,
    },
    focusAreas: {
      type: [String],        // multi-select from welcome screen
      enum: [
        "Exercise / Activity",
        "Healthy eating",
        "Better sleep",
        "Stress management",
        "Weight management",
        "General wellness",
      ],
      default: [],
    },

    // ─── DAILY GOALS (Welcome screen 1 + Settings screen) ────
    stepGoal: {
      type: Number,
      default: 8000,
    },
    waterGoal: {
      type: Number,          // ml per day
      default: 2500,
    },
    calorieGoal: {
      type: Number,
      default: 2200,
    },
    sleepGoal: {
      type: Number,          // hours per night
      default: 8,
    },
    proteinGoal: {
      type: Number,          // grams
      default: 120,
    },
    carbsGoal: {
      type: Number,          // grams
      default: 200,
    },
    fatGoal: {
      type: Number,          // grams
      default: 65,
    },
    weeklyWorkoutGoal: {
      type: Number,
      default: 4,
    },

    // ─── PREFERENCES (Settings screen) ───────────────────────
    theme: {
      type: String,
      enum: ["Light", "Dark", "System"],
      default: "Light",
    },
    language: {
      type: String,
      default: "English",
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    sound: {
      type: String,
      default: "Chimes",
    },

    // ─── PRIVACY (Settings screen) ───────────────────────────
    profileVisibility: {
      type: String,
      enum: ["Everyone", "Followers", "Only me"],
      default: "Everyone",
    },
    showActivityInFeed: {
      type: Boolean,
      default: true,
    },
    whoCanMessageMe: {
      type: String,
      enum: ["Everyone", "Followers", "No one"],
      default: "Everyone",
    },
    shareDataForAI: {
      type: Boolean,
      default: true,
    },

    // ─── ACTIVITY TRACKING ───────────────────────────────────
    streak: {
      type: Number,
      default: 0,
    },
    lastWorkoutDate: Date,

    // ─── SOCIAL (Profile screen) ─────────────────────────────
    // Following/followers counts are derived from a
    // separate Follow collection — not stored here directly.
    // Achievements are stored as embedded docs.
    achievements: [
      {
        name: String,
        description: String,
        unlockedAt: Date,
      },
    ],

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);