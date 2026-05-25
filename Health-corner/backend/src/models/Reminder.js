const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Screen 2 — "Add your Reminder..." text field
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Screen 2 — time picker "08:30 AM"
    time: {
      type: String, // "08:30 AM"
      required: true,
    },

    // Screen 2 — category chips: Medication, Water, Exercise, Sleep, Nutrition, Other
    category: {
      type: String,
      enum: ["Medication", "Water", "Exercise", "Sleep", "Nutrition", "Other"],
      default: "Other",
    },

    // Screen 2 — S M T W T F S day selector
    repeatDays: {
      type: [String],
      enum: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      default: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },

    // Screen 2 — "Daily" label when all days selected
    isDaily: {
      type: Boolean,
      default: true,
    },

    // Screen 1 — toggle on each reminder card
    isEnabled: {
      type: Boolean,
      default: true,
    },

    // Screen 2 — High Priority toggle
    isHighPriority: {
      type: Boolean,
      default: false,
    },

    // Screen 2 — Sound selector "Chimes"
    sound: {
      type: String,
      enum: ["Chimes", "Bell", "Beep", "Silent"],
      default: "Chimes",
    },

    // Screen 2 — notes text area
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reminder", reminderSchema);